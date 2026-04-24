import { defineConfig, devices } from '@playwright/test';

// Mode: local (.local.wiz) or online (use PREVIEW_* envs)
const MODE = process.env.PLAY_MODE || 'local';

const LOCAL = (() => {
  const WWW_PORT = process.env.PLAY_LOCAL_WWW_PORT || '3000';
  const AUTH_PORT = process.env.PLAY_LOCAL_AUTH_PORT || '3001';
  const DB_PORT = process.env.PLAY_LOCAL_DB_PORT || '3002';
  const MAGI_PORT = process.env.PLAY_LOCAL_MAGI_PORT || '3013';
  return {
    auth: `http://auth.local.wiz:${AUTH_PORT}`,
    dashboard: `http://dashboard.local.wiz:${DB_PORT}`,
    www: `http://www.local.wiz:${WWW_PORT}`,
    magicoord: `http://magicoord.local.wiz:${MAGI_PORT}`,
  } as const;
})();

const ONLINE = {
  auth: process.env.PREVIEW_BASE_AUTH || 'https://auth.wizpulseai.com',
  dashboard: process.env.PREVIEW_BASE_DASHBOARD || 'https://dashboard.wizpulseai.com',
  www: process.env.PREVIEW_BASE_WWW || 'https://www.wizpulseai.com',
  magicoord: process.env.PREVIEW_BASE_MAGICOORD || 'https://magicoord.wizpulseai.com',
};

const BASE = MODE === 'local' ? LOCAL : ONLINE;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  timeout: 60_000,
  use: {
    actionTimeout: 10_000,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'auth',
      use: {
        baseURL: BASE.auth,
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'dashboard',
      use: {
        baseURL: BASE.dashboard,
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'www',
      use: {
        baseURL: BASE.www,
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'magicoord',
      use: {
        baseURL: BASE.magicoord,
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
