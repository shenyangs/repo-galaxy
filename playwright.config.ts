import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve('.browser-cache');
export default defineConfig({
  testDir: 'tests', testMatch: ['*.spec.ts'], timeout: 45_000, retries: 0, workers: 1,
  use: { ...devices['Desktop Chrome'], launchOptions: {executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}, baseURL: 'http://127.0.0.1:4202', viewport: {width: 1440, height: 810}, video: 'on', screenshot: 'on' },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:4202', reuseExistingServer: false, timeout: 90_000 },
  outputDir: 'artifacts/playwright/e2e', reporter: [['list']],
});
