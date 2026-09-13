import { describe, expect, it } from 'vitest';
import { completeLesson, defaultProgress } from './storage';
import {
  createProfile,
  parseProfiles,
  profileName,
  removeProfile,
  updateProfile,
} from './profiles';

describe('separate child profiles', () => {
  it('restores every setting and progress field from the profile store', () => {
    const progress = completeLesson(structuredClone(defaultProgress), '1-1', ['1-1-0']);
    progress.favorites = ['1-1-0'];
    progress.settings = {
      name: 'Maja',
      dailyGoal: 12,
      speechRate: 0.65,
      uppercase: true,
      largeText: true,
    };
    const store = {
      version: 1,
      activeProfileId: 'maja',
      profiles: [{ id: 'maja', progress }],
    };
    expect(parseProfiles(JSON.stringify(store))).toEqual(store);
  });
  it('starts with fresh independent progress when no valid profile store exists', () => {
    const store = parseProfiles(null);
    expect(store.profiles).toEqual([{ id: store.activeProfileId, progress: defaultProgress }]);
    expect(parseProfiles(JSON.stringify({ earnedStars: 99, settings: { name: 'Old' } }))).toEqual(
      store,
    );
    store.profiles[0].progress.favorites.push('1-1-0');
    expect(parseProfiles(null).profiles[0].progress.favorites).toEqual([]);
  });
  it('keeps new profiles independent, even when names are the same', () => {
    const a = createProfile(' Maja ');
    const b = createProfile('Maja');
    expect(a.id).not.toBe(b.id);
    a.progress.favorites.push('1-1-0');
    expect(b.progress).toEqual({
      ...defaultProgress,
      settings: { ...defaultProgress.settings, name: 'Maja' },
    });
    expect(defaultProgress.favorites).toEqual([]);
    expect(profileName(a)).toBe('Maja');
  });
  it('updates the original session owner even after the active child changes', () => {
    const a = createProfile('Maja');
    const b = createProfile('Jan');
    const store = { version: 1 as const, activeProfileId: b.id, profiles: [a, b] };
    const next = updateProfile(store, a.id, (progress) =>
      completeLesson(progress, '1-1', ['1-1-0']),
    );
    expect(next.profiles[0].progress.earnedStars).toBe(3);
    expect(next.profiles[1]).toEqual(b);
    expect(next.activeProfileId).toBe(b.id);
    expect(a.progress.earnedStars).toBe(0);
  });
  it('removes only the requested child and selects a remaining child if necessary', () => {
    const a = createProfile('Maja');
    const b = createProfile('Jan');
    const store = { version: 1 as const, activeProfileId: a.id, profiles: [a, b] };
    expect(removeProfile(store, a.id)).toEqual({ ...store, activeProfileId: b.id, profiles: [b] });
    expect(removeProfile(store, b.id)).toEqual({ ...store, profiles: [a] });
    const last = removeProfile(store, a.id);
    expect(removeProfile(last, b.id)).toBe(last);
  });
  it('recovers malformed data, deduplicates ids and validates each progress object', () => {
    for (const raw of [null, '', 'bad json', 'null', '12', '{"profiles":[]}']) {
      expect(parseProfiles(raw).profiles).toHaveLength(1);
    }
    const store = parseProfiles(
      JSON.stringify({
        version: 1,
        activeProfileId: 'missing',
        profiles: [
          null,
          { id: '' },
          { id: 1 },
          { id: 'a', progress: { earnedStars: -1 } },
          { id: 'a', progress: { earnedStars: 9 } },
        ],
      }),
    );
    expect(store.activeProfileId).toBe('a');
    expect(store.profiles).toEqual([{ id: 'a', progress: defaultProgress }]);
  });
});
