/* eslint-disable @typescript-eslint/no-explicit-any */
import privacidadData from '@/data/politica-privacidad.json'

export default function PrivacidadPage() {
  return (
    <div className="py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {privacidadData.documento}
        </h1>

        <div className="mb-8 flex flex-wrap gap-4 text-sm text-gray-600">
          <div>
            <strong>Versión:</strong> {privacidadData.version}
          </div>
          <div>
            <strong>Última actualización:</strong>{' '}
            {new Date(privacidadData.fecha_actualizacion).toLocaleDateString('es-AR')}
          </div>
          <div>
            <strong>País:</strong> {privacidadData.pais}
          </div>
        </div>

        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Legislación principal:</strong> {privacidadData.legislacion_principal}
          </p>
          <p className="text-sm text-blue-900 mt-2">
            <strong>Organismo de control:</strong> {privacidadData.organismo_control.nombre}
            <br />
            Web:{' '}
            <a
              href={`https://${privacidadData.organismo_control.web}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {privacidadData.organismo_control.web}
            </a>
            {' | '}
            Email:{' '}
            <a
              href={`mailto:${privacidadData.organismo_control.email}`}
              className="underline"
            >
              {privacidadData.organismo_control.email}
            </a>
          </p>
        </div>

        <div className="space-y-8 text-gray-700">
          {privacidadData.secciones.map((seccion) => (
            <section key={seccion.numero}>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {seccion.numero}. {seccion.titulo}
              </h2>

              {/* Sección 1: Responsable */}
              {seccion.numero === 1 && 'datos' in seccion && (() => {
                const datos = (seccion as any).datos
                return (
                  <div className="space-y-2">
                    <p>
                      <strong>Razón social:</strong> {datos.razon_social}
                    </p>
                    <p>
                      <strong>Domicilio:</strong> {datos.domicilio}
                    </p>
                    <p>
                      <strong>Email:</strong>{' '}
                      <a
                        href={`mailto:${datos.email}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {datos.email}
                      </a>
                    </p>
                    <p>
                      <strong>Web:</strong>{' '}
                      <a
                        href={datos.web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {datos.web}
                      </a>
                    </p>
                  </div>
                )
              })()}

              {/* Sección 2: Información que recopilamos */}
              {seccion.numero === 2 && 'categorias' in seccion && (() => {
                const categorias = (seccion as any).categorias
                return (
                  <div className="space-y-6">
                    {categorias.map((cat: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-primary-200 pl-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {cat.categoria}
                        </h3>
                        {'nota' in cat && (
                          <p className="text-sm text-gray-600 italic mb-2">{cat.nota}</p>
                        )}
                        <ul className="list-disc pl-6 space-y-1">
                          {cat.datos.map((dato: string, dIdx: number) => (
                            <li key={dIdx}>{dato}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {/* Sección 3: Finalidad del tratamiento */}
              {seccion.numero === 3 && 'finalidades' in seccion && (() => {
                const finalidades = (seccion as any).finalidades
                return (
                  <div className="space-y-4">
                    {finalidades.map((fin: any, idx: number) => (
                      <div key={idx}>
                        <h3 className="font-semibold text-gray-900">
                          {fin.letra}) {fin.titulo}
                        </h3>
                        <p className="text-gray-700">{fin.descripcion}</p>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {/* Sección 4: Base legal */}
              {seccion.numero === 4 && 'bases' in seccion && (() => {
                const bases = (seccion as any).bases
                return (
                  <div className="space-y-4">
                    {bases.map((base: any, idx: number) => (
                      <div key={idx}>
                        <h3 className="font-semibold text-gray-900">{base.tipo}</h3>
                        <p className="text-gray-700">{base.descripcion}</p>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {/* Sección 5: Compartir información */}
              {seccion.numero === 5 && 'casos' in seccion && (() => {
                const sec = seccion as any
                return (
                  <div className="space-y-6">
                    {'nota' in sec && (
                      <p className="font-semibold text-primary-700">{sec.nota}</p>
                    )}
                    {sec.casos.map((caso: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-primary-200 pl-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{caso.tipo}</h3>
                        {'proveedores' in caso && (
                          <ul className="list-disc pl-6 space-y-1">
                            {caso.proveedores.map((prov: any, pIdx: number) => (
                              <li key={pIdx}>
                                <strong>{prov.nombre}:</strong> {prov.proposito}
                              </li>
                            ))}
                          </ul>
                        )}
                        {'descripcion' in caso && (
                          <p className="text-gray-700">{caso.descripcion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })()}

              {/* Sección 6: Almacenamiento y seguridad */}
              {seccion.numero === 6 && 'medidas_seguridad' in seccion && (() => {
                const sec = seccion as any
                return (
                  <div className="space-y-4">
                    <p>
                      <strong>Ubicación:</strong> {sec.ubicacion}
                    </p>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Medidas de seguridad implementadas:
                      </h3>
                      <ul className="list-disc pl-6 space-y-1">
                        {sec.medidas_seguridad.map((medida: string, mIdx: number) => (
                          <li key={mIdx}>{medida}</li>
                        ))}
                      </ul>
                    </div>
                    <p>
                      <strong>Retención de datos:</strong> {sec.retencion}
                    </p>
                  </div>
                )
              })()}

              {/* Sección 7: Tus derechos */}
              {seccion.numero === 7 && 'derechos' in seccion && (() => {
                const sec = seccion as any
                return (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {sec.derechos.map((derecho: any, idx: number) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-primary-700">
                            {derecho.derecho}
                          </h3>
                          <p className="text-sm text-gray-700">{derecho.descripcion}</p>
                        </div>
                      ))}
                    </div>
                    {'ejercer_derechos' in sec && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Cómo ejercer tus derechos:
                        </h3>
                        <p>
                          <strong>Email:</strong>{' '}
                          <a
                            href={`mailto:${sec.ejercer_derechos.email}`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            {sec.ejercer_derechos.email}
                          </a>
                        </p>
                        <p>
                          <strong>Asunto:</strong> {sec.ejercer_derechos.asunto}
                        </p>
                        <p>
                          <strong>Requisitos:</strong> {sec.ejercer_derechos.requisitos}
                        </p>
                        <p>
                          <strong>Plazo de respuesta:</strong>{' '}
                          {sec.ejercer_derechos.plazo_respuesta}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Sección 8: Cookies */}
              {seccion.numero === 8 && 'tecnologias' in seccion && (() => {
                const sec = seccion as any
                return (
                  <div className="space-y-4">
                    {'nota' in sec && (
                      <p className="text-gray-600 italic">{sec.nota}</p>
                    )}
                    <div className="space-y-3">
                      {sec.tecnologias.map((tech: any, idx: number) => (
                        <div key={idx}>
                          <h3 className="font-semibold text-gray-900">{tech.tipo}</h3>
                          <p className="text-gray-700">{tech.proposito}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Secciones 9 y 10: Contenido simple */}
              {(seccion.numero === 9 || seccion.numero === 10) && 'contenido' in seccion && (() => {
                const contenido = (seccion as any).contenido
                return <p className="leading-relaxed">{contenido}</p>
              })()}
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contacto</h2>
          <p className="text-gray-700 mb-2">{privacidadData.contacto.proposito}</p>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Email:</strong>{' '}
              <a
                href={`mailto:${privacidadData.contacto.email}`}
                className="text-primary-600 hover:text-primary-700"
              >
                {privacidadData.contacto.email}
              </a>
            </p>
            <p>
              <strong>Sitio web:</strong>{' '}
              <a
                href={privacidadData.contacto.web}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700"
              >
                {privacidadData.contacto.web}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
