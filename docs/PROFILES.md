# Child profiles

## Scope and delivery plan

Profiles are local to one browser installation. Each profile has its own stars,
completed lessons, read cards, activity, favorites and reading settings. The app
remembers the last selected child after a reload. A profile has a stable random ID;
renaming a child does not change the owner of their progress. Names may repeat.

1. Inspect the other active task and current storage before editing.
2. Develop on `codex/child-profiles` in a separate Git worktree. The concurrent
   typography task owns `src/styles.css`; profile styles live in
   `src/components/ProfileManager.css` and reuse the typography variables.
3. Implement and test the storage model and migration independently in
   `src/profiles.ts`, `src/useProfiles.ts` and `src/profiles.test.ts`.
4. Add profile management in a dedicated component and a small integration in
   `src/App.tsx`. Keep the existing reading component and curriculum unchanged.
5. Run browser checks on port 4193 in the isolated worktree, avoiding the other
   task's preview and test servers. New browser coverage lives in
   `tests/profiles.spec.ts`; the existing reset assertion is updated to preserve
   the child's name.
6. Once the typography task is complete and its checkout is clean, combine its
   committed changes with the profile branch. Resolve any overlap in `App.tsx`
   by preserving both features, then test the combined result before integration.

## Behavior

Use **Zmień profil**, the avatar, or **Strefa rodzica** to manage children. Adding
requires a nonblank name and selects the new child with empty progress and default
settings. Selecting another child returns to the dashboard with that child's data.
Edit the existing name field to rename the selected child. Profile switching is
available outside a reading session; finish or leave the session first.

Deleting requires a confirmation naming the child. Deleting the selected child
selects the first remaining profile. The last profile cannot be deleted; its
progress can be reset. Reset clears only the selected child's learning data and
favorites, retaining their name and reading settings.

## Persistence and migration

`czytanki-profiles-v1` stores a versioned object with `activeProfileId` and a list
of `{ id, progress }` records. `Progress` retains the existing schema and validation.
The first load imports `czytanki-progress-v1` into a single initial profile, including
its nickname and every progress/setting field. The old key is removed only after
saving the new object succeeds. A valid new store always takes precedence over
legacy data. Malformed values are sanitized, duplicate IDs ignored, and a missing
active ID falls back to the first valid profile.

Storage failures remain visible and the application continues in memory. Clearing
browser data removes profiles. No accounts, server storage, device synchronization
or synchronization of simultaneous editing in multiple tabs is included.

## Acceptance checks

- Existing data migrates once without loss; failed migration retains legacy data.
- Two children can practice independently, switch, reload and recover their own
  stars, lessons, favorites and settings.
- Renaming preserves profile identity. Reset/deletion affects only its target.
- Destructive actions can be canceled, and the final profile remains available.
- Empty new names are rejected; long names fit phone and tablet layouts.
- Profile controls pass accessibility checks and the existing reading/offline
  regression suite continues to pass.
