// ==UserScript==
// @name           tabbar-layout
// @description    App menu + back/reload on left; downloads + extensions + window controls on right
// ==/UserScript==

(function() {
    const SEPARATOR_ID = "tabbar-layout-separator";

    function ensureSeparator() {
        let sep = document.getElementById(SEPARATOR_ID);
        if (!sep) {
            sep = document.createXULElement("toolbarseparator");
            sep.id = SEPARATOR_ID;
        }
        return sep;
    }

    function moveAll() {
        const tabsToolbar = document.getElementById("TabsToolbar");
        const navbar = document.getElementById("nav-bar");
        if (!tabsToolbar || !navbar) return;

        const rightAnchor = tabsToolbar.querySelector(".titlebar-buttonbox-container");

        // --- Right side (in order, right-to-left before window controls): 
        //     extensions → unified-extensions-button → separator → downloads ---
        const downloads = document.getElementById("downloads-button");
        const unifiedExt = document.getElementById("unified-extensions-button");
        const extActions = [...navbar.querySelectorAll('[id$="-browser-action"]')];

        // Insert downloads first (leftmost of the right group)
        if (downloads && downloads.parentNode !== tabsToolbar) {
            tabsToolbar.insertBefore(downloads, rightAnchor);
        }

        // Separator between downloads and extensions
        if (downloads) {
            const sep = ensureSeparator();
            if (sep.parentNode !== tabsToolbar || sep.previousSibling !== downloads) {
                tabsToolbar.insertBefore(sep, rightAnchor);
            }
        }

        // Then extension action buttons
        extActions.forEach(node => {
            if (node.parentNode !== tabsToolbar) {
                tabsToolbar.insertBefore(node, rightAnchor);
            }
        });

        // Then the unified extensions button (rightmost before window controls)
        if (unifiedExt && unifiedExt.parentNode !== tabsToolbar) {
            tabsToolbar.insertBefore(unifiedExt, rightAnchor);
        }

        // --- Left side: hamburger → back → reload ---
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

        // Reload button: Firefox wraps it as #stop-reload-button containing #reload-button.
        // Prefer the wrapper if present, else the bare reload button.
        const reloadBtn = document.getElementById("stop-reload-button")
                       || document.getElementById("reload-button");
        if (reloadBtn && backBtn) {
            backBtn.after(reloadBtn);
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
                            n.id === "unified-extensions-button" ||
                            n.id === "downloads-button" ||
                            n.id === "reload-button" ||
                            n.id === "stop-reload-button" ||
                            n.id === "back-button"
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