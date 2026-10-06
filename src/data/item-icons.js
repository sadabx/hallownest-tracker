import wikiIconPages from "./wiki-icon-pages.json";
import wikiLocationPages from "./wiki-location-pages.json";
import wikiMapPoints from "./wiki-map-points.json";

const ITEM_ASSET_ROOT = `${import.meta.env.BASE_URL}assets/items/`;
const TRACKER_ASSET_ROOT = `${import.meta.env.BASE_URL}assets/tracker/`;
const WIKI_ICON_ROOT = `${import.meta.env.BASE_URL}assets/wiki-icons/`;

const CHARM_LOCATION_MAP_FILES = {
  gotCharm_1: "sly-location-2.webp",
  gotCharm_2: "iselda-location-1.webp",
  gotCharm_3: "grubsong-location-1.webp",
  gotCharm_4: "sly-location-2.webp",
  gotCharm_5: "baldur-shell-location-1.webp",
  gotCharm_6: "fury-of-the-fallen-location-1.webp",
  gotCharm_7: "quick-focus-location-1.webp",
  gotCharm_8: "lifeblood-heart-location-1.webp",
  gotCharm_9: "lifeblood-core-location-1.webp",
  gotCharm_10: "defenders-crest-location-1.webp",
  gotCharm_11: "flukenest-location-1.webp",
  gotCharm_12: "thorns-of-agony-location-1.webp",
  gotCharm_13: "mark-of-pride-location-1.webp",
  gotCharm_14: "steady-body-location-1.webp",
  gotCharm_15: "sly-location-2.webp",
  gotCharm_16: "sharp-shadow-location-1.webp",
  gotCharm_17: "spore-shroom-location-1.webp",
  gotCharm_18: "longnail-location-1.webp",
  gotCharm_19: "shaman-stone-location-1.webp",
  gotCharm_20: "soul-catcher-location-1.webp",
  gotCharm_21: "soul-eater-location-1.webp",
  gotCharm_22: "glowing-womb-location-1.webp",
  gotCharm_23: "fragile-heart-location-1.webp",
  gotCharm_24: "fragile-greed-location-1.webp",
  gotCharm_25: "fragile-strength-location-1.webp",
  gotCharm_26: "sly-location-2.webp",
  gotCharm_27: "jonis-blessing-location-1.webp",
  gotCharm_28: "shape-of-unn-location-1.webp",
  gotCharm_29: "hiveblood-location-1.webp",
  gotCharm_30: "dream-wielder-location-1.webp",
  gotCharm_31: "dashmaster-location-1.webp",
  gotCharm_32: "quick-slash-location-1.webp",
  gotCharm_33: "spell-twister-location-1.webp",
  gotCharm_34: "deep-focus-location-1.webp",
  gotCharm_35: "grubberflys-elegy-location-1.webp",
  gotCharm_36: "kingsoul-location-1.webp"
};

const CHECK_LOCATION_MAPS = {
  nailUpgrades: {
    oldNail: "nailsmith-location-1.webp",
    sharpenedNail: "nailsmith-location-1.webp",
    channeledNail: "nailsmith-location-1.webp",
    coiledNail: "nailsmith-location-1.webp",
    pureNail: "nailsmith-location-1.webp"
  },
  maskShards: {
    slyShellFrag1: "sly-location-2.webp",
    slyShellFrag2: "sly-location-2.webp",
    slyShellFrag3: "sly-location-2.webp",
    slyShellFrag4: "sly-location-2.webp",
    dreamReward7: "seer-location-1.webp",
    maskShardCrossroadsSprings: "mask-shard-mapshot-03.webp",
    maskShardCrossroadsMawlek: "brooding-mawlek-location-1.webp",
    maskShardGrubfather: "mask-shard-mapshot-02.webp",
    maskShardBretta: "bretta-location-2.webp",
    maskShardQueensStation: "mask-shard-mapshot-04.webp",
    maskShardWaterways: "mask-shard-mapshot-07.webp",
    maskShardStoneSanctuary: "no-eyes-location-1.webp",
    maskShardCrystalPeak: "mask-shard-mapshot-09.webp",
    maskShardDeepnest: "mask-shard-mapshot-08.webp",
    maskShardHive: "mask-shard-mapshot-10.webp",
    maskShardDelicateFlower: "grey-mourner-location-1.webp"
  },
  vesselFragments: {
    slyVesselFrag1: "sly-location-2.webp",
    slyVesselFrag2: "sly-location-2.webp",
    dreamReward5: "seer-location-1.webp",
    vesselFragStagNest: "vessel-fragment-location-6.webp",
    vesselFragmentGreenpath: "vessel-fragment-location-2.webp",
    vesselFragmentCrossroads: "vessel-fragment-location-3.webp",
    vesselFragmentCityOfTears: "vessel-fragment-location-4.webp",
    vesselFragmentDeepnest: "vessel-fragment-location-5.webp",
    vesselFragmentFountain: "vessel-fragment-location-8.webp"
  },
  equipment: {
    hasAcidArmour: "ismas-tear-location-1.webp"
  },
  bosses: {
    hornetOutskirtsDefeated: "hornet-sentinel-location-1.webp"
  },
  nailArts: {
    hasDashSlash: "great-slash-location-1.webp"
  },
  spells: {
    descendingDark: "descending-dark-location-1.webp"
  },
  dreamNail: {
    hasDreamNail: "dream-nail-location-1.webp"
  },
  warriorDreams: {
    noEyesDefeated: "no-eyes-location-1.webp",
    markothDefeated: "markoth-location-1.webp"
  },
  dreamers: {
    lurienDefeated: "dreamers-location-4.webp",
    monomonDefeated: "dreamers-location-3.webp"
  },
  grimmTroupe: {
    grimmChildLevel: "grimmchild-location-1.webp"
  },
  godmaster: {
    pantheonMaster: "pantheon-of-the-master-location.webp",
    pantheonArtist: "pantheon-of-the-master-location.webp",
    pantheonSage: "pantheon-of-the-master-location.webp",
    pantheonKnight: "pantheon-of-the-master-location.webp"
  },
  colosseum: {
    colosseumBronzeCompleted: "colosseum-of-fools-lore-location.webp",
    colosseumSilverCompleted: "colosseum-of-fools-lore-location.webp",
    colosseumGoldCompleted: "colosseum-of-fools-lore-location.webp"
  },
};

const CHECK_LOCATION_MAP_LABELS = {
  "mask-shard-mapshot-02.webp": "Mask Shard location at Grubfather",
  "mask-shard-mapshot-03.webp": "Mask Shard location below the Forgotten Crossroads hot spring",
  "mask-shard-mapshot-04.webp": "Mask Shard location in Queen's Station",
  "mask-shard-mapshot-07.webp": "Mask Shard location in Royal Waterways",
  "mask-shard-mapshot-08.webp": "Mask Shard location in Deepnest",
  "mask-shard-mapshot-09.webp": "Mask Shard location in Crystal Peak",
  "mask-shard-mapshot-10.webp": "Mask Shard location in the Hive",
  "descending-dark-location-1.webp": "Crystallised Mound in Crystal Peak",
  "dream-nail-location-1.webp": "Dream Nail location in the Resting Grounds",
  "great-slash-location-1.webp": "Nailmaster Sheo in Greenpath",
  "ismas-tear-location-1.webp": "Isma's Grove in the Royal Waterways",
  "colosseum-of-fools-lore-location.webp": "Colosseum of Fools location",
  "pantheon-of-the-master-location.webp": "Godhome · Pantheon of the Master",
  "markoth-location-1.webp": "Markoth's arena in Kingdom's Edge",
  "no-eyes-location-1.webp": "No Eyes' arena in Greenpath",
  "dreamers-location-3.webp": "Monomon's location in Teacher's Archives",
  "dreamers-location-4.webp": "Lurien's location in Watcher's Spire",
  "grimmchild-location-1.webp": "Grimm Troupe location in Dirtmouth",
  "hornet-sentinel-location-1.webp": "Hornet Sentinel's arena in Kingdom's Edge"
};

const TRACKER_ICON_SECTIONS = new Set([
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
]);

const SECTION_ITEM_ICONS = {
  geoChests: "geo-chest.webp",
  geoRocks: "geo-deposit.webp",
  essentialsStagStations: "map-pin-stag.webp",
  achievementsMaps: "area-map.webp",
  charmNotches: "charm-notch.webp",
  whisperingRoots: "map-pin-tree.webp"
};

const PANTHEON_SECTION_ICONS = {
  pantheonOfTheMaster: "godmaster-pantheonMaster.webp",
  pantheonOfTheArtist: "godmaster-pantheonArtist.webp",
  pantheonOfTheSage: "godmaster-pantheonSage.webp",
  pantheonOfTheKnight: "godmaster-pantheonKnight.webp",
  pantheonOfHallownest: "wiki-icons/pantheon-of-hallownest.webp"
};

const GODHOME_BOSS_ALIASES = new Map([
  ["Hornet1", "Hornet_Protector"],
  ["Hornet2", "Hornet_Sentinel"],
  ["MegaMossCharger", "Massive_Moss_Charger"],
  ["MantisLordsExtra", "Mantis_Lords"],
  ["NoskHornet", "Nosk"],
  ["CrystalGuardian1", "Crystal_Guardian"],
  ["CrystalGuardian2", "Enraged_Guardian"],
  ["GreyPrince", "Grey_Prince_Zote"],
  ["MageKnight", "Soul_Warrior"],
  ["WatcherKnights", "Watcher_Knight"],
  ["Nailmasters", "Brothers_Oro_&_Mato"],
  ["Paintmaster", "Paintmaster_Sheo"],
  ["NightmareGrimm", "Nightmare_King"]
]);

const WIKI_PAGE_ALIASES = new Map([["Hot_Springs", "Hot_Spring"]]);

const ICON_RULES = [
  ["mr mushroom", "mister-mushroom.webp"],
  ["inventory map", "map-and-quill.webp"],
  ["quill", "map-and-quill.webp"],
  ["charm notch", "charm-notch.webp"],
  ["whispering root", "map-pin-tree.webp"],
  ["stag station", "map-pin-stag.webp"],
  ["map: ", "area-map.webp"],
  ["area maps", "area-map.webp"],
  ["map pin: bench", "wiki-icons/map-pin-bench.webp"],
  ["map pin: vendor", "wiki-icons/map-pin-vendor.webp"],
  ["map pin: hot springs", "wiki-icons/map-pin-springs.webp"],
  ["map pin: tram", "wiki-icons/map-pin-tram.webp"],
  ["map pin: lifeblood", "wiki-icons/map-pin-cocoon.webp"],
  ["map pin: warrior's grave", "wiki-icons/map-pin-warriors-grave.webp"],
  ["map pin: dreamers", "wiki-icons/map-pin-dream.webp"],
  ["map pin: temple of the black egg", "wiki-icons/map-pin-black-egg.webp"],
  ["shell marker", "wiki-icons/shell-marker.webp"],
  ["scarab marker", "wiki-icons/scarab-marker.webp"],
  ["token marker", "wiki-icons/token-marker.webp"],
  ["gleaming marker", "wiki-icons/gleaming-marker.webp"],
  ["mantis village floor lever", "wiki-icons/mantis-lords.webp"],
  ["acid drained", "wiki-icons/ismas-tear.webp"],
  ["tower of love door", "love-key.webp"],
  ["abyss gate", "kings-brand.webp"],
  ["nightmare lantern", "wiki-icons/grimm.webp"],
  ["pale lurker", "wiki-icons/pale-lurker.webp"],
  ["godseeker cocoon", "godtuner.webp"],
  ["geo in fountain", "wiki-icons/geo.webp"],
  ["tuner memory", "godtuner.webp"],
  ["lifeblood door open", "wiki-icons/lifeblood-core.webp"],
  ["journal: void idol", "wiki-icons/void-idol.webp"],
  ["journal: weathered mask", "wiki-icons/weathered-mask.webp"],
  ["intruder discovered", "wiki-icons/zote.webp"],
  ["the eternal ordeal", "wiki-icons/volatile-zoteling.webp"],
  ["gossipping bugs", "wiki-icons/gathering-swarm.webp"],
  ["pleasure house door", "simple-key.webp"],
  ["waterways manhole", "simple-key.webp"],
  ["spirits' glade door", "wiki-icons/seer.webp"],
  ["city of tears gate", "city-crest.webp"],
  ["soul sanctum shortcut", "wiki-icons/soul-master.webp"],
  ["waterways gate", "wiki-icons/dung-defender.webp"],
  ["hidden hot spring", "wiki-icons/map-pin-springs.webp"],
  ["stag nest egg", "map-pin-stag.webp"],
  ["deepnest entry bridge", "wiki-icons/stalking-devout.webp"],
  ["mask maker unmasked", "wiki-icons/mask-maker.webp"],
  ["grimm's tent: secret room", "wiki-icons/grimm.webp"],
  ["tower of love: secret room", "wiki-icons/the-collector.webp"],
  ["weaver's den: secret room", "wiki-icons/weaversong.webp"],
  ["path of pain", "wiki-icons/seal-of-binding.webp"],
  ["white palace: secret room", "wiki-icons/kingsoul.webp"],
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

function wikiArticleIconFor(entry) {
  const sectionIcon = SECTION_ITEM_ICONS[entry.sectionKey];
  if (sectionIcon) return `${ITEM_ASSET_ROOT}${sectionIcon}`;
  const page = entry.raw?.wiki?.split("#")[0];
  if (!page) return null;
  const title = WIKI_PAGE_ALIASES.get(decodeURIComponent(page)) || decodeURIComponent(page);
  const icon = wikiIconPages[title];
  return icon ? `${WIKI_ICON_ROOT}${icon}` : null;
}

function godhomeBossIconFor(entry) {
  if (entry.sectionKey !== "hallOfGods") return null;
  const bossId = entry.raw?.id;
  if (!bossId) return null;
  const title = GODHOME_BOSS_ALIASES.get(bossId)
    || Object.keys(wikiIconPages).find(page => page.toLowerCase().replace(/[^a-z0-9]/g, "") === bossId.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const icon = title && wikiIconPages[title];
  return icon ? `${WIKI_ICON_ROOT}${icon}` : null;
}

function wikiLocationMapsFor(entry) {
  const charmMapFile = entry.sectionKey === "charms" && CHARM_LOCATION_MAP_FILES[entry.key];
  if (charmMapFile) {
    const map = Object.values(wikiLocationPages).flat().find(candidate => candidate.file === charmMapFile);
    if (map) return [{ src: `${import.meta.env.BASE_URL}assets/wiki-location-maps/${map.file}`, label: map.label }];
  }
  const page = entry.raw?.wiki?.split("#")[0];
  if (!page) return [];
  const title = WIKI_PAGE_ALIASES.get(decodeURIComponent(page)) || decodeURIComponent(page);
  const normalize = value => String(value || "").toLowerCase().replace(/^location in\s+/, "").replace(/^the\s+/, "").trim();
  const area = normalize(entry.regionLabel);
  const locationParts = String(entry.description || "")
    .split(/[\n,;:.()]+/)
    .map(part => normalize(part))
    .filter(part => part.length > 3 && (!area || !part.includes(area)));
  const maps = (wikiLocationPages[title] || []).map(map => ({
    src: `${import.meta.env.BASE_URL}assets/wiki-location-maps/${map.file}`,
    label: map.label
  }));
  const matches = maps.filter(map => {
    const place = normalize(map.label);
    return locationParts.some(part => place.includes(part));
  });
  if (matches.length) return matches;
  const regional = maps.filter(map => area && normalize(map.label).includes(area));
  return regional.length === 1 ? regional : [];
}

function wikiLocationPreviewFor(entry) {
  const pantheonMap = entry.sectionKey.startsWith("pantheonOf")
    ? "pantheon-of-the-master-location.webp"
    : null;
  const locationFile = CHECK_LOCATION_MAPS[entry.sectionKey]?.[entry.key] || pantheonMap;
  if (locationFile) {
    const knownMap = Object.values(wikiLocationPages).flat().find(map => map.file === locationFile);
    return [{
      src: `${import.meta.env.BASE_URL}assets/wiki-location-maps/${locationFile}`,
      label: CHECK_LOCATION_MAP_LABELS[locationFile] || knownMap?.label || `${entry.name} location`
    }];
  }

  const direct = wikiLocationMapsFor(entry);
  if (direct.length) return direct;

  const source = String(entry.description || "").match(/^([A-Za-z][A-Za-z' -]+):/);
  if (!source) return [];
  const page = source[1].trim().replaceAll(" ", "_");
  if (!["Sly", "Seer"].includes(source[1].trim())) return [];
  const maps = wikiLocationPages[page] || [];
  const region = String(entry.regionLabel || "").toLowerCase().replace(/^the\s+/, "");
  const relevant = maps.filter(map => !region || map.label.toLowerCase().replace(/^location in\s+/, "").replace(/^the\s+/, "").includes(region));
  return (relevant.length === 1 ? relevant : []).map(map => ({
    src: `${import.meta.env.BASE_URL}assets/wiki-location-maps/${map.file}`,
    label: map.label
  }));
}

function wikiMapPointFor(entry) {
  const map = wikiLocationMapsFor(entry).find(candidate => wikiMapPoints[candidate.src.split("/").at(-1)]);
  if (!map) return null;
  const point = wikiMapPoints[map.src.split("/").at(-1)];
  return { ...point, label: map.label };
}

function itemIconFor(entry) {
  const itemName = entry.name.toLowerCase().replace(/^p\d+\s+/, "");
  const match = ICON_RULES.find(([needle]) => itemName.includes(needle));
  if (match) return `${import.meta.env.BASE_URL}assets/${match[1].includes("/") ? match[1] : `items/${match[1]}`}`;
  const bossIcon = godhomeBossIconFor(entry);
  if (bossIcon) return bossIcon;
  const sectionIcon = SECTION_ITEM_ICONS[entry.sectionKey];
  if (sectionIcon) return `${ITEM_ASSET_ROOT}${sectionIcon}`;
  const pantheonIcon = PANTHEON_SECTION_ICONS[entry.sectionKey];
  if (pantheonIcon) {
    return pantheonIcon.includes("/")
      ? `${import.meta.env.BASE_URL}assets/${pantheonIcon}`
      : `${TRACKER_ASSET_ROOT}${pantheonIcon}`;
  }
  if (TRACKER_ICON_SECTIONS.has(entry.sectionKey) && entry.raw.wiki) {
    return `${TRACKER_ASSET_ROOT}${entry.sectionKey}-${entry.key}.webp`;
  }
  return wikiArticleIconFor(entry);
}

export { itemIconFor, wikiArticleIconFor, wikiLocationMapsFor, wikiLocationPreviewFor, wikiMapPointFor };
