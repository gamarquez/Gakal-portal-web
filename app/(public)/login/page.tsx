'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import RegistroForm from '@/components/RegistroForm'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/cuenta'

  const [activeTab, setActiveTab] = useState<'login' | 'registro'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const supabase = createClient()

  // Verificar si ya está logueado
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push(redirect)
      }
    }
    checkUser()
  }, [supabase.auth, router, redirect])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Email o contraseña incorrectos'
        : error.message
      )
      setLoading(false)
    } else {
      router.push(redirect)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError('Por favor ingresá tu email primero')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Te enviamos un email con instrucciones para restablecer tu contraseña')
    }

    setLoading(false)
  }

  return (
    <div className="py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>
                {activeTab === 'login' ? 'Ingresar a Gakal' : 'Crear cuenta en Gakal'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {activeTab === 'login'
                  ? 'Usá las mismas credenciales de tu app'
                  : 'Registrate para acceder a todas las funciones'
                }
              </p>
            </CardHeader>
            <CardContent>
              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'login'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Ingresar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('registro')}
                  className={`flex-1 pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'registro'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Registrarse
                </button>
              </div>

              {/* Login Form */}
              {activeTab === 'login' && (
                <>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      disabled={loading}
                    />

                    <Input
                      label="Contraseña"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    {message && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-600">{message}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? 'Ingresando...' : 'Ingresar'}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={loading}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  </form>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-600">
                      ¿No tenés cuenta?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('registro')}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Registrate acá
                      </button>
                    </p>
                  </div>
                </>
              )}

              {/* Registro Form */}
              {activeTab === 'registro' && (
                <>
                  <RegistroForm redirectUrl={redirect} />

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-600">
                      ¿Ya tenés cuenta?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Ingresá acá
                      </button>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="py-12 sm:py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
