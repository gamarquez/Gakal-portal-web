'use client'

import { planes } from '@/types/plans'
import PlanCard from './PlanCard'
import { useState } from 'react'

interface PlanComparisonProps {
  onSelectPlan?: (planId: string, esAnual: boolean) => void
  planActualId?: string
}

export default function PlanComparison({ onSelectPlan, planActualId }: PlanComparisonProps) {
  const [esAnual, setEsAnual] = useState(false)

  return (
    <div className="w-full">
      {/* Toggle Mensual/Anual */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setEsAnual(false)}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              !esAnual
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setEsAnual(true)}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              esAnual
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Anual
            <span className="ml-2 text-xs text-primary-600 font-semibold">
              -25%
            </span>
          </button>
        </div>
      </div>

      {/* Grid de planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {planes.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            esAnual={esAnual}
            onSelect={(planId) => onSelectPlan?.(planId, esAnual)}
            isPlanActual={plan.id === planActualId}
          />
        ))}
      </div>
    </div>
  )
}
