import { createAdminClient } from '@/lib/supabase/server'
import { getPreApproval } from '@/lib/mercadopago'
import { sendPlanActivadoEmail, sendPlanCanceladoEmail, NOMBRES_PLANES } from '@/lib/email'
import { writeAuditLog } from '@/lib/auditLog'
import { NextRequest, NextResponse } from 'next/server'

// Función para verificar la firma del webhook de Mercado Pago usando Web Crypto API
async function verifyWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  secret: string
): Promise<boolean> {
  if (!xSignature || !xRequestId) {
    return false
  }

  try {
    // Parsear el header x-signature que viene como "ts=1234567890,v1=hash"
    const signatureParts = xSignature.split(',')
    let ts = ''
    let hash = ''

    for (const part of signatureParts) {
      const [key, value] = part.split('=')
      if (key === 'ts') ts = value
      if (key === 'v1') hash = value
    }

    if (!ts || !hash) {
      return false
    }

    // Validar timestamp (anti-replay: rechazar si tiene más de 5 minutos)
    const tsNum = parseInt(ts, 10)
    const nowSec = Math.floor(Date.now() / 1000)
    if (Math.abs(nowSec - tsNum) > 300) {
      console.warn('Webhook timestamp rechazado (posible replay attack):', { ts: tsNum, now: nowSec })
      return false
    }

    // Construir el mensaje a firmar según la documentación de MP
    const message = `id=${dataId}&request-id=${xRequestId}&ts=${ts}`

    // Calcular el HMAC-SHA256 usando Web Crypto API (compatible con Edge Runtime)
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(message)

    // Convertir el hash recibido de hex a bytes para comparación timing-safe
    const hexPairs = hash.match(/.{2}/g)
    if (!hexPairs || hexPairs.length === 0) {
      return false
    }
    const hashBytes = new Uint8Array(hexPairs.map(byte => parseInt(byte, 16)))

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    // crypto.subtle.verify() es timing-safe por especificación (evita timing attacks)
    return await crypto.subtle.verify('HMAC', cryptoKey, hashBytes, messageData)
  } catch (error) {
    console.error('Error verificando firma del webhook:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obtener headers de Mercado Pago
    const xSignature = request.headers.get('x-signature')
    const xRequestId = request.headers.get('x-request-id')

    // Parsear body
    const body = await request.json()

    // Verificar firma del webhook (SEGURIDAD CRÍTICA)
    const webhookSecret = process.env.MP_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('MP_WEBHOOK_SECRET no configurado')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    const dataId = body.data?.id
    if (!dataId) {
      return NextResponse.json(
        { error: 'Missing data ID' },
        { status: 400 }
      )
    }

    // Verificar la firma HMAC-SHA256
    const isValid = await verifyWebhookSignature(xSignature, xRequestId, dataId, webhookSecret)
    if (!isValid) {
      console.error('Firma del webhook inválida', {
        xSignature,
        xRequestId,
        dataId
      })
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    console.log('Webhook de Mercado Pago recibido y verificado:', {
      type: body.type,
      action: body.action,
      data_id: dataId,
    })

    const supabase = createAdminClient()

    // ── Handler: pago individual (ciclo de facturación) ──────────────────────
    if (body.type === 'payment') {
      const mpAccessToken = process.env.MP_ACCESS_TOKEN
      if (!mpAccessToken) {
        console.error('MP_ACCESS_TOKEN no configurado')
        return NextResponse.json({ error: 'MP_ACCESS_TOKEN not configured' }, { status: 500 })
      }

      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${dataId}`,
        { headers: { Authorization: `Bearer ${mpAccessToken}` } }
      )

      if (!paymentResponse.ok) {
        console.error('Error al obtener pago de MP:', paymentResponse.status)
        return NextResponse.json({ received: true })
      }

      const payment = await paymentResponse.json()

      if (payment.status === 'approved' && payment.preapproval_id) {
        const { data: suscripcion } = await supabase
          .from('suscripciones')
          .select('*')
          .eq('mp_preapproval_id', payment.preapproval_id)
          .single<{
            id: string
            usuario_id: string
            plan_id: string
            estado: 'active' | 'paused' | 'cancelled' | 'expired'
            es_anual: boolean
            fecha_cancelacion: string | null
          }>()

        if (!suscripcion) {
          console.log('Suscripción no encontrada para payment preapproval:', payment.preapproval_id)
          return NextResponse.json({ received: true })
        }

        // Idempotencia: no reprocesar si la suscripción ya fue activada
        if (suscripcion.estado === 'active') {
          console.log('Pago ya procesado anteriormente, suscripción activa:', suscripcion.id)
          return NextResponse.json({ received: true })
        }

        const ahora = new Date()
        const fechaFin = new Date(ahora)
        if (suscripcion.es_anual) {
          fechaFin.setFullYear(fechaFin.getFullYear() + 1)
        } else {
          fechaFin.setMonth(fechaFin.getMonth() + 1)
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: paymentSubError } = await (supabase as any).from('suscripciones').update({
          estado: 'active',
          fecha_inicio: ahora.toISOString(),
          fecha_fin: fechaFin.toISOString(),
        }).eq('id', suscripcion.id)

        if (paymentSubError) {
          console.error('Error al activar suscripción por pago:', paymentSubError)
          return NextResponse.json({ error: 'Error al activar suscripción' }, { status: 500 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('perfiles').update({
          plan_id: suscripcion.plan_id,
          suscripcion_activa_id: suscripcion.id,
        }).eq('id', suscripcion.usuario_id)

        // Enviar email de activación
        try {
          const { data: authData } = await supabase.auth.admin.getUserById(suscripcion.usuario_id)
          if (authData?.user?.email) {
            const nombrePlan = NOMBRES_PLANES[suscripcion.plan_id] ?? suscripcion.plan_id
            const nombreUsuario = (authData.user.user_metadata?.nombre as string | undefined) ?? 'Usuario'
            const fechaFinStr = fechaFin.toLocaleDateString('es-AR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              timeZone: 'America/Argentina/Buenos_Aires',
            })
            await sendPlanActivadoEmail(supabase, {
              userId: suscripcion.usuario_id,
              email: authData.user.email,
              nombre: nombreUsuario,
              plan: nombrePlan,
              fechaFin: fechaFinStr,
            })
          }
        } catch (emailErr) {
          console.error('Error al enviar email de activación (no crítico):', emailErr)
        }

        await writeAuditLog(supabase, {
          usuarioId: suscripcion.usuario_id,
          accion: 'plan_activado',
          metadata: { suscripcion_id: suscripcion.id, plan_id: suscripcion.plan_id, via: 'payment' },
        })

        console.log('Pago aprobado, suscripción activada:', suscripcion.id)
      }

      return NextResponse.json({ received: true })
    }

    // ── Handler: cambio de estado del preapproval ─────────────────────────────
    if (body.type !== 'subscription_preapproval') {
      return NextResponse.json({ received: true })
    }

    const preapprovalId = dataId

    // Obtener detalles del preapproval desde Mercado Pago
    const mpResult = await getPreApproval(preapprovalId)

    if (!mpResult.success || !mpResult.data) {
      console.error('Error al obtener preapproval:', mpResult.error)
      return NextResponse.json(
        { error: 'Error al obtener detalles del preapproval' },
        { status: 500 }
      )
    }

    const preapproval = mpResult.data

    // Buscar suscripción en la base de datos
    const { data: suscripcion } = await supabase
      .from('suscripciones')
      .select('*')
      .eq('mp_preapproval_id', preapprovalId)
      .single<{
        id: string
        usuario_id: string
        plan_id: string
        estado: 'active' | 'paused' | 'cancelled' | 'expired'
        es_anual: boolean
        fecha_cancelacion: string | null
      }>()

    if (!suscripcion) {
      console.error('Suscripción no encontrada para preapproval:', preapprovalId)
      return NextResponse.json({ received: true })
    }

    // Mapear estado de Mercado Pago a nuestro estado
    let nuevoEstado: 'active' | 'paused' | 'cancelled' | 'expired' = 'active'

    switch (preapproval.status) {
      case 'authorized':
        nuevoEstado = 'active'
        break
      case 'paused':
        nuevoEstado = 'paused'
        break
      case 'cancelled':
        nuevoEstado = 'cancelled'
        break
      case 'pending':
        return NextResponse.json({ received: true })
      default:
        nuevoEstado = 'expired'
    }

    // Actualizar suscripción en Supabase
    const updateData: {
      estado: 'active' | 'paused' | 'cancelled' | 'expired'
      fecha_inicio?: string
      fecha_fin?: string
      fecha_cancelacion?: string
    } = { estado: nuevoEstado }

    if (nuevoEstado === 'active' && suscripcion.estado !== 'active') {
      updateData.fecha_inicio = new Date().toISOString()
      const fechaFin = new Date()
      if (suscripcion.es_anual) {
        fechaFin.setFullYear(fechaFin.getFullYear() + 1)
      } else {
        fechaFin.setMonth(fechaFin.getMonth() + 1)
      }
      updateData.fecha_fin = fechaFin.toISOString()
    }

    if (nuevoEstado === 'cancelled' && !suscripcion.fecha_cancelacion) {
      updateData.fecha_cancelacion = new Date().toISOString()
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('suscripciones')
      .update(updateData)
      .eq('id', suscripcion.id)

    if (updateError) {
      console.error('Error al actualizar suscripción:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar suscripción' },
        { status: 500 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabase as any)
      .from('perfiles')
      .update({
        plan_id: nuevoEstado === 'active' ? suscripcion.plan_id : 'free',
        suscripcion_activa_id: nuevoEstado === 'active' ? suscripcion.id : null,
      })
      .eq('id', suscripcion.usuario_id)

    if (profileError) {
      console.error('Error al actualizar perfil:', profileError)
    }

    // Enviar emails según el cambio de estado
    try {
      const { data: authData } = await supabase.auth.admin.getUserById(suscripcion.usuario_id)
      if (authData?.user?.email) {
        const nombrePlan = NOMBRES_PLANES[suscripcion.plan_id] ?? suscripcion.plan_id
        const nombreUsuario = (authData.user.user_metadata?.nombre as string | undefined) ?? 'Usuario'

        if (nuevoEstado === 'active' && suscripcion.estado !== 'active') {
          const fechaFinStr = updateData.fecha_fin
            ? new Date(updateData.fecha_fin).toLocaleDateString('es-AR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                timeZone: 'America/Argentina/Buenos_Aires',
              })
            : '-'
          await sendPlanActivadoEmail(supabase, {
            userId: suscripcion.usuario_id,
            email: authData.user.email,
            nombre: nombreUsuario,
            plan: nombrePlan,
            fechaFin: fechaFinStr,
          })
        } else if (nuevoEstado === 'cancelled' || nuevoEstado === 'paused') {
          await sendPlanCanceladoEmail(supabase, {
            userId: suscripcion.usuario_id,
            email: authData.user.email,
            nombre: nombreUsuario,
            plan: nombrePlan,
            accion: nuevoEstado === 'cancelled' ? 'cancelada' : 'pausada',
          })
        }
      }
    } catch (emailErr) {
      console.error('Error al enviar email de notificación (no crítico):', emailErr)
    }

    const auditAccion = nuevoEstado === 'active' ? 'plan_activado'
      : nuevoEstado === 'cancelled' ? 'plan_cancelado'
      : 'plan_pausado'
    await writeAuditLog(supabase, {
      usuarioId: suscripcion.usuario_id,
      accion: auditAccion,
      metadata: { suscripcion_id: suscripcion.id, plan_id: suscripcion.plan_id, via: 'preapproval' },
    })

    console.log('Suscripción actualizada:', {
      suscripcion_id: suscripcion.id,
      usuario_id: suscripcion.usuario_id,
      nuevo_estado: nuevoEstado,
      plan_id: suscripcion.plan_id,
    })

    return NextResponse.json({
      success: true,
      message: 'Webhook procesado correctamente',
    })
  } catch (error) {
    console.error('Error en webhook de Mercado Pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
