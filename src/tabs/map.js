import { GROUPS, HK, REGIONS, WIKI_ROOT, escapeHTML, flattenEntries } from "../app/tracker-model.js";
import { state } from "../app/tracker-state.js";
import { itemIconFor } from "../data/item-icons.js";

const MAP_WIDTH = 2560;
const MAP_HEIGHT = 1651;
const MAP_MAX_ZOOM = 6;
const MAP_URL = `${import.meta.env.BASE_URL}assets/maps/hallownest-clean.webp`;
const MAP_SOURCE = "https://hollowknight.wiki/w/File:Clean_map_updated.png";

let mapResizeObserver = null;
let mapFilterScroll = 0;

function hashText(value) {
  let hash = 2166136261;
  for (const char of String(value || "")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mapPoint(item, index) {
  const region = REGIONS[item.region];
  const sceneHash = hashText(item.sceneName || item.description || item.name);
  const itemHash = hashText(item.id);
  const sceneX = ((sceneHash % 10000) / 9999 - 0.5) * region.w * 0.66;
  const sceneY = (((Math.floor(sceneHash / 10000) % 10000) / 9999) - 0.5) * region.h * 0.62;
  const angle = ((itemHash % 360) * Math.PI) / 180;
  const radius = 0.2 + ((itemHash >>> 9) % 100) / 180;
  return {
    x: Math.max(1.5, Math.min(98.5, region.x + sceneX + Math.cos(angle) * radius)),
    y: Math.max(1.5, Math.min(98.5, region.y + sceneY + Math.sin(angle) * radius)),
    z: index + 1
  };
}

function mapFiltered(entries) {
  return entries.filter(item => {
    if (!item.region || REGIONS[item.region].atlas === false) return false;
    if (state.mapHiddenSections.has(item.sectionKey)) return false;
    if (state.missingOnly && item.status === "complete") return false;
    const query = state.mapQuery.trim().toLowerCase();
    const region = REGIONS[item.region]?.label || "";
    return !query || `${item.name} ${item.section} ${item.description} ${item.sceneName || ""} ${region}`.toLowerCase().includes(query);
  });
}

function sectionFilterMarkup(entries) {
  return Object.entries(GROUPS).map(([groupKey, group]) => {
    const sections = group.sections.map(sectionKey => {
      const items = entries.filter(item => item.sectionKey === sectionKey && item.region && REGIONS[item.region].atlas !== false);
      if (!items.length) return "";
      const checked = !state.mapHiddenSections.has(sectionKey);
      return `<label class="map-section-filter"><input type="checkbox" data-map-section="${sectionKey}" ${checked ? "checked" : ""}><span>${escapeHTML(items[0].section)}</span><small>${items.length}</small></label>`;
    }).filter(Boolean).join("");
    return sections ? `<section class="map-filter-group" data-map-filter-group="${groupKey}"><h3>${escapeHTML(group.label)}</h3><div>${sections}</div></section>` : "";
  }).join("");
}

function regionMarkup() {
  if (!state.mapLabels) return "";
  return Object.entries(REGIONS).filter(([, region]) => region.atlas !== false).map(([key, region]) => `<div class="map-region map-region-${key}" style="left:${region.x - region.w / 2}%;top:${region.y - region.h / 2}%;width:${region.w}%;height:${region.h}%"><span>${escapeHTML(region.label)}</span></div>`).join("");
}

function pinMarkup(filtered) {
  return filtered.map((item, index) => {
    const point = mapPoint(item, index);
    const icon = itemIconFor(item);
    const artwork = icon ? `<img src="${icon}" alt="" loading="lazy">` : "<span></span>";
    const exactness = item.sceneName ? `Scene: ${item.sceneName}` : `Area: ${REGIONS[item.region].label}`;
    return `<button class="map-pin status-${item.status} ${icon ? "has-art" : ""} ${state.selectedEntry === item.id ? "selected" : ""}" style="left:${point.x}%;top:${point.y}%;z-index:${point.z}" data-select-entry="${item.id}" title="${escapeHTML(item.name)} · ${escapeHTML(exactness)}">${artwork}</button>`;
  }).join("");
}

function selectedDetail(entries) {
  const selected = entries.find(item => item.id === state.selectedEntry && item.region && REGIONS[item.region].atlas !== false);
  if (!selected) return `<div class="map-detail empty"><div><small>Map details</small><h3>Select a marker</h3><p>Choose a marker to inspect its save status and location notes.</p></div></div>`;
  const location = selected.sceneName ? `${REGIONS[selected.region].label} · ${selected.sceneName}` : REGIONS[selected.region].label;
  return `<div class="map-detail status-${selected.status}"><span class="status-mark"></span><div><small>${escapeHTML(location)} · ${escapeHTML(selected.section)}</small><h3>${escapeHTML(selected.name)}</h3><p>${state.spoilers ? escapeHTML(selected.description || "No additional directions.") : "Enable Show spoilers to reveal directions."}</p></div>${selected.wiki ? `<a href="${WIKI_ROOT}${encodeURI(selected.wiki)}" target="_blank" rel="noreferrer">Wiki</a>` : ""}</div>`;
}

function renderMap(entries, onSelectEntry) {
  mapResizeObserver?.disconnect();
  const filtered = mapFiltered(entries);
  const sceneCount = new Set(filtered.map(item => item.sceneName).filter(Boolean)).size;
  const sectionFilters = sectionFilterMarkup(entries);

  document.querySelector("#map-view").innerHTML = `
    <div class="view-heading compact"><div><span class="overline">Save-aware atlas</span><h1>Interactive Map</h1><p>Explore the real Hallownest map with save-linked checks grouped by scene and area.</p></div><button class="primary-action" data-upload>${HK.saveAnalyzed ? "Load another save" : "Load save"}</button></div>
    <div class="map-layout"><div class="map-canvas-wrap">
      <div class="map-filter-anchor">
        <button id="map-filter-toggle" class="map-filter-toggle" type="button" aria-expanded="${state.mapFiltersOpen}"><span>☷</span> Map filters <small>${state.mapHiddenSections.size ? `${state.mapHiddenSections.size} hidden` : "All shown"}</small></button>
        <aside id="map-filter-menu" class="map-filter-menu" ${state.mapFiltersOpen ? "" : "hidden"}>
          <header><h2>Map Filters</h2><button id="map-filter-close" type="button">Hide filters</button></header>
          <label class="map-search-label"><span>Search locations</span><input id="map-search" value="${escapeHTML(state.mapQuery)}" placeholder="Name, scene, or area..."></label>
          <div class="map-filter-actions"><button id="map-sections-show-all" type="button">Show all</button><button id="map-sections-hide-all" type="button">Hide all</button></div>
          <div class="map-filter-sections">${sectionFilters}</div>
          <div class="map-filter-utilities"><label class="map-label-toggle"><input id="map-labels" type="checkbox" ${state.mapLabels ? "checked" : ""}>Show area guides</label><button class="secondary-action" id="map-reset-filters" type="button">Reset all filters</button></div>
          <div class="map-legend"><span><i class="legend-complete"></i>Complete</span><span><i class="legend-missing"></i>Missing</span><span><i class="legend-partial"></i>Partial</span><span><i class="legend-unknown"></i>Unknown</span></div>
          <p class="map-placement-note">Pins use save-database scene IDs and calibrated area placement. They are approximate, not room-perfect. White Palace and Godhome use separate maps.</p>
        </aside>
      </div>
      <div class="map-tools"><button id="map-zoom-out" aria-label="Zoom out">−</button><button id="map-reset" aria-label="Fit map">Fit</button><button id="map-zoom-in" aria-label="Zoom in">+</button></div>
      <div id="map-viewport" aria-label="Interactive Hallownest map"><div id="map-stage"><img class="hallownest-map-art" src="${MAP_URL}" width="${MAP_WIDTH}" height="${MAP_HEIGHT}" alt="Clean map of Hallownest" draggable="false"><div class="map-regions">${regionMarkup()}</div><div class="map-pins">${pinMarkup(filtered)}</div></div><div class="map-result-count"><strong>${filtered.length}</strong><span>markers across ${sceneCount} known scenes</span></div></div>
      <div class="map-attribution">Map artwork © Team Cherry · <a href="${MAP_SOURCE}" target="_blank" rel="noreferrer">Hollow Knight Wiki source</a> · Drag to pan, scroll to zoom</div>
      ${selectedDetail(entries)}
    </div></div>`;
  const filterMenu = document.querySelector("#map-filter-menu");
  if (filterMenu && state.mapFiltersOpen) filterMenu.scrollTop = mapFilterScroll;
  bindMapInteractions(onSelectEntry);
  requestAnimationFrame(applyMapTransform);
}

function rerender(onSelectEntry) {
  const filterMenu = document.querySelector("#map-filter-menu");
  if (filterMenu && !filterMenu.hidden) mapFilterScroll = filterMenu.scrollTop;
  renderMap(flattenEntries(), onSelectEntry);
}

function mapMetrics(scale = state.scale) {
  const viewport = document.querySelector("#map-viewport");
  if (!viewport) return null;
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;
  const fit = Math.min(width / MAP_WIDTH, height / MAP_HEIGHT);
  const effective = fit * scale;
  return { viewport, width, height, fit, effective, renderedWidth: MAP_WIDTH * effective, renderedHeight: MAP_HEIGHT * effective };
}

function clampPan(metrics) {
  const maxX = Math.max(0, (metrics.renderedWidth - metrics.width) / 2);
  const maxY = Math.max(0, (metrics.renderedHeight - metrics.height) / 2);
  state.panX = Math.max(-maxX, Math.min(maxX, state.panX));
  state.panY = Math.max(-maxY, Math.min(maxY, state.panY));
}

function applyMapTransform() {
  const stage = document.querySelector("#map-stage");
  const metrics = mapMetrics();
  if (!stage || !metrics) return;
  clampPan(metrics);
  const x = (metrics.width - metrics.renderedWidth) / 2 + state.panX;
  const y = (metrics.height - metrics.renderedHeight) / 2 + state.panY;
  stage.style.transform = `translate(${x}px, ${y}px) scale(${metrics.effective})`;
}

function setZoom(nextScale, clientX, clientY) {
  const before = mapMetrics();
  if (!before) return;
  const next = Math.max(1, Math.min(MAP_MAX_ZOOM, nextScale));
  if (next === state.scale) return;
  const rect = before.viewport.getBoundingClientRect();
  const cursorX = clientX == null ? before.width / 2 : clientX - rect.left;
  const cursorY = clientY == null ? before.height / 2 : clientY - rect.top;
  const oldOriginX = (before.width - before.renderedWidth) / 2 + state.panX;
  const oldOriginY = (before.height - before.renderedHeight) / 2 + state.panY;
  const mapX = (cursorX - oldOriginX) / before.effective;
  const mapY = (cursorY - oldOriginY) / before.effective;
  state.scale = next;
  const after = mapMetrics();
  const centeredX = (after.width - after.renderedWidth) / 2;
  const centeredY = (after.height - after.renderedHeight) / 2;
  state.panX = cursorX - mapX * after.effective - centeredX;
  state.panY = cursorY - mapY * after.effective - centeredY;
  applyMapTransform();
}

function resetMapView() {
  state.scale = 1;
  state.panX = 0;
  state.panY = 0;
  applyMapTransform();
}

function bindMapInteractions(onSelectEntry) {
  const setFiltersOpen = open => {
    state.mapFiltersOpen = open;
    const menu = document.querySelector("#map-filter-menu");
    const toggle = document.querySelector("#map-filter-toggle");
    if (menu) menu.hidden = !open;
    toggle?.setAttribute("aria-expanded", String(open));
  };
  document.querySelector("#map-filter-toggle")?.addEventListener("click", () => setFiltersOpen(!state.mapFiltersOpen));
  document.querySelector("#map-filter-close")?.addEventListener("click", () => setFiltersOpen(false));
  document.querySelector("#map-search")?.addEventListener("input", event => {
    state.mapQuery = event.target.value;
    state.mapFiltersOpen = true;
    rerender(onSelectEntry);
    const search = document.querySelector("#map-search");
    search?.focus();
    search?.setSelectionRange(search.value.length, search.value.length);
  });
  document.querySelectorAll("[data-map-section]").forEach(input => {
    input.addEventListener("change", () => {
      if (input.checked) state.mapHiddenSections.delete(input.dataset.mapSection);
      else state.mapHiddenSections.add(input.dataset.mapSection);
      state.mapFiltersOpen = true;
      rerender(onSelectEntry);
    });
  });
  document.querySelector("#map-sections-show-all")?.addEventListener("click", () => {
    state.mapHiddenSections.clear();
    state.mapFiltersOpen = true;
    rerender(onSelectEntry);
  });
  document.querySelector("#map-sections-hide-all")?.addEventListener("click", () => {
    document.querySelectorAll("[data-map-section]").forEach(input => state.mapHiddenSections.add(input.dataset.mapSection));
    state.mapFiltersOpen = true;
    rerender(onSelectEntry);
  });
  document.querySelector("#map-labels")?.addEventListener("change", event => {
    state.mapLabels = event.target.checked;
    rerender(onSelectEntry);
  });
  document.querySelector("#map-reset-filters")?.addEventListener("click", () => {
    state.mapQuery = "";
    state.mapCategory = "all";
    state.mapHiddenSections.clear();
    state.missingOnly = false;
    state.mapLabels = false;
    state.mapFiltersOpen = true;
    const missing = document.querySelector("#global-missing-only");
    if (missing) missing.checked = false;
    rerender(onSelectEntry);
  });
  document.querySelector("#map-zoom-in")?.addEventListener("click", () => setZoom(state.scale * 1.25));
  document.querySelector("#map-zoom-out")?.addEventListener("click", () => setZoom(state.scale / 1.25));
  document.querySelector("#map-reset")?.addEventListener("click", resetMapView);
  document.querySelectorAll("[data-select-entry]").forEach(button => {
    button.onclick = () => {
      state.selectedEntry = button.dataset.selectEntry;
      const item = flattenEntries().find(entry => entry.id === state.selectedEntry);
      if (item) onSelectEntry(item);
    };
  });

  const viewport = document.querySelector("#map-viewport");
  if (!viewport) return;
  viewport.addEventListener("wheel", event => {
    event.preventDefault();
    setZoom(state.scale * (event.deltaY < 0 ? 1.14 : 1 / 1.14), event.clientX, event.clientY);
  }, { passive: false });

  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  viewport.addEventListener("pointerdown", event => {
    if (event.target.closest(".map-pin")) return;
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    viewport.classList.add("dragging");
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener("pointermove", event => {
    if (!dragging || state.scale === 1) return;
    state.panX += event.clientX - lastX;
    state.panY += event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    applyMapTransform();
  });
  const stop = () => {
    dragging = false;
    viewport.classList.remove("dragging");
  };
  viewport.addEventListener("pointerup", stop);
  viewport.addEventListener("pointercancel", stop);
  viewport.addEventListener("dblclick", event => setZoom(state.scale * 1.5, event.clientX, event.clientY));

  mapResizeObserver = new ResizeObserver(applyMapTransform);
  mapResizeObserver.observe(viewport);
}

export { renderMap };
