require("./css/modern.css");

// Main script for analyzing the decoded save file and generating the page on the fly
require("./core/completion-engine.js");

// Load Save File for opening files, decoding, decryption
require("./core/save-decoder.js");

// Interactive tracker workspaces built on top of the original save analysis engine.
require("./app/tracker-ui.js");
