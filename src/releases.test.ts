import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  APP_VERSION,
  compareVersions,
  getReleaseNotes,
  hasNewVersion,
  isAppVersion,
} from './releases';
import notes from './release-notes.json';
import { parseProfiles } from './profiles';

describe('release history and launch versions', () => {
  it('compares numeric versions and the SemVer prerelease precedence sequence', () => {
    const ordered = [
      '1.0.0-alpha',
      '1.0.0-alpha.1',
      '1.0.0-alpha.beta',
      '1.0.0-beta',
      '1.0.0-beta.2',
      '1.0.0-beta.11',
      '1.0.0-rc.1',
      '1.0.0',
      '1.0.1',
      '1.1.0',
      '1.9.0',
      '1.10.0',
      '2.0.0',
    ];
    for (let i = 1; i < ordered.length; i++) {
      expect(compareVersions(ordered[i - 1], ordered[i])).toBeLessThan(0);
      expect(compareVersions(ordered[i], ordered[i - 1])).toBeGreaterThan(0);
    }
    expect(compareVersions('1.1.0+build.1', '1.1.0+build.2')).toBe(0);
    expect(compareVersions('1.1.0-rc.1+build', '1.1.0-rc.1')).toBe(0);
  });

  it('does not announce a first launch, a repeat, a rollback or corrupt metadata', () => {
    for (const previous of [
      undefined,
      null,
      1,
      '',
      'v1.0.0',
      '01.0.0',
      '1.0',
      '1.0.0-01',
      '1.0.0+',
    ]) {
      expect(isAppVersion(previous)).toBe(false);
      expect(hasNewVersion(previous, '1.1.0')).toBe(false);
    }
    expect(hasNewVersion('1.1.0', '1.1.0')).toBe(false);
    expect(hasNewVersion('2.0.0', '1.1.0')).toBe(false);
    expect(hasNewVersion('1.1.0+old', '1.1.0+new')).toBe(false);
    expect(hasNewVersion('1.1.0-rc.1', '1.1.0')).toBe(true);
  });

  it('includes skipped releases, excludes already seen and future releases', () => {
    // Synthetic releases exercise future updates without inventing shipped history.
    const history = ['1.0.0', '1.0.1', '1.1.0', '2.0.0'].map((version) => ({
      version,
      title: 'Test release',
      changes: ['Test change'],
    }));
    expect(getReleaseNotes('1.0.0', '1.1.0', history).map((note) => note.version)).toEqual([
      '1.1.0',
      '1.0.1',
    ]);
    expect(getReleaseNotes(undefined, '1.0.1', history).map((note) => note.version)).toEqual([
      '1.0.1',
      '1.0.0',
    ]);
    expect(getReleaseNotes('1.1.0', '1.1.0', history)).toEqual([]);
  });

  it('keeps release summaries aligned with the changelog and package version', () => {
    const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
    const published = [...changelog.matchAll(/^## v([^ ]+) — /gm)].map((match) => match[1]);
    expect(notes.map((note) => note.version)).toEqual(published);
    expect(notes[0].version).toBe(APP_VERSION);
    for (const note of notes) {
      expect(isAppVersion(note.version)).toBe(true);
      expect(note.title.trim()).not.toBe('');
      expect(note.changes.length).toBeGreaterThan(0);
      expect(note.changes.every((change) => change.trim().length > 0)).toBe(true);
    }
  });

  it('loads optional launch metadata without changing profile progress', () => {
    const original = parseProfiles(null);
    original.profiles[0].progress.earnedStars = 9;
    original.profiles[0].progress.settings.name = 'Maja';
    expect(original.lastLaunchedVersion).toBeUndefined();
    for (const previous of ['1.0.1', '1.1.0-rc.1', null, {}, 'broken']) {
      const loaded = parseProfiles(JSON.stringify({ ...original, lastLaunchedVersion: previous }));
      expect(loaded.profiles).toEqual(original.profiles);
      expect(loaded.lastLaunchedVersion).toBe(isAppVersion(previous) ? previous : undefined);
    }
  });
});
