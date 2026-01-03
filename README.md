# Gakal Portal Web

Portal web de suscripciones para **Gakal**, la aplicación móvil de registro nutricional con gamificación.

## Contexto

Google Play no permite monetización directa para desarrolladores argentinos desde junio 2025. Este portal web permite a los usuarios de la app móvil de Gakal suscribirse a planes premium a través de Mercado Pago.

## Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **Styling**: Tailwind CSS
- **Base de datos**: Supabase (compartido con la app móvil)
- **Autenticación**: Supabase Auth
- **Pagos**: Mercado Pago Suscripciones (Preapproval API)
- **Deploy**: Vercel

## Características

### Páginas Públicas
- ✅ Landing page con información de Gakal
- ✅ Comparación de planes (Free, Bronce, Plata, Oro)
- ✅ Login con Supabase Auth
- ✅ Política de Privacidad
- ✅ Términos y Condiciones

### Área Privada (requiere autenticación)
- ✅ Dashboard de cuenta
- ✅ Visualización de plan actual y suscripción
- ✅ Proceso de checkout con Mercado Pago
- ✅ Cancelación de suscripción
- ✅ Páginas de éxito/error post-pago

### API Routes
- ✅ `POST /api/suscripcion/crear` - Crear suscripción en Mercado Pago
- ✅ `POST /api/suscripcion/cancelar` - Cancelar suscripción
- ✅ `GET /api/suscripcion/estado` - Obtener estado de suscripción
- ✅ `POST /api/webhooks/mercadopago` - Webhook para eventos de Mercado Pago

## Instalación

### Prerequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Cuenta de Mercado Pago (producción)

### Pasos

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd gakal-web
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Copiar `.env.example` a `.env.local` y completar:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-xxx
MP_PUBLIC_KEY=APP_USR-xxx
MP_WEBHOOK_SECRET=xxx

# App
NEXT_PUBLIC_APP_URL=https://gakal.com.ar
NEXT_PUBLIC_PLAYSTORE_URL=https://play.google.com/store/apps/details?id=com.gakal.app
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Configuración de Supabase

Este portal web usa la **misma base de datos de Supabase** que la app móvil. Las tablas relevantes son:

### Tablas Requeridas

- `perfiles` - Información del usuario y plan actual
- `planes` - Catálogo de planes (Free, Bronce, Plata, Oro)
- `suscripciones` - Registro de suscripciones activas

Asegurate de que estas migraciones estén aplicadas en tu proyecto de Supabase.

## Configuración de Mercado Pago

### 1. Obtener Credenciales

1. Ingresar a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Ir a "Tus integraciones" → "Credenciales"
3. Copiar el **Access Token** de producción
4. Copiar la **Public Key** de producción

### 2. Configurar Webhook

1. En el panel de Mercado Pago, ir a "Webhooks"
2. Agregar nueva URL: `https://gakal.com.ar/api/webhooks/mercadopago`
3. Seleccionar eventos:
   - `subscription_preapproval` → `authorized`
   - `subscription_preapproval` → `paused`
   - `subscription_preapproval` → `cancelled`
4. Copiar el **Webhook Secret** y agregarlo a las variables de entorno

### 3. Configurar IPN (opcional)

Si querés usar IPN además de webhooks, configurar la URL en el panel de MP.

## Deploy en Vercel

### 1. Conectar Repositorio

1. Crear cuenta en [Vercel](https://vercel.com)
2. Importar el repositorio de GitHub
3. Seleccionar "Next.js" como framework

### 2. Configurar Variables de Entorno

En el panel de Vercel, ir a "Settings" → "Environment Variables" y agregar todas las variables de `.env.example`.

### 3. Deploy

```bash
# Opción 1: Deploy automático (push a main)
git push origin main

# Opción 2: Deploy manual con Vercel CLI
npm install -g vercel
vercel --prod
```

### 4. Configurar Dominio

1. En Vercel, ir a "Settings" → "Domains"
2. Agregar `gakal.com.ar`
3. Configurar DNS según las instrucciones de Vercel

## Flujo de Usuario Completo

1. Usuario usa la app móvil de Gakal (Free)
2. Quiere funciones premium → toca "Gestionar cuenta"
3. Se abre el navegador → `gakal.com.ar`
4. Inicia sesión con las mismas credenciales de la app
5. Ve los planes y selecciona uno (ej: Plata Mensual)
6. Es redirigido a `/checkout/plata?anual=false`
7. Toca "Pagar con Mercado Pago"
8. API crea un preapproval en MP y redirige al checkout de MP
9. Usuario completa el pago en Mercado Pago
10. MP redirige a `/checkout/exito`
11. En paralelo, el webhook de MP actualiza la suscripción en la DB
12. Usuario vuelve a la app → ya tiene el plan Plata activo ✅

## Estructura del Proyecto

```
gakal-web/
├── app/
│   ├── (public)/          # Páginas públicas
│   │   ├── page.tsx       # Landing
│   │   ├── planes/
│   │   ├── login/
│   │   ├── terminos/
│   │   └── privacidad/
│   ├── (private)/         # Área privada (con AuthGuard)
│   │   ├── cuenta/
│   │   └── checkout/
│   ├── api/
│   │   ├── suscripcion/
│   │   └── webhooks/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                # Componentes base
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── PlanCard.tsx
│   └── AuthGuard.tsx
├── lib/
│   ├── supabase/          # Clientes de Supabase
│   ├── mercadopago.ts     # Helpers de MP
│   └── utils.ts
├── types/
│   ├── database.types.ts  # Tipos de Supabase
│   ├── plans.ts           # Tipos de planes
│   └── index.ts
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar en producción
npm run start

# Linter
npm run lint

# Type checking
npm run type-check
```

## Testing

### Probar el Flujo de Pago (Sandbox)

1. Usar credenciales de **test** de Mercado Pago
2. Usar tarjetas de prueba: https://www.mercadopago.com.ar/developers/es/docs/checkout-api/integration-test/test-cards
3. Verificar que el webhook actualice correctamente la DB

### Probar el Webhook Localmente

Usar ngrok para exponer localhost:

```bash
ngrok http 3000

# Configurar en MP webhook: https://xxxx.ngrok.io/api/webhooks/mercadopago
```

## Troubleshooting

### Error 401 en API Routes
- Verificar que el usuario esté autenticado
- Verificar que las cookies de Supabase estén siendo enviadas

### Webhook no se ejecuta
- Verificar que la URL esté configurada en Mercado Pago
- Verificar logs en Vercel o en consola local
- Usar herramientas como https://webhook.site para debuggear

### Suscripción no se actualiza después del pago
- Verificar que el webhook esté recibiendo eventos
- Verificar que el `mp_preapproval_id` coincida en la DB
- Revisar logs del webhook en `/api/webhooks/mercadopago`

### Error al crear preapproval
- Verificar credenciales de MP en variables de entorno
- Verificar que el `MP_ACCESS_TOKEN` sea de producción (no test)

## Seguridad

- ✅ Autenticación con Supabase
- ✅ RLS (Row Level Security) en Supabase
- ✅ Verificación de sesión en todas las API routes
- ✅ Service Role Key solo en servidor (nunca expuesto al cliente)
- ✅ HTTPS obligatorio (manejado por Vercel)
- ⚠️ Verificación de firma del webhook de MP (TODO: implementar HMAC)

## Roadmap

- [ ] Implementar verificación de firma del webhook con HMAC
- [ ] Agregar historial de pagos en "Mi Cuenta"
- [ ] Emails transaccionales (confirmación de pago, cancelación)
- [ ] Panel de administración
- [ ] Métricas y analytics

## Soporte

Para problemas técnicos o preguntas, contactar a través de:
- GitHub Issues
- Email: (agregar email de soporte)

## Licencia

Propietario: Gakal
Todos los derechos reservados.
