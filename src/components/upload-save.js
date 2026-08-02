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
