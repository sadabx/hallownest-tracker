const ITEM_ASSET_ROOT = `${import.meta.env.BASE_URL}assets/items/`;

const ICON_RULES = [
  ["old nail", "old-nail.webp"],
  ["sharpened nail", "sharpened-nail.webp"],
  ["channelled nail", "channelled-nail.webp"],
  ["channeled nail", "channelled-nail.webp"],
  ["coiled nail", "coiled-nail.webp"],
  ["pure nail", "pure-nail.webp"],
  ["shopkeeper's key", "shopkeepers-key.webp"],
  ["collector's map", "collectors-map.webp"],
  ["hunter's journal", "hunters-journal.webp"],
  ["hunter's mark", "hunters-mark.webp"],
  ["salubra's blessing", "salubras-blessing.webp"],
  ["wanderer's journal", "wanderers-journal.webp"],
  ["hallownest seal", "hallownest-seal.webp"],
  ["king's brand", "kings-brand.webp"],
  ["king's idol", "kings-idol.webp"],
  ["vessel fragment", "vessel-fragment.webp"],
  ["lumafly lantern", "lumafly-lantern.webp"],
  ["delicate flower", "delicate-flower.webp"],
  ["map and quill", "map-and-quill.webp"],
  ["mask shard", "mask-shard.webp"],
  ["rancid egg", "rancid-egg.webp"],
  ["simple key", "simple-key.webp"],
  ["elegant key", "elegant-key.webp"],
  ["love key", "love-key.webp"],
  ["city crest", "city-crest.webp"],
  ["tram pass", "tram-pass.webp"],
  ["godtuner", "godtuner.webp"],
  ["pale ore", "pale-ore.webp"],
  ["arcane egg", "arcane-egg.webp"]
];

function itemIconFor(entry) {
  const itemName = entry.name.toLowerCase().replace(/^p\d+\s+/, "");
  const match = ICON_RULES.find(([needle]) => itemName.includes(needle));
  return match ? `${ITEM_ASSET_ROOT}${match[1]}` : null;
}

export { itemIconFor };
