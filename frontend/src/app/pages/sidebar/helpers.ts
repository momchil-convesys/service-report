export function isSidebarOnMobile() {
  /**
   * On mobile screens the sidebar has fixed position,
   * so we can check if it's offset top is 0.
   */
  const sideMenu = document.getElementById('js-app-side-menu');
  if (sideMenu && sideMenu.offsetTop === 0) {
    return true;
  }

  return false;
}
