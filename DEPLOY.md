# Guía de Deploy en Vercel

Esta guía te ayudará a desplegar el Portal Web de Gakal en Vercel paso a paso.

## Pre-requisitos

- [ ] Cuenta de GitHub con el repositorio del proyecto
- [ ] Cuenta de Vercel (puede ser gratuita)
- [ ] Proyecto de Supabase configurado y funcionando
- [ ] Credenciales de Mercado Pago de **producción**
- [ ] Dominio `gakal.com.ar` disponible

## Paso 1: Preparar el Repositorio

1. **Asegurate de que el código esté en GitHub**
```bash
git add .
git commit -m "Preparar para deploy en Vercel"
git push origin main
```

2. **Verificar archivos críticos**
- ✅ `.gitignore` incluye `.env.local` y `.env`
- ✅ `package.json` tiene todas las dependencias
- ✅ `next.config.js` está configurado

## Paso 2: Crear Proyecto en Vercel

1. **Ir a [Vercel](https://vercel.com)** y loguearse con GitHub
2. Click en **"Add New..."** → **"Project"**
3. Seleccionar el repositorio de GitHub (`gakal-web`)
4. Vercel detectará automáticamente que es un proyecto Next.js

## Paso 3: Configurar Variables de Entorno

En la pantalla de configuración, ir a **"Environment Variables"** y agregar:

### Supabase (3 variables)

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Production only ⚠️ |

### Mercado Pago (3 variables)

| Name | Value | Environment |
|------|-------|-------------|
| `MP_ACCESS_TOKEN` | `APP_USR-xxx` | Production only ⚠️ |
| `MP_PUBLIC_KEY` | `APP_USR-xxx` | Production, Preview |
| `MP_WEBHOOK_SECRET` | `xxx` | Production only ⚠️ |

### App (2 variables)

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | `https://gakal.com.ar` | Production |
| `NEXT_PUBLIC_PLAYSTORE_URL` | `https://play.google.com/store/apps/details?id=com.gakal.app` | Production, Preview, Development |

**Nota:** Para Preview y Development, podés usar credenciales de test de Mercado Pago.

## Paso 4: Deploy

1. Click en **"Deploy"**
2. Esperar a que termine el build (2-5 minutos)
3. Una vez completado, Vercel te dará una URL temporal: `gakal-web.vercel.app`

## Paso 5: Probar el Deploy

1. Abrir `https://gakal-web.vercel.app`
2. Verificar que la landing page carga correctamente
3. Probar login con un usuario de Supabase
4. Verificar que la autenticación funciona

## Paso 6: Configurar Dominio Personalizado

### 6.1 Agregar Dominio en Vercel

1. En el proyecto de Vercel, ir a **"Settings"** → **"Domains"**
2. Click en **"Add"**
3. Ingresar `gakal.com.ar`
4. Vercel te dará instrucciones de configuración DNS

### 6.2 Configurar DNS

En tu proveedor de dominio (ej: NIC Argentina), agregar:

**Opción A: CNAME (recomendado)**
```
CNAME  @  cname.vercel-dns.com
```

**Opción B: A Record**
```
A  @  76.76.21.21
```

### 6.3 Verificar Dominio

1. Esperar propagación DNS (5-30 minutos)
2. Vercel verificará automáticamente
3. Una vez verificado, Vercel emitirá certificado SSL automáticamente

## Paso 7: Configurar Webhook de Mercado Pago

1. Ir a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Ir a **"Tus integraciones"** → **"Webhooks"**
3. Click en **"Crear Webhook"**
4. Configurar:
   - **URL**: `https://gakal.com.ar/api/webhooks/mercadopago`
   - **Eventos**: Seleccionar todos los de `subscription_preapproval`
5. Guardar

### Probar el Webhook

```bash
# Usar curl para simular un evento
curl -X POST https://gakal.com.ar/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscription_preapproval",
    "action": "authorized",
    "data": {
      "id": "test-preapproval-id"
    }
  }'
```

Verificar logs en Vercel: **"Deployments"** → última deployment → **"Functions"** → logs

## Paso 8: Actualizar URLs en la App Móvil

En la app móvil de Gakal, actualizar las URLs para que apunten al portal web:

```typescript
// constants/urls.ts
export const PORTAL_WEB_URL = 'https://gakal.com.ar'
```

Cuando el usuario toque "Gestionar cuenta", abrir:
```typescript
Linking.openURL(`${PORTAL_WEB_URL}/login`)
```

## Paso 9: Testing en Producción

### 9.1 Flujo Completo de Pago

1. Desde la app móvil, tocar "Gestionar cuenta"
2. Debe abrir `https://gakal.com.ar/login` en el navegador
3. Login con usuario real
4. Seleccionar un plan (ej: Plata Mensual)
5. Completar pago en Mercado Pago
6. Verificar redirect a `/checkout/exito`
7. Volver a la app → verificar que el plan se actualizó

### 9.2 Verificar Base de Datos

En Supabase, verificar que:
- La suscripción se creó con estado `active`
- El perfil del usuario tiene `plan_id = 'plata'`
- El perfil tiene `suscripcion_activa_id` apuntando a la suscripción

### 9.3 Probar Cancelación

1. Ir a `https://gakal.com.ar/cuenta`
2. Click en "Cancelar Suscripción"
3. Confirmar
4. Verificar que el estado cambia a `cancelled`
5. Verificar que el plan sigue activo hasta la fecha de fin

## Paso 10: Monitoreo

### Logs en Vercel

- **Functions**: Ver logs de API routes y webhooks
- **Build Logs**: Ver errores de compilación
- **Analytics**: Ver tráfico y performance

### Logs en Supabase

- **Table Editor**: Verificar datos de suscripciones
- **SQL Editor**: Queries para analytics

```sql
-- Ver suscripciones activas
SELECT
  s.id,
  p.email,
  s.plan_id,
  s.estado,
  s.fecha_inicio,
  s.fecha_fin
FROM suscripciones s
JOIN perfiles p ON s.usuario_id = p.id
WHERE s.estado = 'active'
ORDER BY s.fecha_inicio DESC;
```

## Troubleshooting

### Error: Build Failed

**Causa**: Error de TypeScript o dependencias faltantes

**Solución**:
```bash
# Probar build localmente
npm run build

# Si funciona local, revisar variables de entorno en Vercel
```

### Error: Webhook no actualiza la suscripción

**Causa**: URL del webhook mal configurada o credenciales incorrectas

**Solución**:
1. Verificar URL en Mercado Pago: `https://gakal.com.ar/api/webhooks/mercadopago`
2. Verificar logs en Vercel → Functions
3. Probar webhook manualmente con curl

### Error: CORS al llamar API routes

**Causa**: Configuración incorrecta de dominios permitidos

**Solución**:
Agregar en `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://gakal.com.ar' },
      ],
    },
  ]
}
```

### Error: Infinite redirect loop en login

**Causa**: Problema con cookies de Supabase

**Solución**:
- Verificar que `middleware.ts` esté configurado correctamente
- Limpiar cookies del navegador
- Verificar que `NEXT_PUBLIC_APP_URL` esté bien configurado

## Rollback en Caso de Problemas

Si algo sale mal en producción:

1. Ir a Vercel → **"Deployments"**
2. Buscar el último deployment estable
3. Click en **"..."** → **"Promote to Production"**
4. Vercel revertirá automáticamente

## Checklist Final de Deploy

- [ ] Build exitoso en Vercel
- [ ] Dominio `gakal.com.ar` funcionando
- [ ] SSL certificado activo (🔒 en la barra del navegador)
- [ ] Login funciona correctamente
- [ ] Flujo de pago completo funciona
- [ ] Webhook de MP actualiza la DB
- [ ] Cancelación de suscripción funciona
- [ ] App móvil redirige correctamente al portal web
- [ ] Variables de entorno de producción configuradas
- [ ] Logs y monitoreo configurados

## Post-Deploy

1. **Monitorear logs** las primeras 24 horas
2. **Probar con usuarios reales** (beta testers)
3. **Configurar alertas** en Vercel para errores
4. **Documentar** cualquier problema y solución

## Soporte

Si tenés problemas durante el deploy, contactar a través de:
- GitHub Issues del proyecto
- Documentación de Vercel: https://vercel.com/docs
- Documentación de Mercado Pago: https://www.mercadopago.com.ar/developers
