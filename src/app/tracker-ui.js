import { HK, flattenEntries, statValue, summary } from "./tracker-model.js";
import { clearPreferences, loadPreferences, savePreferences, state } from "./tracker-state.js";
import { initBackToTop } from "../components/back-to-top.js";
import { initEntryModal, showEntryModal } from "../components/entry-modal.js";
import { initSidebarItems } from "../components/sidebar-items.js";
import { closeUploader, initUploadSave, openUploader } from "../components/upload-save.js";
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

function selectEntryOnMap(entryId) {
  state.selectedEntry = entryId;
  state.mapQuery = "";
  state.mapCategory = "all";
  changeTab("map");
}

function openEntryDetails(item) {
  showEntryModal(item, selectEntryOnMap);
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
  document.querySelectorAll("[data-upload]").forEach(button => { button.onclick = openUploader; });
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

function init() {
  loadPreferences();
  initSidebarItems(changeTab);
  initUploadSave();
  initEntryModal();
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
