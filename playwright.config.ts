import { defineConfig, devices } from '@playwright/test';
const baseURL = `http://127.0.0.1:4187${process.env.VITE_BASE_PATH || '/'}`;
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 3,
  timeout: 30000,
  expect: { timeout: 7000 },
  reporter: [['list']],
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4187 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120000,
  },
});
