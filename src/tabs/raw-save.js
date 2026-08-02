import { HK, escapeHTML } from "../app/tracker-model.js";
import { state } from "../app/tracker-state.js";

function renderRawSave() {
  const raw = state.save ? JSON.stringify(state.save, null, 2) : "No save file loaded. Load a save to inspect its decoded JSON.";
  document.querySelector("#raw-view").innerHTML = `
    <div class="view-heading compact"><div><span class="overline">Decoded locally</span><h1>Raw Save Data</h1><p>Inspect, copy, or download the exact JSON produced by the decoder.</p></div><button class="primary-action" data-upload>${HK.saveAnalyzed ? "Load another save" : "Load save"}</button></div>
    <div class="raw-card"><div class="raw-toolbar"><span>${state.save ? "hollow-knight-save.json" : "Waiting for save"}</span><div><button id="copy-raw" ${state.save ? "" : "disabled"}>Copy JSON</button><button id="download-raw" ${state.save ? "" : "disabled"}>Download</button></div></div><pre><code>${escapeHTML(raw)}</code></pre></div>`;
}

export { renderRawSave };
