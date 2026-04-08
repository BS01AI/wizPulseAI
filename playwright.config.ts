import { defineConfig, devices } from '@playwright/test'

const PROD_URLS = {
  main: 'https://www.wizpulseai.com',
  auth: 'https://auth.wizpulseai.com',
  dashboard: 'https://dashboard.wizpulseai.com',
  magicoord: 'https://magicoord.wizpulseai.com',
}

const LOCAL_URLS = {
  main: 'http://localhost:3010',
  auth: 'http://localhost:3011',
  dashboard: 'http://localhost:3012',
  magicoord: 'http://localhost:3013',
}

const isLocal = process.env.TEST_ENV === 'local'
const URLS = isLocal ? LOCAL_URLS : PROD_URLS

export { URLS }

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,

  outputDir: 'test-results/artifacts',

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    locale: 'ja-JP',
  },

  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
})
