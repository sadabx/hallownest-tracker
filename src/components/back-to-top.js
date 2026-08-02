function initBackToTop() {
  const workspace = document.querySelector("#workspace");
  const button = document.querySelector("#back-to-top");
  workspace.addEventListener("scroll", () => button.classList.toggle("visible", workspace.scrollTop > 500));
  button.addEventListener("click", () => workspace.scrollTo({ top: 0, behavior: "smooth" }));
}

export { initBackToTop };
