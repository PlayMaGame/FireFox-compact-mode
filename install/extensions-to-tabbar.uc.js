// ==UserScript==
// @name           tabbar-layout
// @description    App menu + back on left; extensions + window controls on right
// ==/UserScript==

(function() {
    function moveAll() {
        const tabsToolbar = document.getElementById("TabsToolbar");
        const navbar = document.getElementById("nav-bar");
        if (!tabsToolbar || !navbar) return;

        // --- Right side: extension buttons before window controls ---
        const rightAnchor = tabsToolbar.querySelector(".titlebar-buttonbox-container");
        const extNodes = [
            ...navbar.querySelectorAll('[id$="-browser-action"]'),
            document.getElementById("unified-extensions-button")
        ].filter(Boolean);
        extNodes.forEach(node => {
            if (node.parentNode !== tabsToolbar) {
                tabsToolbar.insertBefore(node, rightAnchor);
            }
        });

        // --- Left side: hamburger, then back button ---
        const appMenu = document.getElementById("PanelUI-menu-button");
        if (appMenu && appMenu.parentNode !== tabsToolbar) {
            tabsToolbar.insertBefore(appMenu, tabsToolbar.firstChild);
        }

        const backBtn = document.getElementById("back-button");
        if (backBtn) {
            if (appMenu && appMenu.parentNode === tabsToolbar) {
                appMenu.after(backBtn);
            } else {
                tabsToolbar.insertBefore(backBtn, tabsToolbar.firstChild);
            }
        }
    }

    function init() {
        moveAll();
        const navbar = document.getElementById("nav-bar");
        if (navbar) {
            new MutationObserver(muts => {
                for (const m of muts) {
                    for (const n of m.addedNodes) {
                        if (n?.id && (
                            n.id.endsWith("-browser-action") ||
                            n.id === "unified-extensions-button"
                        )) {
                            setTimeout(moveAll, 50);
                            return;
                        }
                    }
                }
            }).observe(navbar, { childList: true, subtree: true });
        }
    }

    if (gBrowserInit?.delayedStartupFinished) init();
    else Services.obs.addObserver(function obs(subject) {
        if (subject === window) {
            Services.obs.removeObserver(obs, "browser-delayed-startup-finished");
            init();
        }
    }, "browser-delayed-startup-finished");
})();