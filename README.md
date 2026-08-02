# Hallownest Tracker

An independent, privacy-first Hollow Knight companion built in the style of Silksong Tracker: searchable completion tracking, a save-aware Hallownest atlas, and a raw-save viewer in one static app.

**Live site:** [sadabx.github.io/hallownest-tracker](https://sadabx.github.io/hallownest-tracker/)

## Features

- Decodes Hollow Knight `user*.dat` saves entirely in the browser.
- Tracks 112% completion and more than 1,000 extended checks.
- Covers bosses, charms, equipment, collectibles, Hunter's Journal, secrets, achievements, and Godhome.
- Filters checks by category, search query, missing status, and spoiler preference.
- Links tracker entries to a zoomable, searchable Hallownest region map.
- Provides decoded JSON inspection, clipboard copy, and download.
- Works as a static GitHub Pages application with no backend or analytics.

## Development

```bash
npm install
npm run start
```

Build the production site into the ignored `dist/` directory:

```bash
npm run build
npm run preview
```

## Project structure

```text
index.html     Editable Vite application shell
public/        Static files copied as-is
src/
  app/         Shared tracker model, state, and rendering orchestration
  assets/      App-owned source artwork
  components/  Upload, modal, navigation, and page controls
  core/        Save decoder, completion engine, and game database
  css/         Application styling
  data/        Progress groups and map-region catalog
  tabs/        Progress, interactive map, and raw-save workspaces
  types/       Shared tracker contracts
  main.js      Browser entry point
docs/          Architecture and project documentation only
dist/          Generated GitHub Pages artifact; never committed
```

GitHub Actions builds `main` with Vite and deploys `dist/` to GitHub Pages. The application source never lives in `docs/`.

## License and attribution

Hallownest Tracker is licensed under [GPL-3.0](LICENSE).

The save decoder, completion rules, and initial game database are adapted from Michael "ReznoR"'s GPL-3.0 [Hollow Knight Save Completion Analyzer](https://github.com/ReznoRMichael/hollow-knight-completion-check). The application shell, tracker workspaces, filters, map viewer, and ongoing data model are maintained independently under the same license. Its overall workflow is inspired by [Silksong Tracker](https://github.com/th3r3dfox/silksong-tracker), without copying its game assets.

This is an unofficial, non-commercial fan project. Hollow Knight belongs to Team Cherry.

Hollow Knight inventory icons and Hallownest map artwork are © Team Cherry, sourced from the Hollow Knight Wiki, and excluded from the GPL-3.0 license grant. See [docs/assets.md](docs/assets.md).
