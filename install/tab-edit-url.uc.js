// ==UserScript==
// @name           tab-edit-url
// @description    Double-click a tab to edit its URL inline, with history autocomplete
// ==/UserScript==

(function() {
    const { PlacesUtils } = ChromeUtils.importESModule(
        "resource://gre/modules/PlacesUtils.sys.mjs"
    );
    const BLANK_URLS = new Set(["about:newtab", "about:home", "about:blank", ""]);

    async function getSuggestions(query, limit = 10) {
        if (!query) return [];
        try {
            const db = await PlacesUtils.promiseDBConnection();
            const rows = await db.executeCached(
                `SELECT url, title, frecency
                 FROM moz_places
                 WHERE (url LIKE :q OR title LIKE :q)
                   AND hidden = 0
                   AND frecency > 0
                 ORDER BY frecency DESC
                 LIMIT ${limit}`,
                { q: "%" + query + "%" }
            );
            return rows.map(r => ({
                url:   r.getResultByName("url"),
                title: r.getResultByName("title") || ""
            }));
        } catch (e) {
            console.error("tab-edit-url suggestion error:", e);
            return [];
        }
    }

    function openEditor(tab) {
        if (!tab || tab.querySelector(".tab-url-editor")) return;

        const browser = gBrowser.getBrowserForTab(tab);
        const url = browser?.currentURI?.spec || "";
        const isBlank = BLANK_URLS.has(url);

        tab.classList.add("tab-editing-url");

        const label = tab.querySelector(".tab-label-container");
        if (label) label.style.display = "none";

        const wrap = document.createElement("span");
        wrap.className = "tab-url-editor";

        const input = document.createElement("input");
        input.type = "text";
        input.className = "tab-url-editor-input";
        input.value = isBlank ? "" : url;
        input.placeholder = "input URL here";
        wrap.append(input);

        const content = tab.querySelector(".tab-content") || tab;
        content.appendChild(wrap);

        const panel = document.createElement("div");
        panel.className = "tab-url-editor-panel";
        panel.style.display = "none";
        document.documentElement.appendChild(panel);

        let suggestions = [];
        let selectedIndex = -1;
        let closing = false;

        function positionPanel() {
            const rect = wrap.getBoundingClientRect();
            panel.style.left = rect.left + "px";
            panel.style.top  = (rect.bottom + 2) + "px";
            panel.style.minWidth = Math.max(rect.width, 340) + "px";
        }

        function render() {
            panel.textContent = "";
            if (!suggestions.length) { panel.style.display = "none"; return; }
            panel.style.display = "block";
            positionPanel();
            suggestions.forEach((s, i) => {
                const item = document.createElement("div");
                item.className = "tab-url-editor-item" + (i === selectedIndex ? " selected" : "");
                const t = document.createElement("div");
                t.className = "tab-url-editor-item-title";
                t.textContent = s.title || s.url;
                const u = document.createElement("div");
                u.className = "tab-url-editor-item-url";
                u.textContent = s.url;
                item.append(t, u);
                item.addEventListener("pointerdown", e => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(s.url);
                });
                panel.appendChild(item);
            });
        }

        let inputSeq = 0;
        async function updateSuggestions() {
            const q = input.value.trim();
            const mySeq = ++inputSeq;
            if (!q) { suggestions = []; selectedIndex = -1; render(); return; }
            const results = await getSuggestions(q);
            if (mySeq !== inputSeq) return;
            suggestions = results;
            selectedIndex = -1;
            render();
        }

        // --- Listeners we need to remove on close ---
        const onTabClose = (e) => { if (e.target === tab) close(); };
        const onTabSelect = () => { if (gBrowser.selectedTab !== tab) close(); };
        const onWindowBlur = () => close();
        const onReposition = () => { if (panel.style.display !== "none") positionPanel(); };
        const onDocMouseDown = (e) => {
            // Click outside both the editor wrap and the panel -> close
            if (!wrap.contains(e.target) && !panel.contains(e.target)) close();
        };

        function close() {
            if (closing) return;
            closing = true;
            try { if (wrap.isConnected) wrap.remove(); } catch (_) {}
            try { if (panel.isConnected) panel.remove(); } catch (_) {}
            try { tab.classList.remove("tab-editing-url"); } catch (_) {}
            if (label) { try { label.style.display = ""; } catch (_) {} }

            gBrowser.tabContainer.removeEventListener("TabClose", onTabClose);
            gBrowser.tabContainer.removeEventListener("TabSelect", onTabSelect);
            window.removeEventListener("blur", onWindowBlur);
            window.removeEventListener("resize", onReposition);
            document.removeEventListener("mousedown", onDocMouseDown, true);
        }

        function navigate(target) {
            target = (target || "").trim();
            if (!target) { close(); return; }
            let final;
            if (/^[a-z][a-z0-9+\-.]*:/i.test(target)) {
                final = target;
            } else if (/^[^\s]+\.[^\s]+$/.test(target)) {
                final = "https://" + target;
            } else {
                final = "https://www.google.com/search?q=" + encodeURIComponent(target);
            }
            close();
            if (tab.isConnected) {
                gBrowser.selectedTab = tab;
                gBrowser.loadURI(Services.io.newURI(final), {
                    triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal()
                });
            }
        }

		// Typing -> fetch suggestions
		input.addEventListener("input", updateSuggestions);

		// Stop keyboard events from reaching the tab bar
		const stopKey = e => e.stopPropagation();
		input.addEventListener("keypress", stopKey);
		input.addEventListener("keyup", stopKey);

		input.addEventListener("keydown", e => {
			e.stopPropagation();

			if (e.key === "Enter") {
				e.preventDefault();
				if (selectedIndex >= 0 && suggestions[selectedIndex]) {
					navigate(suggestions[selectedIndex].url);
				} else {
					navigate(input.value);
				}
			} else if (e.key === "Escape") {
				e.preventDefault();
				close();
			} else if (e.key === "ArrowDown" && suggestions.length) {
				e.preventDefault();
				selectedIndex = (selectedIndex + 1) % suggestions.length;
				render();
			} else if (e.key === "ArrowUp" && suggestions.length) {
				e.preventDefault();
				selectedIndex = selectedIndex <= 0 ? suggestions.length - 1 : selectedIndex - 1;
				render();
			} else if (e.key === "Tab" && suggestions.length) {
				e.preventDefault();
				if (selectedIndex < 0) selectedIndex = 0;
				input.value = suggestions[selectedIndex].url;
			}
		});

        input.addEventListener("blur", e => {
            if (panel.contains(e.relatedTarget)) return;
            setTimeout(close, 120);
        });
        wrap.addEventListener("mousedown", e => e.stopPropagation());
        wrap.addEventListener("click",     e => e.stopPropagation());
        wrap.addEventListener("dblclick",  e => e.stopPropagation());

        // Register cleanup hooks
        gBrowser.tabContainer.addEventListener("TabClose", onTabClose);
        gBrowser.tabContainer.addEventListener("TabSelect", onTabSelect);
        window.addEventListener("blur", onWindowBlur);
        window.addEventListener("resize", onReposition);
        document.addEventListener("mousedown", onDocMouseDown, true);

        input.focus();
        input.select();
    }

    // --- Double-click a tab to edit its URL ---
    document.getElementById("tabbrowser-tabs").addEventListener("dblclick", e => {
        const tab = e.target.closest(".tabbrowser-tab");
        if (!tab || tab !== gBrowser.selectedTab) return;
        e.stopPropagation();
        e.preventDefault();
        openEditor(tab);
    });

    // --- Auto-open the editor on new blank tabs ---
    gBrowser.tabContainer.addEventListener("TabOpen", e => {
        const tab = e.target;
        setTimeout(() => {
            const b = gBrowser.getBrowserForTab(tab);
            if (!b) return;
            const u = b.currentURI?.spec || "";
            if (BLANK_URLS.has(u) && tab === gBrowser.selectedTab) {
                openEditor(tab);
            }
        }, 50);
    });
	// --- Handle the initial tab on Firefox startup ---
    function tryOpenInitialEditor() {
        const tab = gBrowser.selectedTab;
        if (!tab) return false;
        const b = gBrowser.getBrowserForTab(tab);
        if (!b) return false;
        const u = b.currentURI?.spec || "";
        if (BLANK_URLS.has(u)) {
            openEditor(tab);
            return true;
        }
        return false;
    }

    // The browser may not be fully initialized yet; retry a few times.
    let tries = 0;
    const startupTimer = setInterval(() => {
        tries++;
        if (tryOpenInitialEditor() || tries > 20) {
            clearInterval(startupTimer);
        }
    }, 150);
})();