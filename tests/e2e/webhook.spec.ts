import { test, expect } from '@playwright/test'
import crypto from 'crypto'

/**
 * Tests de seguridad del webhook de Mercado Pago
 *
 * Orden de checks en la ruta /api/webhooks/mercadopago:
 *   1. MP_WEBHOOK_SECRET configurado → 500 si no está
 *   2. body.data.id presente        → 400 si falta
 *   3. Firma HMAC + timestamp       → 401 si inválida
 *
 * Por eso los tests aceptan rangos de status code:
 *   - Firma inválida: [401, 500] — 401 si el secret está, 500 si no
 *   - Sin data.id:   [400, 500] — 400 si el secret está, 500 si no
 */

const WEBHOOK_URL = '/api/webhooks/mercadopago'

test.describe('Webhook de Mercado Pago — seguridad', () => {
  test('rechaza requests sin firma (401 o 500 si secret no configurado)', async ({ request }) => {
    // Sin headers x-signature ni x-request-id
    const response = await request.post(WEBHOOK_URL, {
      data: { type: 'subscription_preapproval', data: { id: 'test-123' } },
    })
    // 401: secret configurado, firma rechazada
    // 500: secret no configurado en el entorno de test
    expect([401, 500]).toContain(response.status())
  })

  test('rechaza requests con firma inválida', async ({ request }) => {
    // ts=1234567890 es del año 2009 → anti-replay lo rechaza antes de verificar el hash
    const response = await request.post(WEBHOOK_URL, {
      headers: {
        'x-signature': 'ts=1234567890,v1=hashfalsoinvalido',
        'x-request-id': 'req-123',
      },
      data: { type: 'subscription_preapproval', data: { id: 'test-123' } },
    })
    expect([401, 500]).toContain(response.status())
  })

  test('rechaza requests con timestamp antiguo (anti-replay)', async ({ request }) => {
    // Generar firma válida pero con timestamp de hace 6+ minutos
    const oldTs = Math.floor(Date.now() / 1000) - 400
    const dataId = 'test-replay-123'
    const requestId = 'req-replay-456'
    // Usar el secret del entorno si está disponible, si no, cualquier string
    const secret = process.env.MP_WEBHOOK_SECRET ?? 'fallback-test-secret'
    const message = `id=${dataId}&request-id=${requestId}&ts=${oldTs}`
    const hmac = crypto.createHmac('sha256', secret).update(message).digest('hex')

    const response = await request.post(WEBHOOK_URL, {
      headers: {
        'x-signature': `ts=${oldTs},v1=${hmac}`,
        'x-request-id': requestId,
      },
      data: { type: 'subscription_preapproval', data: { id: dataId } },
    })
    // Si el secret coincide → anti-replay → 401
    // Si el secret no coincide → hash inválido → 401
    // Si el secret no está configurado → 500
    expect([401, 500]).toContain(response.status())
  })

  test('rechaza body sin data.id', async ({ request }) => {
    // data.id faltante → el check de dataId debe retornar 400
    // (siempre que MP_WEBHOOK_SECRET esté configurado)
    const response = await request.post(WEBHOOK_URL, {
      headers: {
        // Firma arbitraria — la ruta devuelve 400 ANTES de verificar la firma
        'x-signature': 'ts=1234567890,v1=cualquier',
        'x-request-id': 'req-123',
      },
      data: { type: 'subscription_preapproval', data: {} },
    })
    // 400: secret configurado, data.id faltante
    // 500: secret no configurado (check anterior al de data.id)
    expect([400, 500]).toContain(response.status())
  })

  test('rechaza cualquier request sin firma válida', async ({ request }) => {
    // Tipo desconocido también es rechazado por firma inválida primero
    const response = await request.post(WEBHOOK_URL, {
      data: { type: 'unknown_type', data: { id: 'test-999' } },
    })
    // Sin x-signature → verifyWebhookSignature retorna false → 401
    // Sin MP_WEBHOOK_SECRET → 500
    expect([401, 500]).toContain(response.status())
  })
})
