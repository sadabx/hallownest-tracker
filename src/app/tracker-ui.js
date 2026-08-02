import HK from "../core/completion-database.js";

const WIKI_ROOT = "https://hollowknight.wiki/w/";
const STORAGE_KEY = "hallownestTrackerPreferences";

const GROUPS = {
  main: {
    label: "Main Progress",
    sections: ["bosses", "charms", "colosseum", "dreamers", "dreamNail", "equipment", "nailUpgrades", "maskShards", "nailArts", "spells", "vesselFragments", "warriorDreams", "grimmTroupe", "lifeblood", "godmaster"]
  },
  essentials: {
    label: "Essentials",
    sections: ["essentialsCollectibles", "essentialsStagStations", "essentialsWorldInteractions", "essentialsBosses", "achievementsCollectibles", "achievementsMaps", "achievementsWorldInteractions", "achievementsBosses"]
  },
  journal: {
    label: "Hunter's Journal",
    sections: ["huntersJournal", "huntersJournalOptional"]
  },
  collectibles: {
    label: "Collectibles",
    sections: ["charmNotches", "grubs", "whisperingRoots", "relicsWanderersJournal", "relicsHallownestSeal", "relicsKingsIdol", "relicsArcaneEgg", "rancidEggs", "items"]
  },
  world: {
    label: "World & Secrets",
    sections: ["geoChests", "geoRocks", "worldInteractions", "secretRooms", "corniferNotes"]
  },
  godhome: {
    label: "Godhome",
    sections: ["godhomeStatistics", "pantheonOfTheMaster", "pantheonOfTheArtist", "pantheonOfTheSage", "pantheonOfTheKnight", "pantheonOfHallownest", "hallOfGods"]
  }
};

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
  ["fog", /fog canyon|fog canyon|fogcanyon_|teacher'?s archives/],
  ["resting", /resting grounds|restinggrounds_|blue lake/],
  ["greenpath", /greenpath|fungus1_|stone sanctuary|lake of unn/],
  ["crystal", /crystal peak|mines_|crystallised mound/],
  ["crossroads", /forgotten crossroads|infected crossroads|crossroads_|black egg/],
  ["cliffs", /howling cliffs|cliffs_|joni'?s repose/],
  ["dirtmouth", /dirtmouth|town_|king'?s pass/]
];

const state = {
  save: null,
  activeTab: "dashboard",
  group: "all",
  query: "",
  missingOnly: false,
  spoilers: false,
  mapCategory: "all",
  mapQuery: "",
  selectedEntry: null,
  scale: 1,
  panX: 0,
  panY: 0
};

function stripMarkup(value) {
  const template = document.createElement("template");
  template.innerHTML = String(value || "");
  return (template.content.textContent || "").trim();
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function statusFor(entry) {
  if (!HK.saveAnalyzed) return "unknown";
  if (entry.disabled) return "unavailable";
  if (entry.icon === "green") return "complete";
  if (entry.icon === "red") return "missing";
  if (entry.icon === "none" || entry.icon === "clock") return "info";
  return "partial";
}

function findRegion(entry, section) {
  const haystack = `${entry.sceneName || ""} ${stripMarkup(entry.spoiler)} ${stripMarkup(entry.name)} ${stripMarkup(section.h2)}`.toLowerCase();
  const match = REGION_MATCHES.find(([, pattern]) => pattern.test(haystack));
  return match ? match[0] : null;
}

function groupFor(sectionKey) {
  return Object.keys(GROUPS).find(key => GROUPS[key].sections.includes(sectionKey)) || "other";
}

function flattenEntries() {
  const list = [];
  Object.entries(HK.sections).forEach(([sectionKey, section]) => {
    if (["intro", "hints", "statistics"].includes(sectionKey) || !section.entries) return;
    Object.entries(section.entries).forEach(([entryKey, entry]) => {
      const name = stripMarkup(entry.name);
      if (!name) return;
      const status = statusFor(entry);
      list.push({
        id: `${sectionKey}:${entryKey}`,
        key: entryKey,
        sectionKey,
        section: stripMarkup(section.h2),
        group: groupFor(sectionKey),
        name,
        description: stripMarkup(entry.spoiler),
        status,
        region: findRegion(entry, section),
        wiki: entry.wiki || null,
        raw: entry
      });
    });
  });
  return list;
}

function getPreferences() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (_) {
    return {};
  }
}

function savePreferences() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    activeTab: state.activeTab,
    missingOnly: state.missingOnly,
    spoilers: state.spoilers,
    group: state.group
  }));
}

function statValue(key, fallback = "—") {
  const entry = HK.sections.intro.entries[key];
  return entry && entry.spoiler !== "" ? entry.spoiler : fallback;
}

function summary(entries) {
  const actionable = entries.filter(item => !["info", "unavailable"].includes(item.status));
  const complete = actionable.filter(item => item.status === "complete").length;
  const missing = actionable.filter(item => item.status === "missing").length;
  const mapped = entries.filter(item => item.region).length;
  return { actionable: actionable.length, complete, missing, mapped };
}

function renderSidebarStats(entries) {
  const stats = summary(entries);
  const completion = `${statValue("gameCompletion", 0)}%`;
  document.querySelector("#sidebar-completion").textContent = HK.saveAnalyzed ? completion : "No save";
  document.querySelector("#sidebar-progress-fill").style.width = HK.saveAnalyzed ? `${Math.min(Number(statValue("gameCompletion", 0)), 112) / 1.12}%` : "0%";
  document.querySelector("#sidebar-count").textContent = HK.saveAnalyzed ? `${stats.complete} checks complete` : `${entries.length} checks indexed`;
  document.querySelector("#save-state").textContent = HK.saveAnalyzed ? "Save loaded" : "No save loaded";
  document.querySelector("#save-state").classList.toggle("is-loaded", HK.saveAnalyzed);
}

function renderDashboard(entries) {
  const stats = summary(entries);
  const trueCompletion = HK.sections.intro.entries.gameCompletionExtended;
  const cards = Object.entries(GROUPS).map(([key, group]) => {
    const groupItems = entries.filter(item => item.group === key && !["info", "unavailable"].includes(item.status));
    const done = groupItems.filter(item => item.status === "complete").length;
    const percent = groupItems.length ? Math.round(done / groupItems.length * 100) : 0;
    return `<button class="category-card" data-open-group="${key}">
      <span class="category-icon">${String(done).padStart(2, "0")}</span>
      <span class="category-copy"><strong>${escapeHTML(group.label)}</strong><small>${done} of ${groupItems.length} checks</small></span>
      <span class="category-percent">${percent}%</span>
    </button>`;
  }).join("");

  document.querySelector("#dashboard-view").innerHTML = `
    <div class="view-heading"><div><span class="overline">Journey overview</span><h1>${HK.saveAnalyzed ? "Your Hallownest run" : "Map your journey"}</h1><p>${HK.saveAnalyzed ? "Your save is decoded. Every section below is now live." : "Load a save to turn the full Hollow Knight database into your personal checklist."}</p></div><button class="primary-action" data-upload>Load save</button></div>
    <div class="hero-stats">
      <article class="completion-stat"><span>Game completion</span><strong>${HK.saveAnalyzed ? `${statValue("gameCompletion", 0)}<small>% / 112%</small>` : "—"}</strong><div class="meter"><i style="width:${HK.saveAnalyzed ? Math.min(Number(statValue("gameCompletion", 0)) / 1.12, 100) : 0}%"></i></div></article>
      <article><span>True completion</span><strong>${HK.saveAnalyzed ? `${trueCompletion.spoiler}<small> checks</small>` : "—"}</strong><small>${HK.saveAnalyzed ? stripMarkup(trueCompletion.spoilerAfter) : "Extended tracker"}</small></article>
      <article><span>Time played</span><strong>${HK.saveAnalyzed ? escapeHTML(statValue("timePlayed")) : "—"}</strong><small>Local save time</small></article>
      <article><span>Still missing</span><strong>${HK.saveAnalyzed ? stats.missing : "—"}</strong><small>${HK.saveAnalyzed ? `of ${stats.actionable} trackable checks` : `${entries.length} entries available`}</small></article>
    </div>
    <div class="section-heading"><div><span class="overline">All systems</span><h2>Progress categories</h2></div><button class="text-action" data-tab-target="progress">Browse every check</button></div>
    <div class="category-grid">${cards}</div>
    <div class="dashboard-lower">
      <article class="feature-card map-feature"><span class="overline">Interactive atlas</span><h2>${stats.mapped} locations connected</h2><p>Explore checks by Hallownest region. Search pins, filter categories, and jump from any checklist card to its area.</p><button class="secondary-action" data-tab-target="map">Open Hallownest map</button></article>
      <article class="feature-card"><span class="overline">Private by design</span><h2>Your save stays here</h2><p>Decoding and analysis run entirely in this browser. Nothing is uploaded to a server.</p><div class="privacy-line"><span>Browser only</span><span>No account</span><span>Open source</span></div></article>
    </div>`;
}

function matchesProgress(item) {
  if (state.group !== "all" && item.group !== state.group) return false;
  if (state.missingOnly && item.status === "complete") return false;
  if (state.missingOnly && ["info", "unavailable"].includes(item.status)) return false;
  const query = state.query.trim().toLowerCase();
  return !query || `${item.name} ${item.section} ${item.description}`.toLowerCase().includes(query);
}

function renderProgress(entries) {
  const filtered = entries.filter(matchesProgress);
  const groupButtons = [`<button class="filter-chip ${state.group === "all" ? "active" : ""}" data-group="all">All</button>`]
    .concat(Object.entries(GROUPS).map(([key, group]) => `<button class="filter-chip ${state.group === key ? "active" : ""}" data-group="${key}">${escapeHTML(group.label)}</button>`)).join("");
  const sections = [...new Set(filtered.map(item => item.sectionKey))];
  const body = sections.map(sectionKey => {
    const items = filtered.filter(item => item.sectionKey === sectionKey);
    const section = HK.sections[sectionKey];
    const done = items.filter(item => item.status === "complete").length;
    const cards = items.map(item => renderEntryCard(item)).join("");
    return `<section class="progress-section"><div class="progress-section-heading"><div><h2>${escapeHTML(stripMarkup(section.h2))}</h2><p>${escapeHTML(stripMarkup(section.description))}</p></div><span>${done}/${items.length}</span></div><div class="check-grid">${cards}</div></section>`;
  }).join("");

  document.querySelector("#progress-view").innerHTML = `
    <div class="view-heading compact"><div><span class="overline">Complete database</span><h1>Progress tracker</h1><p>Search every check or narrow the list by system and save status.</p></div><button class="primary-action" data-upload>${HK.saveAnalyzed ? "Load another save" : "Load save"}</button></div>
    <div class="tracker-toolbar"><label class="search-box"><span>Search</span><input id="progress-search" value="${escapeHTML(state.query)}" placeholder="Boss, charm, grub, location..."></label><label class="switch-control"><input id="missing-only" type="checkbox" ${state.missingOnly ? "checked" : ""}><span></span>Missing only</label><label class="switch-control"><input id="show-spoilers" type="checkbox" ${state.spoilers ? "checked" : ""}><span></span>Show locations</label></div>
    <div class="filter-row">${groupButtons}</div>
    <div class="results-count"><strong>${filtered.length}</strong> checks shown${HK.saveAnalyzed ? " from your analyzed save" : " — load a save for live status"}</div>
    <div id="progress-sections">${body || `<div class="empty-state"><h2>No checks match</h2><p>Clear a filter or try a broader search.</p></div>`}</div>`;
}

function renderEntryCard(item) {
  const location = item.description || (item.region ? REGIONS[item.region].label : "Location not catalogued");
  const wiki = item.wiki ? `<a class="icon-link" href="${WIKI_ROOT}${encodeURI(item.wiki)}" target="_blank" rel="noreferrer" aria-label="Open wiki">Wiki</a>` : "";
  const map = item.region ? `<button class="icon-link" data-map-entry="${item.id}">Map</button>` : "";
  return `<article class="check-card status-${item.status}">
    <span class="status-mark" aria-label="${item.status}"></span>
    <div class="check-copy"><span class="check-section">${escapeHTML(item.section)}</span><h3>${escapeHTML(item.name)}</h3><p class="spoiler-copy ${state.spoilers ? "revealed" : ""}">${state.spoilers ? escapeHTML(location) : "Location hidden — enable Show locations"}</p></div>
    <div class="card-actions">${map}${wiki}</div>
  </article>`;
}

function mapPoint(item, index) {
  const region = REGIONS[item.region];
  let hash = 0;
  for (const char of item.id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const xOffset = ((hash % 1000) / 1000 - 0.5) * region.w * 0.72;
  const yOffset = ((((hash / 1000) | 0) % 1000) / 1000 - 0.5) * region.h * 0.62;
  return { x: region.x + xOffset, y: region.y + yOffset, z: index + 1 };
}

function mapFiltered(entries) {
  return entries.filter(item => {
    if (!item.region) return false;
    if (state.mapCategory !== "all" && item.group !== state.mapCategory) return false;
    if (state.missingOnly && item.status === "complete") return false;
    const query = state.mapQuery.trim().toLowerCase();
    return !query || `${item.name} ${item.section} ${item.description} ${REGIONS[item.region].label}`.toLowerCase().includes(query);
  });
}

function renderMap(entries) {
  const filtered = mapFiltered(entries);
  const regions = Object.entries(REGIONS).map(([key, region]) => `<div class="map-region map-region-${key}" style="left:${region.x - region.w / 2}%;top:${region.y - region.h / 2}%;width:${region.w}%;height:${region.h}%"><span>${escapeHTML(region.label)}</span></div>`).join("");
  const pins = filtered.map((item, index) => {
    const point = mapPoint(item, index);
    return `<button class="map-pin status-${item.status} ${state.selectedEntry === item.id ? "selected" : ""}" style="left:${point.x}%;top:${point.y}%;z-index:${point.z}" data-select-entry="${item.id}" title="${escapeHTML(item.name)}"><span></span></button>`;
  }).join("");
  const options = [`<option value="all">All categories</option>`].concat(Object.entries(GROUPS).map(([key, group]) => `<option value="${key}" ${state.mapCategory === key ? "selected" : ""}>${escapeHTML(group.label)}</option>`)).join("");
  const selected = entries.find(item => item.id === state.selectedEntry);
  const detail = selected ? `<div class="map-detail status-${selected.status}"><span class="status-mark"></span><div><small>${escapeHTML(REGIONS[selected.region].label)} · ${escapeHTML(selected.section)}</small><h3>${escapeHTML(selected.name)}</h3><p>${state.spoilers ? escapeHTML(selected.description || "No additional directions.") : "Enable Show locations in Progress to reveal directions."}</p></div>${selected.wiki ? `<a href="${WIKI_ROOT}${encodeURI(selected.wiki)}" target="_blank" rel="noreferrer">Wiki</a>` : ""}</div>` : `<div class="map-detail empty"><div><small>Map details</small><h3>Select a pin</h3><p>Choose any marker to inspect its save status and location notes.</p></div></div>`;

  document.querySelector("#map-view").innerHTML = `
    <div class="view-heading compact"><div><span class="overline">Region-linked checks</span><h1>Hallownest map</h1><p>A searchable schematic atlas. Markers are tied to real analyzer entries at region level.</p></div><button class="primary-action" data-upload>${HK.saveAnalyzed ? "Load another save" : "Load save"}</button></div>
    <div class="map-layout"><aside class="map-controls-panel"><label>Find a location<input id="map-search" value="${escapeHTML(state.mapQuery)}" placeholder="Search map pins..."></label><label>Category<select id="map-category">${options}</select></label><div class="map-result-count"><strong>${filtered.length}</strong><span>visible markers</span></div><div class="map-legend"><span><i class="legend-complete"></i>Complete</span><span><i class="legend-missing"></i>Missing</span><span><i class="legend-partial"></i>Partial</span><span><i class="legend-unknown"></i>Unknown</span></div><button class="secondary-action wide" id="map-show-all">Reset map filters</button></aside>
      <div class="map-canvas-wrap"><div class="map-tools"><button id="map-zoom-out" aria-label="Zoom out">−</button><button id="map-reset" aria-label="Reset map">Fit</button><button id="map-zoom-in" aria-label="Zoom in">+</button></div><div id="map-viewport"><div id="map-stage" style="transform:translate(${state.panX}px, ${state.panY}px) scale(${state.scale})"><div class="map-backdrop"></div>${regions}<div class="map-pins">${pins}</div></div></div>${detail}</div></div>`;
  initMapInteractions();
}

function renderRaw() {
  const raw = state.save ? JSON.stringify(state.save, null, 2) : "No save file loaded. Load a save to inspect its decoded JSON.";
  document.querySelector("#raw-view").innerHTML = `
    <div class="view-heading compact"><div><span class="overline">Decoded locally</span><h1>Raw save data</h1><p>Inspect, copy, or download the exact JSON produced by the decoder.</p></div><button class="primary-action" data-upload>${HK.saveAnalyzed ? "Load another save" : "Load save"}</button></div>
    <div class="raw-card"><div class="raw-toolbar"><span>${state.save ? "hollow-knight-save.json" : "Waiting for save"}</span><div><button id="copy-raw" ${state.save ? "" : "disabled"}>Copy JSON</button><button id="download-raw" ${state.save ? "" : "disabled"}>Download</button></div></div><pre><code>${escapeHTML(raw)}</code></pre></div>`;
}

function render() {
  const entries = flattenEntries();
  renderSidebarStats(entries);
  renderDashboard(entries);
  renderProgress(entries);
  renderMap(entries);
  renderRaw();
  document.querySelectorAll(".workspace-view").forEach(view => view.classList.toggle("active", view.id === `${state.activeTab}-view`));
  document.querySelectorAll("[data-nav-tab]").forEach(button => button.classList.toggle("active", button.dataset.navTab === state.activeTab));
  bindDynamicEvents();
}

function changeTab(tab) {
  state.activeTab = tab;
  document.body.classList.remove("sidebar-open");
  savePreferences();
  render();
  document.querySelector("#workspace").scrollTo({ top: 0, behavior: "smooth" });
}

function openUploader() {
  document.querySelector("#save-area-file").click();
}

function bindDynamicEvents() {
  document.querySelectorAll("[data-upload]").forEach(button => { button.onclick = openUploader; });
  document.querySelectorAll("[data-tab-target]").forEach(button => { button.onclick = () => changeTab(button.dataset.tabTarget); });
  document.querySelectorAll("[data-open-group]").forEach(button => { button.onclick = () => {
    state.group = button.dataset.openGroup;
    changeTab("progress");
  }; });
  document.querySelectorAll("[data-group]").forEach(button => { button.onclick = () => {
    state.group = button.dataset.group;
    savePreferences();
    render();
  }; });
  document.querySelector("#progress-search")?.addEventListener("input", event => {
    state.query = event.target.value;
    renderProgress(flattenEntries());
    bindDynamicEvents();
    document.querySelector("#progress-search")?.focus();
  });
  document.querySelector("#missing-only")?.addEventListener("change", event => {
    state.missingOnly = event.target.checked;
    savePreferences();
    render();
  });
  document.querySelector("#show-spoilers")?.addEventListener("change", event => {
    state.spoilers = event.target.checked;
    savePreferences();
    render();
  });
  document.querySelectorAll("[data-map-entry]").forEach(button => { button.onclick = () => {
    state.selectedEntry = button.dataset.mapEntry;
    state.mapQuery = "";
    state.mapCategory = "all";
    changeTab("map");
  }; });
  const copyRaw = document.querySelector("#copy-raw");
  if (copyRaw) copyRaw.onclick = async () => {
    if (state.save) await navigator.clipboard.writeText(JSON.stringify(state.save, null, 2));
  };
  const downloadRaw = document.querySelector("#download-raw");
  if (downloadRaw) downloadRaw.onclick = () => {
    if (!state.save) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(state.save, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "hollow-knight-save.json";
    link.click();
    URL.revokeObjectURL(url);
  };
}

function applyMapTransform() {
  const stage = document.querySelector("#map-stage");
  if (stage) stage.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
}

function initMapInteractions() {
  document.querySelector("#map-search")?.addEventListener("input", event => {
    state.mapQuery = event.target.value;
    renderMap(flattenEntries());
    bindDynamicEvents();
    document.querySelector("#map-search")?.focus();
  });
  document.querySelector("#map-category")?.addEventListener("change", event => {
    state.mapCategory = event.target.value;
    renderMap(flattenEntries());
    bindDynamicEvents();
  });
  document.querySelector("#map-show-all")?.addEventListener("click", () => {
    state.mapQuery = "";
    state.mapCategory = "all";
    state.missingOnly = false;
    render();
  });
  document.querySelector("#map-zoom-in")?.addEventListener("click", () => {
    state.scale = Math.min(2.6, state.scale + 0.2);
    applyMapTransform();
  });
  document.querySelector("#map-zoom-out")?.addEventListener("click", () => {
    state.scale = Math.max(1, state.scale - 0.2);
    applyMapTransform();
  });
  document.querySelector("#map-reset")?.addEventListener("click", () => {
    state.scale = 1; state.panX = 0; state.panY = 0; applyMapTransform();
  });
  document.querySelectorAll("[data-select-entry]").forEach(button => { button.onclick = () => {
    state.selectedEntry = button.dataset.selectEntry;
    renderMap(flattenEntries());
    bindDynamicEvents();
  }; });

  const viewport = document.querySelector("#map-viewport");
  if (!viewport) return;
  viewport.addEventListener("wheel", event => {
    event.preventDefault();
    state.scale = Math.max(1, Math.min(2.6, state.scale + (event.deltaY < 0 ? 0.12 : -0.12)));
    applyMapTransform();
  }, { passive: false });
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  viewport.addEventListener("pointerdown", event => {
    if (event.target.closest(".map-pin")) return;
    dragging = true; lastX = event.clientX; lastY = event.clientY;
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener("pointermove", event => {
    if (!dragging || state.scale === 1) return;
    state.panX += event.clientX - lastX; state.panY += event.clientY - lastY;
    lastX = event.clientX; lastY = event.clientY; applyMapTransform();
  });
  const stop = () => { dragging = false; };
  viewport.addEventListener("pointerup", stop);
  viewport.addEventListener("pointercancel", stop);
}

function init() {
  Object.assign(state, getPreferences());
  document.querySelectorAll("[data-nav-tab]").forEach(button => button.addEventListener("click", event => {
    event.preventDefault();
    changeTab(button.dataset.navTab);
  }));
  document.querySelector("#global-upload").addEventListener("click", openUploader);
  document.querySelector("#global-reset").addEventListener("click", () => location.reload());
  document.querySelector("#mobile-menu").addEventListener("click", () => document.body.classList.toggle("sidebar-open"));
  document.querySelector("#save-area-file").addEventListener("change", event => {
    const name = event.target.files?.[0]?.name;
    if (name) document.querySelector("#save-state").textContent = `Analyzing ${name}`;
  });
  window.addEventListener("hallownest-save-analyzed", event => {
    state.save = event.detail.save;
    state.activeTab = "dashboard";
    state.selectedEntry = null;
    requestAnimationFrame(render);
  });

  const dropTarget = document.querySelector("#workspace");
  dropTarget.addEventListener("dragover", event => { event.preventDefault(); document.body.classList.add("is-dragging"); });
  dropTarget.addEventListener("dragleave", () => document.body.classList.remove("is-dragging"));
  dropTarget.addEventListener("drop", event => {
    event.preventDefault(); document.body.classList.remove("is-dragging");
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    const transfer = new DataTransfer(); transfer.items.add(file);
    const input = document.querySelector("#save-area-file"); input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  render();
}

document.addEventListener("DOMContentLoaded", init);
