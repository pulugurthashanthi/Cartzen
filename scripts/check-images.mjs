// HEAD-checks every product image URL in data/products.ts.
// Usage: npm run check:images   (exits non-zero if any image is dead)
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = await readFile(path.join(root, "data", "products.ts"), "utf8");

const urls = [...new Set(source.match(/https:\/\/[^"']+/g) ?? [])]
  .map((u) => u.split("?")[0]);

if (urls.length === 0) {
  console.error("No image URLs found in data/products.ts — check the regex.");
  process.exit(1);
}

const CONCURRENCY = 8;
const failures = [];
let checked = 0;

async function check(url) {
  try {
    const res = await fetch(`${url}?w=60&q=10`, {
      method: "HEAD",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) failures.push(`${res.status} ${url}`);
  } catch (err) {
    failures.push(`ERR (${err.name}) ${url}`);
  }
  checked++;
}

const queue = [...urls];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) await check(queue.pop());
  })
);

if (failures.length > 0) {
  console.error(`✗ ${failures.length}/${checked} product images are broken:\n`);
  for (const f of failures.sort()) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`✓ All ${checked} product image URLs are alive.`);
