# 🚀 Deploy Rápido - Comandos Exactos

Guía ejecutiva para deployar el portal web de Gakal AHORA.

## ✅ Estado Actual

- [x] Código completo y listo
- [x] Commit inicial creado
- [x] Errores de navegación corregidos
- [x] Documentación completa

## 📋 Pasos Exactos

### 1. Push a GitHub

```bash
# Si NO tenés repositorio remoto configurado
git remote add origin https://github.com/TU_USUARIO/gakal-portal-web.git
git branch -M main
git push -u origin main

# Si YA tenés repositorio remoto
git push
```

### 2. Deploy en Vercel

#### Opción A: Desde la Web (Recomendado)

1. Ir a https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Seleccionar tu repositorio `gakal-portal-web`
4. Framework: **Next.js** (auto-detectado)
5. **NO hacer click en Deploy todavía**
6. Ir a **"Environment Variables"**
7. Agregar las siguientes variables:

**Variables de Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ...  (Solo Production)
```

**Variables de Mercado Pago TEST:**
```
MP_ACCESS_TOKEN = TEST-xxxx-xxxxxx-xxxx
MP_PUBLIC_KEY = TEST-xxxx-xxxx-xxxx
MP_WEBHOOK_SECRET = test-secret-123
```

**Variables de App:**
```
NEXT_PUBLIC_APP_URL = https://tu-app.vercel.app
NEXT_PUBLIC_PLAYSTORE_URL = https://play.google.com/store/apps/details?id=com.gakal.app
```

8. Click **"Deploy"**
9. Esperar 2-5 minutos ⏳

#### Opción B: Desde CLI

```bash
# 1. Instalar Vercel CLI (si no lo tenés)
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Seguir el asistente:
# - Set up and deploy? → Yes
# - Which scope? → Tu cuenta
# - Link to existing project? → No
# - Project name? → gakal-portal-web
# - Directory? → ./ (presionar Enter)
# - Override settings? → No

# 5. Agregar variables de entorno
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add MP_ACCESS_TOKEN production
vercel env add MP_PUBLIC_KEY production
vercel env add MP_WEBHOOK_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_PLAYSTORE_URL production

# 6. Deploy a producción
vercel --prod
```

### 3. Obtener Credenciales de Mercado Pago TEST

1. Ir a https://www.mercadopago.com.ar/developers
2. Login con tu cuenta de MP
3. Ir a **"Tus integraciones"**
4. Si no tenés app, crear una nueva
5. Ir a **"Credenciales"**
6. Seleccionar **"Credenciales de prueba"** (pestaña)
7. Copiar:
   - **Access Token de prueba**: `TEST-xxx...`
   - **Public Key de prueba**: `TEST-xxx...`

### 4. Configurar Webhook en Mercado Pago

1. En Mercado Pago Developers, ir a **"Webhooks"**
2. Click **"Crear webhook"**
3. URL: `https://TU-APP.vercel.app/api/webhooks/mercadopago`
4. Eventos: Seleccionar todos los de `subscription_preapproval`
5. Guardar

### 5. Actualizar Variable de Entorno en Vercel

La URL de tu app Vercel será algo como: `https://gakal-portal-web.vercel.app`

Actualizar en Vercel:
1. Ir a tu proyecto en Vercel
2. Settings → Environment Variables
3. Editar `NEXT_PUBLIC_APP_URL`
4. Cambiar a: `https://TU-APP.vercel.app`
5. Redeploy:
```bash
vercel --prod
```

### 6. Probar Todo

Ver la guía completa en **`TESTING-MERCADOPAGO.md`**

**Test rápido:**

1. Ir a `https://tu-app.vercel.app`
2. Navegar a `/login`
3. Crear usuario en Supabase:
   - Authentication → Add user
   - Email: `test@gakal.com`
   - Password: `Testing123!`
4. Crear perfil en tabla `perfiles`:
```sql
INSERT INTO perfiles (id, nombre, email, plan_id)
VALUES ('uuid-del-usuario', 'Test User', 'test@gakal.com', 'free');
```
5. Login en el portal web
6. Ir a `/planes` → Seleccionar Plata
7. En checkout, click "Pagar con MP"
8. Usar tarjeta de test:
   - Número: `4509 9535 6623 3704`
   - CVV: `123`
   - Fecha: `11/25`
   - Nombre: **`APRO`** (importante!)
9. Completar pago
10. Verificar redirect a `/checkout/exito`
11. Volver a `/cuenta` → debería ver plan Plata activo

## 🎯 Checklist Pre-Deploy

Antes de hacer push y deploy, verificar:

- [x] ✅ Código commiteado
- [ ] GitHub repository creado
- [ ] Credenciales de Supabase listas
- [ ] Cuenta de Mercado Pago Developers lista
- [ ] Cuenta de Vercel lista

## 🎯 Checklist Post-Deploy

Después del deploy, verificar:

- [ ] App carga en Vercel URL
- [ ] Login funciona
- [ ] Selección de plan funciona
- [ ] Redirect a Mercado Pago funciona
- [ ] Pago de test se aprueba
- [ ] Webhook actualiza la DB
- [ ] Usuario ve plan activo

## 📊 URLs Importantes

Después del deploy tendrás:

| Servicio | URL |
|----------|-----|
| App Web | `https://tu-app.vercel.app` |
| Dashboard Vercel | `https://vercel.com/tu-usuario/gakal-portal-web` |
| Logs Vercel | `https://vercel.com/tu-usuario/gakal-portal-web/deployments` |
| Supabase Dashboard | `https://supabase.com/dashboard/project/xxx` |
| MP Developers | `https://www.mercadopago.com.ar/developers` |

## 🆘 Si Algo Sale Mal

### Build falla en Vercel

```bash
# Probar build local
npm run build

# Si funciona local, revisar env vars en Vercel
```

### Webhook no funciona

1. Verificar URL en MP: `https://tu-app.vercel.app/api/webhooks/mercadopago`
2. Ver logs en Vercel → Functions
3. Probar manualmente:
```bash
curl -X POST https://tu-app.vercel.app/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{"type":"subscription_preapproval","action":"authorized","data":{"id":"test"}}'
```

### Error 401 Unauthorized

1. Verificar que variables de Supabase estén bien
2. Verificar que usuario exista en tabla `perfiles`
3. Limpiar cookies y volver a loguear

## 📚 Documentación Completa

- `README.md` - Documentación general
- `DEPLOY.md` - Deploy detallado en Vercel
- `TESTING-MERCADOPAGO.md` - Testing completo con MP
- `QUICKSTART.md` - Inicio rápido local
- `TROUBLESHOOTING.md` - Solución de problemas

## 🎉 Siguiente Nivel

Cuando el testing funcione correctamente:

1. Migrar a credenciales de **producción** de MP
2. Configurar dominio custom `gakal.com.ar`
3. Actualizar webhook a URL de producción
4. Probar con tarjeta real (monto bajo)
5. ¡Lanzar! 🚀

---

**¿Listo para deployar? Empezá con el paso 1 y seguí la guía! 💪**
