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
  it('migrates every existing setting and progress field into the first profile', () => {
    const legacy = completeLesson(structuredClone(defaultProgress), '1-1', ['1-1-0']);
    legacy.favorites = ['1-1-0'];
    legacy.settings = {
      name: 'Maja',
      dailyGoal: 12,
      speechRate: 0.65,
      uppercase: true,
      largeText: true,
    };
    const store = parseProfiles(null, JSON.stringify(legacy));
    expect(store.profiles).toEqual([{ id: store.activeProfileId, progress: legacy }]);
    expect(parseProfiles(JSON.stringify(store), JSON.stringify(defaultProgress))).toEqual(store);
  });
  it('does not resurrect legacy progress after a reset', () => {
    const store = parseProfiles(null, null);
    expect(parseProfiles(JSON.stringify(store), JSON.stringify({ earnedStars: 99 }))).toEqual(
      store,
    );
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
      expect(parseProfiles(raw, null).profiles).toHaveLength(1);
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
      null,
    );
    expect(store.activeProfileId).toBe('a');
    expect(store.profiles).toEqual([{ id: 'a', progress: defaultProgress }]);
  });
});
