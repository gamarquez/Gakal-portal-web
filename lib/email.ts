import { Resend } from 'resend'

const FROM_EMAIL = 'Gakal <noreply@gakal.com.ar>'

// Escapa caracteres HTML para evitar que datos de usuario rompan los templates
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY no configurada en variables de entorno')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

export interface EmailPayload {
  to: string
  subject: string
  html: string
  tags?: Array<{ name: string; value: string }>
}

// ─── Templates ────────────────────────────────────────────────────────────────

const TEMPLATE_BIENVENIDA = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Gakal</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <tr><td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:40px;text-align:center;">
          <div style="font-size:64px;margin-bottom:16px;">🎉</div>
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">¡Bienvenido a Gakal!</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 16px;color:#374151;font-size:16px;">Hola {{nombre}},</p>
          <p style="margin:0 0 24px;color:#374151;font-size:16px;">¡Tu cuenta está confirmada! Estamos muy contentos de tenerte en nuestra comunidad de nutrición y bienestar.</p>
          <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);border-radius:12px;padding:24px;margin:24px 0;">
            <h2 style="margin:0 0 16px;color:#ffffff;font-size:20px;">🚀 Empezá ahora:</h2>
            <ul style="margin:0;padding:0;list-style:none;">
              <li style="margin-bottom:10px;padding-left:24px;position:relative;color:#ffffff;font-size:14px;"><span style="position:absolute;left:0;">✓</span> Registrá tus comidas y llevá un control completo</li>
              <li style="margin-bottom:10px;padding-left:24px;position:relative;color:#ffffff;font-size:14px;"><span style="position:absolute;left:0;">✓</span> Ganá puntos y subí de nivel</li>
              <li style="margin-bottom:10px;padding-left:24px;position:relative;color:#ffffff;font-size:14px;"><span style="position:absolute;left:0;">✓</span> Desbloqueá logros mientras mejorás tus hábitos</li>
              <li style="margin-bottom:10px;padding-left:24px;position:relative;color:#ffffff;font-size:14px;"><span style="position:absolute;left:0;">✓</span> Analizá tus comidas con IA (planes premium)</li>
            </ul>
          </div>
          <div style="text-align:center;margin:32px 0;">
            <a href="https://gakal.com.ar/planes" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:16px;">Ver planes premium</a>
          </div>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">Gakal · <a href="https://gakal.com.ar" style="color:#10b981;text-decoration:none;">gakal.com.ar</a> · <a href="mailto:soporte@gakal.com.ar" style="color:#10b981;text-decoration:none;">soporte@gakal.com.ar</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

const TEMPLATE_PLAN_ACTIVADO = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <tr><td style="background:#10b981;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">¡Tu plan fue activado!</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 16px;color:#374151;font-size:16px;">Hola {{nombre}},</p>
          <p style="margin:0 0 24px;color:#374151;font-size:16px;">Tu suscripción al plan <strong>{{plan}}</strong> fue activada exitosamente. Ya podés disfrutar de todas sus features.</p>
          <div style="background:#f0fdf4;border-left:4px solid #10b981;border-radius:8px;padding:20px;margin-bottom:24px;">
            <p style="margin:0;color:#065f46;font-size:14px;font-weight:600;">Plan activo: {{plan}}</p>
            <p style="margin:4px 0 0;color:#047857;font-size:13px;">Vigente hasta: {{fecha_fin}}</p>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="https://gakal.com.ar/cuenta" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">Ver mi cuenta</a>
          </div>
          <p style="margin:0;color:#6b7280;font-size:14px;">Gracias por confiar en Gakal. ¡Seguí con tu racha! 🔥</p>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">Gakal · <a href="https://gakal.com.ar" style="color:#10b981;text-decoration:none;">gakal.com.ar</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

const TEMPLATE_PLAN_CANCELADO = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <tr><td style="background:#6b7280;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Suscripción {{accion_titulo}}</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 16px;color:#374151;font-size:16px;">Hola {{nombre}},</p>
          <p style="margin:0 0 24px;color:#374151;font-size:16px;">Tu suscripción al plan <strong>{{plan}}</strong> fue {{accion}}. Tu cuenta vuelve al plan <strong>Free</strong>.</p>
          <div style="background:#fef9c3;border-left:4px solid #eab308;border-radius:8px;padding:20px;margin-bottom:24px;">
            <p style="margin:0;color:#713f12;font-size:14px;">Si creés que esto fue un error o querés reactivar tu plan, visitá <a href="https://gakal.com.ar/planes" style="color:#10b981;">gakal.com.ar/planes</a></p>
          </div>
          <p style="margin:0;color:#6b7280;font-size:14px;">Gracias por haber sido parte de Gakal. Siempre podés volver 💚</p>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">Gakal · <a href="https://gakal.com.ar" style="color:#10b981;text-decoration:none;">gakal.com.ar</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

// ─── Core send function ────────────────────────────────────────────────────────

export async function sendEmail(payload: EmailPayload): Promise<{ id: string }> {
  const resend = getResend()
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    tags: payload.tags,
  })

  if (error || !data) {
    throw new Error(`Resend error: ${error?.message ?? 'No data returned'}`)
  }

  return { id: data.id }
}

// ─── Send with log (best-effort) ─────────────────────────────────────────────

interface SendWithLogOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any
  userId?: string
  tipo: string
  metadata?: Record<string, unknown>
}

export async function sendEmailWithLog(
  payload: EmailPayload,
  log: SendWithLogOptions
): Promise<{ id: string } | null> {
  let resendId: string | null = null
  let errorMsg: string | null = null

  try {
    const result = await sendEmail(payload)
    resendId = result.id
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`Error enviando email tipo "${log.tipo}":`, errorMsg)
  }

  try {
    await log.supabaseAdmin.from('email_log').insert({
      usuario_id: log.userId ?? null,
      email_destino: payload.to,
      tipo: log.tipo,
      subject: payload.subject,
      resend_id: resendId,
      estado: errorMsg ? 'error' : 'enviado',
      error_mensaje: errorMsg,
      metadata: log.metadata ?? null,
    })
  } catch (logErr) {
    console.error('Error al guardar en email_log (no crítico):', logErr)
  }

  return resendId ? { id: resendId } : null
}

// ─── Named email senders ──────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any,
  opts: { userId: string; email: string; nombre: string }
) {
  const html = TEMPLATE_BIENVENIDA.replace(/\{\{nombre\}\}/g, escapeHtml(opts.nombre))
  return sendEmailWithLog(
    { to: opts.email, subject: '¡Bienvenido a Gakal! 🎉', html, tags: [{ name: 'tipo', value: 'bienvenida' }] },
    { supabaseAdmin, userId: opts.userId, tipo: 'bienvenida' }
  )
}

export async function sendPlanActivadoEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any,
  opts: { userId: string; email: string; nombre: string; plan: string; fechaFin: string }
) {
  const html = TEMPLATE_PLAN_ACTIVADO
    .replace(/\{\{nombre\}\}/g, escapeHtml(opts.nombre))
    .replace(/\{\{plan\}\}/g, escapeHtml(opts.plan))
    .replace(/\{\{fecha_fin\}\}/g, escapeHtml(opts.fechaFin))

  return sendEmailWithLog(
    {
      to: opts.email,
      subject: `¡Tu plan ${opts.plan} fue activado! 🎉`,
      html,
      tags: [{ name: 'tipo', value: 'activacion_plan' }],
    },
    { supabaseAdmin, userId: opts.userId, tipo: 'activacion_plan', metadata: { plan: opts.plan } }
  )
}

export async function sendPlanCanceladoEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any,
  opts: { userId: string; email: string; nombre: string; plan: string; accion: 'cancelada' | 'pausada' }
) {
  const accionTitulo = opts.accion === 'cancelada' ? 'Cancelada' : 'Pausada'
  const html = TEMPLATE_PLAN_CANCELADO
    .replace(/\{\{nombre\}\}/g, escapeHtml(opts.nombre))
    .replace(/\{\{plan\}\}/g, escapeHtml(opts.plan))
    .replace(/\{\{accion_titulo\}\}/g, escapeHtml(accionTitulo))
    .replace(/\{\{accion\}\}/g, escapeHtml(opts.accion))

  const tipo = opts.accion === 'cancelada' ? 'cancelacion_plan' : 'pausa_plan'
  return sendEmailWithLog(
    {
      to: opts.email,
      subject: `Tu suscripción de Gakal fue ${opts.accion}`,
      html,
      tags: [{ name: 'tipo', value: tipo }],
    },
    { supabaseAdmin, userId: opts.userId, tipo, metadata: { plan: opts.plan } }
  )
}

// ─── Plan name helper ─────────────────────────────────────────────────────────

export const NOMBRES_PLANES: Record<string, string> = {
  free: 'Free',
  bronce: 'Bronce 🥉',
  plata: 'Plata 🥈',
  oro: 'Oro 🥇',
}
