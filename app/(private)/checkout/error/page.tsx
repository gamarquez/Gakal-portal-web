import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function CheckoutErrorPage() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
            <CardTitle>Error en el Pago</CardTitle>
            <p className="text-gray-600 mt-2">
              Hubo un problema al procesar tu pago
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Qué puede haber pasado?
              </h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                <li>El pago fue rechazado por tu banco o tarjeta</li>
                <li>Cancelaste la operación en Mercado Pago</li>
                <li>Hubo un problema de conexión</li>
                <li>Los datos ingresados no son correctos</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/planes" className="flex-1">
                <Button className="w-full" size="lg">
                  Reintentar Pago
                </Button>
              </Link>
              <Link href="/cuenta" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  Volver a Mi Cuenta
                </Button>
              </Link>
            </div>

            <p className="text-center text-sm text-gray-500">
              Si el problema persiste, contactanos a través de la aplicación
              para que podamos ayudarte.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
