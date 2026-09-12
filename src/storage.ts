export type Settings = {
  name: string;
  largeText: boolean;
  uppercase: boolean;
  speechRate: number;
  dailyGoal: number;
};
export type Progress = {
  earnedStars: number;
  completed: string[];
  favorites: string[];
  readCards: string[];
  activity: Record<string, number>;
  settings: Settings;
};
export const STORAGE_KEY = 'czytanki-progress-v1';
export const defaultProgress: Progress = {
  earnedStars: 0,
  completed: [],
  favorites: [],
  readCards: [],
  activity: {},
  settings: { name: '', largeText: false, uppercase: false, speechRate: 0.85, dailyGoal: 6 },
};
const strings = (value: unknown): string[] =>
  Array.isArray(value)
    ? [...new Set(value.filter((entry): entry is string => typeof entry === 'string'))]
    : [];
export function parseProgress(raw: string | null): Progress {
  try {
    const value = JSON.parse(raw || '{}');
    const settings = value?.settings || {};
    return {
      earnedStars:
        typeof value?.earnedStars === 'number' &&
        Number.isFinite(value.earnedStars) &&
        value.earnedStars >= 0
          ? Math.floor(value.earnedStars)
          : 0,
      completed: strings(value?.completed),
      favorites: strings(value?.favorites),
      readCards: strings(value?.readCards),
      activity: Object.fromEntries(
        Object.entries(
          value?.activity && typeof value.activity === 'object' ? value.activity : {},
        ).filter(
          ([key, amount]) =>
            /^\d{4}-\d{2}-\d{2}$/.test(key) &&
            typeof amount === 'number' &&
            Number.isFinite(amount) &&
            amount >= 0,
        ),
      ) as Record<string, number>,
      settings: {
        name: typeof settings.name === 'string' ? settings.name.slice(0, 30) : '',
        largeText: settings.largeText === true,
        uppercase: settings.uppercase === true,
        speechRate: [0.65, 0.85, 1].includes(settings.speechRate) ? settings.speechRate : 0.85,
        dailyGoal: [6, 12, 18].includes(settings.dailyGoal) ? settings.dailyGoal : 6,
      },
    };
  } catch {
    return structuredClone(defaultProgress);
  }
}
export function dateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function completeLesson(
  progress: Progress,
  lessonId: string,
  cardIds: string[],
  date = dateKey(),
): Progress {
  return {
    ...progress,
    earnedStars: progress.earnedStars + 3,
    completed: /^\d+-\d+$/.test(lessonId)
      ? [...new Set([...progress.completed, lessonId])]
      : progress.completed,
    readCards: [...new Set([...progress.readCards, ...cardIds])],
    activity: { ...progress.activity, [date]: (progress.activity[date] || 0) + cardIds.length },
  };
}
export function getStreak(activity: Record<string, number>, now = new Date()): number {
  const date = new Date(now);
  let count = 0;
  if (!activity[dateKey(date)]) date.setDate(date.getDate() - 1);
  while (activity[dateKey(date)] > 0) {
    count++;
    date.setDate(date.getDate() - 1);
  }
  return count;
}

export function getLongestStreak(activity: Record<string, number>): number {
  const dates = Object.keys(activity)
    .filter((key) => activity[key] > 0)
    .sort();
  let longest = 0;
  let current = 0;
  let previous = '';
  for (const key of dates) {
    const dayBefore = new Date(`${key}T12:00:00`);
    dayBefore.setDate(dayBefore.getDate() - 1);
    current = dateKey(dayBefore) === previous ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = key;
  }
  return longest;
}
