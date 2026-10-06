import { HK, flattenEntries, statValue, stripMarkup, summary } from "./tracker-model.js";
import { clearPreferences, loadPreferences, savePreferences, state } from "./tracker-state.js";
import { initBackToTop } from "../components/back-to-top.js";
import { initEntryModal, showEntryModal } from "../components/entry-modal.js";
import { initSidebarItems } from "../components/sidebar-items.js";
import { closeUploader, initUploadSave } from "../components/upload-save.js";
import { renderMap } from "../tabs/map.js";
import { renderProgress, renderProgressTOC } from "../tabs/progress.js";
import { renderRawSave } from "../tabs/raw-save.js";

function renderSidebarStats(entries) {
  const stats = summary(entries);
  const completion = `${statValue("gameCompletion", 0)}%`;
  document.querySelector("#sidebar-completion").textContent = HK.saveAnalyzed ? completion : "No save";
  document.querySelector("#sidebar-progress-fill").style.width = HK.saveAnalyzed ? `${Math.min(Number(statValue("gameCompletion", 0)), 112) / 1.12}%` : "0%";
  document.querySelector("#sidebar-count").textContent = HK.saveAnalyzed ? `${stats.complete} checks complete` : `${entries.length} checks indexed`;
  document.querySelector("#save-state").textContent = HK.saveAnalyzed ? "Normal save loaded" : "No save loaded";
  document.querySelector("#save-state").classList.toggle("is-loaded", HK.saveAnalyzed);
  document.querySelector(".save-indicator").classList.toggle("is-loaded", HK.saveAnalyzed);
}

function openEntryDetails(item) {
  showEntryModal(item);
}

function initSectionDescriptionModal() {
  const overlay = document.querySelector("#section-description-overlay");
  const closeButton = document.querySelector("#close-section-description");
  const close = () => overlay.classList.add("hidden");

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-section-info]");
    if (!button) return;
    const section = HK.sections[button.dataset.sectionInfo];
    if (!section) return;
    const text = stripMarkup(String(section.description || "").replace(/<br\s*\/?\s*>/gi, "\n"))
      .replace(/[ \t]*\n[ \t]*/g, "\n")
      .replace(/\n{3,}/g, "\n\n");
    document.querySelector("#section-description-title").textContent = stripMarkup(section.h2);
    document.querySelector("#section-description-text").textContent = text;
    overlay.classList.remove("hidden");
    closeButton.focus();
  });

  closeButton.onclick = close;
  overlay.addEventListener("click", event => {
    if (event.target === overlay) close();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") close();
  });
}

function render() {
  const entries = flattenEntries();
  renderSidebarStats(entries);
  renderProgress(entries);
  renderMap(entries, openEntryDetails);
  renderRawSave();
  renderProgressTOC();
  document.querySelectorAll(".workspace-view").forEach(view => view.classList.toggle("active", view.id === `${state.activeTab}-view`));
  document.querySelectorAll("[data-nav-tab]").forEach(button => button.classList.toggle("active", button.dataset.navTab === state.activeTab));
  document.querySelector("#progress-toc").classList.toggle("hidden", state.activeTab !== "progress");
  document.querySelector("#global-missing-only").checked = state.missingOnly;
  document.querySelector("#global-show-spoilers").checked = state.spoilers;
  document.querySelector("#global-category").value = state.group;
  bindDynamicEvents();
}

function changeTab(tab) {
  state.activeTab = tab;
  document.body.classList.remove("sidebar-open");
  savePreferences();
  render();
  document.querySelector("#workspace").scrollTo({ top: 0, behavior: "smooth" });
}

function bindDynamicEvents() {
  document.querySelectorAll("[data-tab-target]").forEach(button => { button.onclick = () => changeTab(button.dataset.tabTarget); });
  document.querySelectorAll("[data-open-group]").forEach(button => { button.onclick = () => {
    state.group = button.dataset.openGroup;
    state.tocGroup = state.group;
    changeTab("progress");
  }; });
  document.querySelectorAll("[data-group]").forEach(button => { button.onclick = () => {
    state.group = button.dataset.group;
    if (state.group !== "all") state.tocGroup = state.group;
    savePreferences();
    render();
  }; });
  document.querySelectorAll("[data-toc-group]").forEach(button => { button.onclick = () => {
    state.tocGroup = button.dataset.tocGroup;
    render();
  }; });
  document.querySelector("#progress-search")?.addEventListener("input", event => {
    state.query = event.target.value;
    renderProgress(flattenEntries());
    bindDynamicEvents();
    document.querySelector("#progress-search")?.focus();
  });
  document.querySelectorAll("[data-entry-details]").forEach(card => {
    const open = event => {
      if (event.target.closest("a, button")) return;
      if (event.type === "keydown" && !["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      const item = flattenEntries().find(entry => entry.id === card.dataset.entryDetails);
      if (item) openEntryDetails(item);
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", open);
  });
  document.querySelectorAll("[data-toc-target]").forEach(link => {
    link.onclick = event => {
      event.preventDefault();
      document.querySelector(`#${link.dataset.tocTarget}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
  });
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

function init() {
  loadPreferences();
  initSidebarItems(changeTab);
  initUploadSave();
  initEntryModal();
  initSectionDescriptionModal();
  initBackToTop();
  document.querySelector("#global-reset").addEventListener("click", () => {
    clearPreferences();
    location.reload();
  });
  document.querySelector("#global-missing-only").addEventListener("change", event => {
    state.missingOnly = event.target.checked;
    savePreferences();
    render();
  });
  document.querySelector("#global-show-spoilers").addEventListener("change", event => {
    state.spoilers = event.target.checked;
    savePreferences();
    render();
  });
  document.querySelector("#global-category").addEventListener("change", event => {
    state.group = event.target.value;
    if (state.group !== "all") state.tocGroup = state.group;
    savePreferences();
    render();
  });
  window.addEventListener("hallownest-save-analyzed", event => {
    state.save = event.detail.save;
    state.activeTab = "progress";
    state.selectedEntry = null;
    closeUploader();
    requestAnimationFrame(render);
  });
  render();
}

document.addEventListener("DOMContentLoaded", init);
