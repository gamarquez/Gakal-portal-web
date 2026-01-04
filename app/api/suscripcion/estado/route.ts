import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
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

    // Obtener perfil con plan actual
    const { data: profile } = await supabase
      .from('perfiles')
      .select('plan_id, suscripcion_activa_id')
      .eq('id', user.id)
      .single<{ plan_id: string; suscripcion_activa_id: string | null }>()

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Perfil no encontrado' },
        { status: 404 }
      )
    }

    let suscripcion = null

    // Si tiene suscripción activa, obtener detalles
    if (profile.suscripcion_activa_id) {
      const { data: suscripcionData } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('id', profile.suscripcion_activa_id)
        .single()

      suscripcion = suscripcionData
    }

    return NextResponse.json({
      success: true,
      plan_id: profile.plan_id,
      suscripcion,
    })
  } catch (error) {
    console.error('Error en /api/suscripcion/estado:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
