import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verificar que el usuario esté autenticado
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const supabaseAdmin = createAdminClient()

    // Verificar en email_log que no se haya enviado ya el email de bienvenida (deduplicación)
    const { count } = await supabaseAdmin
      .from('email_log')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', user.id)
      .eq('tipo', 'bienvenida')

    if (count && count > 0) {
      return NextResponse.json({ success: true, skipped: true })
    }

    // Obtener nombre del usuario
    const body = await request.json().catch(() => ({}))
    const nombre = body.nombre ?? user.user_metadata?.nombre ?? 'Usuario'
    const email = user.email!

    await sendWelcomeEmail(supabaseAdmin, { userId: user.id, email, nombre })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en /api/auth/welcome-email:', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
