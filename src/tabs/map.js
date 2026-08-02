import { GROUPS, HK, REGIONS, WIKI_ROOT, escapeHTML, flattenEntries } from "../app/tracker-model.js";
import { state } from "../app/tracker-state.js";
import hallownestMapUrl from "../assets/hallownest-map.svg";

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

function renderMap(entries, onSelectEntry) {
  const filtered = mapFiltered(entries);
  const regions = Object.entries(REGIONS).map(([key, region]) => `<div class="map-region map-region-${key}" style="left:${region.x - region.w / 2}%;top:${region.y - region.h / 2}%;width:${region.w}%;height:${region.h}%"><span>${escapeHTML(region.label)}</span></div>`).join("");
  const pins = filtered.map((item, index) => {
    const point = mapPoint(item, index);
    return `<button class="map-pin status-${item.status} ${state.selectedEntry === item.id ? "selected" : ""}" style="left:${point.x}%;top:${point.y}%;z-index:${point.z}" data-select-entry="${item.id}" title="${escapeHTML(item.name)}"><span></span></button>`;
  }).join("");
  const options = [`<option value="all">All categories</option>`].concat(Object.entries(GROUPS).map(([key, group]) => `<option value="${key}" ${state.mapCategory === key ? "selected" : ""}>${escapeHTML(group.label)}</option>`)).join("");
  const selected = entries.find(item => item.id === state.selectedEntry);
  const detail = selected ? `<div class="map-detail status-${selected.status}"><span class="status-mark"></span><div><small>${escapeHTML(REGIONS[selected.region].label)} · ${escapeHTML(selected.section)}</small><h3>${escapeHTML(selected.name)}</h3><p>${state.spoilers ? escapeHTML(selected.description || "No additional directions.") : "Enable Show spoilers to reveal directions."}</p></div>${selected.wiki ? `<a href="${WIKI_ROOT}${encodeURI(selected.wiki)}" target="_blank" rel="noreferrer">Wiki</a>` : ""}</div>` : `<div class="map-detail empty"><div><small>Map details</small><h3>Select a pin</h3><p>Choose any marker to inspect its save status and location notes.</p></div></div>`;

  document.querySelector("#map-view").innerHTML = `
    <div class="view-heading compact"><div><span class="overline">Save-aware atlas</span><h1>Interactive Map</h1><p>Search and filter Hallownest markers tied directly to completion checks.</p></div><button class="primary-action" data-upload>${HK.saveAnalyzed ? "Load another save" : "Load save"}</button></div>
    <div class="map-layout"><aside class="map-controls-panel"><label>Find a location<input id="map-search" value="${escapeHTML(state.mapQuery)}" placeholder="Search map pins..."></label><label>Category<select id="map-category">${options}</select></label><div class="map-result-count"><strong>${filtered.length}</strong><span>visible markers</span></div><div class="map-legend"><span><i class="legend-complete"></i>Complete</span><span><i class="legend-missing"></i>Missing</span><span><i class="legend-partial"></i>Partial</span><span><i class="legend-unknown"></i>Unknown</span></div><button class="secondary-action wide" id="map-show-all">Reset map filters</button><a class="external-map-link" href="https://www.ign.com/maps/hollow-knight/hallownest" target="_blank" rel="noreferrer">Open IGN reference map</a></aside>
      <div class="map-canvas-wrap"><div class="map-tools"><button id="map-zoom-out" aria-label="Zoom out">−</button><button id="map-reset" aria-label="Reset map">Fit</button><button id="map-zoom-in" aria-label="Zoom in">+</button></div><div id="map-viewport"><div id="map-stage" style="transform:translate(${state.panX}px, ${state.panY}px) scale(${state.scale})"><div class="map-backdrop"></div><img class="hallownest-map-art" src="${hallownestMapUrl}" alt="Stylized map of Hallownest" draggable="false">${regions}<div class="map-pins">${pins}</div></div></div>${detail}</div></div>`;
  bindMapInteractions(onSelectEntry);
}

function rerender(onSelectEntry) {
  renderMap(flattenEntries(), onSelectEntry);
}

function applyMapTransform() {
  const stage = document.querySelector("#map-stage");
  if (stage) stage.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
}

function bindMapInteractions(onSelectEntry) {
  document.querySelector("#map-search")?.addEventListener("input", event => {
    state.mapQuery = event.target.value;
    rerender(onSelectEntry);
    document.querySelector("#map-search")?.focus();
  });
  document.querySelector("#map-category")?.addEventListener("change", event => {
    state.mapCategory = event.target.value;
    rerender(onSelectEntry);
  });
  document.querySelector("#map-show-all")?.addEventListener("click", () => {
    state.mapQuery = "";
    state.mapCategory = "all";
    state.missingOnly = false;
    document.querySelector("#global-missing-only").checked = false;
    rerender(onSelectEntry);
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
    state.scale = 1;
    state.panX = 0;
    state.panY = 0;
    applyMapTransform();
  });
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
    state.scale = Math.max(1, Math.min(2.6, state.scale + (event.deltaY < 0 ? 0.12 : -0.12)));
    applyMapTransform();
  }, { passive: false });
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  viewport.addEventListener("pointerdown", event => {
    if (event.target.closest(".map-pin")) return;
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
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
  const stop = () => { dragging = false; };
  viewport.addEventListener("pointerup", stop);
  viewport.addEventListener("pointercancel", stop);
}

export { renderMap };
