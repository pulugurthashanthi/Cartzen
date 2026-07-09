import { NextResponse } from "next/server";

// Fetches a product page server-side and extracts title/price/image from
// JSON-LD, Open Graph, and common meta tags. Regex-based on purpose — no
// HTML-parser dependency, and retail pages are too inconsistent for one anyway.

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 1_500_000;

// Pretend to be a real browser — most retail sites serve meta tags to anything,
// but some block obvious bot UAs outright.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  // IPv6 literals ([::1] etc.) — reject all of them, no retail site needs one
  if (h.includes(":")) return true;
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 0 || a === 10 || a === 127 || (a === 169 && b === 254)) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  return false;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function metaContent(html: string, key: string): string | undefined {
  // Matches <meta property="og:title" content="..."> with attributes in either order
  const re = new RegExp(
    `<meta[^>]+(?:property|name|itemprop)=["']${key}["'][^>]*content=["']([^"']+)["']|` +
      `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name|itemprop)=["']${key}["']`,
    "i"
  );
  const m = html.match(re);
  return m ? decodeEntities(m[1] ?? m[2]) : undefined;
}

function parsePrice(raw: unknown): number | undefined {
  if (typeof raw === "number" && raw > 0) return raw;
  if (typeof raw !== "string") return undefined;
  // strip currency symbols and thousands separators: "₹1,24,900.00" → 124900
  const cleaned = raw.replace(/[^\d.]/g, "");
  const n = parseFloat(cleaned);
  return n > 0 ? n : undefined;
}

interface Extracted {
  title?: string;
  brand?: string;
  price?: number;
  image?: string;
  description?: string;
  siteName?: string;
}

function extractJsonLd(html: string): Extracted {
  const out: Extracted = {};
  const blocks = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  for (const [, body] of blocks) {
    try {
      const data = JSON.parse(body.trim());
      const nodes: unknown[] = Array.isArray(data) ? data : data["@graph"] ?? [data];
      for (const node of nodes) {
        const n = node as Record<string, unknown>;
        const type = String(n["@type"] ?? "");
        if (!/Product/i.test(type)) continue;
        out.title = out.title ?? (typeof n.name === "string" ? n.name : undefined);
        out.description =
          out.description ?? (typeof n.description === "string" ? n.description : undefined);
        const img = n.image;
        out.image =
          out.image ??
          (typeof img === "string" ? img : Array.isArray(img) && typeof img[0] === "string" ? img[0] : undefined);
        const brand = n.brand as Record<string, unknown> | string | undefined;
        out.brand =
          out.brand ??
          (typeof brand === "string" ? brand : typeof brand?.name === "string" ? brand.name : undefined);
        const offersRaw = n.offers;
        const offer = (Array.isArray(offersRaw) ? offersRaw[0] : offersRaw) as
          | Record<string, unknown>
          | undefined;
        out.price = out.price ?? parsePrice(offer?.price ?? offer?.lowPrice);
        if (out.title && out.price) return out;
      }
    } catch {
      // malformed JSON-LD — skip block
    }
  }
  return out;
}

function extractMeta(html: string): Extracted {
  const priceStr =
    metaContent(html, "product:price:amount") ??
    metaContent(html, "og:price:amount") ??
    metaContent(html, "twitter:data1") ??
    metaContent(html, "price");
  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return {
    title:
      metaContent(html, "og:title") ??
      metaContent(html, "twitter:title") ??
      (titleTag ? decodeEntities(titleTag) : undefined),
    image: metaContent(html, "og:image") ?? metaContent(html, "twitter:image"),
    description: metaContent(html, "og:description") ?? metaContent(html, "description"),
    price: parsePrice(priceStr),
    brand: metaContent(html, "product:brand") ?? metaContent(html, "brand"),
    siteName: metaContent(html, "og:site_name"),
  };
}

// Last resort: find a ₹/Rs price near the top of the body (Amazon.in, Flipkart
// often render price outside meta tags).
function extractRupeePrice(html: string): number | undefined {
  const m = html.match(/(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)/);
  return m ? parsePrice(m[1]) : undefined;
}

export async function POST(request: Request) {
  let url: URL;
  try {
    const body = await request.json();
    url = new URL(String(body.url ?? ""));
  } catch {
    return NextResponse.json({ error: "Enter a valid link" }, { status: 400 });
  }

  if (!/^https?:$/.test(url.protocol) || isPrivateHost(url.hostname)) {
    return NextResponse.json({ error: "That link can't be fetched" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `The site refused (${res.status}) — fill in the details manually` },
        { status: 502 }
      );
    }
    const html = (await res.text()).slice(0, MAX_BYTES);

    const jsonLd = extractJsonLd(html);
    const meta = extractMeta(html);
    const result = {
      title: jsonLd.title ?? meta.title ?? "",
      brand: jsonLd.brand ?? meta.brand ?? "",
      price: jsonLd.price ?? meta.price ?? extractRupeePrice(html) ?? 0,
      image: jsonLd.image ?? meta.image ?? "",
      description: jsonLd.description ?? meta.description ?? "",
      siteName: meta.siteName ?? url.hostname.replace(/^www\./, ""),
      sourceUrl: url.toString(),
    };
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Couldn't reach that page — fill in the details manually" },
      { status: 502 }
    );
  }
}
