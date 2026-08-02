import HK from "../core/completion-database.js";
import { REGIONS, REGION_MATCHES } from "../data/regions.js";
import { GROUPS } from "../data/tracker-groups.js";

const WIKI_ROOT = "https://hollowknight.wiki/w/";

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
      list.push({
        id: `${sectionKey}:${entryKey}`,
        key: entryKey,
        sectionKey,
        section: stripMarkup(section.h2),
        group: groupFor(sectionKey),
        name,
        description: stripMarkup(entry.spoiler),
        status: statusFor(entry),
        region: findRegion(entry, section),
        sceneName: entry.sceneName || null,
        wiki: entry.wiki || null,
        raw: entry
      });
    });
  });
  return list;
}

function statValue(key, fallback = "—") {
  const entry = HK.sections.intro.entries[key];
  return entry && entry.spoiler !== "" ? entry.spoiler : fallback;
}

function summary(entries) {
  const actionable = entries.filter(item => !["info", "unavailable"].includes(item.status));
  return {
    actionable: actionable.length,
    complete: actionable.filter(item => item.status === "complete").length,
    missing: actionable.filter(item => item.status === "missing").length,
    mapped: entries.filter(item => item.region).length
  };
}

export { GROUPS, HK, REGIONS, WIKI_ROOT, escapeHTML, flattenEntries, statValue, stripMarkup, summary };
