import { test, expect } from '@playwright/test'

/**
 * Tests del flujo de Registro de usuario
 *
 * DOM real de RegistroForm:
 * - Inputs: Nombre completo → id="nombre-completo", Email → id="email",
 *   Contraseña → id="contraseña", Confirmar contraseña → id="confirmar-contraseña"
 * - TerminosCheckbox: <input type="checkbox"> sin id, dentro de <label> implícito
 * - Error términos: <p class="text-sm text-red-600 ml-8">Debes aceptar los Términos...</p>
 * - Error general: <p class="text-sm text-red-600"> dentro de div.bg-red-50
 * - Submit: <button type="submit">Crear cuenta</button>
 */

test.describe('Formulario de Registro', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    // Esperar que el Suspense resuelva
    await page.waitForSelector('h3', { timeout: 10_000 })
    // Cambiar a la tab de registro (texto exacto "Registrarse", distinto a "Registrate acá")
    await page.getByRole('button', { name: 'Registrarse' }).click()
    // Esperar que el form de registro esté listo
    await expect(page.getByLabel('Nombre completo')).toBeVisible({ timeout: 5_000 })
  })

  test('muestra todos los campos requeridos', async ({ page }) => {
    await expect(page.getByLabel('Nombre completo')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    // exact:true para distinguir "Contraseña" de "Confirmar contraseña"
    await expect(page.getByLabel('Contraseña', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Confirmar contraseña')).toBeVisible()
    // Submit button tiene type="submit" con texto "Crear cuenta"
    await expect(page.locator('button[type="submit"]')).toContainText('Crear cuenta')
  })

  test('valida contraseñas que no coinciden', async ({ page }) => {
    await page.getByLabel('Nombre completo').fill('Test Usuario')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Contraseña', { exact: true }).fill('password123')
    await page.getByLabel('Confirmar contraseña').fill('diferente456')
    // getByRole('checkbox') — único checkbox en el form
    await page.getByRole('checkbox').check()
    await page.locator('button[type="submit"]').click()

    await expect(page.getByText('Las contraseñas no coinciden')).toBeVisible()
  })

  test('valida contraseña muy corta', async ({ page }) => {
    await page.getByLabel('Nombre completo').fill('Test Usuario')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Contraseña', { exact: true }).fill('abc')
    await page.getByLabel('Confirmar contraseña').fill('abc')
    await page.getByRole('checkbox').check()
    await page.locator('button[type="submit"]').click()

    await expect(page.getByText('La contraseña debe tener al menos 6 caracteres')).toBeVisible()
  })

  test('requiere aceptar términos antes de registrarse', async ({ page }) => {
    await page.getByLabel('Nombre completo').fill('Test Usuario')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Contraseña', { exact: true }).fill('password123')
    await page.getByLabel('Confirmar contraseña').fill('password123')
    // Dejar el checkbox SIN marcar
    await page.locator('button[type="submit"]').click()

    // Error de términos: proviene de terminosError → TerminosCheckbox error prop
    // Renderiza como <p class="text-sm text-red-600 ml-8">Debes aceptar los...</p>
    // ATENCIÓN: NO usar /Términos y Condiciones/ — también matchea el link del footer
    await expect(
      page.getByText('Debes aceptar los Términos y Condiciones para continuar')
    ).toBeVisible()
  })

  test('muestra mensaje de éxito o error tras registro (no redirige a /cuenta)', async ({ page }) => {
    const uniqueEmail = `playwright_${Date.now()}@gakal-playwright.com`
    await page.getByLabel('Nombre completo').fill('Test Playwright')
    await page.getByLabel('Email').fill(uniqueEmail)
    await page.getByLabel('Contraseña', { exact: true }).fill('password123')
    await page.getByLabel('Confirmar contraseña').fill('password123')
    await page.getByRole('checkbox').check()
    await page.locator('button[type="submit"]').click()

    // Esperar respuesta de la API (registro real contra Supabase)
    await page.waitForTimeout(6_000)

    // En ningún caso debe redirigir a /cuenta sin confirmación de email
    expect(page.url()).not.toContain('/cuenta')

    // Debe mostrar éxito ("¡Cuenta creada exitosamente!") o error de la API
    const successVisible = await page.getByText('¡Cuenta creada exitosamente!').isVisible().catch(() => false)
    const errorVisible = await page.locator('.bg-red-50').isVisible().catch(() => false)
    expect(successVisible || errorVisible).toBe(true)
  })
})
