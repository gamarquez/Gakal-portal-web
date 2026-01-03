import { createClient } from '@/lib/supabase/server'
import { cancelPreApproval } from '@/lib/mercadopago'
import { NextResponse } from 'next/server'

export async function POST() {
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

    // Obtener suscripción activa
    const { data: profile } = await supabase
      .from('perfiles')
      .select('suscripcion_activa_id')
      .eq('id', user.id)
      .single()

    if (!profile?.suscripcion_activa_id) {
      return NextResponse.json(
        { success: false, error: 'No tenés una suscripción activa' },
        { status: 400 }
      )
    }

    const { data: suscripcion } = await supabase
      .from('suscripciones')
      .select('*')
      .eq('id', profile.suscripcion_activa_id)
      .single()

    if (!suscripcion || suscripcion.estado !== 'active') {
      return NextResponse.json(
        { success: false, error: 'No tenés una suscripción activa' },
        { status: 400 }
      )
    }

    // Cancelar en Mercado Pago
    if (suscripcion.mp_preapproval_id) {
      const mpResult = await cancelPreApproval(suscripcion.mp_preapproval_id)

      if (!mpResult.success) {
        return NextResponse.json(
          { success: false, error: 'Error al cancelar en Mercado Pago' },
          { status: 500 }
        )
      }
    }

    // Actualizar estado en Supabase
    const { error: updateError } = await supabase
      .from('suscripciones')
      .update({
        estado: 'cancelled',
        fecha_cancelacion: new Date().toISOString(),
      })
      .eq('id', suscripcion.id)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Error al actualizar la suscripción' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada exitosamente',
    })
  } catch (error) {
    console.error('Error en /api/suscripcion/cancelar:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
