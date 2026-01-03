import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-primary-600">Gakal</span>
            </Link>
            <p className="text-sm text-gray-600 max-w-md">
              La app de nutrición con gamificación para Argentina.
              Registrá tus comidas, alcanzá tus objetivos y desbloqueá logros.
            </p>
          </div>

          {/* Enlaces */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Producto</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/planes" className="text-sm text-gray-600 hover:text-primary-600">
                  Planes
                </Link>
              </li>
              <li>
                <a
                  href={process.env.NEXT_PUBLIC_PLAYSTORE_URL || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-primary-600"
                >
                  Descargar App
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terminos" className="text-sm text-gray-600 hover:text-primary-600">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-sm text-gray-600 hover:text-primary-600">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            © {currentYear} Gakal. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
