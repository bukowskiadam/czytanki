# Child profiles

Profiles are included in the initial v1.0.0 and are local to one browser installation.
Each profile has its own stars, completed lessons, read cards, activity, favorites
and reading settings. The app remembers the last selected child after a reload.
A profile has a stable random ID; renaming does not change the owner of the progress.
Names may repeat.

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

## Persistence

`czytanki-profiles-v1` stores a versioned object with `activeProfileId` and a list
of `{ id, progress }` records. `Progress` contains learning data and reading settings,
validated when loaded. Malformed values are sanitized, duplicate IDs ignored, and
an unknown active ID falls back to the first valid profile. Missing, invalid or
empty profile storage creates one empty profile with default settings.

The app reads and writes only the profile store. It does not import or remove the
experimental single-child data format used during development before profiles.

Storage failures remain visible and the application continues in memory. Clearing
browser data removes profiles. There are no accounts, server storage, device
synchronization or synchronization of simultaneous editing in multiple tabs.

The store also accepts optional `lastLaunchedVersion` metadata shared by all profiles.
Each app launch records the package version and uses the previously loaded value to
decide whether to show new release notes. Data without this field loads normally.
Switching, adding, deleting or resetting a child retains this shared metadata.

## Implementation

- `src/profiles.ts`: profile creation, validation, loading and updates.
- `src/useProfiles.ts`: active profile, persistence, launch metadata and reading updates.
- `src/components/ProfileManager.tsx`: profile selection, creation and deletion.
- `src/App.tsx`: integration with reading, settings, rename and reset flows.

## Acceptance checks

- A fresh installation starts with one empty profile and default reading settings.
- Existing profile data restores settings and progress; obsolete single-child data is ignored.
- Two children can practice independently, switch, reload and recover their own
  stars, lessons, favorites and settings.
- Renaming preserves profile identity. Reset/deletion affects only its target.
- Destructive actions can be canceled, and the final profile remains available.
- Empty new names are rejected; long names fit phone and tablet layouts.
- Failed writes preserve saved profile data and allow reading to continue in memory.
- Profile controls pass accessibility checks and the reading/offline regression suite.

Current verification results are recorded in [QA.md](QA.md).
