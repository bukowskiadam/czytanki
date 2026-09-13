import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const openProfiles = (page: Page) =>
  page.getByRole('button', { name: 'Zmień profil', exact: true }).click();
const closeProfiles = (page: Page) =>
  page.getByRole('button', { name: 'Zamknij', exact: true }).click();
async function addChild(page: Page, name: string) {
  await page.getByLabel('Imię nowego dziecka').fill(name);
  await page.getByRole('button', { name: 'Dodaj profil', exact: true }).click();
  await expect(page.getByLabel('Imię lub pseudonim odkrywcy')).toHaveValue(name);
}
const stored = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('czytanki-profiles-v1')!));

test('restores saved profiles and keeps learning, favorites and settings separate after switching and reloading', async ({
  page,
}) => {
  await page.goto('./');
  await page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem('czytanki-profiles-v1')!);
    const progress = store.profiles[0].progress;
    store.profiles[0].progress = {
      ...progress,
      earnedStars: 9,
      completed: ['1-1'],
      readCards: ['1-1-0'],
      favorites: ['1-1-0'],
      activity: { '2026-09-12': 6 },
      settings: {
        ...progress.settings,
        name: 'Maja',
        uppercase: true,
        dailyGoal: 12,
        speechRate: 0.65,
      },
    };
    localStorage.setItem('czytanki-profiles-v1', JSON.stringify(store));
  });
  await page.reload();
  await expect(page.locator('.stat-chip.stars strong')).toHaveText('9');
  const original = (await stored(page)).profiles[0];
  await openProfiles(page);
  await addChild(page, 'Jan');
  await expect(page.getByRole('switch', { name: 'Wielkie litery', exact: true })).toHaveAttribute(
    'aria-checked',
    'false',
  );
  await closeProfiles(page);
  await expect(page.locator('.stat-chip.stars strong')).toHaveText('0');
  await page.getByRole('button', { name: 'Zaczynamy przygodę', exact: true }).click();
  await expect(page.locator('.reading-text')).toHaveText('mama');
  await page.getByRole('button', { name: 'Dodaj do ulubionych', exact: true }).click();
  for (let i = 0; i < 5; i++)
    await page.getByRole('button', { name: 'Następna karta', exact: true }).click();
  await page.getByRole('button', { name: 'Czas na zabawę', exact: true }).click();
  const answer = await page.locator('.memory-card > p').innerText();
  await page.getByRole('button', { name: 'Pamiętam! Szukam' }).click();
  await page.locator('.answer-options').getByRole('button', { name: answer, exact: true }).click();
  await page.getByRole('button', { name: 'Wracam do mojej przygody' }).click();
  await page.reload();
  await expect(page.locator('.current-reader')).toContainText('Jan');
  await expect(page.locator('.stat-chip.stars strong')).toHaveText('3');
  const after = await stored(page);
  expect(after.profiles[0]).toEqual(original);
  expect(after.profiles[1].progress.completed).toEqual(['1-1']);
  expect(after.profiles[1].progress.favorites).toEqual(['1-1-0']);
  await openProfiles(page);
  await page.getByRole('button', { name: 'Maja Wybierz profil', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Wielkie litery', exact: true })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(page.getByLabel('Mały dzienny cel')).toHaveValue('12');
  await closeProfiles(page);
  await expect(page.getByRole('button', { name: 'Zmień profil', exact: true })).toBeFocused();
  await page.reload();
  await expect(page.locator('.stat-chip.stars strong')).toHaveText('9');
});

test('renames without losing identity, resets only the active child, and confirms profile deletion', async ({
  page,
}) => {
  await page.goto('./');
  await openProfiles(page);
  await page.getByLabel('Imię lub pseudonim odkrywcy').fill('Maja');
  await addChild(page, 'Jan');
  const before = await stored(page);
  await page.getByLabel('Imię lub pseudonim odkrywcy').fill('Janek');
  expect((await stored(page)).profiles[1].id).toBe(before.profiles[1].id);
  await page.getByRole('button', { name: 'Zacznij od nowa — wyzeruj dane' }).click();
  await expect(page.getByRole('alert')).toContainText('Janek');
  await page.getByRole('button', { name: 'Usuń dane', exact: true }).click();
  expect((await stored(page)).profiles[0]).toEqual(before.profiles[0]);
  await openProfiles(page);
  await page.getByRole('button', { name: 'Usuń profil Janek', exact: true }).click();
  await page.getByRole('button', { name: 'Zachowaj profil', exact: true }).click();
  expect((await stored(page)).profiles).toHaveLength(2);
  await page.getByRole('button', { name: 'Usuń profil Janek', exact: true }).click();
  await page.getByRole('button', { name: 'Usuń ten profil', exact: true }).click();
  await expect(page.getByLabel('Imię lub pseudonim odkrywcy')).toHaveValue('Maja');
  await expect(page.getByRole('button', { name: 'Usuń profil Maja', exact: true })).toHaveCount(0);
  await page.reload();
  expect((await stored(page)).profiles).toEqual([before.profiles[0]]);
});

test('profile management stays accessible with long names at narrow widths', async ({ page }) => {
  await page.goto('./');
  await openProfiles(page);
  await page.getByLabel('Imię nowego dziecka').fill('   ');
  await expect(page.getByRole('button', { name: 'Dodaj profil' })).toBeDisabled();
  await addChild(page, 'AleksandraAleksandraAleksandra');
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document.getAnimations().map((animation) => animation.finished.catch(() => {})),
    );
  });
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(result.violations).toEqual([]);
  for (const width of [320, 390, 593, 768]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.locator('.dialog').evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
    expect(
      await page.evaluate(() => ({
        width: innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth,
        elements: Array.from(document.querySelectorAll('body *'))
          .filter((el) => el.getBoundingClientRect().right > innerWidth + 1)
          .map((el) => el.className)
          .slice(0, 10),
      })),
      `viewport ${width}`,
    ).toMatchObject({ overflow: false });
  }
});

test('failed writes retain saved profiles and report that changes cannot be saved', async ({
  page,
}) => {
  await page.goto('./');
  await page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem('czytanki-profiles-v1')!);
    store.profiles[0].progress.earnedStars = 12;
    store.profiles[0].progress.settings.name = 'Maja';
    localStorage.setItem('czytanki-profiles-v1', JSON.stringify(store));
  });
  const before = await stored(page);
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Test quota', 'QuotaExceededError');
    };
  });
  await page.reload();
  await expect(page.getByRole('status')).toContainText('Postęp nie może zostać zapisany');
  await expect(page.locator('.stat-chip.stars strong')).toHaveText('12');
  expect(await stored(page)).toEqual(before);
  await openProfiles(page);
  await addChild(page, 'Jan');
  await closeProfiles(page);
  await expect(page.locator('.current-reader')).toContainText('Jan');
  expect(await stored(page)).toEqual(before);
});

test('starts a fresh profile without reading or removing obsolete single-child data', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'czytanki-progress-v1',
      JSON.stringify({ earnedStars: 99, settings: { name: 'Old' } }),
    );
    const getItem = Storage.prototype.getItem;
    const removeItem = Storage.prototype.removeItem;
    Storage.prototype.getItem = function (key) {
      if (key === 'czytanki-progress-v1') throw new Error('Obsolete storage read');
      return getItem.call(this, key);
    };
    Storage.prototype.removeItem = function (key) {
      if (key === 'czytanki-progress-v1') throw new Error('Obsolete storage removal');
      return removeItem.call(this, key);
    };
  });
  await page.goto('./');
  await expect(page.locator('.stat-chip.stars strong')).toHaveText('0');
  await expect(page.getByRole('heading', { name: /Cześć, odkrywco/ })).toBeVisible();
  await expect(page.getByRole('status')).toHaveCount(0);
  expect((await stored(page)).profiles).toHaveLength(1);
  await openProfiles(page);
  await page.getByLabel('Imię lub pseudonim odkrywcy').fill('Maja');
  await closeProfiles(page);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Cześć, Maja/ })).toBeVisible();
  await expect(page.getByRole('status')).toHaveCount(0);
});
