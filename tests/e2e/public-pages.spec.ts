import { test, expect } from '@playwright/test'

/**
 * Tests de páginas públicas (landing, planes, términos, privacidad)
 * y redirección de rutas privadas.
 *
 * IMPORTANTE — Redirección de rutas privadas:
 * AuthGuard usa useAuth() + useEffect → redirección client-side.
 * page.goto() resuelve con el HTML inicial (spinner de loading),
 * NO con el redirect. Hay que usar waitForURL().
 */

test.describe('Páginas públicas', () => {
  test('landing page carga correctamente', async ({ page }) => {
    await page.goto('/')
    // Título: "Gakal - Nutrición con Gamificación"
    await expect(page).toHaveTitle(/Gakal/)
    // Hero section con <h1>
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('página de planes muestra los 4 planes', async ({ page }) => {
    await page.goto('/planes')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Free').first()).toBeVisible()
    await expect(page.getByText('Bronce').first()).toBeVisible()
    await expect(page.getByText('Plata').first()).toBeVisible()
    await expect(page.getByText('Oro').first()).toBeVisible()
  })

  test('página de términos carga', async ({ page }) => {
    await page.goto('/terminos')
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.getByText('Términos').first()).toBeVisible()
  })

  test('página de privacidad carga', async ({ page }) => {
    await page.goto('/privacidad')
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.getByText('Privacidad').first()).toBeVisible()
  })

  test('reset-password page sin token muestra error amigable (no 404)', async ({ page }) => {
    await page.goto('/reset-password')
    // Sin token_hash → ResetPasswordContent va a step='error'
    // Pero primero pasa por Suspense (spinner) → verifying → error
    // Esperar que el estado de error aparezca
    await expect(page.getByText('Link de recuperación inválido o expirado.')).toBeVisible({
      timeout: 10_000,
    })
    // Verificar que no estamos en 404
    await expect(page).not.toHaveURL(/404/)
  })

  test('rutas privadas redirigen a login si no hay sesión', async ({ page }) => {
    await page.goto('/cuenta')
    // AuthGuard hace redirect client-side vía useEffect → NO usar toHaveURL inmediatamente
    // Usar waitForURL que espera hasta que la URL cambia
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('checkout redirige a login si no hay sesión', async ({ page }) => {
    await page.goto('/checkout/plata')
    // Mismo patrón: AuthGuard client-side redirect
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })
})
