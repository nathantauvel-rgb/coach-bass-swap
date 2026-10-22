// Tests de non-régression de DJingood. Lancer avec : npm test
const { defineConfig } = require('@playwright/test');
// Port du serveur de test : 8766, ou DJ_PORT pour faire tourner deux copies du site en même temps (lot 37)
const PORT = process.env.DJ_PORT || 8766;
module.exports = defineConfig({
  testDir: 'tests',
  testMatch: '*.spec.js',
  timeout: 90000,
  workers: 2,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1366, height: 768 },
    launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] }
  },
  webServer: { command: 'node tests/serveur.js', url: `http://localhost:${PORT}/index.html`, reuseExistingServer: true }
});
