import { access, mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import HK from "../src/core/completion-database.js";

const CATEGORY = "Category:Items (Hollow Knight)";
const API_URL = "https://hollowknight.fandom.com/api.php";
const OUTPUT_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), "../public/assets/items");
const TRACKER_OUTPUT_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), "../public/assets/tracker");
const TRACKER_SECTIONS = [
  "bosses",
  "charms",
  "equipment",
  "nailArts",
  "spells",
  "dreamNail",
  "warriorDreams",
  "dreamers",
  "colosseum",
  "grimmTroupe",
  "lifeblood",
  "godmaster"
];
const refreshAll = process.argv.includes("--refresh");
const refreshTracker = refreshAll || process.argv.includes("--refresh-wiki");
const refreshOverrides = process.argv.includes("--refresh-overrides");
const WIKI_IMAGE_OVERRIDES = new Map([
  ["Grimm", "B_Grimm.png"],
  ["Hive_Knight", "Hive_Knight_Idle.png"],
  ["Grimm_Troupe_(Quest)", "FlameConsumed.png"]
]);
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
const EXTRA_ICONS = new Map([
  ["Old Nail", "https://static.wikia.nocookie.net/hollowknight/images/6/65/Nail_1_Old_Nail.png/revision/latest/scale-to-width-down/72?cb=20170717212304"],
  ["Sharpened Nail", "https://static.wikia.nocookie.net/hollowknight/images/0/0e/Nail_2_Sharpened_Nail.png/revision/latest/scale-to-width-down/72?cb=20170717212321"],
  ["Channelled Nail", "https://static.wikia.nocookie.net/hollowknight/images/2/29/Nail_3_Channelled_Nail.png/revision/latest/scale-to-width-down/72?cb=20170717212328"],
  ["Coiled Nail", "https://static.wikia.nocookie.net/hollowknight/images/e/e4/Nail_4_Coiled_Nail.png/revision/latest/scale-to-width-down/72?cb=20170717212335"],
  ["Pure Nail", "https://static.wikia.nocookie.net/hollowknight/images/4/4a/Nail_5_Pure_Nail.png/revision/latest/scale-to-width-down/72?cb=20170717212343"]
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

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function cachedArtworkIsUsable(path) {
  if (!await fileExists(path)) return false;
  return (await stat(path)).size > 1500;
}

function wikiApi(parameters) {
  const url = new URL(API_URL);
  Object.entries({ ...parameters, format: "json", origin: "*" })
    .forEach(([key, value]) => url.searchParams.set(key, value));
  return fetch(url).then(response => {
    if (!response.ok) throw new Error(`Fandom API returned ${response.status}`);
    return response.json();
  });
}

const wikiImageCache = new Map();

async function wikiArtwork(pageReference) {
  const pageName = pageReference.split("#")[0];
  if (wikiImageCache.has(pageName)) return wikiImageCache.get(pageName);

  const parsed = await wikiApi({ action: "parse", page: pageName, prop: "images" });
  const override = WIKI_IMAGE_OVERRIDES.get(pageName);
  const candidates = override
    ? [override]
    : parsed.parse?.images?.filter(image => !/^(?:Beta_hk_promo|Dialogue_|Mapshot_|Screenshot_)/i.test(image)) || [];
  for (const imageName of candidates.slice(0, 12)) {
    const imagePayload = await wikiApi({
      action: "query",
      titles: `File:${imageName}`,
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "180"
    });
    const imagePage = Object.values(imagePayload.query?.pages || {})[0];
    const imageInfo = imagePage?.imageinfo?.[0];
    const source = imageInfo?.thumburl || imageInfo?.url;
    if (!source) continue;
    wikiImageCache.set(pageName, source);
    return source;
  }
  throw new Error(`No downloadable artwork found on wiki page: ${pageName}`);
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

for (const [itemName, source] of EXTRA_ICONS) icons.set(itemName, source);

await mkdir(OUTPUT_DIRECTORY, { recursive: true });
for (const [itemName, source] of icons) {
  const destination = resolve(OUTPUT_DIRECTORY, `${slugify(itemName)}.webp`);
  if (!refreshAll && await fileExists(destination)) {
    console.log(`${itemName} -> cached`);
    continue;
  }
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Unable to download ${itemName}: ${response.status}`);
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  console.log(`${itemName} -> ${destination}`);
}

if (![...ITEM_NAMES, ...EXTRA_ICONS.keys()].every(itemName => icons.has(itemName))) {
  const missing = [...ITEM_NAMES, ...EXTRA_ICONS.keys()].filter(itemName => !icons.has(itemName));
  throw new Error(`Missing icons: ${missing.join(", ")}`);
}

await mkdir(TRACKER_OUTPUT_DIRECTORY, { recursive: true });
for (const sectionKey of TRACKER_SECTIONS) {
  for (const [entryKey, entry] of Object.entries(HK.sections[sectionKey].entries)) {
    if (!entry.wiki) continue;
    const destination = resolve(TRACKER_OUTPUT_DIRECTORY, `${sectionKey}-${entryKey}.webp`);
    const pageName = entry.wiki.split("#")[0];
    const shouldRefreshOverride = refreshOverrides && WIKI_IMAGE_OVERRIDES.has(pageName);
    if (!refreshTracker && !shouldRefreshOverride && await cachedArtworkIsUsable(destination)) {
      console.log(`${entry.name} -> cached`);
      continue;
    }
    const source = await wikiArtwork(entry.wiki);
    const response = await fetch(source);
    if (!response.ok) throw new Error(`Unable to download ${entry.name}: ${response.status}`);
    await writeFile(destination, Buffer.from(await response.arrayBuffer()));
    console.log(`${entry.name} -> ${destination}`);
  }
}
