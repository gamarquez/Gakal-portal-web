# Prompt: Portal Web de Suscripciones Gakal

## Contexto del Proyecto

Necesito crear un portal web para **Gakal**, una aplicación móvil de registro nutricional con gamificación para el mercado argentino. 

### ¿Por qué necesito esta web?
Google Play no permite monetización directa para desarrolladores argentinos (desde junio 2025). La app móvil es gratuita en Play Store, y la monetización se hace a través de este portal web externo usando Mercado Pago.

### Flujo de usuario
1. Usuario usa la app gratuita de Gakal (React Native/Expo)
2. Quiere funciones premium → toca "Gestionar cuenta"
3. Se abre el navegador → **gakal.com.ar**
4. Inicia sesión con las mismas credenciales de la app
5. Ve los planes, selecciona uno, paga con Mercado Pago
6. Webhook actualiza su suscripción en la base de datos
7. Al volver a la app, ya tiene el plan activo

---

## Stack Técnico

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (opcional pero recomendado)

### Backend/Servicios
- **Base de datos y Auth**: Supabase (ya existe, compartido con la app móvil)
- **Pagos**: Mercado Pago Suscripciones (API de preapproval)
- **Deploy**: Vercel

### Dominio
- **Producción**: gakal.com.ar
- **Preview**: gakal.vercel.app (durante desarrollo)

---

## Base de Datos Existente (Supabase)

Ya tengo estas tablas relevantes en Supabase:

### Tabla `perfiles`
```sql
- id (uuid, PK, FK a auth.users)
- nombre (text)
- email (text)
- plan_id (text, FK a planes, default 'free')
- suscripcion_activa_id (uuid, FK a suscripciones)
-- ... otros campos de la app
```

### Tabla `planes`
```sql
- id (text, PK) -- 'free', 'bronce', 'plata', 'oro'
- nombre (text)
- descripcion (text)
- precio_mensual (numeric) -- en ARS
- precio_anual (numeric)
- dias_historial (integer, null = ilimitado)
- analisis_ia_mes (integer, null = ilimitado)
- max_alimentos_custom (integer)
- multiplicador_xp (numeric)
-- ... otros campos de features
```

### Tabla `suscripciones`
```sql
- id (uuid, PK)
- usuario_id (uuid, FK a perfiles)
- plan_id (text, FK a planes)
- estado (text) -- 'active', 'paused', 'cancelled', 'expired'
- mp_preapproval_id (text) -- ID de suscripción en Mercado Pago
- fecha_inicio (timestamp)
- fecha_fin (timestamp)
- fecha_cancelacion (timestamp)
- es_anual (boolean)
- analisis_ia_usados (integer)
- mes_actual_inicio (date)
```

---

## Funcionalidades Requeridas

### 1. Páginas Públicas

#### Landing Page (`/`)
- Hero section con propuesta de valor de Gakal
- Sección de features principales
- Tabla comparativa de planes (Free, Bronce, Plata, Oro)
- CTA "Descargar App" → link a Play Store
- CTA "Ya tengo cuenta" → `/login`
- Footer con links a documentos legales

#### Página de Planes (`/planes`)
- Comparativa detallada de los 4 planes
- Toggle mensual/anual con descuento visible (25%)
- Precios en ARS con formato argentino ($1.999)
- Botón "Elegir plan" → requiere login, luego checkout
- Highlight del plan recomendado (Plata)

#### Documentos Legales
- `/privacidad` - Política de Privacidad
- `/terminos` - Términos y Condiciones
- Contenido en español argentino

### 2. Autenticación

#### Login (`/login`)
- Email + contraseña (Supabase Auth)
- Usar el mismo sistema de auth que la app móvil
- Link "¿No tenés cuenta? Descargá la app"
- Link "Olvidé mi contraseña" → recovery por email
- Redirect post-login a `/cuenta` o al plan que quería comprar

#### Logout
- Limpiar sesión de Supabase
- Redirect a landing

### 3. Área Privada (requiere auth)

#### Mi Cuenta (`/cuenta`)
Dashboard del usuario con:
- Información del perfil (nombre, email)
- Plan actual con badge (🆓/🥉/🥈/🥇)
- Si tiene suscripción activa:
  - Fecha de próxima renovación
  - Monto a cobrar
  - Botón "Cancelar suscripción"
  - Botón "Cambiar plan"
- Si es Free:
  - CTA prominente para upgrade
- Historial de pagos (últimos 10)

#### Checkout (`/checkout/[planId]`)
- Resumen del plan seleccionado
- Opción mensual/anual
- Precio total a pagar
- Botón "Pagar con Mercado Pago"
- Al hacer clic:
  1. Llamar a API route que crea preapproval en MP
  2. Redirect al `init_point` de MP
  3. Usuario completa pago en MP
  4. MP redirige a `/checkout/exito` o `/checkout/error`

#### Checkout Exitoso (`/checkout/exito`)
- Mensaje de confirmación
- Instrucciones: "Ya podés volver a la app"
- Botón "Abrir Gakal" → deep link `gakal://`
- El webhook de MP ya actualizó la DB en background

#### Checkout Error (`/checkout/error`)
- Mensaje de error amigable
- Botón para reintentar
- Link a soporte

#### Cancelar Suscripción (`/cuenta/cancelar`)
- Confirmación antes de cancelar
- Explicar qué pasa: "Tu plan seguirá activo hasta [fecha]"
- Botón "Confirmar cancelación"
- Llamar a API de MP para cancelar preapproval
- Actualizar estado en Supabase

### 4. API Routes (Next.js)

#### `POST /api/suscripcion/crear`
```typescript
// Input: { planId: string, esAnual: boolean }
// 1. Verificar usuario autenticado
// 2. Verificar que no tenga suscripción activa
// 3. Crear preapproval en Mercado Pago
// 4. Guardar referencia en Supabase (estado 'pending')
// 5. Retornar init_point URL
```

#### `POST /api/suscripcion/cancelar`
```typescript
// 1. Verificar usuario autenticado
// 2. Obtener mp_preapproval_id de su suscripción
// 3. Cancelar en Mercado Pago API
// 4. Actualizar estado en Supabase a 'cancelled'
// 5. Retornar confirmación
```

#### `POST /api/webhooks/mercadopago`
```typescript
// Webhook que MP llama cuando hay eventos
// Eventos a manejar:
// - authorized: Suscripción aprobada → activar plan
// - paused: Suscripción pausada
// - cancelled: Suscripción cancelada
// - updated: Datos actualizados
// 
// 1. Verificar firma del webhook (x-signature)
// 2. Obtener detalles del preapproval desde MP
// 3. Actualizar suscripción en Supabase
// 4. Actualizar plan_id en perfil del usuario
```

#### `GET /api/suscripcion/estado`
```typescript
// Retorna estado actual de suscripción del usuario
// Para que la app móvil pueda verificar
```

---

## Integración Mercado Pago

### Credenciales necesarias (env vars)
```env
MP_ACCESS_TOKEN=APP_USR-xxx (producción)
MP_PUBLIC_KEY=APP_USR-xxx
MP_WEBHOOK_SECRET=xxx (para verificar webhooks)
```

### Crear Suscripción (Preapproval)
```typescript
// Ejemplo de payload para crear preapproval
const preapproval = {
  reason: "Gakal Plata - Suscripción Mensual",
  auto_recurring: {
    frequency: 1,
    frequency_type: "months", // o "years" para anual
    transaction_amount: 3499,
    currency_id: "ARS"
  },
  back_url: "https://gakal.com.ar/checkout/exito",
  payer_email: user.email,
  external_reference: `gakal_${oderId}_${planId}`
};

// POST https://api.mercadopago.com/preapproval
```

### Webhook URL
Configurar en panel de MP: `https://gakal.com.ar/api/webhooks/mercadopago`

---

## Diseño y UX

### Paleta de Colores (consistente con la app)
```css
--primary-500: #10b981; /* Verde esmeralda principal */
--primary-600: #059669;
--primary-700: #047857;

/* Badges de planes */
--free: #10b981;      /* Verde */
--bronce: #CD7F32;    /* Bronce */
--plata: #C0C0C0;     /* Plata */
--oro: #FFD700;       /* Oro */
```

### Responsive
- Mobile-first (muchos usuarios vendrán desde la app)
- Breakpoints: sm (640px), md (768px), lg (1024px)

### Idioma
- Español argentino (vos, formato de fecha DD/MM/YYYY)
- Moneda: ARS con formato $1.999 (punto como separador de miles)

---

## Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Solo para API routes

# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-xxx
MP_PUBLIC_KEY=APP_USR-xxx
MP_WEBHOOK_SECRET=xxx

# App
NEXT_PUBLIC_APP_URL=https://gakal.com.ar
NEXT_PUBLIC_PLAYSTORE_URL=https://play.google.com/store/apps/details?id=com.gakal.app
```

---

## Estructura de Carpetas Sugerida

```
gakal-web/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Landing
│   │   ├── planes/page.tsx       # Comparativa planes
│   │   ├── login/page.tsx        # Login
│   │   ├── privacidad/page.tsx   # Política privacidad
│   │   └── terminos/page.tsx     # Términos
│   ├── (private)/
│   │   ├── layout.tsx            # Auth guard
│   │   ├── cuenta/
│   │   │   ├── page.tsx          # Dashboard
│   │   │   └── cancelar/page.tsx # Cancelar sub
│   │   └── checkout/
│   │       ├── [planId]/page.tsx # Checkout
│   │       ├── exito/page.tsx    # Success
│   │       └── error/page.tsx    # Error
│   ├── api/
│   │   ├── suscripcion/
│   │   │   ├── crear/route.ts
│   │   │   ├── cancelar/route.ts
│   │   │   └── estado/route.ts
│   │   └── webhooks/
│   │       └── mercadopago/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn components
│   ├── PlanCard.tsx
│   ├── PlanComparison.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── AuthGuard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client
│   ├── mercadopago.ts            # MP API helpers
│   └── utils.ts
├── types/
│   ├── database.types.ts         # Tipos de Supabase
│   └── plans.ts
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Consideraciones de Seguridad

1. **Webhook de MP**: Verificar header `x-signature` con el secret
2. **API Routes**: Verificar sesión de Supabase antes de operaciones
3. **SUPABASE_SERVICE_ROLE_KEY**: Solo en server, nunca exponer al cliente
4. **RLS en Supabase**: Ya configurado, las políticas restringen acceso
5. **HTTPS**: Obligatorio (Vercel lo maneja automáticamente)

---

## Consideraciones Legales (Argentina)

### Defensa del Consumidor
- Botón de cancelación debe ser igual de visible que el de compra
- Mostrar precio final en ARS (impuestos incluidos)
- Confirmación por email de cada transacción

### Ley de Protección de Datos (25.326)
- Consentimiento explícito al registrarse
- Link visible a política de privacidad
- Opción para solicitar eliminación de datos

---

## Entregables Esperados

1. **Código fuente** del proyecto Next.js completo
2. **Instrucciones de deploy** en Vercel
3. **Configuración de variables de entorno**
4. **Contenido de páginas legales** (privacidad y términos)
5. **Documentación de la API** para los endpoints

---

## Preguntas Frecuentes para el Desarrollo

### ¿Cómo manejo la sesión entre la app y la web?
El usuario usa las mismas credenciales. Al loguearse en la web, Supabase crea una sesión independiente. Ambas (app y web) leen el mismo `plan_id` del perfil.

### ¿Qué pasa si el usuario cierra el browser durante el pago?
El webhook de MP se ejecuta independientemente. Cuando el pago se confirma, el webhook actualiza la DB. La próxima vez que el usuario abra la app o la web, verá su plan activo.

### ¿Cómo pruebo los webhooks en desarrollo?
Usar ngrok o similar para exponer localhost. Configurar la URL de ngrok temporalmente en el panel de MP.

### ¿Los precios incluyen IVA?
Sí, los precios mostrados son finales. Como monotributista no discrimino IVA.

---

## Datos de Planes (para hardcodear o seed)

```typescript
export const planes = [
  {
    id: 'free',
    nombre: 'Free',
    emoji: '🆓',
    precioMensual: 0,
    precioAnual: 0,
    features: [
      'Registro ilimitado de comidas',
      'Historial de 3 días',
      '3 logros básicos',
      'Gestión de peso e IMC',
      'Con publicidad'
    ],
    destacado: false
  },
  {
    id: 'bronce',
    nombre: 'Bronce',
    emoji: '🥉',
    precioMensual: 1999,
    precioAnual: 17990,
    features: [
      'Todo lo de Free',
      'Historial de 30 días',
      '12 logros',
      'Estadísticas semanales',
      'Desafíos semanales',
      'Sin publicidad'
    ],
    destacado: false
  },
  {
    id: 'plata',
    nombre: 'Plata',
    emoji: '🥈',
    precioMensual: 3499,
    precioAnual: 31490,
    features: [
      'Todo lo de Bronce',
      'Historial de 90 días',
      '10 análisis IA/mes',
      '20 logros',
      'Multiplicador XP x1.5',
      'Exportar CSV'
    ],
    destacado: true // Recomendado
  },
  {
    id: 'oro',
    nombre: 'Oro',
    emoji: '🥇',
    precioMensual: 5499,
    precioAnual: 49490,
    features: [
      'Todo lo de Plata',
      'Historial ilimitado',
      'Análisis IA ilimitados',
      '30+ logros',
      'Multiplicador XP x2',
      'Alimentos personalizados',
      'Medidas corporales',
      'Perfil nutricional completo'
    ],
    destacado: false
  }
];
```

---

## Comando para Iniciar

```bash
npx create-next-app@latest gakal-web --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd gakal-web
npm install @supabase/supabase-js @supabase/ssr mercadopago
npx shadcn@latest init
```
