import { useEffect, useState, type SetStateAction } from 'react';
import { defaultProgress, type Progress } from './storage';
import { APP_VERSION } from './releases';
import {
  createProfile,
  loadProfiles,
  PROFILES_KEY,
  removeProfile,
  updateProfile,
  type ProfileStore,
} from './profiles';

export function useProfiles() {
  // Snapshot before persisting the current version, also under React StrictMode.
  const [launch] = useState(() => {
    const loaded = loadProfiles();
    return {
      previousVersion: loaded.lastLaunchedVersion,
      store: { ...loaded, lastLaunchedVersion: APP_VERSION },
    };
  });
  const [store, setStore] = useState<ProfileStore>(launch.store);
  const [storageError, setStorageError] = useState(false);
  const activeProfile = store.profiles.find((profile) => profile.id === store.activeProfileId)!;
  useEffect(() => {
    try {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(store));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [store]);
  // Capture the owner when the callback is created: a late session callback must
  // never credit a different child after a profile switch.
  const setProgress = (update: SetStateAction<Progress>) =>
    setStore((current) =>
      updateProfile(current, activeProfile.id, (progress) =>
        typeof update === 'function' ? update(progress) : update,
      ),
    );
  return {
    previousVersion: launch.previousVersion,
    profiles: store.profiles,
    activeProfile,
    progress: activeProfile.progress,
    storageError,
    setProgress,
    selectProfile: (id: string) =>
      setStore((current) =>
        current.profiles.some((profile) => profile.id === id)
          ? { ...current, activeProfileId: id }
          : current,
      ),
    addProfile: (name: string) => {
      const profile = createProfile(name);
      setStore((current) => ({
        ...current,
        profiles: [...current.profiles, profile],
        activeProfileId: profile.id,
      }));
    },
    deleteProfile: (id: string) => setStore((current) => removeProfile(current, id)),
    resetProgress: () =>
      setProgress((current) => ({
        ...structuredClone(defaultProgress),
        settings: { ...current.settings },
      })),
  };
}
