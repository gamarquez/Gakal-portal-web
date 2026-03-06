'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Link from 'next/link'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [step, setStep] = useState<'verifying' | 'form' | 'success' | 'error'>('verifying')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const verifyToken = async () => {
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      if (!token_hash || type !== 'recovery') {
        setErrorMessage('Link de recuperación inválido o expirado.')
        setStep('error')
        return
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'recovery',
      })

      if (error) {
        console.error('Error al verificar token:', error)
        setErrorMessage('El link expiró o ya fue usado. Solicitá uno nuevo.')
        setStep('error')
        return
      }

      setStep('form')
    }

    verifyToken()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Error al actualizar la contraseña. Intentá nuevamente.')
      setLoading(false)
      return
    }

    setStep('success')
    setTimeout(() => router.push('/cuenta'), 3000)
  }

  return (
    <div className="py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>
                {step === 'verifying' && 'Verificando link...'}
                {step === 'form' && 'Nueva contraseña'}
                {step === 'success' && '✅ Contraseña actualizada'}
                {step === 'error' && '❌ Link inválido'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === 'verifying' && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent" />
                  <p className="text-center text-gray-600">Verificando tu link...</p>
                </div>
              )}

              {step === 'form' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Nueva contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    disabled={loading}
                  />
                  <Input
                    label="Confirmar contraseña"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repetí tu nueva contraseña"
                    required
                    disabled={loading}
                  />

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                  </Button>
                </form>
              )}

              {step === 'success' && (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">¡Tu contraseña fue actualizada correctamente!</p>
                  </div>
                  <p className="text-sm text-gray-600">Serás redirigido a tu cuenta...</p>
                  <Link href="/cuenta">
                    <Button className="w-full">Ir a Mi Cuenta</Button>
                  </Link>
                </div>
              )}

              {step === 'error' && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errorMessage}</p>
                  </div>
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Solicitar nuevo link
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="py-12 sm:py-20 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
