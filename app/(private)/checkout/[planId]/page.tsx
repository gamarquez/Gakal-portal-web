'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { planes, formatPrice, calcularDescuentoAnual } from '@/types/plans'
import { Check } from 'lucide-react'

export default function CheckoutPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const planId = params.planId as string
  const esAnual = searchParams.get('anual') === 'true'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const plan = planes.find((p) => p.id === planId)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
      }
    }
    getUser()
  }, [supabase.auth])

  if (!plan) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Plan no encontrado</p>
      </div>
    )
  }

  const precio = esAnual ? plan.precioAnual : plan.precioMensual
  const precioMostrar = esAnual ? Math.round(plan.precioAnual / 12) : precio
  const descuento = esAnual ? calcularDescuentoAnual(plan.precioMensual, plan.precioAnual) : 0

  const handleCheckout = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/suscripcion/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          esAnual,
        }),
      })

      const data = await response.json()

      if (!data.success || !data.init_point) {
        setError(data.error || 'Error al crear la suscripción')
        setLoading(false)
        return
      }

      // Redirigir a Mercado Pago
      window.location.href = data.init_point
    } catch (err) {
      setError('Error al procesar el pago')
      setLoading(false)
    }
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Completar Suscripción
        </h1>

        <div className="space-y-6">
          {/* Resumen del plan */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{plan.emoji}</span>
                  <div>
                    <CardTitle>{plan.nombre}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {esAnual ? 'Suscripción Anual' : 'Suscripción Mensual'}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Funciones incluidas:
                  </h3>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de pago */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cuenta:</span>
                  <span className="font-medium text-gray-900">{userEmail}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium text-gray-900">
                    {plan.nombre} ({esAnual ? 'Anual' : 'Mensual'})
                  </span>
                </div>
                {esAnual && descuento > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Descuento anual:</span>
                    <span className="font-medium text-primary-600">-{descuento}%</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-900 font-semibold">Total a pagar:</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(precio)}
                      </p>
                      {esAnual && (
                        <p className="text-sm text-gray-600">
                          {formatPrice(precioMostrar)}/mes
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Procesando...' : 'Pagar con Mercado Pago'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/planes')}
                  disabled={loading}
                  className="w-full"
                >
                  Volver a Planes
                </Button>
              </div>

              <p className="mt-4 text-xs text-center text-gray-500">
                Al hacer clic en "Pagar con Mercado Pago", serás redirigido a
                completar el pago de forma segura. Tu suscripción se activará
                automáticamente una vez confirmado el pago.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
