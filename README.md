# Czytanki

A Polish reading companion for children and caregivers, designed for phones and tablets. React, TypeScript and Vite; English source code, Polish interface and learning content.

## Change history and releases

See [CHANGELOG.md](CHANGELOG.md) for released versions, starting with v1.0.0,
and pending changes in **Unreleased**. All changes must follow [AGENTS.md](AGENTS.md); version selection
and release steps are documented in [docs/RELEASE.md](docs/RELEASE.md).
The repository changelog is entirely in English; user-facing release titles, notes
and history controls remain in Polish.

The application footer shows the version from `package.json` and opens a Polish,
user-facing release history bundled in `src/release-notes.json`, also available offline.
It lists released versions; **Unreleased** stays in the repository changelog.
The shared browser state records `lastLaunchedVersion` alongside the profiles. The
first launch (including existing data without version metadata) establishes a baseline
without a popup. Launching a newer version shows all releases since the previous visit
once, then records the current version. Reopening the same version, switching children,
resetting a child's progress or running an older version does not trigger the popup.
Version comparison follows SemVer, including prereleases and ignoring build metadata.
If browser storage cannot be written, reading still works and the existing storage notice
appears; the update popup can appear again on the next launch until saving succeeds.

## Run locally

Requires Node.js 22.12+ (or a supported newer LTS) and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. To try it on a phone or tablet connected to the same Wi-Fi, use the network URL printed by Vite. No account, API key or backend is required.

## Production and offline mode

```sh
npm run build
npm run preview -- --port 5180
```

Open `http://localhost:5180`. Publish the contents of `dist/` to any static host at the domain root. Use HTTPS outside localhost to enable installation and service workers. HTTP access over the local network supports online reading, but browsers require a secure origin for offline installation.

The build generates a content-versioned service worker and caches all reading content, illustrations, fonts and icons. After the first successful load, the application can reopen offline, including levels not previously visited. Updates activate once older application tabs close. Polish speech is supplied by the device; some voices require a network connection or an installed Polish language pack.

## GitHub Pages

The live site is **https://bukowskiadam.github.io/czytanki/**.

The workflow in `.github/workflows/deploy.yml` runs on every push to `master` and can also be started from the repository's Actions tab. It uses Node.js 24, installs the locked dependencies, checks formatting and unit tests, then builds and tests the production app in desktop and mobile Chromium before deploying `dist/` with the official GitHub Pages actions. Deployment permissions are limited to the deploy job; no personal access token or deployment secret is required.

The repository's **Settings → Pages → Source** must be **GitHub Actions**. The workflow reads the base path from GitHub Pages metadata, so production assets, installed app shortcuts and the offline cache stay inside `/czytanki/`. Each deployment path has its own cache namespace.

To reproduce the Pages build and browser checks locally:

```sh
VITE_BASE_PATH=/czytanki/ npm run test:e2e
```

For a manual preview:

```sh
VITE_BASE_PATH=/czytanki/ npm run build
VITE_BASE_PATH=/czytanki/ npm run preview -- --port 5180
```

Open `http://localhost:5180/czytanki/`. Omit `VITE_BASE_PATH` to keep the default local app at `/`.

Workflow details follow the [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [Vite deployment guide](https://vite.dev/guide/static-deploy.html#github-pages).

## Included

- Six freely accessible levels, 24 lessons, 144 original Polish reading cards.
- Familiar words, word pairs, short sentences, longer sentences and four connected stories.
- Self-paced six-card sessions with optional hints and Polish speech.
- A recognition game with friendly retries, optional reminders and three choices.
- Search that understands Polish diacritics, level filters, favorites and custom practice.
- Multiple child profiles with separate locally saved progress, favorites, daily activity, goals, stars and achievement badges.
- Parent settings: add/switch/rename/delete child profiles, large text, uppercase text, voice speed and per-child progress reset confirmation.
- Responsive navigation, keyboard focus management, reduced-motion support and installable PWA assets.

There are no accounts, advertisements, analytics or remote data storage. Profiles, nicknames, settings and progress stay in local browser storage under `czytanki-profiles-v1`. A new installation starts with one empty child profile. Clearing browser data removes them. Private browsing or a full storage quota can prevent persistence; the app shows a notice and remains usable. Different browsers and devices keep separate progress.

## Checks

```sh
npm test
npx playwright install chromium
npm run test:e2e
npm run format:check
```

End-to-end tests build the production version, start a dedicated preview on port 4187 and run desktop and mobile Chromium projects. They cover sessions, all levels, search, favorites, settings, recognition retries, keyboard focus, offline reopening, accessibility, responsive layouts, speech requests, storage failure and reset confirmation. Unit tests validate the curriculum, data recovery, rewards and calendar boundaries.

```sh
npm run format  # Format source files
npm run icons   # Regenerate PNG app icons from the original SVG
```

## Source guide

- `src/App.tsx`: navigation, dashboard, library, progress and parent settings.
- `src/components/ReadingSession.tsx`: reading and recognition flow.
- `src/components/Dialog.tsx`: accessible modal focus management.
- `src/components/Illustrations.tsx`: original vector illustrations and Leo the fox.
- `src/data.ts`: the Polish curriculum; add cards and lessons here.
- `src/storage.ts`: validated progress and progress calculations.
- `src/profiles.ts`, `src/useProfiles.ts`: child profiles, validation and persistence.
- `src/components/ProfileManager.tsx`: profile selection and management.
- `docs/PROFILES.md`: profile behavior, acceptance checks and integration plan.
- `src/styles.css`: responsive design and reading typography.
- `scripts/build-sw.mjs`: deterministic offline cache generation.
- `docs/PLAN.md`: product decisions and research sources.

Global word recognition is presented as a shared reading activity. The parent guide encourages also exploring letters and speech sounds and reading books together. It does not promise educational or therapeutic outcomes.

Fonts are Nunito and DM Sans from Fontsource (SIL Open Font License); interface icons are Lucide (ISC). All fonts are bundled locally. The forest and fox illustrations were created for this application.
