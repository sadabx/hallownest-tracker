const REGIONS = {
  dirtmouth: { label: "Dirtmouth", x: 39, y: 21, w: 13, h: 8 },
  cliffs: { label: "Howling Cliffs", x: 30, y: 15, w: 19, h: 15 },
  crossroads: { label: "Forgotten Crossroads", x: 48, y: 29, w: 23, h: 17 },
  crystal: { label: "Crystal Peak", x: 66, y: 20, w: 23, h: 25 },
  greenpath: { label: "Greenpath", x: 22, y: 32, w: 27, h: 20 },
  resting: { label: "Resting Grounds", x: 79, y: 31, w: 17, h: 14 },
  fog: { label: "Fog Canyon", x: 31, y: 42, w: 14, h: 15 },
  fungal: { label: "Fungal Wastes", x: 41, y: 51, w: 19, h: 20 },
  city: { label: "City of Tears", x: 61, y: 49, w: 26, h: 24 },
  edge: { label: "Kingdom's Edge", x: 86, y: 54, w: 22, h: 27 },
  gardens: { label: "Queen's Gardens", x: 22, y: 48, w: 23, h: 19 },
  deepnest: { label: "Deepnest", x: 23, y: 65, w: 30, h: 22 },
  waterways: { label: "Royal Waterways", x: 58, y: 65, w: 26, h: 14 },
  hive: { label: "The Hive", x: 84, y: 70, w: 16, h: 11 },
  basin: { label: "Ancient Basin", x: 59, y: 77, w: 26, h: 14 },
  abyss: { label: "The Abyss", x: 69, y: 91, w: 28, h: 14 },
  palace: { label: "White Palace", x: 54, y: 79, w: 13, h: 9, atlas: false },
  godhome: { label: "Godhome", x: 91, y: 83, w: 10, h: 8, atlas: false },
  colosseum: { label: "Colosseum", x: 87, y: 45, w: 10, h: 8 }
};

const REGION_MATCHES = [
  ["godhome", /godhome|pantheon|hall of gods/],
  ["palace", /white palace|path of pain/],
  ["colosseum", /colosseum|trial of the/],
  ["abyss", /\bthe abyss\b|abyss_|birthplace/],
  ["basin", /ancient basin|basin_|palace grounds/],
  ["hive", /\bthe hive\b|hive_/],
  ["waterways", /royal waterways|waterways_|junk pit/],
  ["deepnest", /deepnest|deepnest_/],
  ["gardens", /queen'?s gardens|fungus3_/],
  ["edge", /kingdom'?s edge|outskirts_|kingdom's edge/],
  ["city", /city of tears|ruins_|soul sanctum|tower of love|watcher'?s spire/],
  ["fungal", /fungal wastes|fungus2_|mantis village/],
  ["fog", /fog canyon|fogcanyon_|teacher'?s archives/],
  ["resting", /resting grounds|restinggrounds_|blue lake/],
  ["greenpath", /greenpath|fungus1_|stone sanctuary|lake of unn/],
  ["crystal", /crystal peak|mines_|crystallised mound/],
  ["crossroads", /forgotten crossroads|infected crossroads|crossroads_|black egg/],
  ["cliffs", /howling cliffs|cliffs_|joni'?s repose/],
  ["dirtmouth", /dirtmouth|town_|king'?s pass/]
];

export { REGIONS, REGION_MATCHES };
