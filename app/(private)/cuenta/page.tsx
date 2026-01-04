'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { UserProfile, Suscripcion } from '@/types'
import Link from 'next/link'

export default function CuentaPage() {
  const supabase = createClient()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Cargar perfil
      const { data: profileData } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single<UserProfile>()

      setProfile(profileData)

      // Cargar suscripción si tiene
      if (profileData?.suscripcion_activa_id) {
        const { data: suscripcionData } = await supabase
          .from('suscripciones')
          .select('*')
          .eq('id', profileData.suscripcion_activa_id)
          .single()

        setSuscripcion(suscripcionData)
      }

      setLoading(false)
    }

    loadData()
  }, [supabase])

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

  const getPlanBadge = (planId: string) => {
    const badges: Record<string, { emoji: string; name: string; color: string }> = {
      free: { emoji: '🆓', name: 'Free', color: 'bg-gray-100 text-gray-800' },
      bronce: { emoji: '🥉', name: 'Bronce', color: 'bg-orange-100 text-orange-800' },
      plata: { emoji: '🥈', name: 'Plata', color: 'bg-gray-100 text-gray-800' },
      oro: { emoji: '🥇', name: 'Oro', color: 'bg-yellow-100 text-yellow-800' },
    }
    return badges[planId] || badges.free
  }

  const badge = getPlanBadge(profile?.plan_id || 'free')

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Cuenta</h1>

        <div className="space-y-6">
          {/* Información del usuario */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Nombre:</span>
                <p className="font-medium text-gray-900">{profile?.nombre}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="font-medium text-gray-900">{profile?.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Plan actual */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{badge.emoji}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{badge.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${badge.color} mt-1`}>
                      {suscripcion?.estado === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                {profile?.plan_id === 'free' && (
                  <Link href="/planes">
                    <Button>Actualizar Plan</Button>
                  </Link>
                )}
              </div>

              {suscripcion && suscripcion.estado === 'active' && (
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <p className="font-medium text-gray-900">
                      {suscripcion.es_anual ? 'Suscripción Anual' : 'Suscripción Mensual'}
                    </p>
                  </div>
                  {suscripcion.fecha_fin && (
                    <div>
                      <span className="text-sm text-gray-600">Próxima renovación:</span>
                      <p className="font-medium text-gray-900">
                        {formatDate(suscripcion.fecha_fin)}
                      </p>
                    </div>
                  )}
                  <div className="pt-4">
                    <Link href="/cuenta/cancelar">
                      <Button variant="outline" size="sm">
                        Cancelar Suscripción
                      </Button>
                    </Link>
                    <Link href="/planes" className="ml-3">
                      <Button variant="ghost" size="sm">
                        Cambiar Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {profile?.plan_id === 'free' && (
                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-800">
                    <strong>¿Querés desbloquear todas las funciones?</strong>
                    <br />
                    Actualizá a un plan premium y accedé a análisis con IA, estadísticas
                    avanzadas, y mucho más.
                  </p>
                  <Link href="/planes">
                    <Button className="mt-3" size="sm">
                      Ver Planes Premium
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones de Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/planes">
                <Button variant="outline" className="w-full justify-start">
                  Ver todos los planes
                </Button>
              </Link>
              <a
                href={`gakal://cuenta`}
                className="block"
              >
                <Button variant="outline" className="w-full justify-start">
                  Abrir Gakal App
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
