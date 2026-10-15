// Tests de non-régression de DJingo. Lancer avec : npm test
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: 'tests',
  testMatch: '*.spec.js',
  timeout: 90000,
  workers: 2,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:8766',
    viewport: { width: 1366, height: 768 },
    launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] }
  },
  webServer: { command: 'node tests/serveur.js', url: 'http://localhost:8766/index.html', reuseExistingServer: true }
});
