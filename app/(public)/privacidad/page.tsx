export default function PrivacidadPage() {
  return (
    <div className="py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Política de Privacidad
        </h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">
            Última actualización: {new Date().toLocaleDateString('es-AR')}
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Información que Recopilamos
            </h2>
            <p>En Gakal recopilamos la siguiente información:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Información de cuenta:</strong> Email, nombre, contraseña (encriptada)
              </li>
              <li>
                <strong>Datos nutricionales:</strong> Comidas registradas, objetivos calóricos,
                preferencias alimentarias
              </li>
              <li>
                <strong>Datos de salud:</strong> Peso, altura, medidas corporales (solo si lo ingresás)
              </li>
              <li>
                <strong>Fotos:</strong> Imágenes de comidas que subís para análisis con IA
              </li>
              <li>
                <strong>Datos de uso:</strong> Estadísticas de uso de la app, logros desbloqueados
              </li>
              <li>
                <strong>Información de pago:</strong> Procesada por Mercado Pago (no almacenamos
                datos de tarjetas)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Cómo Usamos tu Información
            </h2>
            <p>Usamos tu información para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proporcionar y mejorar el Servicio</li>
              <li>Calcular valores nutricionales y recomendaciones personalizadas</li>
              <li>Analizar fotos de comidas con inteligencia artificial</li>
              <li>Gestionar tu suscripción y facturación</li>
              <li>Enviar notificaciones sobre rachas, logros y recordatorios</li>
              <li>Generar estadísticas y gráficos de progreso</li>
              <li>Comunicarnos con vos sobre actualizaciones del servicio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Con Quién Compartimos tu Información
            </h2>
            <p>Compartimos tu información únicamente con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Supabase:</strong> Proveedor de base de datos y autenticación
              </li>
              <li>
                <strong>Mercado Pago:</strong> Procesador de pagos para suscripciones
              </li>
              <li>
                <strong>OpenAI:</strong> Para el análisis de fotos con IA (solo las imágenes
                que subís para análisis)
              </li>
            </ul>
            <p className="mt-2">
              <strong>NO vendemos ni alquilamos tu información personal a terceros.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Seguridad de los Datos
            </h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger
              tus datos:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encriptación de contraseñas</li>
              <li>Conexiones HTTPS seguras</li>
              <li>Políticas de seguridad a nivel de base de datos (RLS)</li>
              <li>Acceso restringido a datos personales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Tus Derechos (Ley 25.326)
            </h2>
            <p>
              Según la Ley de Protección de Datos Personales de Argentina, tenés derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceder a tus datos personales</li>
              <li>Rectificar datos inexactos</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Oponerte al procesamiento de tus datos</li>
              <li>Exportar tus datos en formato CSV</li>
            </ul>
            <p className="mt-2">
              Para ejercer estos derechos, contactanos a través de la aplicación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Retención de Datos
            </h2>
            <p>
              Mantenemos tus datos mientras tu cuenta esté activa. Si eliminás tu cuenta,
              borramos todos tus datos personales dentro de los 30 días, excepto aquellos
              que debamos conservar por obligaciones legales o contables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Cookies y Tecnologías Similares
            </h2>
            <p>
              Usamos cookies esenciales para mantener tu sesión y mejorar la experiencia
              de usuario. No usamos cookies de terceros para publicidad.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Menores de Edad
            </h2>
            <p>
              Gakal está dirigido a mayores de 18 años. No recopilamos intencionalmente
              información de menores de edad.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Cambios a esta Política
            </h2>
            <p>
              Podemos actualizar esta política ocasionalmente. Te notificaremos sobre
              cambios significativos por email o mediante la aplicación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Contacto
            </h2>
            <p>
              Para preguntas sobre esta Política de Privacidad o para ejercer tus derechos,
              contactanos a través de la aplicación o nuestros canales de soporte.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
