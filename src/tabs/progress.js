import { GROUPS, HK, escapeHTML, statValue, stripMarkup } from "../app/tracker-model.js";
import { state } from "../app/tracker-state.js";
import { itemIconFor } from "../data/item-icons.js";

const LONG_DESCRIPTION_LIMIT = 130;
const SECTION_SUMMARIES = {
  bosses: "Bosses that count toward game completion.",
  charms: "Collect Charms for game completion.",
  warriorDreams: "Defeat Warrior Dreams and collect their Essence.",
  colosseum: "Complete the Colosseum Trials for game completion.",
  grimmTroupe: "Checks from the Grimm Troupe content pack.",
  lifeblood: "Lifeblood content pack checks, including one completion boss.",
  godmaster: "Godmaster checks add up to 5% completion.",
  essentialsStagStations: "Open the Stag Stations and discover the Stag Nest.",
  essentialsWorldInteractions: "World and NPC interactions required for 112% completion.",
  achievementsWorldInteractions: "World interactions tied to achievements.",
  huntersJournal: "Journal entries counted toward Hunter’s Mark and journal achievements.",
  huntersJournalOptional: "Additional Journal entries outside the Hunter’s Mark total.",
  charmNotches: "Find notches to equip more Charms.",
  grubs: "Rescue Grubs to earn rewards from the Grubfather.",
  whisperingRoots: "Collect Essence from Whispering Roots.",
  relicsWanderersJournal: "Find Wanderer’s Journals and sell them to Lemm.",
  relicsHallownestSeal: "Find Hallownest Seals and sell them to Lemm.",
  relicsKingsIdol: "Find King’s Idols and sell them to Lemm.",
  relicsArcaneEgg: "Find Arcane Eggs and sell them to Lemm.",
  rancidEggs: "Find Rancid Eggs throughout Hallownest.",
  items: "Miscellaneous items, map pins, and collectibles.",
  geoChests: "Open Geo Chests to collect their contents.",
  geoRocks: "Fully break Geo Rocks to collect their Geo.",
  worldInteractions: "Track optional interactions and world events.",
  corniferNotes: "Find Cornifer’s note in each area after he leaves.",
  statistics: "Save-file stats and tracked game totals.",
  hallOfGods: "Track boss unlocks and victories across all three difficulties."
};

function matchesProgress(item) {
  if (state.group !== "all" && item.group !== state.group) return false;
  if (state.missingOnly && item.status === "complete") return false;
  if (state.missingOnly && ["info", "unavailable"].includes(item.status)) return false;
  const query = state.query.trim().toLowerCase();
  return !query || `${item.name} ${item.section} ${item.description}`.toLowerCase().includes(query);
}

function renderEntryCard(item) {
  const icon = itemIconFor(item);
  const hideIcon = !state.spoilers && ["unknown", "missing"].includes(item.status);
  const spoilerLocked = hideIcon && icon;
  const revealOnHover = state.spoilers && icon && ["unknown", "missing"].includes(item.status);
  const artwork = !icon
    ? `<span class="locked-art" aria-hidden="true">?</span>`
    : `${hideIcon ? `<span class="locked-art spoiler-placeholder" aria-hidden="true">?</span>` : ""}<img class="item-art" src="${icon}" alt="" loading="lazy">`;
  const displayName = item.name.replace(/^#\d+\s+/, "");
  const badge = ["grimmTroupe", "lifeblood", "godmaster"].includes(item.sectionKey) ? "DLC" : "Base";
  return `<article class="check-card status-${item.status}${spoilerLocked ? " spoiler-card-locked" : ""}" data-entry-details="${item.id}" tabindex="0">
    <span class="check-section">${badge}</span>
    <div class="check-art${spoilerLocked ? " spoiler-locked" : revealOnHover ? " spoiler-reveal-on-hover" : ""}" aria-hidden="true">${artwork}</div>
    <div class="check-copy"><h3>${escapeHTML(displayName)}</h3></div>
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
      const description = stripMarkup(section.description);
      const hasLongDescription = description.length > LONG_DESCRIPTION_LIMIT;
      const infoButton = hasLongDescription
        ? `<button type="button" class="section-info-toggle" data-section-info="${sectionKey}" aria-label="Read full ${escapeHTML(stripMarkup(section.h2))} description">i</button>`
        : "";
      const summary = hasLongDescription ? SECTION_SUMMARIES[sectionKey] || `${stripMarkup(section.h2)} details.` : description;
      return `<section class="progress-section" id="section-${sectionKey}"><div class="progress-section-heading"><h2>${escapeHTML(stripMarkup(section.h2))} <span>${done}/${items.length}</span>${infoButton}</h2><p>${escapeHTML(summary)}</p></div><div class="check-grid">${cards}</div></section>`;
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
