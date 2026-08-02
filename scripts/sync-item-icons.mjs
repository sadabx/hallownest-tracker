import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CATEGORY = "Category:Items (Hollow Knight)";
const API_URL = "https://hollowknight.fandom.com/api.php";
const OUTPUT_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), "../public/assets/items");
const ITEM_NAMES = new Set([
  "Arcane Egg",
  "City Crest",
  "Collector's Map",
  "Delicate Flower",
  "Elegant Key",
  "Godtuner",
  "Hallownest Seal",
  "Hunter's Journal",
  "Hunter's Mark",
  "King's Brand",
  "King's Idol",
  "Love Key",
  "Lumafly Lantern",
  "Map and Quill",
  "Mask Shard",
  "Pale Ore",
  "Rancid Egg",
  "Salubra's Blessing",
  "Shopkeeper's Key",
  "Simple Key",
  "Tram Pass",
  "Vessel Fragment",
  "Wanderer's Journal"
]);

function decodeEntities(value) {
  return value
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"');
}

function slugify(value) {
  return value.toLowerCase().replaceAll("'", "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const api = new URL(API_URL);
Object.entries({ action: "parse", page: CATEGORY, prop: "text", format: "json" })
  .forEach(([key, value]) => api.searchParams.set(key, value));

const payload = await fetch(api).then(response => {
  if (!response.ok) throw new Error(`Fandom API returned ${response.status}`);
  return response.json();
});
const html = payload.parse.text["*"];
const icons = new Map();

for (const row of html.split("<tr").slice(1)) {
  const image = row.match(/<img[^>]+src="([^"]+)"/);
  const title = row.match(/<a[^>]+title="([^"]+)"/);
  if (!image || !title) continue;

  const itemName = decodeEntities(title[1]);
  if (!ITEM_NAMES.has(itemName) || icons.has(itemName)) continue;
  icons.set(itemName, decodeEntities(image[1]));
}

await mkdir(OUTPUT_DIRECTORY, { recursive: true });
for (const [itemName, source] of icons) {
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Unable to download ${itemName}: ${response.status}`);
  const destination = resolve(OUTPUT_DIRECTORY, `${slugify(itemName)}.webp`);
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  console.log(`${itemName} -> ${destination}`);
}

if (icons.size !== ITEM_NAMES.size) {
  const missing = [...ITEM_NAMES].filter(itemName => !icons.has(itemName));
  throw new Error(`Missing icons: ${missing.join(", ")}`);
}
