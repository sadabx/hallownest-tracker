# Hallownest Tracker overview

Hallownest Tracker is a static, browser-only Hollow Knight save analyzer. It decrypts a local `user*.dat` save, evaluates completion checks, and renders three workspaces:

- **Progress** — searchable completion categories, missing-item filtering, spoiler controls, and per-entry details.
- **Interactive Map** — save-aware Hallownest markers with search, category filters, zoom, and pan.
- **Raw Save Data** — decoded JSON inspection, copy, and download.

The application source lives in `src/`, the editable HTML entry is the repository-root `index.html`, static files belong in `public/`, and Vite creates the deployable site in the ignored `dist/` directory.

The completion engine and save decoder are adapted from ReznoRMichael's GPL-3.0 Hollow Knight Save Completion Analyzer. The application shell and tracker workspaces are maintained by the Hallownest Tracker project under GPL-3.0.
