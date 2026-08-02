const REGIONS = {
  dirtmouth: { label: "Dirtmouth", x: 43, y: 8, w: 16, h: 11 },
  cliffs: { label: "Howling Cliffs", x: 16, y: 12, w: 20, h: 15 },
  crossroads: { label: "Forgotten Crossroads", x: 39, y: 21, w: 22, h: 17 },
  crystal: { label: "Crystal Peak", x: 63, y: 14, w: 19, h: 20 },
  greenpath: { label: "Greenpath", x: 17, y: 28, w: 23, h: 20 },
  resting: { label: "Resting Grounds", x: 64, y: 36, w: 19, h: 14 },
  fog: { label: "Fog Canyon", x: 27, y: 47, w: 15, h: 14 },
  fungal: { label: "Fungal Wastes", x: 40, y: 45, w: 20, h: 18 },
  city: { label: "City of Tears", x: 54, y: 51, w: 24, h: 19 },
  edge: { label: "Kingdom's Edge", x: 79, y: 39, w: 18, h: 23 },
  gardens: { label: "Queen's Gardens", x: 11, y: 48, w: 19, h: 18 },
  deepnest: { label: "Deepnest", x: 21, y: 64, w: 27, h: 23 },
  waterways: { label: "Royal Waterways", x: 51, y: 68, w: 22, h: 13 },
  hive: { label: "The Hive", x: 79, y: 67, w: 16, h: 14 },
  basin: { label: "Ancient Basin", x: 48, y: 81, w: 22, h: 13 },
  abyss: { label: "The Abyss", x: 52, y: 94, w: 15, h: 10 },
  palace: { label: "White Palace", x: 71, y: 84, w: 16, h: 12 },
  godhome: { label: "Godhome", x: 86, y: 87, w: 13, h: 12 },
  colosseum: { label: "Colosseum", x: 84, y: 30, w: 13, h: 10 }
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
