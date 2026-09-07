module.exports = {
  testDir: 'tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1440, height: 900 },
    actionTimeout: 10000,
    permissions: ['clipboard-read', 'clipboard-write']
  },
  // Reconstrói sempre o ficheiro self-contained antes de servir, para os testes
  // correrem contra o artefacto real de distribuição (não uma versão obsoleta).
  webServer: {
    command: 'node build.js && node server.js',
    port: 4173,
    reuseExistingServer: false
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ]
};
