# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-10-25

### Added

- The inline URL editor recognises search-result URLs (Google, Bing, DuckDuckGo,
  Brave, Startpage, Ecosia, Yahoo, Yandex, Mojeek) and shows what you searched
  instead of the long encoded URL: `rf online next` rather than
  `https://www.google.com/search?q=rf%20online%20next`.

### Fixed

- Double-clicking a tab that is already being edited no longer closes the editor.
  It stays open with the text selected, and only a click outside that tab
  (another tab, the page, the toolbar, the empty tab strip) closes it.

## [1.0.0] - 2026-10-11

First tracked release - everything below already shipped before versioning
started, so it is listed here for completeness.

### Added

- Single-row layout: app menu and back button on the left, tabs in the middle,
  downloads, extensions and window controls on the right, with the nav bar hidden.
- Inline URL editing: double-click a tab to edit its URL in place, with live
  autocomplete from browsing history, arrow/Tab navigation and safe-scheme
  handling for anything typed in.
- Smart new tabs: a new blank tab opens straight into the inline editor.
- Typed text stays on the tab: text typed into a blank tab's editor is kept and
  shown on the tab instead of "New Tab".
- Tabs fill the tab bar and split the available width equally.
- Smart tab close: the leftmost/rightmost tabs fill the bar immediately, middle
  tabs wait until the pointer leaves the tab bar.
- Smart bookmarks bar: shows on startup, new tab and tab close; hides on a click
  in the page or on a bookmark.
- Windows installer (`install/install-windows.bat`) that finds Firefox and the
  profile, sets up fx-autoconfig and copies the scripts and styles.

[Unreleased]: https://github.com/PlayMaGame/FireFox-compact-mode/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/PlayMaGame/FireFox-compact-mode/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/PlayMaGame/FireFox-compact-mode/releases/tag/v1.0.0
