import terminosData from '@/data/terminos-condiciones.json'

export default function TerminosPage() {
  return (
    <div className="py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {terminosData.documento}
        </h1>

        <div className="mb-8 flex flex-wrap gap-4 text-sm text-gray-600">
          <div>
            <strong>Versión:</strong> {terminosData.version}
          </div>
          <div>
            <strong>Última actualización:</strong>{' '}
            {new Date(terminosData.fecha_actualizacion).toLocaleDateString('es-AR')}
          </div>
          <div>
            <strong>País:</strong> {terminosData.pais}
          </div>
        </div>

        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-900">
            <strong>Importante:</strong> {terminosData.aviso_importante}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Legislación Aplicable
          </h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
            {terminosData.legislacion.map((ley, index) => (
              <li key={index}>{ley}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-8 text-gray-700">
          {terminosData.secciones.map((seccion) => (
            <section key={seccion.numero}>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {seccion.numero}. {seccion.titulo}
              </h2>
              <div className="space-y-3">
                {seccion.contenido.map((parrafo, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {parrafo}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Contacto
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Email:</strong>{' '}
              <a
                href={`mailto:${terminosData.contacto.email}`}
                className="text-primary-600 hover:text-primary-700"
              >
                {terminosData.contacto.email}
              </a>
            </p>
            <p>
              <strong>Sitio web:</strong>{' '}
              <a
                href={terminosData.contacto.web}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700"
              >
                {terminosData.contacto.web}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            <strong>Jurisdicción:</strong> {terminosData.jurisdiccion}
          </p>
        </div>
      </div>
    </div>
  )
}
