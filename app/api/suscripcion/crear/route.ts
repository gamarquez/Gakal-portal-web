import { createClient } from '@/lib/supabase/server'
import { createPreApproval } from '@/lib/mercadopago'
import { NextRequest, NextResponse } from 'next/server'
import { planes } from '@/types/plans'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Parsear body
    const body = await request.json()
    const { planId, esAnual } = body

    // Validar plan
    const plan = planes.find((p) => p.id === planId)
    if (!plan || plan.id === 'free') {
      return NextResponse.json(
        { success: false, error: 'Plan inválido' },
        { status: 400 }
      )
    }

    // Verificar que no tenga suscripción activa
    const { data: profile } = await supabase
      .from('perfiles')
      .select('suscripcion_activa_id')
      .eq('id', user.id)
      .single<{ suscripcion_activa_id: string | null }>()

    if (profile?.suscripcion_activa_id) {
      const { data: suscripcionActual } = await supabase
        .from('suscripciones')
        .select('estado')
        .eq('id', profile.suscripcion_activa_id)
        .single<{ estado: 'active' | 'paused' | 'cancelled' | 'expired' }>()

      if (suscripcionActual?.estado === 'active') {
        return NextResponse.json(
          { success: false, error: 'Ya tenés una suscripción activa' },
          { status: 400 }
        )
      }
    }

    // Calcular precio
    const precio = esAnual ? plan.precioAnual : plan.precioMensual

    // Crear preapproval en Mercado Pago
    const mpResult = await createPreApproval({
      reason: `Gakal ${plan.nombre} - ${esAnual ? 'Suscripción Anual' : 'Suscripción Mensual'}`,
      amount: precio,
      frequency: esAnual ? 12 : 1,
      frequencyType: 'months',
      backUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/exito`,
      payerEmail: user.email || '',
      externalReference: `gakal_${user.id}_${planId}_${Date.now()}`,
    })

    if (!mpResult.success || !mpResult.init_point) {
      return NextResponse.json(
        { success: false, error: 'Error al crear la suscripción en Mercado Pago' },
        { status: 500 }
      )
    }

    // Crear registro de suscripción en estado pending
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newSuscripcion, error: suscripcionError } = await (supabase as any)
      .from('suscripciones')
      .insert({
        usuario_id: user.id,
        plan_id: planId,
        estado: 'pending',
        mp_preapproval_id: mpResult.preapproval_id,
        es_anual: esAnual,
        fecha_inicio: new Date().toISOString(),
      })
      .select()
      .single()

    if (suscripcionError) {
      return NextResponse.json(
        { success: false, error: 'Error al crear el registro de suscripción' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      init_point: mpResult.init_point,
      suscripcion_id: newSuscripcion.id,
    })
  } catch (error) {
    console.error('Error en /api/suscripcion/crear:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
