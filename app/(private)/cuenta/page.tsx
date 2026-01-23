'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { UserProfile, Suscripcion } from '@/types'
import Link from 'next/link'

export default function CuentaPage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    setDeleteError('')

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmar: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar la cuenta')
      }

      // Redirigir a la página principal después de eliminar
      router.push('/')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar la cuenta')
      setDeleteLoading(false)
    }
  }

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
            <CardContent>
              <div>
                <span className="text-sm text-gray-600">Nombre:</span>
                <p className="font-medium text-gray-900">{profile?.nombre}</p>
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
                  <h3 className="text-xl font-bold text-gray-900">{badge.name}</h3>
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

          {/* Zona de Peligro */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Eliminar cuenta
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Esta acción es permanente y no se puede deshacer. Se eliminarán todos tus datos personales, incluidos:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1 mb-4">
                    <li>Tu perfil y configuración</li>
                    <li>Historial de comidas y registro nutricional</li>
                    <li>Estadísticas y progreso</li>
                    <li>Suscripción activa (si la tenés)</li>
                  </ul>
                  <p className="text-sm text-gray-600 mb-4">
                    Conforme a la Ley 25.326, tus datos serán eliminados dentro de los 30 días.
                  </p>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Eliminar mi cuenta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              ¿Estás seguro?
            </h2>
            <p className="text-gray-600 mb-4">
              Estás por eliminar permanentemente tu cuenta de Gakal. Esta acción no se puede deshacer.
            </p>
            {suscripcion && suscripcion.estado === 'active' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Atención:</strong> Tenés una suscripción activa que será cancelada automáticamente.
                </p>
              </div>
            )}
            <p className="text-sm text-gray-600 mb-6">
              Tus datos serán eliminados conforme a la Ley 25.326 de Protección de Datos Personales.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{deleteError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteError('')
                }}
                disabled={deleteLoading}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Eliminando...' : 'Sí, eliminar cuenta'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
