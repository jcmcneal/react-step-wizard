import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
    testDir: './tests/browser', use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
    webServer: { command: process.env.RSW_BROWSER_MODE === 'development' ?
        'npm run app:dev -- --host 127.0.0.1 --port 4173 --strictPort' :
        'npm run app:preview -- --host 127.0.0.1 --port 4173 --strictPort', port: 4173, reuseExistingServer: false },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        ...(process.env.RSW_INSTALLED_BROWSERS ? [
            { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
            { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
        ] : []),
    ],
});
