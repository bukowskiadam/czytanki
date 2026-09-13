# Changelog

All notable changes to Czytanki. Version numbers follow
[Semantic Versioning 2.0.0](https://semver.org/).
New entries belong in **Unreleased**, with the latest version listed first.
Agent guidelines: [AGENTS.md](AGENTS.md). Release procedure: [docs/RELEASE.md](docs/RELEASE.md).

This file is written in English. The user-facing release history in the application
is written in Polish and maintained in `src/release-notes.json`.

All work before the first release is consolidated into v1.0.0.

## Unreleased

## v1.0.0 — 2026-09-13

### Added

- Initial Czytanki application built with React, TypeScript and Vite, with a Polish
  interface, original illustrations and locally bundled fonts.
- Six levels, 24 lessons and 144 reading cards: words, word pairs, sentences and four stories.
- Six-card sessions, optional hints and Polish speech using the device's voices.
- A recognition game with three distinct answers, retries and reminders.
- A library with Polish diacritic-aware search, level filters, favorites and custom
  practice sets.
- Child profiles: creation, switching, renaming and deletion with confirmation.
  The application remembers the last selected profile.
- Separate locally saved progress, completed lessons, read cards, favorites, daily
  activity, goals, stars, badges and reading settings for each child.
- Protection against deleting the last profile and a reset limited to the selected
  child's progress, preserving their name and reading settings.
- Parent settings for large text, uppercase letters and speech speed, plus a guide
  to reading together.
- Readable typography based on `rem`: 18 px body text and primary controls, 16 px
  secondary controls and captions of at least 14 px with default browser settings.
  Cards and illustrations adapt to larger text and smaller screens.
- Responsive navigation, a single column of cards on narrow phones, bottom navigation
  on portrait tablets and a weekly chart that scrolls within its panel.
- Keyboard support, focus management, reduced-motion support and readable contrast.
- An installable PWA with offline access to reading materials, illustrations, fonts
  and icons after the first successful load.
- A notice when local storage fails, with continued use in memory.
- The version number and release history in the footer of every main view. Short
  user-facing notes are available offline in a scrollable, keyboard-accessible dialog.
- The last launched version in shared browser state. Future updates show changes
  since the previous version, including skipped releases. First launches, repeated
  launches of the same version and rollbacks do not display an update notice.
  Unreleased entries are excluded from the application history.

### Fixed before the first release

- Prevented the phone headline from clipping and increased text and button contrast.
- Ensured three distinct answers even when practicing recognition with a single card.
- Fixed offline asset lookup when the server includes a `Vary: Origin` header.
- Preserved earned reading-streak badges after a later break.
- Added correct Polish count forms for cards and stars, and simplified the reading
  pace message.

### Maintenance

- Added automatic GitHub Pages deployment on changes to `master`, preceded by
  formatting checks, unit tests, a production build and browser tests.
- Adapted assets, the manifest, icons and service worker to the `/czytanki/` subpath;
  each deployment path has its own cache namespace.
- Aligned package metadata, the changelog and the UI history on the initial version `1.0.0`.
- Removed the development-era import of progress saved before profiles were introduced.
  The application uses only profile storage and creates an empty profile when no valid
  data is available.

### Tests

- Added tests for the curriculum, data recovery, rewards, day boundaries and Polish count forms.
- Added desktop and mobile browser tests covering reading, the library, settings,
  accessibility, responsive layouts, speech, storage failures, reset and offline use,
  including the GitHub Pages deployment path.
- Added tests for profile data isolation, saving and restoring progress, and profile
  management; verified that obsolete single-child data is not imported.
- Added tests for SemVer precedence, consistency between user-facing history and the
  changelog, launch-version persistence, update notices and exclusion of previously
  seen releases.

### Documentation

- Established English for the repository changelog and Polish for the application's
  release history, with explicit language rules for agents.
- Standardized pending changes under **Unreleased** across the release procedure
  and documentation.
- Added the product and curriculum plan, local setup and deployment instructions,
  [profile documentation](docs/PROFILES.md) and a [QA verification report](docs/QA.md).
- Added a changelog, a requirement for agents to document all changes under **Unreleased**,
  and a separate release procedure using Semantic Versioning.
- Documented launch-version persistence and updates to user-facing release notes
  during release preparation.
