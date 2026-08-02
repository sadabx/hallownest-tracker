import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "./css/modern.css";

import { analyzeSave } from "./core/completion-engine.js";
import "./core/save-decoder.js";
import "./app/tracker-ui.js";

window.HallownestTracker = Object.freeze({ analyzeSave });
