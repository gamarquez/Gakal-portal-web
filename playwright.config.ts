import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Los tests de auth son stateful
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3333',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Arrancar el servidor de Next.js automáticamente en tests locales
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3333',
        // false: siempre inicia servidor fresco en el puerto dedicado 3333
        // (evita conectarse a instancias desactualizadas si el puerto 3000 está ocupado)
        reuseExistingServer: false,
        timeout: 120_000,
        // Forzar puerto 3333 dedicado para tests → nunca colisiona con dev local
        env: {
          PORT: '3333',
        },
      },
})
