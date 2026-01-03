'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { Suscripcion } from '@/types'
import { AlertTriangle } from 'lucide-react'

export default function CancelarSuscripcionPage() {
  const router = useRouter()
  const supabase = createClient()

  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null)
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSuscripcion = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('perfiles')
        .select('suscripcion_activa_id')
        .eq('id', user.id)
        .single()

      if (!profileData?.suscripcion_activa_id) {
        router.push('/cuenta')
        return
      }

      const { data: suscripcionData } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('id', profileData.suscripcion_activa_id)
        .single()

      setSuscripcion(suscripcionData)
      setLoading(false)
    }

    loadSuscripcion()
  }, [supabase, router])

  const handleCancelar = async () => {
    setCanceling(true)
    setError('')

    try {
      const response = await fetch('/api/suscripcion/cancelar', {
        method: 'POST',
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Error al cancelar la suscripción')
        setCanceling(false)
        return
      }

      // Redirigir a cuenta con mensaje de éxito
      router.push('/cuenta?canceled=true')
    } catch (err) {
      setError('Error al cancelar la suscripción')
      setCanceling(false)
    }
  }

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!suscripcion) {
    return null
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
              <div>
                <CardTitle>Cancelar Suscripción</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  ¿Estás seguro de que querés cancelar tu suscripción?
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  ¿Qué va a pasar?
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                  <li>Tu suscripción se cancelará pero seguirás teniendo acceso hasta el fin del período pagado</li>
                  {suscripcion.fecha_fin && (
                    <li>
                      Podrás usar tu plan actual hasta el{' '}
                      <strong>{formatDate(suscripcion.fecha_fin)}</strong>
                    </li>
                  )}
                  <li>Después de esa fecha, tu cuenta volverá al plan Free</li>
                  <li>No se te cobrará ningún pago adicional</li>
                  <li>Podés volver a suscribirte en cualquier momento</li>
                </ul>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  variant="danger"
                  onClick={handleCancelar}
                  disabled={canceling}
                  className="flex-1"
                >
                  {canceling ? 'Cancelando...' : 'Sí, cancelar suscripción'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/cuenta')}
                  disabled={canceling}
                  className="flex-1"
                >
                  No, volver atrás
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500">
                Si tenés algún problema o necesitás ayuda, contactanos a través
                de la aplicación.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
