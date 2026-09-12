import { cardCount, polishPlural } from './format';
import { describe, expect, it } from 'vitest';
import { allCards, allLessons, levels } from './data';
import {
  completeLesson,
  dateKey,
  defaultProgress,
  getStreak,
  getLongestStreak,
  parseProgress,
} from './storage';
describe('Polish reading curriculum', () => {
  it('has six levels, 24 complete lessons and 144 unique cards', () => {
    expect(levels).toHaveLength(6);
    expect(allLessons).toHaveLength(24);
    expect(allCards).toHaveLength(144);
    expect(new Set(allCards.map((card) => card.id)).size).toBe(144);
    expect(new Set(allCards.map((card) => card.text)).size).toBe(144);
    for (const level of levels) {
      expect(level.lessons).toHaveLength(4);
      for (const lesson of level.lessons) {
        expect(lesson.cards).toHaveLength(6);
        for (const card of lesson.cards) {
          expect(card.levelId).toBe(level.id);
          expect(card.lessonId).toBe(lesson.id);
          expect(card.text.trim()).toBe(card.text);
          expect(card.hint.length).toBeGreaterThan(5);
          expect(card.emoji.length).toBeGreaterThan(0);
        }
      }
    }
  });
  it('increases average reading length across all levels', () => {
    const averages = levels.map((level) => {
      const cards = level.lessons.flatMap((lesson) => lesson.cards);
      return cards.reduce((total, card) => total + card.text.split(' ').length, 0) / cards.length;
    });
    for (let index = 1; index < averages.length; index++)
      expect(averages[index]).toBeGreaterThan(averages[index - 1]);
  });
});
describe('persistent progress', () => {
  it('recovers safely from missing or corrupt browser storage', () => {
    for (const value of [null, '', 'broken json', 'null', '12'])
      expect(parseProgress(value)).toEqual(defaultProgress);
  });
  it('validates settings and discards malformed stored values', () => {
    const value = parseProgress(
      JSON.stringify({
        earnedStars: -20,
        completed: ['1-1', '1-1', null, 3],
        favorites: {},
        readCards: 'bad',
        activity: { '2026-09-12': 6, wrong: 10, '2026-09-11': -3 },
        settings: { name: 33, largeText: 'yes', uppercase: true, speechRate: -1, dailyGoal: 999 },
      }),
    );
    expect(value.completed).toEqual(['1-1']);
    expect(value.favorites).toEqual([]);
    expect(value.earnedStars).toBe(0);
    expect(value.activity).toEqual({ '2026-09-12': 6 });
    expect(value.settings).toEqual({ ...defaultProgress.settings, uppercase: true });
  });
  it('counts repeat practice while keeping unique cards and lessons', () => {
    const once = completeLesson(defaultProgress, '1-1', ['1-1-0', '1-1-1'], '2026-09-12');
    const twice = completeLesson(once, '1-1', ['1-1-0', '1-1-1'], '2026-09-12');
    expect(twice.completed).toEqual(['1-1']);
    expect(twice.readCards).toHaveLength(2);
    expect(twice.activity['2026-09-12']).toBe(4);
    expect(twice.earnedStars).toBe(6);
    expect(defaultProgress.completed).toHaveLength(0);
    expect(parseProgress(JSON.stringify(twice))).toEqual(twice);
  });
  it('rewards library practice without marking a curriculum lesson complete', () => {
    const result = completeLesson(defaultProgress, 'practice-123', ['1-1-0']);
    expect(result.completed).toEqual([]);
    expect(result.readCards).toEqual(['1-1-0']);
    expect(result.earnedStars).toBe(3);
  });
  it('uses local dates across month and year boundaries', () => {
    expect(dateKey(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01');
    expect(
      getStreak({ '2025-12-30': 6, '2025-12-31': 6, '2026-01-01': 6 }, new Date(2026, 0, 1)),
    ).toBe(3);
  });
  it('keeps yesterday’s streak until today ends, but breaks it after a gap', () => {
    const activity = { '2026-09-09': 6, '2026-09-10': 6, '2026-09-11': 6 };
    expect(getStreak(activity, new Date(2026, 8, 12))).toBe(3);
    expect(getStreak(activity, new Date(2026, 8, 13))).toBe(0);
    expect(getStreak({}, new Date())).toBe(0);
  });
});

it('keeps earned streak achievements after a reading break', () => {
  const activity = { '2026-09-01': 6, '2026-09-02': 6, '2026-09-03': 6, '2026-09-11': 6 };
  expect(getStreak(activity, new Date(2026, 8, 12))).toBe(1);
  expect(getLongestStreak(activity)).toBe(3);
});

it('uses Polish count forms including teens and compound numbers', () => {
  expect([0, 1, 2, 4, 6, 12, 14, 21, 22, 112].map(cardCount)).toEqual([
    '0 kart',
    '1 karta',
    '2 karty',
    '4 karty',
    '6 kart',
    '12 kart',
    '14 kart',
    '21 kart',
    '22 karty',
    '112 kart',
  ]);
  expect(polishPlural(3, ['gwiazdka', 'gwiazdki', 'gwiazdek'])).toBe('gwiazdki');
});
