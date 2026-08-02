const STORAGE_KEY = "hallownestTrackerPreferences";

const state = {
  save: null,
  activeTab: "progress",
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

function loadPreferences() {
  try {
    const preferences = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    if (!["progress", "map", "raw"].includes(preferences.activeTab)) {
      preferences.activeTab = "progress";
    }
    Object.assign(state, preferences);
  } catch (_) {
    state.activeTab = "progress";
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

function clearPreferences() {
  localStorage.removeItem(STORAGE_KEY);
}

export { clearPreferences, loadPreferences, savePreferences, state };
