export default function TerminosPage() {
  return (
    <div className="py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Términos y Condiciones
        </h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">
            Última actualización: {new Date().toLocaleDateString('es-AR')}
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder y usar Gakal (la "App" y el "Servicio"), aceptás estar vinculado
              por estos Términos y Condiciones y todas las leyes y regulaciones aplicables
              en Argentina. Si no estás de acuerdo con alguno de estos términos, tenés
              prohibido usar o acceder a este sitio y aplicación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Descripción del Servicio
            </h2>
            <p>
              Gakal es una aplicación móvil de registro nutricional con gamificación
              que permite a los usuarios:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Registrar comidas y calcular calorías</li>
              <li>Analizar fotos de alimentos con inteligencia artificial</li>
              <li>Trackear progreso nutricional</li>
              <li>Participar en un sistema de gamificación (XP, logros, rachas)</li>
              <li>Acceder a funciones premium mediante suscripción</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Registro y Cuenta
            </h2>
            <p>
              Para usar ciertas funciones del Servicio, debés crear una cuenta proporcionando
              información veraz y completa. Sos responsable de mantener la confidencialidad
              de tu cuenta y contraseña.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Suscripciones y Pagos
            </h2>
            <p>
              Gakal ofrece planes de suscripción mensuales y anuales. Al suscribirte:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Autorizás el cobro recurrente según el plan elegido</li>
              <li>Los pagos se procesan a través de Mercado Pago</li>
              <li>Los precios están en pesos argentinos (ARS) e incluyen impuestos</li>
              <li>Podés cancelar tu suscripción en cualquier momento</li>
              <li>Al cancelar, tu plan seguirá activo hasta el fin del período pagado</li>
              <li>No ofrecemos reembolsos por períodos no utilizados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Cancelación
            </h2>
            <p>
              Podés cancelar tu suscripción en cualquier momento desde tu cuenta en
              gakal.com.ar. La cancelación será efectiva al final de tu período de
              facturación actual.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Uso Aceptable
            </h2>
            <p>Te comprometés a NO:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usar el Servicio para fines ilegales</li>
              <li>Intentar hackear o comprometer la seguridad del Servicio</li>
              <li>Compartir tu cuenta con terceros</li>
              <li>Usar bots o automatizaciones no autorizadas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Limitación de Responsabilidad
            </h2>
            <p>
              Gakal es una herramienta de tracking nutricional y NO reemplaza el consejo
              médico profesional. La información proporcionada es solo para fines informativos.
              No nos hacemos responsables de decisiones tomadas basadas en la información
              del Servicio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Modificaciones
            </h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Los cambios significativos serán notificados por email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Ley Aplicable
            </h2>
            <p>
              Estos términos se rigen por las leyes de la República Argentina,
              incluyendo la Ley de Defensa del Consumidor N° 24.240.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Contacto
            </h2>
            <p>
              Para consultas sobre estos Términos, contactanos a través de
              la aplicación o nuestros canales de soporte.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
