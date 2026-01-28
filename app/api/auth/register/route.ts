import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parsear body
    const body = await request.json()
    const { nombre, email, password, terminos_aceptados } = body

    // Validaciones
    if (!nombre || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son obligatorios' },
        { status: 400 }
      )
    }

    if (!terminos_aceptados) {
      return NextResponse.json(
        { success: false, error: 'Debes aceptar los Términos y Condiciones para continuar' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Crear cliente de Supabase
    const supabase = await createClient()

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
      },
    })

    if (authError) {
      return NextResponse.json(
        {
          success: false,
          error: authError.message === 'User already registered'
            ? 'Este email ya está registrado'
            : authError.message
        },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Error al crear el usuario' },
        { status: 500 }
      )
    }

    // Capturar IP del usuario
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Usar admin client para crear perfil con campos de términos
    const adminClient = createAdminClient()

    // Crear perfil con información de términos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: perfilError } = await (adminClient as any)
      .from('perfiles')
      .insert({
        id: authData.user.id,
        nombre: nombre,
        email: email,
        terminos_aceptados: true,
        terminos_fecha_aceptacion: new Date().toISOString(),
        terminos_ip_aceptacion: ip,
        terminos_version_aceptada: '1.0',
      })

    if (perfilError) {
      console.error('Error al actualizar perfil con términos:', perfilError)
      // No fallar el registro por esto, pero registrar el error
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      message: 'Cuenta creada exitosamente. Por favor verificá tu email.',
    })
  } catch (error) {
    console.error('Error en /api/auth/register:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
