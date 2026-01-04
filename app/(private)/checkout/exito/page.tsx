import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function CheckoutExitoPage() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle>¡Pago Exitoso!</CardTitle>
            <p className="text-gray-600 mt-2">
              Tu suscripción se ha activado correctamente
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Qué sigue ahora?
              </h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                <li>Tu plan premium ya está activo</li>
                <li>Volvé a la app de Gakal para disfrutar todas las funciones</li>
                <li>Vas a recibir un email de confirmación con los detalles</li>
                <li>Podés gestionar tu suscripción desde &quot;Mi Cuenta&quot;</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href="gakal://cuenta" className="flex-1">
                <Button className="w-full" size="lg">
                  Abrir Gakal App
                </Button>
              </a>
              <Link href="/cuenta" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  Ver Mi Cuenta
                </Button>
              </Link>
            </div>

            <p className="text-center text-sm text-gray-500">
              ¡Gracias por confiar en Gakal! 💚
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
