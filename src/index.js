import "./css/modern.css";

import { analyzeSave } from "./core/completion-engine.js";

// Load Save File for opening files, decoding, decryption
import "./core/save-decoder.js";

import "./app/tracker-ui.js";

window.HallownestTracker = Object.freeze({ analyzeSave });
