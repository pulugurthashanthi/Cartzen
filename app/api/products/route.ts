import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/verifyAdmin";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIRESTORE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromFirestore(doc: any) {
  const id = doc.name?.split("/").pop();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fields: Record<string, any> = {};
  for (const [key, val] of Object.entries(doc.fields ?? {})) {
    const v = val as Record<string, unknown>;
    fields[key] =
      v.stringValue ?? v.integerValue ?? v.doubleValue ?? v.booleanValue ?? v.nullValue ?? null;
  }
  return { id, ...fields };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toFirestore(data: Record<string, any>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fields: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === "string") fields[key] = { stringValue: val };
    else if (typeof val === "number")
      fields[key] = Number.isInteger(val)
        ? { integerValue: String(val) }
        : { doubleValue: val };
    else if (typeof val === "boolean") fields[key] = { booleanValue: val };
    else if (val === null) fields[key] = { nullValue: null };
  }
  return { fields };
}

export async function GET() {
  try {
    const res = await fetch(`${FIRESTORE}/products`);
    const data = await res.json();
    const products = (data.documents ?? []).map(fromFirestore);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    const body = await request.json();
    const payload = toFirestore({ ...body, createdAt: new Date().toISOString() });

    const res = await fetch(`${FIRESTORE}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const doc = await res.json();
    return NextResponse.json(fromFirestore(doc), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
