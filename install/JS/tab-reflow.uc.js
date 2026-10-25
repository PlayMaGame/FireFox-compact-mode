// ==UserScript==
// @name           tab-reflow
// @description    The leftmost tab fills the bar immediately on close, like the rightmost tab.
// @version        1.1.0
// ==/UserScript==

(() => {
  function setup() {
    const tabContainer = gBrowser?.tabContainer;
    if (!tabContainer || tabContainer.__tabReflowInstalled) {
      return;
    }
    tabContainer.__tabReflowInstalled = true;

    const originalLock = tabContainer._lockTabSizing;
    tabContainer._lockTabSizing = function (aTab, tabWidth) {
      const result = originalLock.apply(this, arguments);
      try {
        // The leftmost unpinned tab has index == number of pinned tabs.
        if (aTab && !aTab.pinned && aTab.index === gBrowser.pinnedTabCount) {
          // Release Firefox's freeze so the bar fills immediately.
          if (typeof this._unlockTabSizing === "function") {
            this._unlockTabSizing();
          }
          for (const t of this.allTabs) {
            if (t.style.maxWidth) {
              t.style.maxWidth = "";
            }
            t.animationsEnabled = true;
          }
          try {
            Services.prefs.setBoolPref("userChromeJS.tabReflowLeftmost", true);
          } catch (e) {}
        }
      } catch (err) {}
      return result;
    };
  }

  if (gBrowser) {
    setup();
  }
  window.addEventListener("load", () => setup(), { once: true });
  setTimeout(() => setup(), 3000);
})();