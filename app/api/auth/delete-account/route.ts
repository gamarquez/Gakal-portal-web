import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cancelPreApproval } from '@/lib/mercadopago'

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

    // Parsear body para confirmar eliminación
    const body = await request.json()
    const { confirmar } = body

    if (!confirmar) {
      return NextResponse.json(
        { success: false, error: 'Debes confirmar la eliminación de la cuenta' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Paso 1: Obtener información del perfil y suscripción
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (adminClient as any)
      .from('perfiles')
      .select('*, suscripcion_activa_id')
      .eq('id', user.id)
      .single()

    // Paso 2: Cancelar suscripción activa si existe
    if (profile?.suscripcion_activa_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: suscripcion } = await (adminClient as any)
        .from('suscripciones')
        .select('mp_preapproval_id, estado')
        .eq('id', profile.suscripcion_activa_id)
        .single()

      // Si tiene suscripción activa en Mercado Pago, cancelarla
      if (suscripcion?.mp_preapproval_id && suscripcion.estado === 'active') {
        await cancelPreApproval(suscripcion.mp_preapproval_id)
      }

      // Marcar suscripción como cancelada en la base de datos
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any)
        .from('suscripciones')
        .update({
          estado: 'cancelled',
          fecha_cancelacion: new Date().toISOString(),
        })
        .eq('id', profile.suscripcion_activa_id)
    }

    // Paso 3: Marcar todas las suscripciones del usuario como canceladas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient as any)
      .from('suscripciones')
      .update({
        estado: 'cancelled',
        fecha_cancelacion: new Date().toISOString(),
      })
      .eq('usuario_id', user.id)
      .neq('estado', 'cancelled')

    // Paso 4: Eliminar el perfil del usuario
    // Nota: Según la Ley 25.326, debemos eliminar los datos personales
    // cuando el usuario lo solicite, salvo obligaciones legales
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deletePerfilError } = await (adminClient as any)
      .from('perfiles')
      .delete()
      .eq('id', user.id)

    if (deletePerfilError) {
      console.error('Error al eliminar perfil:', deletePerfilError)
      // Continuar de todos modos con la eliminación del usuario de Auth
    }

    // Paso 5: Eliminar el usuario de Supabase Auth
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(
      user.id
    )

    if (deleteAuthError) {
      console.error('Error al eliminar usuario de Auth:', deleteAuthError)
      return NextResponse.json(
        { success: false, error: 'Error al eliminar la cuenta' },
        { status: 500 }
      )
    }

    // Paso 6: Cerrar sesión (limpiar cookies)
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: 'Cuenta eliminada exitosamente',
    })
  } catch (error) {
    console.error('Error en /api/auth/delete-account:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
