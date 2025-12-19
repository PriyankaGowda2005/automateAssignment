const { defineConfig, devices } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 120000,
  /* Run tests in files in parallel */
  fullyParallel: false, // Disable parallel execution to reduce HTTP2 errors
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1, // Add retry for local runs to handle HTTP2 errors
  /* Reduce workers to minimize HTTP2 protocol errors */
  workers: 1, // Run tests sequentially to avoid overwhelming the server
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    /* If BASE_URL is set in .env, it will be used. Otherwise, defaults to Community Edition Control Room */
    baseURL: process.env.BASE_URL 
      ? process.env.BASE_URL
          .replace(/#\/.*$/, '')  // Remove hash routes like #/login
          .replace(/\?.*$/, '')   // Remove query parameters like ?mkt_tok=...
          .replace(/\/$/, '')     // Remove trailing slash
      : 'https://community2.cloud-2.automationanywhere.digital',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Enhanced video and screenshot settings
    videoSize: { width: 1920, height: 1080 },
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 60000,
    /* Maximum time for navigation. Defaults to 0 (no limit). */
    navigationTimeout: 90000,
    /* Maximum time each test can run. */
    testTimeout: 120000,
    // Disable HTTP/2 to avoid protocol errors
    ignoreHTTPSErrors: false,
    // Additional context options to handle HTTP2 issues
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    },
    // Force HTTP/1.1 to avoid HTTP/2 protocol errors
    httpCredentials: undefined,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      // Add launch options to handle HTTP/2 issues for Chromium
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--disable-http2',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-blink-features=AutomationControlled'
          ]
        }
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'network.http.http2.enabled': false,
            'network.http.http2.enabled.http3': false
          }
        }
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // WebKit options
        launchOptions: {
          args: [],
        },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

