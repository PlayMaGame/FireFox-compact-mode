/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

pref("app.update.channel", "release");

// --- Required by fx-autoconfig ---
pref("general.config.filename", "config.js");
pref("general.config.obscure_value", 0);
pref("general.config.sandbox_enabled", false);

// --- Custom tweaks ---
pref("xpinstall.signatures.required", false);
pref("extensions.experiments.enabled", true);
pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);