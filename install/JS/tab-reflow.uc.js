// ==UserScript==
// @name           tab-reflow
// @description    Tabs reflow immediately when one is closed, instead of waiting for the pointer to move away.
// ==/UserScript==

(() => {
  function patch() {
    const tabContainer = gBrowser?.tabContainer;
    if (!tabContainer) {
      return;
    }
    // Prevent Firefox's tab-width lock (it sets an inline
    // `max-width: … !important` on every tab while the pointer is over the tab
    // bar). CSS cannot override inline !important styles, so neutralize the
    // method that applies the lock.
    if (typeof tabContainer._lockTabSizing === "function") {
      tabContainer._lockTabSizing = function () {
        // Intentionally empty.
      };
    }
    // Safety net for Firefox versions with different tab-close internals:
    // right after a tab closes, clear any leftover inline max-width lock so
    // the remaining tabs reflow immediately.
    if (!tabContainer.__tabReflowCleanupInstalled) {
      tabContainer.__tabReflowCleanupInstalled = true;
      tabContainer.addEventListener("TabClose", () => {
        for (const tab of tabContainer.allTabs) {
          if (tab.style.maxWidth) {
            tab.style.maxWidth = "";
          }
        }
      });
    }
  }

  if (gBrowser) {
    patch();
  }
  window.addEventListener("load", () => patch(), { once: true });
  setTimeout(() => patch(), 3000);
})();