function initSidebarItems(onChangeTab) {
  document.querySelectorAll("[data-nav-tab]").forEach(button => button.addEventListener("click", event => {
    event.preventDefault();
    onChangeTab(button.dataset.navTab);
  }));
  document.querySelector("#mobile-menu").addEventListener("click", () => document.body.classList.toggle("sidebar-open"));
}

export { initSidebarItems };
