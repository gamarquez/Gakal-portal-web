'use client'

import { useRouter } from 'next/navigation'
import PlanComparison from '@/components/PlanComparison'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function PlanesPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUser()
  }, [supabase.auth])

  const handleSelectPlan = (planId: string, esAnual: boolean) => {
    // Si no está logueado, redirigir a login
    if (!userId) {
      router.push(`/login?redirect=/checkout/${planId}?anual=${esAnual}`)
      return
    }

    // Si está logueado, ir al checkout
    router.push(`/checkout/${planId}?anual=${esAnual}`)
  }

  return (
    <div className="py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Elegí tu plan Gakal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Empezá gratis y actualizá cuando quieras. Sin compromisos, podés
            cancelar en cualquier momento.
          </p>
        </div>

        <PlanComparison onSelectPlan={handleSelectPlan} />

        {/* Información adicional */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Puedo cambiar de plan en cualquier momento?
              </h3>
              <p className="text-gray-600">
                Sí, podés actualizar o bajar de plan cuando quieras. Si bajás de plan,
                el cambio se aplicará al finalizar tu período de facturación actual.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Cómo cancelo mi suscripción?
              </h3>
              <p className="text-gray-600">
                Podés cancelar desde tu cuenta en cualquier momento. Tu plan seguirá
                activo hasta el final del período que ya pagaste.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Los precios incluyen impuestos?
              </h3>
              <p className="text-gray-600">
                Sí, todos los precios mostrados son finales e incluyen impuestos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Qué medios de pago aceptan?
              </h3>
              <p className="text-gray-600">
                Aceptamos todos los medios de pago disponibles en Mercado Pago:
                tarjetas de crédito, débito, transferencia bancaria, y más.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
