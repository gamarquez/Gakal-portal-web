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

    // El perfil se crea automáticamente por el trigger handle_new_user()
    // Esperamos a que el perfil exista y luego actualizamos los términos
    const adminClient = createAdminClient()

    // Reintentar hasta 5 veces con delays incrementales
    let perfilActualizado = false
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, i * 200 + 100))

      // Verificar si el perfil existe
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: perfil } = await (adminClient as any)
        .from('perfiles')
        .select('id')
        .eq('id', authData.user.id)
        .single()

      if (perfil) {
        // Perfil existe, actualizar con términos
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (adminClient as any)
          .from('perfiles')
          .update({
            terminos_aceptados: true,
            terminos_fecha_aceptacion: new Date().toISOString(),
            terminos_ip_aceptacion: ip,
            terminos_version_aceptada: '1.0',
          })
          .eq('id', authData.user.id)

        if (!updateError) {
          perfilActualizado = true
          break
        } else {
          console.error('Error al actualizar perfil:', updateError)
        }
      }
    }

    if (!perfilActualizado) {
      console.warn('No se pudo actualizar el perfil con términos después de varios intentos')
      // No fallar el registro por esto, el usuario puede aceptar términos después
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
