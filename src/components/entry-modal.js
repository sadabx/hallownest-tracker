import { REGIONS, WIKI_ROOT, escapeHTML } from "../app/tracker-model.js";
import { state } from "../app/tracker-state.js";

function closeEntryModal() {
  document.querySelector("#entry-overlay").classList.add("hidden");
}

function showEntryModal(item, onShowMap) {
  const overlay = document.querySelector("#entry-overlay");
  const region = item.region ? REGIONS[item.region].label : "Location not catalogued";
  const directions = item.description || region;
  const mapButton = item.region ? `<button class="secondary-action" data-modal-map="${item.id}">Show on map</button>` : "";
  const wiki = item.wiki ? `<a class="secondary-action" href="${WIKI_ROOT}${encodeURI(item.wiki)}" target="_blank" rel="noreferrer">Open wiki</a>` : "";

  document.querySelector("#entry-modal").innerHTML = `
    <button class="modal-close" data-close-entry aria-label="Close details">×</button>
    <span class="entry-status status-${item.status}"><i class="status-mark"></i>${escapeHTML(item.status)}</span>
    <span class="overline">${escapeHTML(item.section)}</span>
    <h2 id="entry-modal-title">${escapeHTML(item.name)}</h2>
    <p class="entry-region">${escapeHTML(region)}</p>
    <p class="entry-directions ${state.spoilers ? "revealed" : ""}">${state.spoilers ? escapeHTML(directions) : "Location hidden — enable Show spoilers to reveal it."}</p>
    <div class="entry-actions">${mapButton}${wiki}</div>`;

  overlay.classList.remove("hidden");
  document.querySelector("[data-close-entry]").onclick = closeEntryModal;
  document.querySelector("[data-modal-map]")?.addEventListener("click", event => {
    closeEntryModal();
    onShowMap(event.currentTarget.dataset.modalMap);
  });
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
