// ==UserScript==
// @name           tab-reflow
// @description    Tabs reflow immediately when one is closed by mouse, instead of waiting for the pointer to move away.
// ==/UserScript==

(() => {
  function patch() {
    try {
      const tabContainer = gBrowser?.tabContainer;
      if (!tabContainer || typeof tabContainer._lockTabSizing !== "function") {
        return false;
      }
      // When a tab is closed by mouse while the pointer is over a tab,
      // Firefox calls _lockTabSizing(), which sets an inline
      // `max-width: … !important` on every tab to keep them frozen until the
      // pointer moves (mousemove/mouseout). CSS cannot override inline
      // !important styles, so we neutralize the method here: tabs reflow
      // instantly on close, regardless of pointer position.
      tabContainer._lockTabSizing = function () {
        // Intentionally empty.
      };
      return true;
    } catch (e) {
      return false;
    }
  }

  if (gBrowser) {
    patch();
  }
  window.addEventListener("load", () => patch(), { once: true });
  setTimeout(() => patch(), 3000);
})();