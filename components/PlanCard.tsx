'use client'

import { memo } from 'react'
import { Plan, formatPrice } from '@/types/plans'
import { Card, CardContent, CardFooter, CardHeader } from './ui/Card'
import Button from './ui/Button'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlanCardProps {
  plan: Plan
  esAnual: boolean
  onSelect?: (planId: string) => void
  isPlanActual?: boolean
  disabled?: boolean
}

const PlanCard = memo(function PlanCard({
  plan,
  esAnual,
  onSelect,
  isPlanActual = false,
  disabled = false,
}: PlanCardProps) {
  const precio = esAnual ? plan.precioAnual : plan.precioMensual
  const precioMostrar = esAnual && plan.precioMensual > 0
    ? Math.round(plan.precioAnual / 12)
    : precio

  const descuento = esAnual && plan.precioMensual > 0
    ? Math.round(((plan.precioMensual * 12 - plan.precioAnual) / (plan.precioMensual * 12)) * 100)
    : 0

  return (
    <Card
      className={cn(
        'relative transition-all duration-200',
        plan.destacado && 'ring-2 ring-primary-500 shadow-lg scale-105',
        isPlanActual && 'border-primary-500'
      )}
    >
      {plan.destacado && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Recomendado
          </span>
        </div>
      )}

      {isPlanActual && (
        <div className="absolute -top-4 right-4">
          <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Plan Actual
          </span>
        </div>
      )}

      <CardHeader className="text-center">
        <div className="text-5xl mb-2">{plan.emoji}</div>
        <h3 className="text-2xl font-bold text-gray-900">{plan.nombre}</h3>
        <div className="mt-4">
          {plan.precioMensual === 0 ? (
            <div className="text-4xl font-bold text-gray-900">Gratis</div>
          ) : (
            <>
              <div className="text-4xl font-bold text-gray-900">
                {formatPrice(precioMostrar)}
                <span className="text-lg font-normal text-gray-600">/mes</span>
              </div>
              {esAnual && descuento > 0 && (
                <div className="mt-1 text-sm text-primary-600 font-medium">
                  Ahorrás {descuento}% anual
                </div>
              )}
              {esAnual && (
                <div className="mt-1 text-xs text-gray-500">
                  {formatPrice(precio)} cobrado anualmente
                </div>
              )}
            </>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={plan.destacado ? 'primary' : 'outline'}
          onClick={() => onSelect?.(plan.id)}
          disabled={disabled || isPlanActual}
        >
          {isPlanActual ? 'Plan Actual' : plan.precioMensual === 0 ? 'Plan Actual' : 'Elegir Plan'}
        </Button>
      </CardFooter>
    </Card>
  )
})

export default PlanCard
