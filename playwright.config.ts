import { defineConfig, devices } from '@playwright/test';

const e2eMode = process.env.E2E_MODE === 'upstream' ? 'upstream' : 'mock';
const port = Number(process.env.E2E_PORT || 3100);
const baseUrl = process.env.E2E_BASE_URL || `http://127.0.0.1:${port}`;
const shouldStartWebServer = process.env.E2E_SKIP_WEBSERVER !== 'true';
const usePreviewServer = process.env.E2E_USE_PREVIEW_SERVER === 'true';
const mockJwtSecret =
    process.env.E2E_MOCK_JWT_SECRET || 'osk-manager-e2e-mock-secret';
const webServerCommand = usePreviewServer
    ? `npm run preview -- --host 127.0.0.1 --port ${port}`
    : `npm run dev -- --host 127.0.0.1 --port ${port}`;

export default defineConfig({
    testDir: './e2e/specs',
    outputDir: './output/playwright/test-results',
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    workers: e2eMode === 'upstream' ? 1 : undefined,
    reporter: [
        ['line'],
        [
            'html',
            {
                open: 'never',
                outputFolder: './output/playwright/report',
            },
        ],
    ],
    use: {
        baseURL: baseUrl,
        timezoneId: 'Europe/Warsaw',
        locale: 'pl-PL',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    expect: {
        timeout: 10_000,
    },
    projects: [
        {
            name: 'ui-chromium',
            testMatch: /ui\/.*\.spec\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'full-chromium',
            testMatch: /full\/.*\.spec\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: shouldStartWebServer
        ? {
              command: webServerCommand,
              url: baseUrl,
              reuseExistingServer: process.env.E2E_REUSE_SERVER === 'true',
              timeout: 300_000,
              stdout: 'pipe',
              stderr: 'pipe',
              env: {
                  ...process.env,
                  JWT_SECRET: mockJwtSecret,
                  NUXT_BFF_ADAPTER: e2eMode,
                  NUXT_API_UPSTREAM:
                      e2eMode === 'upstream'
                          ? process.env.E2E_API_UPSTREAM || ''
                          : '',
                  NUXT_PUBLIC_API_BASE: '',
                  NUXT_PUBLIC_DEMO_MOCK_LOGIN: 'true',
                  NUXT_PUBLIC_SITE_URL: baseUrl,
                  NUXT_COOKIE_SECURE: 'false',
              },
          }
        : undefined,
});
