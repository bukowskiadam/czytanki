# Czytanki implementation plan

## Product

A Polish, touch-first reading companion for children and their caregivers. Six freely accessible levels progress from familiar whole words to connected stories. Sessions contain six cards and a short recognition activity; no timers, penalties, accounts, ads, or forced progression. English source identifiers; Polish interface and learning content.

## Research and decisions

- IES recommends daily connected-text reading and instruction in decoding: https://ies.ed.gov/ncee/WWC/PracticeGuide/21/Published
- Whole-word memorization alone is not a complete reading curriculum: https://www.readingrockets.org/reading-101/reading-and-writing-basics/sight-words-and-orthographic-mapping
- Provide global-reading practice as an activity to share with an adult, alongside letters and sounds; do not claim therapeutic or guaranteed outcomes.
- Keep initial cards text-only, with optional hints and Polish device speech. Short, self-paced sessions reduce pressure.
- Store progress locally; support installation and offline reopening with a service worker. Speech availability depends on the device.

## Delivery sequence

1. Bootstrap a React/TypeScript/Vite application and document decisions.
2. Build a responsive illustrated dashboard, 144 curated reading cards, reading sessions, recognition exercises, library, favorites, progress and parent settings.
3. Add install/offline support, validate data and progress, test complete flows at desktop and mobile sizes, build production assets and commit final work.

## Acceptance

- All six levels open and each lesson can be completed.
- Saved progress and favorites survive reloads.
- Library filters and search work; settings affect reading cards.
- Keyboard, reduced-motion preferences, mobile and tablet layouts work.
- Production build, unit tests and browser flows pass.
