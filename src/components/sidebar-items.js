function initSidebarItems(onChangeTab) {
  document.querySelectorAll("[data-nav-tab]").forEach(button => button.addEventListener("click", event => {
    event.preventDefault();
    onChangeTab(button.dataset.navTab);
  }));
  const menu = document.querySelector("#mobile-menu");
  const sidebar = document.querySelector(".app-sidebar");
  menu.addEventListener("click", () => {
    const open = document.body.classList.toggle("sidebar-open");
    menu.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", event => {
    if (!document.body.classList.contains("sidebar-open") || sidebar.contains(event.target) || menu.contains(event.target)) return;
    document.body.classList.remove("sidebar-open");
    menu.setAttribute("aria-expanded", "false");
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    document.body.classList.remove("sidebar-open");
    menu.setAttribute("aria-expanded", "false");
  });
}

export { initSidebarItems };
