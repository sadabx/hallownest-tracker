import { GROUPS, HK, REGIONS, WIKI_ROOT, escapeHTML, statValue, stripMarkup } from "../app/tracker-model.js";
import { state } from "../app/tracker-state.js";
import { itemIconFor } from "../data/item-icons.js";

function matchesProgress(item) {
  if (state.group !== "all" && item.group !== state.group) return false;
  if (state.missingOnly && item.status === "complete") return false;
  if (state.missingOnly && ["info", "unavailable"].includes(item.status)) return false;
  const query = state.query.trim().toLowerCase();
  return !query || `${item.name} ${item.section} ${item.description}`.toLowerCase().includes(query);
}

function renderEntryCard(item) {
  const location = item.description || (item.region ? REGIONS[item.region].label : "Location not catalogued");
  const wiki = item.wiki ? `<a class="icon-link" href="${WIKI_ROOT}${encodeURI(item.wiki)}" target="_blank" rel="noreferrer" aria-label="Open wiki">Wiki</a>` : "";
  const map = item.region ? `<button class="icon-link" data-map-entry="${item.id}">Map</button>` : "";
  const icon = itemIconFor(item);
  const artwork = icon ? `<img src="${icon}" alt="" loading="lazy">` : `<span class="locked-art">?</span>`;
  const displayName = item.name.replace(/^#\d+\s+/, "");
  const badge = ["grimmTroupe", "lifeblood", "godmaster"].includes(item.sectionKey) ? "DLC" : "Base";
  return `<article class="check-card status-${item.status}" data-entry-details="${item.id}" tabindex="0">
    <span class="check-section">${badge}</span>
    <div class="check-art" aria-hidden="true">${artwork}</div>
    <div class="check-copy"><h3>${escapeHTML(displayName)}</h3><p class="spoiler-copy ${state.spoilers ? "revealed" : ""}">${state.spoilers ? escapeHTML(location) : ""}</p></div>
    <div class="card-actions">${map}${wiki}</div>
  </article>`;
}

function renderProgress(entries) {
  const filtered = entries.filter(matchesProgress);
  const groupEntries = Object.entries(GROUPS).filter(([key]) => state.group === "all" || state.group === key);
  const body = groupEntries.map(([groupKey, group]) => {
    const sections = group.sections.filter(sectionKey => filtered.some(item => item.sectionKey === sectionKey));
    if (!sections.length) return "";
    const sectionBody = sections.map(sectionKey => {
      const items = filtered.filter(item => item.sectionKey === sectionKey);
      const section = HK.sections[sectionKey];
      const done = items.filter(item => item.status === "complete").length;
      const cards = items.map(renderEntryCard).join("");
      return `<section class="progress-section" id="section-${sectionKey}"><div class="progress-section-heading"><h2>${escapeHTML(stripMarkup(section.h2))} <span>${done}/${items.length}</span></h2><p>${escapeHTML(stripMarkup(section.description))}</p></div><div class="check-grid">${cards}</div></section>`;
    }).join("");
    return `<section class="progress-group" data-group-key="${groupKey}" data-group-name="${escapeHTML(group.label)}"><h2 class="progress-group-banner">${escapeHTML(group.label)}</h2>${sectionBody}</section>`;
  }).join("");

  const geo = HK.sections.intro.entries.geo.amount || 0;
  const essence = HK.sections.essentialsCollectibles.entries.dreamOrbs.amount || 0;

  document.querySelector("#progress-view").innerHTML = `
    <div class="view-heading compact"><div><h1>All Progress</h1></div></div>
    <div class="hero-stats progress-summary">
      <article class="completion-stat"><span>Completion:</span><strong>${HK.saveAnalyzed ? `${statValue("gameCompletion", 0)}%` : "0%"}</strong></article>
      <article><span>Play Time:</span><strong>${HK.saveAnalyzed ? escapeHTML(statValue("timePlayed")) : "0h 00m"}</strong></article>
      <article><span>Geo:</span><strong>${HK.saveAnalyzed ? geo : 0}</strong></article>
      <article><span>Essence:</span><strong>${HK.saveAnalyzed ? essence : 0}</strong></article>
    </div>
    <div id="progress-sections">${body || `<div class="empty-state"><h2>No checks match</h2><p>Clear a filter or try a broader search.</p></div>`}</div>`;
}

function renderProgressTOC() {
  const toc = document.querySelector("#progress-toc");
  const groups = [...document.querySelectorAll("#progress-sections .progress-group")];
  if (!groups.some(group => group.dataset.groupKey === state.tocGroup)) {
    state.tocGroup = groups[0]?.dataset.groupKey || "main";
  }
  toc.innerHTML = `<nav>${groups.map(group => {
    const sections = [...group.querySelectorAll(".progress-section")];
    const isOpen = group.dataset.groupKey === state.tocGroup;
    return `<div class="toc-group ${isOpen ? "open" : ""}"><button type="button" data-toc-group="${group.dataset.groupKey}" aria-expanded="${isOpen}"><span>•</span>${escapeHTML(group.dataset.groupName)}</button><div class="toc-sublist">${sections.map(section => {
      const heading = section.querySelector("h2")?.textContent || "Section";
      return `<a href="#${section.id}" data-toc-target="${section.id}">◦ ${escapeHTML(heading)}</a>`;
    }).join("")}</div></div>`;
  }).join("")}</nav><div class="toc-legend"><strong>Legend</strong><span><i class="legend-complete"></i>Complete</span><span><i class="legend-missing"></i>Missing</span><span><i class="legend-partial"></i>Partial</span></div>`;
}

export { renderProgress, renderProgressTOC };
