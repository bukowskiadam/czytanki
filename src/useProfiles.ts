import { useEffect, useState, type SetStateAction } from 'react';
import { defaultProgress, STORAGE_KEY, type Progress } from './storage';
import {
  createProfile,
  loadProfiles,
  PROFILES_KEY,
  removeProfile,
  updateProfile,
} from './profiles';

export function useProfiles() {
  const [store, setStore] = useState(loadProfiles);
  const [storageError, setStorageError] = useState(false);
  const activeProfile = store.profiles.find((profile) => profile.id === store.activeProfileId)!;
  useEffect(() => {
    try {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(store));
      // Only retire the old data after the complete migrated store is saved.
      localStorage.removeItem(STORAGE_KEY);
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
