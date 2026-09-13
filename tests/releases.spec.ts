import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import packageJson from '../package.json' with { type: 'json' };
import notes from '../src/release-notes.json' with { type: 'json' };

const { version } = packageJson;
const versions = notes.map((note) => `v${note.version}`);
// Simulate an earlier launch without adding fictitious releases to the UI history.
const previousVersion = `${version}-rc.1`;

const storeKey = 'czytanki-profiles-v1';
const historyButton = (page: Page) =>
  page.getByRole('button', { name: `Wersja v${version} Historia zmian` });
const saved = (page: Page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storeKey);
async function setPreviousVersion(page: Page, previous: unknown) {
  await page.evaluate(
    ({ key, previous }) => {
      const store = JSON.parse(localStorage.getItem(key)!);
      store.lastLaunchedVersion = previous;
      localStorage.setItem(key, JSON.stringify(store));
    },
    { key: storeKey, previous },
  );
}

test('first launch records the version and the footer opens accessible full history on every main page', async ({
  page,
}, testInfo) => {
  await page.goto('./');
  await expect.poll(async () => (await saved(page)).lastLaunchedVersion).toBe(version);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  for (const destination of [
    null,
    /^(Poziomy nauki|Poziomy)$/,
    /^Biblioteczka$/,
    /^(Moje sukcesy|Sukcesy)$/,
  ]) {
    if (destination) await page.getByRole('button', { name: destination }).click();
    await historyButton(page).click();
    const dialog = page.getByRole('dialog', { name: 'Historia zmian', exact: true });
    await expect(dialog).toBeFocused();
    await expect(dialog.locator('.release-version')).toHaveText(versions);
    await expect(dialog).not.toContainText('Unreleased');
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Zamknij', exact: true })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('button', { name: 'Wracam do czytania' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(historyButton(page)).toBeFocused();
  }
  await page.screenshot({ path: testInfo.outputPath('footer.png') });
  await historyButton(page).click();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document.getAnimations().map((animation) => animation.finished.catch(() => {})),
    );
  });
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('history.png') });
  for (const width of [320, 390, 593, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page
        .getByRole('dialog')
        .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
    ).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.getByRole('button', { name: 'Wracam do czytania' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('an upgrade shows the new release once and preserves learning data', async ({ page }) => {
  await page.goto('./');
  const before = await saved(page);
  await setPreviousVersion(page, previousVersion);
  await page.reload();
  const dialog = page.getByRole('dialog', { name: 'Co nowego w Czytankach?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.release-version')).toHaveText([`v${version}`]);
  await expect.poll(async () => (await saved(page)).lastLaunchedVersion).toBe(version);
  expect((await saved(page)).profiles).toEqual(before.profiles);
  await page.getByRole('button', { name: 'Wracam do czytania' }).click();
  await page.reload();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await historyButton(page).click();
  await expect(page.locator('.release-version')).toHaveText(versions);
});

test('repeat launches, rollbacks and unversioned existing data do not announce an upgrade', async ({
  page,
}) => {
  await page.goto('./');
  for (const previous of [version, '99.0.0', null, 'invalid']) {
    await setPreviousVersion(page, previous);
    await page.reload();
    await expect.poll(async () => (await saved(page)).lastLaunchedVersion).toBe(version);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /Cześć, odkrywco/ })).toBeVisible();
  }
});

test('switching profiles and resetting progress keep the launch version', async ({ page }) => {
  await page.goto('./');
  await setPreviousVersion(page, previousVersion);
  await page.reload();
  await page.getByRole('button', { name: 'Zamknij', exact: true }).click();
  await page.getByRole('button', { name: 'Zmień profil', exact: true }).click();
  await page.getByLabel('Imię nowego dziecka').fill('Maja');
  await page.getByRole('button', { name: 'Dodaj profil', exact: true }).click();
  await page.getByRole('button', { name: 'Zacznij od nowa — wyzeruj dane' }).click();
  await page.getByRole('button', { name: 'Usuń dane', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect.poll(async () => (await saved(page)).lastLaunchedVersion).toBe(version);
  expect((await saved(page)).profiles).toHaveLength(2);
});

test('history and upgrade detection work offline', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);
  await setPreviousVersion(page, previousVersion);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('dialog', { name: 'Co nowego w Czytankach?' })).toBeVisible();
  await expect(page.locator('.release-version')).toHaveText([`v${version}`]);
  await page.getByRole('button', { name: 'Zamknij', exact: true }).click();
  await historyButton(page).click();
  await expect(page.locator('.release-version')).toHaveCount(versions.length);
  await context.setOffline(false);
});

test('failed launch persistence leaves saved data intact and does not prevent reading', async ({
  page,
}) => {
  await page.goto('./');
  await setPreviousVersion(page, previousVersion);
  const before = await saved(page);
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Test quota', 'QuotaExceededError');
    };
  });
  await page.reload();
  await expect(page.getByRole('dialog', { name: 'Co nowego w Czytankach?' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Postęp nie może zostać zapisany');
  await page.getByRole('button', { name: 'Wracam do czytania' }).click();
  expect(await saved(page)).toEqual(before);
  await page.getByRole('button', { name: 'Zaczynamy przygodę', exact: true }).click();
  await expect(page.locator('.reading-text')).toHaveText('mama');
});
