# Quick Start - Portal Web Gakal

Guía rápida para levantar el proyecto en 5 minutos.

## 1. Instalar dependencias

```bash
npm install
```

## 2. Configurar variables de entorno

Copiar `.env.example` a `.env.local` y completar:

```env
# Supabase (obtener de tu proyecto en supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Mercado Pago (usar credenciales de TEST para desarrollo)
MP_ACCESS_TOKEN=TEST-xxx
MP_PUBLIC_KEY=TEST-xxx
MP_WEBHOOK_SECRET=test-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PLAYSTORE_URL=https://play.google.com/store/apps/details?id=com.gakal.app
```

## 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 4. Crear usuario de prueba en Supabase

Si no tenés usuarios, crear uno manualmente en Supabase:

1. Ir a Authentication → Users
2. Click "Add User"
3. Ingresar email y contraseña
4. Ir a Table Editor → `perfiles`
5. Insertar un registro:
   ```sql
   INSERT INTO perfiles (id, nombre, email, plan_id)
   VALUES (
     'uuid-del-usuario-creado',
     'Usuario Test',
     'test@gakal.com',
     'free'
   );
   ```

## 5. Probar el flujo

### Login
1. Ir a http://localhost:3000/login
2. Ingresar email/contraseña del usuario de prueba
3. Debería redirigir a http://localhost:3000/cuenta

### Ver planes
1. Ir a http://localhost:3000/planes
2. Seleccionar un plan (ej: Plata)
3. Debería redirigir a checkout

### Checkout (modo test)
1. En checkout, click "Pagar con Mercado Pago"
2. Se creará un preapproval en Mercado Pago Sandbox
3. Completar pago con tarjeta de prueba

**Tarjetas de prueba de Mercado Pago:**
- Visa: 4509 9535 6623 3704
- Mastercard: 5031 7557 3453 0604
- CVV: 123
- Vencimiento: cualquier fecha futura
- Nombre: TEST

## Comandos útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción local
npm run start

# Linter
npm run lint

# Type check
npm run type-check
```

## Estructura de URLs

- `/` - Landing page
- `/planes` - Comparación de planes
- `/login` - Login
- `/cuenta` - Dashboard (requiere auth)
- `/checkout/[planId]` - Checkout (requiere auth)
- `/checkout/exito` - Pago exitoso
- `/checkout/error` - Error en pago
- `/cuenta/cancelar` - Cancelar suscripción
- `/terminos` - Términos y condiciones
- `/privacidad` - Política de privacidad

## API Routes

- `POST /api/suscripcion/crear` - Crear suscripción
- `POST /api/suscripcion/cancelar` - Cancelar suscripción
- `GET /api/suscripcion/estado` - Estado de suscripción
- `POST /api/webhooks/mercadopago` - Webhook de MP

## Testing con ngrok (webhooks locales)

```bash
# 1. Instalar ngrok
npm install -g ngrok

# 2. Exponer puerto 3000
ngrok http 3000

# 3. Configurar webhook en Mercado Pago
# URL: https://xxxx.ngrok.io/api/webhooks/mercadopago
```

## Próximos pasos

- Ver [README.md](./README.md) para documentación completa
- Ver [DEPLOY.md](./DEPLOY.md) para instrucciones de deploy en Vercel
- Revisar código en `app/` para entender la estructura

## Troubleshooting rápido

**Error: "No autorizado" al hacer login**
- Verificar que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctos

**Error: "Plan inválido" en checkout**
- Verificar que exista el plan en la tabla `planes` de Supabase

**Webhook no funciona en local**
- Usar ngrok para exponer localhost
- Configurar la URL de ngrok en Mercado Pago

**Build falla con errores de TypeScript**
- Ejecutar `npm run type-check` para ver errores específicos
- Verificar que todas las dependencias estén instaladas
