'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Obtener parámetros de la URL
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        if (!token_hash || !type) {
          setStatus('error')
          setMessage('Link de confirmación inválido o expirado')
          return
        }

        // Verificar el email con Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as 'email' | 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change',
        })

        if (error) {
          console.error('Error al confirmar email:', error)
          setStatus('error')
          setMessage(error.message || 'Error al confirmar tu email. Por favor, intentá nuevamente.')
          return
        }

        // Éxito
        setStatus('success')
        setMessage('¡Tu email ha sido confirmado exitosamente!')

        // Redirigir a la cuenta después de 3 segundos
        setTimeout(() => {
          router.push('/cuenta')
        }, 3000)
      } catch (error) {
        console.error('Error inesperado:', error)
        setStatus('error')
        setMessage('Ocurrió un error inesperado. Por favor, intentá nuevamente.')
      }
    }

    confirmEmail()
  }, [searchParams, supabase.auth, router])

  return (
    <div className="py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>
                {status === 'loading' && 'Confirmando tu email...'}
                {status === 'success' && '✅ Email Confirmado'}
                {status === 'error' && '❌ Error'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status === 'loading' && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                  <p className="text-center text-gray-600">
                    Estamos verificando tu email...
                  </p>
                </div>
              )}

              {status === 'success' && (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">{message}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Serás redirigido a tu cuenta en unos segundos...
                  </p>
                  <Link href="/cuenta">
                    <Button className="w-full">
                      Ir a Mi Cuenta
                    </Button>
                  </Link>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{message}</p>
                  </div>
                  <div className="space-y-2">
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        Ir a Iniciar Sesión
                      </Button>
                    </Link>
                    <p className="text-xs text-center text-gray-500">
                      Si el problema persiste, contactanos a través de la aplicación.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="py-12 sm:py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
