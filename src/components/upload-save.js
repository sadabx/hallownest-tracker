const SAVE_PATHS = Object.freeze({
  windows: String.raw`%USERPROFILE%\AppData\LocalLow\Team Cherry\Hollow Knight`,
  mac: "~/Library/Application Support/unity.Team Cherry.Hollow Knight",
  linux: "~/.config/unity3d/Team Cherry/Hollow Knight"
});

const STEAM_CLOUD_URL = "https://store.steampowered.com/account/remotestorageapp/?appid=367520";

function showUploadToast(message, type = "success") {
  document.querySelector("#upload-toast")?.remove();
  const toast = document.createElement("div");
  toast.id = "upload-toast";
  toast.className = `upload-toast ${type}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  const icon = document.createElement("i");
  icon.className = `fa-solid ${type === "success" ? "fa-clipboard-check" : "fa-circle-exclamation"}`;
  icon.setAttribute("aria-hidden", "true");
  const copy = document.createElement("span");
  copy.textContent = message;
  toast.append(icon, copy);
  document.body.append(toast);
  requestAnimationFrame(() => toast.classList.add("visible"));
  window.setTimeout(() => {
    toast.classList.remove("visible");
    window.setTimeout(() => toast.remove(), 180);
  }, 2300);
}

async function copySavePath(path) {
  try {
    await navigator.clipboard.writeText(path);
  } catch (_) {
    const textarea = document.createElement("textarea");
    textarea.value = path;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("Clipboard unavailable");
  }
}

function openUploader() {
  document.querySelector("#upload-overlay").classList.remove("hidden");
  document.querySelector("#save-dropzone").focus();
}

function closeUploader() {
  document.querySelector("#upload-overlay").classList.add("hidden");
}

function openFilePicker() {
  document.querySelector("#save-area-file").click();
}

function loadDroppedFile(file) {
  if (!file) return;
  const transfer = new DataTransfer();
  transfer.items.add(file);
  const input = document.querySelector("#save-area-file");
  input.files = transfer.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function initUploadSave() {
  document.querySelector("#global-upload").addEventListener("click", openUploader);
  document.querySelector("#close-upload").addEventListener("click", closeUploader);
  document.querySelector("#upload-overlay").addEventListener("click", event => {
    if (event.target.id === "upload-overlay") closeUploader();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeUploader();
  });

  document.querySelectorAll("[data-save-platform]").forEach(button => {
    button.addEventListener("click", async () => {
      const platform = button.dataset.savePlatform;
      if (platform === "steam") {
        window.open(STEAM_CLOUD_URL, "_blank", "noopener,noreferrer");
        return;
      }
      const path = SAVE_PATHS[platform];
      if (!path) return;
      try {
        await copySavePath(path);
        showUploadToast("Path copied to clipboard!");
      } catch (_) {
        showUploadToast("Unable to copy the path.", "error");
      }
    });
  });

  const dropzone = document.querySelector("#save-dropzone");
  dropzone.addEventListener("click", openFilePicker);
  dropzone.addEventListener("keydown", event => {
    if (["Enter", " "].includes(event.key)) {
      event.preventDefault();
      openFilePicker();
    }
  });
  dropzone.addEventListener("dragover", event => {
    event.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", event => {
    event.preventDefault();
    dropzone.classList.remove("dragover");
    loadDroppedFile(event.dataTransfer.files?.[0]);
  });

  document.querySelector("#save-area-file").addEventListener("change", event => {
    const name = event.target.files?.[0]?.name;
    if (name) document.querySelector("#save-state").textContent = `Analyzing ${name}`;
  });

  const workspace = document.querySelector("#workspace");
  workspace.addEventListener("dragover", event => {
    event.preventDefault();
    document.body.classList.add("is-dragging");
  });
  workspace.addEventListener("dragleave", () => document.body.classList.remove("is-dragging"));
  workspace.addEventListener("drop", event => {
    event.preventDefault();
    document.body.classList.remove("is-dragging");
    loadDroppedFile(event.dataTransfer.files?.[0]);
  });
}

export { closeUploader, initUploadSave, openUploader };
