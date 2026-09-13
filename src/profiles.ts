import { defaultProgress, parseProgress, type Progress } from './storage';
import { isAppVersion } from './releases';

export const PROFILES_KEY = 'czytanki-profiles-v1';
export type ChildProfile = { id: string; progress: Progress };
export type ProfileStore = {
  version: 1;
  activeProfileId: string;
  profiles: ChildProfile[];
  lastLaunchedVersion?: string;
};
export const profileName = (profile: ChildProfile) =>
  profile.progress.settings.name.trim() || 'Odkrywca';

function profileId(): string {
  // randomUUID needs HTTPS; getRandomValues also works when a family opens the
  // app over the local Wi-Fi network using an HTTP address.
  return (
    globalThis.crypto.randomUUID?.() ??
    Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('')
  );
}

export function createProfile(name = '', id = profileId()): ChildProfile {
  const progress = structuredClone(defaultProgress);
  progress.settings.name = name.trim().slice(0, 30);
  return { id, progress };
}

export function parseProfiles(raw: string | null): ProfileStore {
  try {
    const value = JSON.parse(raw || 'null');
    if (value?.version === 1 && Array.isArray(value.profiles)) {
      const ids = new Set<string>();
      const profiles: ChildProfile[] = [];
      for (const entry of value.profiles) {
        if (!entry || typeof entry.id !== 'string' || !entry.id.trim() || ids.has(entry.id))
          continue;
        ids.add(entry.id);
        profiles.push({ id: entry.id, progress: parseProgress(JSON.stringify(entry.progress)) });
      }
      if (profiles.length) {
        return {
          version: 1,
          activeProfileId: ids.has(value.activeProfileId) ? value.activeProfileId : profiles[0].id,
          profiles,
          ...(isAppVersion(value.lastLaunchedVersion)
            ? { lastLaunchedVersion: value.lastLaunchedVersion }
            : {}),
        };
      }
    }
  } catch {
    // Invalid storage starts a fresh profile using the current format.
  }
  const profile = createProfile('', 'first-reader');
  return { version: 1, activeProfileId: profile.id, profiles: [profile] };
}

export function loadProfiles(): ProfileStore {
  try {
    return parseProfiles(localStorage.getItem(PROFILES_KEY));
  } catch {
    return parseProfiles(null);
  }
}

export function updateProfile(
  store: ProfileStore,
  id: string,
  update: (progress: Progress) => Progress,
): ProfileStore {
  return {
    ...store,
    profiles: store.profiles.map((profile) =>
      profile.id === id ? { ...profile, progress: update(profile.progress) } : profile,
    ),
  };
}

export function removeProfile(store: ProfileStore, id: string): ProfileStore {
  if (store.profiles.length <= 1) return store;
  const profiles = store.profiles.filter((profile) => profile.id !== id);
  return {
    ...store,
    profiles,
    activeProfileId: profiles.some((profile) => profile.id === store.activeProfileId)
      ? store.activeProfileId
      : profiles[0].id,
  };
}
