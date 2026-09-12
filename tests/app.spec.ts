import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function startFirstLesson(page: Page) {
  await page.getByRole('button', { name: 'Zaczynamy przygodę', exact: true }).click();
}
async function finishSession(page: Page) {
  for (let index = 0; index < 5; index++)
    await page.getByRole('button', { name: 'Następna karta', exact: true }).click();
  await page.getByRole('button', { name: 'Czas na zabawę', exact: true }).click();
  const answer = await page.locator('.memory-card > p').innerText();
  await page.getByRole('button', { name: 'Pamiętam! Szukam' }).click();
  await page.locator('.answer-options').getByRole('button', { name: answer, exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Pięknie ci poszło!' })).toBeVisible();
  await page.getByRole('button', { name: 'Wracam do mojej przygody' }).click();
}
test.beforeEach(async ({ page }) => {
  await page.goto('./');
});
test('completes a reading session and persists progress and favorites', async ({ page }) => {
  await startFirstLesson(page);
  await expect(page.locator('.reading-text')).toHaveText('mama');
  await page.getByRole('button', { name: 'Dodaj do ulubionych', exact: true }).click();
  await page.getByRole('button', { name: 'Pokaż podpowiedź' }).click();
  await expect(page.getByText('Przytula cię i jest blisko.')).toBeVisible();
  await finishSession(page);
  await page.reload();
  await expect(page.locator('.stat-chip.stars strong')).toHaveText('3');
  await expect(page.locator('.stat-chip.streak strong')).toHaveText('1');
  await expect(page.getByRole('button', { name: /POZIOM 1 Pierwsze słowa/ })).toContainText(
    '1 z 4 zestawów',
  );
  await page.getByRole('button', { name: /^(Moje sukcesy|Sukcesy)$/ }).click();
  await expect(page.locator('.progress-stats strong')).toHaveText(['6', '3', '1', '1']);
  await expect(page.locator('.badge-card.unlocked')).toContainText('Pierwszy krok');
});
test('all six levels open and allow a reading session without locks', async ({ page }) => {
  for (let level = 1; level <= 6; level++) {
    await page.getByRole('button', { name: new RegExp(`^POZIOM ${level} `) }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('.lesson-row')).toHaveCount(4);
    await page.locator('.lesson-row').first().click();
    await expect(page.locator('.reading-text')).not.toBeEmpty();
    await page.getByRole('button', { name: 'Zakończ sesję', exact: true }).click();
    await page.getByRole('button', { name: 'Kończę na dziś', exact: true }).click();
  }
  await expect(page.locator('.stat-chip.stars strong')).toHaveText('0');
});
test('library searches Polish accents, filters favorites and practices a single card', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Biblioteczka', exact: true }).click();
  await page.getByRole('textbox', { name: 'Szukaj słowa lub zdania' }).fill('zolty banan');
  await expect(page.locator('.library-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Dodaj do ulubionych: żółty banan', exact: true }).click();
  await page.getByRole('button', { name: /^Ulubione/ }).click();
  await expect(page.locator('.library-card > p')).toHaveText('żółty banan');
  await page.getByRole('button', { name: 'Czytaj: żółty banan', exact: true }).click();
  await expect(page.locator('.reading-text')).toHaveText('żółty banan');
  await page.getByRole('button', { name: 'Czas na zabawę' }).click();
  await page.getByRole('button', { name: 'Pamiętam! Szukam' }).click();
  await expect(page.locator('.answer-options > button')).toHaveCount(3);
  await page
    .locator('.answer-options')
    .getByRole('button', { name: 'żółty banan', exact: true })
    .click();
  await page.getByRole('button', { name: 'Wracam do mojej przygody' }).click();
  await page.reload();
  await page.getByRole('button', { name: /^(Moje sukcesy|Sukcesy)$/ }).click();
  await expect(page.locator('.progress-stats strong')).toHaveText(['1', '3', '1', '1']);
  await expect(page.locator('.badge-card.unlocked')).toHaveCount(0);
});
test('settings persist and change the reading presentation', async ({ page }) => {
  await page.getByRole('button', { name: 'Otwórz profil i ustawienia' }).click();
  await page.getByLabel('Imię lub pseudonim odkrywcy').fill('Maja');
  await page.getByRole('switch', { name: 'Wielkie litery', exact: true }).click();
  await page.getByRole('switch', { name: 'Jeszcze większe litery', exact: true }).click();
  await page.getByLabel('Tempo czytania').selectOption('0.65');
  await page.getByLabel('Mały dzienny cel').selectOption('12');
  await page.getByRole('button', { name: 'Zamknij', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: /Cześć, Maja!/ })).toBeVisible();
  await startFirstLesson(page);
  await expect(page.locator('.reading-text')).toHaveText('MAMA');
  await expect(page.locator('.reading-card')).toHaveClass(/large-type/);
});
test('recognition offers friendly retries and an optional reminder', async ({ page }) => {
  await startFirstLesson(page);
  for (let index = 0; index < 5; index++)
    await page.getByRole('button', { name: 'Następna karta', exact: true }).click();
  await page.getByRole('button', { name: 'Czas na zabawę', exact: true }).click();
  await page.getByRole('button', { name: 'Pamiętam! Szukam' }).click();
  await page.locator('.answer-options').getByRole('button', { name: 'mama', exact: true }).click();
  await expect(page.getByText('Spróbuj jeszcze raz.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Chcę zobaczyć jeszcze raz' }).click();
  await expect(page.locator('.memory-reminder')).toHaveText('dom');
  await page.locator('.answer-options').getByRole('button', { name: 'dom', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Pięknie ci poszło!' })).toBeVisible();
});
test('parent dialog traps keyboard focus and restores it on Escape', async ({ page }) => {
  const opener = page.getByRole('button', { name: 'Otwórz profil i ustawienia' });
  await opener.click();
  await expect(page.getByRole('dialog')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Zamknij', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Zacznij od nowa — wyzeruj dane' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(opener).toBeFocused();
});
test('offline reopening works including a previously unvisited level', async ({
  page,
  context,
}) => {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Cześć, odkrywco/ })).toBeVisible();
  await page.getByRole('button', { name: /^POZIOM 6 / }).click();
  await page.locator('.lesson-row').last().click();
  await expect(page.locator('.reading-text')).toContainText('Babcia dała Mai małe nasionko.');
  await context.setOffline(false);
});
test('main views and reading controls have no accessibility violations', async ({ page }) => {
  const violations: unknown[] = [];
  const inspect = async (view: string) => {
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        document.getAnimations().map((animation) => animation.finished.catch(() => {})),
      );
    });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    violations.push(
      ...results.violations.map((item) => ({
        view,
        id: item.id,
        nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
      })),
    );
  };
  for (const name of [
    null,
    /^(Poziomy nauki|Poziomy)$/,
    'Biblioteczka',
    /^(Moje sukcesy|Sukcesy)$/,
  ]) {
    if (name) await page.getByRole('button', { name, exact: typeof name === 'string' }).click();
    await inspect(String(name || 'home'));
  }
  await page.getByRole('button', { name: 'Otwórz profil i ustawienia' }).click();
  await inspect('parent settings');
  await page.getByRole('button', { name: 'Zamknij', exact: true }).click();
  await page.getByRole('button', { name: 'Czytamy razem', exact: true }).click();
  await inspect('reading card');
  expect(violations).toEqual([]);
});
test('layouts stay inside the viewport at phone, tablet and desktop widths', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    const headline = page.locator('.hero h2');
    expect(await headline.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
  }
});
test('browser has no runtime errors during a full session', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.reload();
  await startFirstLesson(page);
  await finishSession(page);
  expect(errors).toEqual([]);
});

test('speech requests the Polish device voice and chosen reading speed', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: class {
        text: string;
        lang = '';
        rate = 1;
        voice: unknown = null;
        constructor(text: string) {
          this.text = text;
        }
      },
    });
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        cancel() {},
        getVoices() {
          return [{ lang: 'pl-PL', name: 'Polish test voice' }];
        },
        speak(utterance: SpeechSynthesisUtterance) {
          (window as unknown as { testSpeech: unknown }).testSpeech = {
            text: utterance.text,
            lang: utterance.lang,
            rate: utterance.rate,
          };
        },
      },
    });
  });
  await page.reload();
  await startFirstLesson(page);
  await page.getByRole('button', { name: 'Posłuchaj', exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { testSpeech: unknown }).testSpeech))
    .toEqual({ text: 'mama', lang: 'pl-PL', rate: 0.85 });
});
test('storage failure is visible without preventing reading', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Test quota', 'QuotaExceededError');
    };
  });
  await page.reload();
  await expect(page.getByRole('status')).toContainText('Postęp nie może zostać zapisany');
  await startFirstLesson(page);
  await finishSession(page);
  await expect(page.locator('.stat-chip.stars strong')).toHaveText('3');
});
test('reset requires an explicit choice and then clears only the app data', async ({ page }) => {
  await page.getByRole('button', { name: 'Otwórz profil i ustawienia' }).click();
  await page.getByLabel('Imię lub pseudonim odkrywcy').fill('Test');
  await page.getByRole('button', { name: 'Zacznij od nowa — wyzeruj dane' }).click();
  await expect(page.getByText('Usunąć wszystkie postępy i ulubione?')).toBeVisible();
  await page.getByRole('button', { name: 'Zachowaj dane' }).click();
  await expect(page.getByLabel('Imię lub pseudonim odkrywcy')).toHaveValue('Test');
  await page.getByRole('button', { name: 'Zacznij od nowa — wyzeruj dane' }).click();
  await page.getByRole('button', { name: 'Usuń dane', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: /Cześć, odkrywco/ })).toBeVisible();
});

test('PWA assets and worker stay inside the deployment path', async ({ page, request }) => {
  const baseURL = new URL('./', page.url());
  const links = await page
    .locator('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]')
    .evaluateAll((elements) => elements.map((element) => (element as HTMLLinkElement).href));
  for (const link of links) {
    expect(link.startsWith(baseURL.href)).toBe(true);
    expect((await request.get(link)).ok()).toBe(true);
  }
  const manifestURL = await page
    .locator('link[rel="manifest"]')
    .evaluate((element) => (element as HTMLLinkElement).href);
  const manifest = await (await request.get(manifestURL)).json();
  for (const key of ['id', 'scope', 'start_url'])
    expect(new URL(manifest[key], manifestURL).href).toBe(baseURL.href);
  for (const icon of manifest.icons) {
    const iconURL = new URL(icon.src, manifestURL).href;
    expect(iconURL.startsWith(baseURL.href)).toBe(true);
    const response = await request.get(iconURL);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('image/png');
  }
  const worker = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return { scope: registration.scope, scriptURL: registration.active?.scriptURL };
  });
  expect(worker.scope).toBe(baseURL.href);
  expect(worker.scriptURL).toBe(new URL('sw.js', baseURL).href);
});
