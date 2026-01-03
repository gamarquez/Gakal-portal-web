import Link from 'next/link'
import Button from '@/components/ui/Button'
import PlanComparison from '@/components/PlanComparison'
import { Award, TrendingUp, Zap, Camera } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Nutrición con{' '}
              <span className="text-primary-600">Gamificación</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Registrá tus comidas, alcanzá tus objetivos nutricionales y
              desbloqueá logros. La app argentina que convierte el tracking
              de calorías en un juego.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={process.env.NEXT_PUBLIC_PLAYSTORE_URL || '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="w-full sm:w-auto">
                  Descargar App Gratis
                </Button>
              </a>
              <Link href="/planes">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Ver Planes Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué Gakal?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Combinamos la ciencia de la nutrición con la diversión de los juegos
              para mantenerte motivado día a día.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Zap className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sistema de XP y Niveles
              </h3>
              <p className="text-gray-600">
                Ganás puntos de experiencia por cada comida registrada y subís de nivel
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Award className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Logros Desbloqueables
              </h3>
              <p className="text-gray-600">
                Más de 30 logros para desbloquear mientras cumplís tus objetivos
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Rachas y Desafíos
              </h3>
              <p className="text-gray-600">
                Mantené tu racha diaria y completá desafíos semanales
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Camera className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Análisis con IA
              </h3>
              <p className="text-gray-600">
                Sacale una foto a tu comida y la IA calcula las calorías automáticamente
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Elegí el plan perfecto para vos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Empezá gratis y actualizá cuando quieras. Todos los planes incluyen
              lo esencial para alcanzar tus objetivos.
            </p>
          </div>

          <PlanComparison />

          <div className="text-center mt-12">
            <Link href="/planes">
              <Button size="lg">Ver comparación detallada</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            ¿Listo para empezar tu transformación?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Descargá Gakal gratis y empezá a registrar tus comidas hoy mismo.
            Actualizá a Premium cuando quieras desbloquear todas las funciones.
          </p>
          <a
            href={process.env.NEXT_PUBLIC_PLAYSTORE_URL || '#'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" variant="secondary">
              Descargar desde Play Store
            </Button>
          </a>
        </div>
      </section>
    </div>
  )
}
