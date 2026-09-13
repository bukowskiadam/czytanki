# Release verification

This file records verification results. The change history lives in
[CHANGELOG.md](../CHANGELOG.md); future changes go into its **Unreleased** section.
For release steps, follow [RELEASE.md](RELEASE.md).

## v1.0.0 — release verification — 2026-09-13

All development work is consolidated into the initial v1.0.0, including profiles,
typography and the in-app release history. Package metadata and the UI history use
`1.0.0`. The following checks validate the release contents before tagging.
Deployment status is recorded by the GitHub Actions run for the release commit.

- Unit tests: 21 passed. Coverage includes curriculum integrity, progressive text
  length, data validation, repeated practice, local-date boundaries, streaks,
  lasting badges, Polish count forms and profile isolation.
- Release tests validate SemVer precedence, prereleases, optional launch metadata
  and agreement between package metadata, changelog and user-facing notes.
  Skipped and future releases are exercised with synthetic unit-test fixtures.
- Browser tests: 50 passed in desktop Chromium and mobile Chromium emulating iPhone 13,
  using `VITE_BASE_PATH=/czytanki/`. The test run includes the production TypeScript
  check and Vite/service-worker build.
- Reading coverage includes sessions, all levels, search, favorites, recognition
  retries, settings, speech requests, reset confirmation and storage failures.
- Profile coverage verifies a fresh empty profile, saved settings and progress,
  independent children after switching/reloading, renaming, deletion confirmation,
  last-profile protection and failed writes without loss of stored profiles.
- An explicit browser regression checks that the obsolete single-child storage key
  is neither read nor removed, and that current profiles still persist normally.
- The footer shows v1.0.0 and opens the single consolidated history on all four main
  pages. A simulated earlier prerelease triggers the update dialog once; repeated
  launches, rollbacks and invalid/missing version metadata do not trigger it.
- Full history, update notifications and previously unvisited reading levels work
  after reopening offline. PWA assets and service-worker scope stay under `/czytanki/`.
- Automated axe checks found no WCAG 2 A/AA or 2.1 AA violations on the covered main
  views, reading controls, profiles and release history. Keyboard focus trapping,
  restoration and dialog closing controls passed.
- Responsive checks cover widths from 320 to 1440 px with no horizontal overflow.
  The history dialog was checked at 320, 390, 593, 768 and 1440 px.
- Screenshots of the consolidated history at 1440 px and 390 px were visually reviewed.
  Text wraps within the scrollable dialog and only v1.0.0 is listed.
- Formatting, local documentation links, package/lockfile version agreement and
  `git diff --check` passed.

## Practical boundaries

Browser emulation does not replace testing on physical devices. Polish speech requests
use a controlled speech adapter in tests; voice quality and offline availability depend
on the operating system and installed voices. Offline installation requires HTTPS or
localhost and an initial successful online load.

Profiles and the last launched version are local to this browser and are not synchronized
across devices. If storage cannot be written, reading continues with a notice, and the
update dialog may reappear on a later launch because the version could not be saved.
Deployment is performed by GitHub Actions after the release commit is pushed to `master`.
