# FireFox-compact-mode

A minimal, compact Firefox setup that merges the tab bar and nav bar into a single row, with inline URL editing on tabs.

## Demo Screenshots

### Startup View
![Startup](screenshots/startup.jpg)

### New Tab Behavior
![New Tab](screenshots/newtab.jpg)

### Tab Search
![Tab Search](screenshots/tabsearch.jpg)

### Bookmarks Hidden on Load
![Bookmarks Hidden](screenshots/bookmarks_hide_on_load.jpg)

## Features

- **Single-row layout** — app menu and back button on the left, tabs in the middle, extensions and window controls on the right. No separate nav bar taking up vertical space.
- **Inline URL editing** — double-click any tab to edit its URL in place, with live autocomplete from your browsing history.
- **Smart new tabs** — opening a new blank tab drops you straight into the inline URL editor, no address bar needed.
- **Typed text stays on the tab** — type something in a blank tab's editor and switch away; the text is kept and shown on the tab instead of "New Tab".
- **Tabs fill the bar** — tabs fill the whole tab bar and split the available width equally.
- **Instant tab reflow** — closing a tab makes the rest expand immediately (no waiting for the mouse to move away).

## Requirements

- **Firefox 115+** (tested on Firefox 156)
- **[fx-autoconfig](https://github.com/MrOtherGuy/fx-autoconfig)** installed — this is what enables custom user scripts (`.uc.js`) and the `chrome/` folder. Follow its install instructions before proceeding.

## Installation

### 1. Install fx-autoconfig

Follow the instructions at [MrOtherGuy/fx-autoconfig](https://github.com/MrOtherGuy/fx-autoconfig). In short:

- Copy `config.js` and the `defaults/` folder into your **Firefox install directory**
  (e.g. `C:\Program Files\Mozilla Firefox\`)
- Copy the `chrome/utils/` folder into your **Firefox profile folder**
  (find it at `about:support` → **Open Folder** next to "Profile Folder")

### 2. Copy the files from this repo

| File in this repo | Copy to |
|---|---|
| `install/channel-prefs.js` | `<Firefox install dir>/defaults/pref/channel-prefs.js` *(overwrite)* |
| `install/JS/tab-edit-url.uc.js` | `<Profile folder>/chrome/JS/tab-edit-url.uc.js` |
| `install/JS/tab-reflow.uc.js` | `<Profile folder>/chrome/JS/tab-reflow.uc.js` |
| `install/JS/extensions-to-tabbar.uc.js` | `<Profile folder>/chrome/JS/extensions-to-tabbar.uc.js` |
| `install/CSS/tab-fill.uc.css` | `<Profile folder>/chrome/CSS/tab-fill.uc.css` |
| `install/CSS/user-styles.uc.css` | `<Profile folder>/chrome/CSS/user-styles.uc.css` |

> Create the `chrome/`, `chrome/JS/` and `chrome/CSS/` folders inside your profile if they don't exist.

### 3. Restart Firefox

Fully close Firefox (check Task Manager — no lingering `firefox.exe` processes) and reopen it. The layout should snap into place and double-clicking a tab should open the inline URL editor.

## Usage

- **Double-click a tab** → edit its URL inline, with history autocomplete.
- **Open a new tab** → jumps straight into the inline URL editor.
- **Arrow keys** → navigate autocomplete suggestions.
- **Tab** → fill the input with the selected suggestion.
- **Enter** → navigate (URL, domain, or Google search for plain text).
- **Esc** or click outside → cancel.

## Security note

- **userChrome scripts run with full browser privileges.** They can read all your data and modify anything in Firefox. Only install userChrome scripts from sources you trust, and review them before installing.
- `user-styles.uc.css` **hides the URL bar** on normal pages (shown on hover or `Ctrl+L`). This is a deliberate UI choice, but hiding the address bar is a common phishing trick — be aware of the trade-off.
- `tab-edit-url.uc.js` only navigates to safe URL schemes (`http/https/ftp/about/mailto`); `javascript:`, `file:`, `chrome:` etc. are never executed.

## Troubleshooting

**Scripts aren't loading after a Firefox update.**
Firefox updates can overwrite `defaults/pref/channel-prefs.js`, wiping the fx-autoconfig prefs. If your scripts stop working after an update, just re-copy `install/channel-prefs.js` from this repo and restart Firefox.

**Nothing loads at all.**
- Make sure Firefox is **fully** closed before copying files (no `firefox.exe` in Task Manager).
- Verify `chrome/utils/` from fx-autoconfig is in your **profile** folder, not the install folder.
- Check `about:config` for `xpinstall.signatures.required` — if it's `false`, the prefs loaded correctly.
- Open the Browser Console (Ctrl+Shift+J) and look for red errors.

**Layout looks wrong.**
Your Firefox version might have renamed some toolbar elements. Open an issue with a screenshot.

## Files

- `install/channel-prefs.js` — Firefox prefs that enable fx-autoconfig and legacy customization (`userChrome.css`, unsigned extensions, experiments).
- `install/JS/tab-edit-url.uc.js` — Inline tab URL editor with history autocomplete (keeps typed text, hardened URL schemes).
- `install/JS/tab-reflow.uc.js` — Tabs reflow instantly when one is closed.
- `install/JS/extensions-to-tabbar.uc.js` — Rearranges app menu, back button, extensions, and window controls into the tab bar.
- `install/CSS/tab-fill.uc.css` — Tabs fill the whole tab bar and split width equally.
- `install/CSS/user-styles.uc.css` — Consolidated UI styles (hidden URL bar, tighter toolbar, editor styling).

## Credits

Built on top of [MrOtherGuy/fx-autoconfig](https://github.com/MrOtherGuy/fx-autoconfig).

## License

[MIT](LICENSE)