import { test, expect } from '@playwright/test'

/**
 * Tests del flujo de Login / Autenticación
 *
 * DOM real de la página:
 * - CardTitle → <h3> con "Ingresar a Gakal" o "Crear cuenta en Gakal"
 * - Tabs: dos <button type="button"> con texto "Ingresar" y "Registrarse"
 * - Submit login: <button type="submit"> con texto "Ingresar"
 * - Reset: <button type="button">¿Olvidaste tu contraseña?</button>
 * - La página usa Suspense: esperar que el <h3> aparezca antes de assertar
 */

test.describe('Página de Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    // Esperar que el Suspense resuelva y el form esté visible en el DOM
    await page.waitForSelector('h3', { timeout: 10_000 })
  })

  test('muestra el formulario de login por defecto', async ({ page }) => {
    // CardTitle renderiza como <h3>
    await expect(page.locator('h3').first()).toContainText('Ingresar a Gakal')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()
    // El submit del form es button[type="submit"] — diferente al tab button[type="button"]
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('permite cambiar a la tab de Registrarse', async ({ page }) => {
    // El tab tiene texto exacto "Registrarse" — distinto al botón "Registrate acá"
    await page.getByRole('button', { name: 'Registrarse' }).click()
    await expect(page.locator('h3').first()).toContainText('Crear cuenta en Gakal')
    await expect(page.getByLabel('Nombre completo')).toBeVisible()
  })

  test('muestra error con credenciales incorrectas', async ({ page }) => {
    await page.getByLabel('Email').fill('noexiste@gakal-test.com')
    await page.getByLabel('Contraseña').fill('wrongpassword')
    // Submit via type="submit" para no confundir con el tab "Ingresar"
    await page.locator('button[type="submit"]').click()

    await expect(page.getByText('Email o contraseña incorrectos')).toBeVisible({ timeout: 10_000 })
  })

  test('muestra error al pedir reset sin email', async ({ page }) => {
    // Intentar reset sin llenar el campo email
    await page.getByRole('button', { name: '¿Olvidaste tu contraseña?' }).click()
    await expect(page.getByText('Por favor ingresá tu email primero')).toBeVisible()
  })

  test('tiene link a Términos y Condiciones en el formulario de registro', async ({ page }) => {
    await page.getByRole('button', { name: 'Registrarse' }).click()
    // Scope al form — el Footer también tiene un link a /terminos
    const terminosLink = page.locator('form').getByRole('link', { name: 'Términos y Condiciones' })
    await expect(terminosLink).toBeVisible()
  })
})
