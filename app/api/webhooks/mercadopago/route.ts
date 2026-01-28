import { createAdminClient } from '@/lib/supabase/server'
import { getPreApproval } from '@/lib/mercadopago'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Función para verificar la firma del webhook de Mercado Pago
function verifyWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  secret: string
): boolean {
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

    // Construir el mensaje a firmar según la documentación de MP
    const message = `id=${dataId}&request-id=${xRequestId}&ts=${ts}`

    // Calcular el HMAC-SHA256
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex')

    // Comparar los hashes de forma segura
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(expectedHash)
    )
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
    const isValid = verifyWebhookSignature(xSignature, xRequestId, dataId, webhookSecret)
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

    // Verificar que es un webhook de preapproval
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
    const supabase = createAdminClient()

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
        // Mantener el estado actual si está pendiente
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
    } = {
      estado: nuevoEstado,
    }

    // Si se activó, establecer fecha de inicio y fin
    if (nuevoEstado === 'active' && suscripcion.estado !== 'active') {
      updateData.fecha_inicio = new Date().toISOString()

      // Calcular fecha de fin según si es anual o mensual
      const fechaFin = new Date()
      if (suscripcion.es_anual) {
        fechaFin.setFullYear(fechaFin.getFullYear() + 1)
      } else {
        fechaFin.setMonth(fechaFin.getMonth() + 1)
      }
      updateData.fecha_fin = fechaFin.toISOString()
    }

    // Si se canceló, establecer fecha de cancelación
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

    // Actualizar perfil del usuario con el nuevo plan
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

// Permitir que el webhook sea llamado desde Mercado Pago
export const runtime = 'edge'
