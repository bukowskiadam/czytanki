# Release verification

Verified on 2026-09-12.

- Production TypeScript check and Vite build: passed.
- Unit tests: 10 passed (curriculum integrity, progressive text length, storage recovery, repeated practice, local-date boundaries, streaks, lasting badges and Polish plural forms).
- End-to-end tests: 26 passed, 13 scenarios each in desktop Chromium and mobile Chromium emulating an iPhone 13 viewport.
- Automated axe checks: no WCAG 2 A/AA or 2.1 AA violations detected on the dashboard, level overview, library, progress, parent settings and reading card after transitions finish.
- Responsive checks: no horizontal overflow at 320, 390, 768, 1024 and 1440 pixels; hero headings stay inside their cards.
- Offline check: installed service worker reopened the production app without a connection and loaded a previously unvisited level.
- Visual review: desktop dashboard, portrait tablet at 820 × 1180, phone at 390 × 844 and phone reading card inspected in the in-app browser.
- Formatting: Prettier check passed.
- Dependency audit at installation: 0 reported vulnerabilities.

## Fixes found during verification

- Prevented the phone hero headline from clipping.
- Increased supporting-text and button contrast.
- Made single-card practice offer three distinct recognition choices.
- Fixed offline asset lookup when a static server includes a `Vary: Origin` header. Cached assets are public and identical for every same-origin request.
- Kept earned streak badges after a later break in reading.
- Added Polish count forms for cards and stars.

## Practical boundaries

Browser emulation does not replace testing on every physical phone or tablet. Polish speech requests are tested with a controlled speech adapter; the voice quality and offline availability depend on the user's operating system and installed Polish voice. Offline installation requires HTTPS or localhost and an initial successful online load. Progress belongs to one browser and is not synchronized across devices.
