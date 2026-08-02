import { readFile } from "node:fs/promises";

const fixturePath = process.argv[2];
const debuggerUrl = process.argv[3] || "http://127.0.0.1:9222";

if (!fixturePath) {
  throw new Error("Usage: node scripts/browser-smoke.mjs <decoded-save.json> [debugger-url]");
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

socket.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  if (message.method === "Page.javascriptDialogOpening") {
    dialogMessage = message.params.message;
    void send("Page.handleJavaScriptDialog", { accept: true });
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
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result.value;
}

await evaluate(`
  window.HallownestTracker.analyzeSave(JSON.parse(${JSON.stringify(saveText)}));
`);

const overview = await evaluate(`({
  dashboardCompletion: document.querySelector("#dashboard-view .completion-stat strong")?.textContent,
  categoryCards: document.querySelectorAll("#dashboard-view .category-card").length
})`);

const progressCards = await evaluate(`
  document.querySelector('[data-nav-tab="progress"]').click();
  document.querySelectorAll("#progress-view .check-card").length;
`);

const missingCards = await evaluate(`
  document.querySelector("#missing-only").click();
  document.querySelectorAll("#progress-view .check-card").length;
`);

const mapPins = await evaluate(`
  document.querySelector('[data-nav-tab="map"]').click();
  document.querySelectorAll("#map-view .map-pin").length;
`);

const rawSaveVisible = await evaluate(`
  document.querySelector('[data-nav-tab="raw"]').click();
  document.querySelector("#raw-view pre")?.textContent.includes("playerData");
`);

const values = { ...overview, progressCards, missingCards, mapPins, rawSaveVisible };

if (dialogMessage) throw new Error(dialogMessage);

socket.close();
if (
  !values.dashboardCompletion?.includes("88")
  || values.categoryCards !== 6
  || values.progressCards < 500
  || values.missingCards >= values.progressCards
  || values.mapPins < 100
  || values.rawSaveVisible !== true
) {
  throw new Error(`Unexpected analyzer result: ${JSON.stringify(values)}`);
}

console.log(JSON.stringify(values));
