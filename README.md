# Hallownest Tracker

An independent, privacy-first Hollow Knight save tracker with a completion dashboard, searchable checklist, interactive Hallownest atlas, and raw-save viewer.

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

Build the production site into `docs/`:

```bash
npm test
```

## Project structure

```text
src/
  app/       Tracker workspaces and UI state
  core/      Save decoder, completion engine, and game database
  css/       Application styling
  index.html Static application shell
docs/        Generated GitHub Pages site
```

## License and attribution

Hallownest Tracker is licensed under [GPL-3.0](LICENSE).

The save decoder, completion rules, and initial game database are adapted from Michael "ReznoR"'s GPL-3.0 [Hollow Knight Save Completion Analyzer](https://github.com/ReznoRMichael/hollow-knight-completion-check). The application shell, tracker workspaces, filters, atlas, and ongoing data model are maintained independently under the same license.

This is an unofficial, non-commercial fan project. Hollow Knight belongs to Team Cherry.
