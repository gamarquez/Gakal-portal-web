# Testing con Mercado Pago Sandbox

Guía completa para probar el portal web con credenciales de testing de Mercado Pago.

## 📋 Pre-requisitos

- [ ] Cuenta de Mercado Pago Developers
- [ ] Proyecto creado en Vercel (o listo para crear)
- [ ] Proyecto de Supabase configurado
- [ ] Git repository subido a GitHub

## 1️⃣ Obtener Credenciales de Testing de Mercado Pago

### Paso 1: Ir a Mercado Pago Developers

1. Ir a https://www.mercadopago.com.ar/developers
2. Iniciar sesión con tu cuenta de Mercado Pago
3. Ir a **"Tus integraciones"**

### Paso 2: Crear Aplicación (si no existe)

1. Click en **"Crear aplicación"**
2. Nombre: `Gakal Portal Web - Testing`
3. Seleccionar **"Pagos online"**
4. Click **"Crear aplicación"**

### Paso 3: Obtener Credenciales de Test

1. Ir a **"Credenciales"**
2. Seleccionar **"Credenciales de prueba"** (NO producción)
3. Copiar:
   - ✅ **Access Token de prueba**: `TEST-xxxx-xxxxxx-xxxx`
   - ✅ **Public Key de prueba**: `TEST-xxxx-xxxx-xxxx`

**IMPORTANTE:** Las credenciales de TEST empiezan con `TEST-`. Nunca uses credenciales de producción (`APP_USR-`) para testing.

## 2️⃣ Configurar Variables de Entorno para Testing

### Crear archivo `.env.local` (desarrollo local)

```env
# Supabase (usar tu proyecto real)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Mercado Pago - CREDENCIALES DE TEST
MP_ACCESS_TOKEN=TEST-xxxx-xxxxxx-xxxx
MP_PUBLIC_KEY=TEST-xxxx-xxxx-xxxx
MP_WEBHOOK_SECRET=test-secret-123

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PLAYSTORE_URL=https://play.google.com/store/apps/details?id=com.gakal.app
```

### Variables de Entorno en Vercel

Al deployar en Vercel, agregar las mismas variables:

| Variable | Valor | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | **Production only** |
| `MP_ACCESS_TOKEN` | `TEST-xxxx...` | Production, Preview |
| `MP_PUBLIC_KEY` | `TEST-xxxx...` | Production, Preview |
| `MP_WEBHOOK_SECRET` | `test-secret-123` | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://tu-app.vercel.app` | Production |
| `NEXT_PUBLIC_PLAYSTORE_URL` | `https://play.google.com/...` | All |

## 3️⃣ Deploy en Vercel

### Opción A: Deploy desde GitHub

1. Ir a https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Importar tu repositorio de GitHub
4. Vercel detectará automáticamente Next.js
5. Configurar variables de entorno (paso anterior)
6. Click **"Deploy"**
7. Esperar 2-5 minutos

### Opción B: Deploy con Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Seguir las instrucciones en pantalla para configurar el proyecto.

## 4️⃣ Configurar Webhook de Mercado Pago (Testing)

### Paso 1: Obtener URL de Vercel

Una vez deployado, tendrás una URL como: `https://gakal-portal-web.vercel.app`

### Paso 2: Configurar Webhook en Mercado Pago

1. Ir a https://www.mercadopago.com.ar/developers
2. Ir a **"Webhooks"** en el menú lateral
3. Click **"Crear webhook"**
4. Configurar:
   - **URL**: `https://tu-app.vercel.app/api/webhooks/mercadopago`
   - **Eventos a escuchar**: Seleccionar todos los de `subscription_preapproval`
     - ✅ `authorized`
     - ✅ `paused`
     - ✅ `cancelled`
     - ✅ `updated`
5. Click **"Guardar"**

**Nota:** Mercado Pago enviará un request de prueba. Vercel lo recibirá aunque retorne error (es normal en la primera vez).

## 5️⃣ Probar el Flujo Completo

### Paso 1: Crear Usuario de Prueba en Supabase

1. Ir a Supabase → Authentication → Users
2. Click **"Add User"**
3. Email: `test@gakal.com`
4. Password: `Testing123!`
5. Ir a Table Editor → `perfiles`
6. Insertar registro:
```sql
INSERT INTO perfiles (id, nombre, email, plan_id)
VALUES (
  'uuid-del-usuario',  -- Copiar el UUID de Authentication
  'Usuario Test',
  'test@gakal.com',
  'free'
);
```

### Paso 2: Probar Login

1. Ir a `https://tu-app.vercel.app/login`
2. Email: `test@gakal.com`
3. Password: `Testing123!`
4. Debería redirigir a `/cuenta`

### Paso 3: Probar Selección de Plan

1. Ir a `/planes`
2. Seleccionar "Plata Mensual" (o cualquier plan)
3. Debería redirigir a `/checkout/plata?anual=false`

### Paso 4: Probar Checkout

1. En checkout, verificar resumen del plan
2. Click **"Pagar con Mercado Pago"**
3. Debería redirigir a Mercado Pago Sandbox

### Paso 5: Completar Pago con Tarjeta de Test

Mercado Pago te llevará a su checkout. Usar **tarjetas de prueba**:

#### ✅ Tarjetas que APRUEBAN el pago

**Visa**
- Número: `4509 9535 6623 3704`
- CVV: `123`
- Vencimiento: `11/25` (cualquier fecha futura)
- Nombre: `APRO` (importante para aprobar)

**Mastercard**
- Número: `5031 7557 3453 0604`
- CVV: `123`
- Vencimiento: `11/25`
- Nombre: `APRO`

#### ❌ Tarjetas que RECHAZAN el pago (para probar error)

**Visa - Fondos insuficientes**
- Número: `4509 9535 6623 3704`
- Nombre: `FUND` (en lugar de APRO)

**Mastercard - Rechazada**
- Número: `5031 7557 3453 0604`
- Nombre: `OTHE`

### Paso 6: Verificar Redirect Post-Pago

**Si el pago es aprobado:**
- Deberías ser redirigido a `/checkout/exito`
- Ver mensaje de confirmación

**Si el pago es rechazado:**
- Redirigido a `/checkout/error`
- Ver mensaje de error

### Paso 7: Verificar Webhook

1. Ir a Vercel → tu proyecto → **"Deployments"**
2. Click en la última deployment
3. Ir a **"Functions"**
4. Buscar logs de `/api/webhooks/mercadopago`
5. Deberías ver:
```
Webhook de Mercado Pago recibido: {
  type: 'subscription_preapproval',
  action: 'authorized',
  data_id: 'xxx'
}
Suscripción actualizada: {...}
```

### Paso 8: Verificar Base de Datos

1. Ir a Supabase → Table Editor → `suscripciones`
2. Deberías ver un nuevo registro:
   - `estado`: `active`
   - `mp_preapproval_id`: `xxx`
   - `plan_id`: `plata`

3. Ir a tabla `perfiles`
4. El usuario debería tener:
   - `plan_id`: `plata`
   - `suscripcion_activa_id`: (UUID de la suscripción)

### Paso 9: Verificar en la App

1. Volver a `/cuenta`
2. Deberías ver:
   - Plan actual: **Plata** 🥈
   - Estado: **Activo**
   - Fecha de próxima renovación

## 6️⃣ Probar Cancelación

1. En `/cuenta`, click **"Cancelar Suscripción"**
2. Confirmar cancelación
3. Verificar en Supabase que `estado` cambió a `cancelled`
4. Verificar que `fecha_cancelacion` se estableció

## 7️⃣ Ver Logs y Debugging

### Logs en Vercel

**Functions logs:**
```
Vercel → Proyecto → Deployments → Latest → Functions
```

Ahí verás todos los requests a:
- `/api/suscripcion/crear`
- `/api/suscripcion/cancelar`
- `/api/webhooks/mercadopago`

### Logs en Mercado Pago

```
Mercado Pago Developers → Tus integraciones → Tu app → Webhooks
```

Verás historial de webhooks enviados y respuestas.

### Network Tab (Chrome DevTools)

1. Abrir DevTools (F12)
2. Ir a **Network**
3. Hacer el flujo de pago
4. Ver requests a `/api/*`

## 8️⃣ Testing Avanzado

### Probar Diferentes Escenarios

| Escenario | Tarjeta | Nombre | Resultado Esperado |
|-----------|---------|--------|-------------------|
| Pago aprobado | `4509 9535 6623 3704` | `APRO` | Suscripción activa |
| Fondos insuficientes | `4509 9535 6623 3704` | `FUND` | Redirect a error |
| Tarjeta rechazada | `5031 7557 3453 0604` | `OTHE` | Redirect a error |
| Cancelación inmediata | Aprobar pago, luego cancelar | - | Estado = cancelled |
| Plan anual | Seleccionar toggle "Anual" | - | Precio x12 meses |

### Probar con ngrok (Webhook local)

Si querés probar el webhook en local:

```bash
# 1. Instalar ngrok
npm install -g ngrok

# 2. Levantar tu app local
npm run dev

# 3. En otra terminal, exponer puerto 3000
ngrok http 3000

# 4. Configurar webhook en MP con URL de ngrok
# https://xxxx.ngrok.io/api/webhooks/mercadopago
```

## 9️⃣ Migrar a Producción

Cuando estés listo para producción:

1. **Obtener credenciales de producción** de Mercado Pago
   - Access Token: `APP_USR-xxxx` (sin TEST-)
   - Public Key: `APP_USR-xxxx`

2. **Actualizar variables de entorno en Vercel**
   - Cambiar `MP_ACCESS_TOKEN` a producción
   - Cambiar `MP_PUBLIC_KEY` a producción
   - Actualizar `NEXT_PUBLIC_APP_URL` a dominio final

3. **Re-configurar webhook** con URL de producción
   - URL: `https://gakal.com.ar/api/webhooks/mercadopago`

4. **Probar con tarjeta real** con montos bajos (ej: $100)

## ✅ Checklist de Testing

Antes de pasar a producción, verificar:

- [ ] Login funciona correctamente
- [ ] Selección de plan redirige a checkout
- [ ] Checkout muestra precio correcto (mensual/anual)
- [ ] Redirect a Mercado Pago funciona
- [ ] Pago con tarjeta de test APRUEBA
- [ ] Webhook actualiza la DB correctamente
- [ ] Usuario ve plan activo en `/cuenta`
- [ ] Cancelación funciona correctamente
- [ ] Logs en Vercel muestran info correcta
- [ ] No hay errores en consola del navegador
- [ ] Responsive funciona en mobile

## 🆘 Problemas Comunes

### Webhook no actualiza la DB

**Solución:**
1. Verificar logs en Vercel Functions
2. Verificar que URL del webhook sea correcta
3. Probar webhook manualmente con curl

### Pago se aprueba pero suscripción sigue en "pending"

**Solución:**
1. Esperar 30 segundos (webhook puede tardar)
2. Verificar logs del webhook
3. Verificar que `mp_preapproval_id` coincida

### Error 401 en API routes

**Solución:**
1. Verificar que el usuario esté logueado
2. Limpiar cookies y volver a loguear
3. Verificar que Supabase Auth esté configurado

## 📚 Recursos

- [Tarjetas de Prueba MP](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/integration-test/test-cards)
- [Documentación Webhooks](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks)
- [Vercel Functions Logs](https://vercel.com/docs/functions/logs)
