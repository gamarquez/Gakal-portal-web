# Changelog - Portal Web Gakal

Registro de cambios y correcciones del proyecto.

## [1.0.1] - 2026-01-03

### 🐛 Correcciones de Bugs

#### Errores de Importación
- **Fixed:** Error de importación `formatDate` no exportado desde `@/types/plans`
  - Archivo: `app/(private)/cuenta/page.tsx`
  - Cambio: Mover import de `formatDate` a `@/lib/utils`

- **Fixed:** Error de importación `formatDate` no exportado desde `@/types/plans`
  - Archivo: `app/(private)/cuenta/cancelar/page.tsx`
  - Cambio: Mover import de `formatDate` a `@/lib/utils`

### 📝 Documentación Agregada
- ✅ `FIXES.md` - Resumen de correcciones de navegabilidad
- ✅ `TROUBLESHOOTING.md` - Guía de solución de problemas comunes

### ✅ Verificaciones
- [x] Type checking pasa sin errores
- [x] Todos los imports están correctos
- [x] Componentes exportados correctamente
- [x] Rutas configuradas correctamente
- [x] Middleware funciona correctamente

---

## [1.0.0] - 2026-01-03

### 🎉 Release Inicial

#### Características Implementadas

**Páginas Públicas**
- ✅ Landing page con Hero, Features, Planes y CTA
- ✅ Página de comparación de planes con toggle mensual/anual
- ✅ Sistema de login con Supabase Auth
- ✅ Política de Privacidad (Ley 25.326 Argentina)
- ✅ Términos y Condiciones (Ley de Defensa del Consumidor)

**Área Privada**
- ✅ Dashboard de cuenta con información del usuario
- ✅ Visualización de plan actual y suscripción
- ✅ Sistema de checkout integrado con Mercado Pago
- ✅ Página de cancelación de suscripción
- ✅ Páginas de confirmación (éxito/error) post-pago

**API Routes**
- ✅ `POST /api/suscripcion/crear` - Crear preapproval en Mercado Pago
- ✅ `POST /api/suscripcion/cancelar` - Cancelar suscripción
- ✅ `GET /api/suscripcion/estado` - Obtener estado actual
- ✅ `POST /api/webhooks/mercadopago` - Webhook para eventos de MP

**Componentes UI**
- ✅ Button - Botón reutilizable con variantes
- ✅ Input - Input con label y validación
- ✅ Card - Card y variantes (Header, Content, Footer)
- ✅ Header - Navegación principal con auth
- ✅ Footer - Footer con links
- ✅ PlanCard - Card individual de plan
- ✅ PlanComparison - Comparador de planes
- ✅ AuthGuard - Protección de rutas privadas

**Integraciones**
- ✅ Supabase Auth - Autenticación compartida con app móvil
- ✅ Mercado Pago Preapproval API - Suscripciones recurrentes
- ✅ Webhook automático - Actualización de estado de suscripciones

**Configuración**
- ✅ Next.js 14 App Router
- ✅ TypeScript estricto
- ✅ Tailwind CSS
- ✅ Middleware de autenticación
- ✅ Variables de entorno
- ✅ ESLint y configuración de TypeScript

**Documentación**
- ✅ README.md completo
- ✅ DEPLOY.md con guía paso a paso de Vercel
- ✅ QUICKSTART.md para inicio rápido
- ✅ .env.example con todas las variables necesarias

### 📊 Estadísticas

- **Archivos creados:** 45+
- **Líneas de código:** ~3,800
- **Componentes:** 13
- **Páginas:** 10
- **API Routes:** 4
- **Tipos TypeScript:** 15+

### 🎯 Planes de Suscripción

**Free** 🆓
- Gratis para siempre
- Historial 3 días
- 3 logros básicos

**Bronce** 🥉
- $1.999/mes o $17.990/año
- Historial 30 días
- 12 logros
- Sin publicidad

**Plata** 🥈
- $3.499/mes o $31.490/año
- Historial 90 días
- 10 análisis IA/mes
- 20 logros
- Multiplicador XP x1.5

**Oro** 🥇
- $5.499/mes o $49.490/año
- Historial ilimitado
- Análisis IA ilimitados
- 30+ logros
- Multiplicador XP x2
- Alimentos personalizados
- Perfil nutricional completo

### 🔧 Stack Tecnológico

**Frontend**
- Next.js 14.2.0
- React 18.3.0
- TypeScript 5.6.0
- Tailwind CSS 3.4.0

**Backend**
- Supabase (Auth + Database)
- Mercado Pago SDK 2.0.15
- Next.js API Routes

**Desarrollo**
- ESLint
- PostCSS
- Autoprefixer

**Utilidades**
- lucide-react 0.460.0 (iconos)
- date-fns 3.6.0 (fechas)
- zod 3.23.0 (validación)
- clsx + tailwind-merge (estilos)

### 🚀 Deploy

**Plataforma:** Vercel
**Dominio:** gakal.com.ar
**SSL:** Automático via Vercel

### 📋 Próximos Pasos (Roadmap)

- [ ] Implementar verificación HMAC del webhook de MP
- [ ] Agregar historial de pagos en dashboard
- [ ] Emails transaccionales con Resend/SendGrid
- [ ] Panel de administración
- [ ] Analytics y métricas
- [ ] Testing E2E con Playwright
- [ ] Internacionalización (i18n)

---

## Convenciones del Changelog

**Tipos de cambios:**
- `Added` - Nueva funcionalidad
- `Changed` - Cambios en funcionalidad existente
- `Deprecated` - Funcionalidad que será removida
- `Removed` - Funcionalidad removida
- `Fixed` - Corrección de bugs
- `Security` - Correcciones de seguridad

**Emojis usados:**
- 🎉 Release/Inicio
- ✅ Completado
- 🐛 Bug fix
- 📝 Documentación
- 🔧 Configuración
- 🚀 Deploy/Performance
- 🔒 Seguridad
- ⚠️ Deprecado
- 💥 Breaking change
