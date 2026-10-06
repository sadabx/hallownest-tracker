import { REGIONS, WIKI_ROOT, escapeHTML } from "../app/tracker-model.js";
import { itemIconFor, wikiArticleIconFor, wikiLocationPreviewFor } from "../data/item-icons.js";
import { POPUP_DETAILS } from "../data/popup-details.js";
import { POPUP_DESCRIPTIONS } from "../data/popup-descriptions.js";

const REGION_MAPS = {
  colosseum: {
    file: "colosseum-of-fools-lore-location.webp",
    label: "Colosseum of Fools location"
  },
  godhome: {
    file: "pantheon-of-the-master-location.webp",
    label: "Godhome · Pantheon of the Master"
  }
};

function regionalMapMarkup(item) {
  const area = REGIONS[item.region];
  const regionMap = REGION_MAPS[item.region];
  if (regionMap) {
    const src = `${import.meta.env.BASE_URL}assets/wiki-location-maps/${regionMap.file}`;
    return `<section class="entry-location-maps"><figure><img src="${src}" alt="${escapeHTML(regionMap.label)}" loading="lazy"><figcaption>${escapeHTML(regionMap.label)}</figcaption></figure></section>`;
  }
  const source = `${import.meta.env.BASE_URL}assets/maps/hallownest-clean.webp`;
  if (!area) {
    return `<section class="entry-location-maps"><figure><img src="${source}" alt="Hallownest map" loading="lazy"><figcaption>Hallownest overview</figcaption></figure></section>`;
  }
  const x = (area.x / 100 * 2560).toFixed(1);
  const y = (area.y / 100 * 1651).toFixed(1);
  const width = (area.w / 100 * 2560).toFixed(1);
  const height = (area.h / 100 * 1651).toFixed(1);
  return `<section class="entry-location-maps"><figure><svg class="entry-area-map" viewBox="${x} ${y} ${width} ${height}" role="img" aria-label="${escapeHTML(area.label)} area map"><image href="${source}" x="0" y="0" width="2560" height="1651"></image></svg><figcaption>Area overview · ${escapeHTML(area.label)}</figcaption></figure></section>`;
}

function locationMapMarkup(item) {
  const region = REGIONS[item.region]?.label.replace(/^the\s+/i, "").toLowerCase() || "";
  const maps = wikiLocationPreviewFor({ ...item, regionLabel: region }).slice(0, 1);
  if (!maps.length) return regionalMapMarkup(item);
  const map = maps[0];
  return `<section class="entry-location-maps"><figure><img src="${map.src}" alt="${escapeHTML(map.label)}" loading="lazy"><figcaption>${escapeHTML(map.label)}</figcaption></figure></section>`;
}

function closeEntryModal() {
  document.querySelector("#entry-overlay").classList.add("hidden");
}

function showEntryModal(item) {
  const overlay = document.querySelector("#entry-overlay");
  const region = item.region ? REGIONS[item.region]?.label || "" : "";
  const directions = POPUP_DESCRIPTIONS[item.id] || item.description || "";
  const acquisition = POPUP_DETAILS[item.id];
  const acquisitionMarkup = acquisition
    ? `<dl class="entry-details"><div><dt>Obtained</dt><dd>${escapeHTML(acquisition.obtained)}</dd></div><div><dt>Cost</dt><dd>${escapeHTML(acquisition.cost)}</dd></div></dl>`
    : "";
  const icon = wikiArticleIconFor(item) || itemIconFor(item);
  const iconFallback = itemIconFor(item);
  const artwork = icon ? `<div class="entry-art"><img src="${icon}" alt=""${iconFallback && icon !== iconFallback ? ` onerror="this.onerror=null;this.src='${iconFallback}'"` : ""}></div>` : "";
  const wiki = item.wiki ? `<a class="entry-more-info" href="${WIKI_ROOT}${encodeURI(item.wiki)}" target="_blank" rel="noreferrer">More info</a>` : "";

  document.querySelector("#entry-modal").innerHTML = `
    <button class="modal-close" data-close-entry aria-label="Close details">×</button>
    ${artwork}
    <h2 id="entry-modal-title">${escapeHTML(item.name)}</h2>
    ${region && !POPUP_DESCRIPTIONS[item.id] ? `<p class="entry-region">${escapeHTML(region)}</p>` : ""}
    ${directions ? `<p class="entry-directions revealed">${escapeHTML(directions)}</p>` : ""}
    ${acquisitionMarkup}
    ${locationMapMarkup(item)}
    <div class="entry-actions">${wiki}</div>`;

  overlay.classList.remove("hidden");
  document.querySelector("[data-close-entry]").onclick = closeEntryModal;
}

function initEntryModal() {
  document.querySelector("#entry-overlay").addEventListener("click", event => {
    if (event.target.id === "entry-overlay") closeEntryModal();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeEntryModal();
  });
}

export { closeEntryModal, initEntryModal, showEntryModal };
