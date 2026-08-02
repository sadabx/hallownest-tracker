import { readFile, writeFile } from "node:fs/promises";

const fixturePath = process.argv[2];
const debuggerUrl = process.argv[3] || "http://127.0.0.1:9222";
const siteUrl = process.argv[4];
const screenshotPath = process.argv[5];
const screenshotView = process.argv[6] || "map";
const screenshotTarget = process.argv[7];

if (!fixturePath) {
  throw new Error("Usage: node scripts/browser-smoke.mjs <decoded-save.json> [debugger-url] [site-url]");
}

const targets = await fetch(`${debuggerUrl}/json`).then(response => response.json());
const page = targets.find(target => target.type === "page");

if (!page) {
  throw new Error("No Chromium page target found");
}

const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let messageId = 0;
let dialogMessage = "";
const runtimeErrors = [];

socket.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  if (message.method === "Page.javascriptDialogOpening") {
    dialogMessage = message.params.message;
    void send("Page.handleJavaScriptDialog", { accept: true });
    return;
  }
  if (message.method === "Runtime.exceptionThrown") {
    runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    return;
  }
  const request = pending.get(message.id);
  if (!request) return;

  pending.delete(message.id);
  if (message.error) request.reject(new Error(message.error.message));
  else request.resolve(message.result);
});

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

await send("Page.enable");
await send("Runtime.enable");
if (screenshotPath) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false
  });
}

function send(method, params = {}) {
  const id = ++messageId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

const saveText = await readFile(fixturePath, "utf8");
async function evaluate(expression) {
  const response = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (response.exceptionDetails) {
    const description = response.exceptionDetails.exception?.description;
    throw new Error(description || response.exceptionDetails.text);
  }
  return response.result.value;
}

if (siteUrl) {
  await send("Storage.clearDataForOrigin", {
    origin: new URL(siteUrl).origin,
    storageTypes: "local_storage"
  });
  await send("Page.navigate", { url: siteUrl });
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await evaluate(`Boolean(window.HallownestTracker) && document.readyState === "complete" && Boolean(document.querySelector("#progress-view")?.children.length)`)) {
      ready = true;
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  if (!ready) throw new Error(`Tracker failed to initialize at ${siteUrl}: ${runtimeErrors.join(" | ")}`);
}

await evaluate(`
  window.HallownestTracker.analyzeSave(JSON.parse(${JSON.stringify(saveText)}));
`);

for (let attempt = 0; attempt < 100; attempt += 1) {
  const completion = await evaluate(`document.querySelector("#progress-view .completion-stat strong")?.textContent`);
  if (completion?.includes("88")) break;
  await new Promise(resolve => setTimeout(resolve, 50));
}

const overview = await evaluate(`({
  progressCompletion: document.querySelector("#progress-view .completion-stat strong")?.textContent,
  categorySections: document.querySelectorAll("#progress-view .progress-section").length
})`);

const progressCards = await evaluate(`
  document.querySelectorAll("#progress-view .check-card").length;
`);

const itemIcons = await evaluate(`
  document.querySelectorAll("#progress-view .check-art img").length;
`);

const brokenArtwork = await evaluate(`
  [...document.querySelectorAll("#progress-view .check-art img")]
    .filter(image => image.complete && image.naturalWidth === 0).length;
`);

const missingCards = await evaluate(`
  document.querySelector("#global-missing-only").click();
  document.querySelectorAll("#progress-view .check-card").length;
`);

const mapPins = await evaluate(`
  document.querySelector('[data-nav-tab="map"]').click();
  document.querySelectorAll("#map-view .map-pin").length;
`);

const mapViewer = await evaluate(`(() => {
  const image = document.querySelector("#map-view .hallownest-map-art");
  const viewport = document.querySelector("#map-viewport");
  const stage = document.querySelector("#map-stage");
  const before = stage?.style.transform;
  const rect = viewport?.getBoundingClientRect();
  viewport?.dispatchEvent(new WheelEvent("wheel", {
    deltaY: -100,
    clientX: rect ? rect.left + rect.width / 2 : 0,
    clientY: rect ? rect.top + rect.height / 2 : 0,
    bubbles: true,
    cancelable: true
  }));
  const zoomed = Boolean(before && stage?.style.transform && before !== stage.style.transform);
  document.querySelector("#map-reset")?.click();
  const pinsBeforeFilter = document.querySelectorAll("#map-view .map-pin").length;
  document.querySelector("#map-filter-toggle")?.click();
  const sectionFilters = document.querySelectorAll("[data-map-section]").length;
  const firstSection = document.querySelector("[data-map-section]");
  firstSection?.click();
  const pinsAfterFilter = document.querySelectorAll("#map-view .map-pin").length;
  document.querySelector("#map-sections-show-all")?.click();
  const pinsAfterRestore = document.querySelectorAll("#map-view .map-pin").length;
  document.querySelector("#map-filter-close")?.click();
  const filterMenuClosed = document.querySelector("#map-filter-menu")?.hidden === true;
  return {
    loaded: Boolean(image?.complete && image.naturalWidth === 2560 && image.naturalHeight === 1651),
    zoomed,
    sectionFilters,
    sectionFiltered: pinsAfterFilter < pinsBeforeFilter,
    filtersRestored: pinsAfterRestore === pinsBeforeFilter,
    filterMenuClosed
  };
})()`);

const uploader = await evaluate(`new Promise(resolve => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: value => { window.__copiedSavePath = value; return Promise.resolve(); } }
  });
  document.querySelector("#global-upload")?.click();
  const platformButtons = document.querySelectorAll("[data-save-platform]").length;
  document.querySelector('[data-save-platform="linux"]')?.click();
  setTimeout(() => {
    const result = {
      opened: !document.querySelector("#upload-overlay")?.classList.contains("hidden"),
      platformButtons,
      copiedPath: window.__copiedSavePath,
      toast: document.querySelector("#upload-toast")?.textContent,
      duplicateWorkspaceUpload: Boolean(document.querySelector("#workspace [data-upload]"))
    };
    document.querySelector("#close-upload")?.click();
    resolve(result);
  }, 30);
})`);

const rawSaveVisible = await evaluate(`
  document.querySelector('[data-nav-tab="raw"]').click();
  document.querySelector("#raw-view pre")?.textContent.includes("playerData");
`);

const values = { ...overview, progressCards, itemIcons, brokenArtwork, missingCards, mapPins, mapViewer, uploader, rawSaveVisible };

if (screenshotPath) {
  await evaluate(`document.querySelector("#global-missing-only").checked && document.querySelector("#global-missing-only").click()`);
  await evaluate(`${JSON.stringify(screenshotView)} === "upload" ? document.querySelector("#global-upload")?.click() : document.querySelector('[data-nav-tab=${JSON.stringify(screenshotView)}]')?.click()`);
  await evaluate(`new Promise(resolve => setTimeout(async () => {
    const target = ${JSON.stringify(screenshotTarget)};
    if (target) document.querySelector(target)?.scrollIntoView({ block: "start" });
    else document.querySelector("#workspace").scrollTop = 0;
    const scope = target ? document.querySelector(target) : document;
    const images = [...scope.querySelectorAll(".check-art img")];
    await Promise.race([
      Promise.all(images.map(image => image.complete ? null : new Promise(done => {
        image.addEventListener("load", done, { once: true });
        image.addEventListener("error", done, { once: true });
      }))),
      new Promise(done => setTimeout(done, 2000))
    ]);
    resolve();
  }, 250))`);
  const screenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));
}

if (dialogMessage) throw new Error(dialogMessage);

socket.close();
if (
  !values.progressCompletion?.includes("88")
  || values.categorySections < 20
  || values.progressCards < 500
  || values.itemIcons < 20
  || values.brokenArtwork !== 0
  || values.missingCards >= values.progressCards
  || values.mapPins < 100
  || values.mapViewer.loaded !== true
  || values.mapViewer.zoomed !== true
  || values.mapViewer.sectionFilters < 10
  || values.mapViewer.sectionFiltered !== true
  || values.mapViewer.filtersRestored !== true
  || values.mapViewer.filterMenuClosed !== true
  || values.uploader.opened !== true
  || values.uploader.platformButtons !== 4
  || !values.uploader.copiedPath?.includes("Team Cherry/Hollow Knight")
  || !values.uploader.toast?.includes("Path copied")
  || values.uploader.duplicateWorkspaceUpload !== false
  || values.rawSaveVisible !== true
) {
  throw new Error(`Unexpected analyzer result: ${JSON.stringify(values)}`);
}

console.log(JSON.stringify(values));
