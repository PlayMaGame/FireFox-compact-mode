// ==UserScript==
// @name           smart-bookmarks-bar
// @description    Bookmarks bar shows on startup / new tab / tab close; hides on any click in the page or on a bookmark.
// ==/UserScript==

(() => {
  function setup() {
    const toolbox = document.getElementById("navigator-toolbox");
    const tabContainer = gBrowser?.tabContainer;
    const content = document.getElementById("tabbrowser-tabbox");
    if (!toolbox || !tabContainer || !content) {
      return;
    }
    if (toolbox.__smartBmBarInstalled) {
      return;
    }
    toolbox.__smartBmBarInstalled = true;

    // Stop Firefox's built-in "newtab" auto-hide from overriding us, so the
    // bookmarks bar stays under this script's control.
    const bar = document.getElementById("PersonalToolbar");
    try {
      Services.prefs.setCharPref("browser.toolbars.bookmarks.visibility", "always");
      CustomizableUI.setToolbarVisibility(bar, true, false);
    } catch (e) {}

    const showBar = () => toolbox.removeAttribute("data-bmbar");
    const hideBar = () => toolbox.setAttribute("data-bmbar", "hidden");

    // Show on new tab, or when any tab is closed.
    tabContainer.addEventListener("TabOpen", showBar);
    tabContainer.addEventListener("TabClose", showBar);

    // Hide when the user clicks anywhere inside the page content
    // (capture phase, so it fires before the page handles the click).
    content.addEventListener("mousedown", hideBar, true);

    // Hide when a bookmark on the bar is clicked (after it activates), but not
    // when just opening a folder (a container) — that needs another click inside.
    if (bar) {
      bar.addEventListener("click", (e) => {
        const item = e.target.closest(".bookmark-item");
        if (item && item.getAttribute("container") === "true") {
          return;
        }
        hideBar();
      });
    }

    // Show at startup.
    showBar();
  }

  if (gBrowser) {
    setup();
  }
  window.addEventListener("load", () => setup(), { once: true });
  setTimeout(() => setup(), 1500);
})();