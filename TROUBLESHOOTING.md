# Troubleshooting - Portal Web Gakal

Guía de solución de problemas comunes durante el desarrollo.

## 🔍 Verificación Inicial

### 1. Verificar que todas las dependencias estén instaladas

```bash
npm install
```

### 2. Verificar tipos TypeScript

```bash
npm run type-check
```

Si hay errores de tipos, revisar esta guía.

### 3. Verificar build

```bash
npm run build
```

## ⚠️ Errores Comunes y Soluciones

### Error: "formatDate is not exported from '@/types/plans'"

**Causa:** Import incorrecto de `formatDate`

**Solución:**
```typescript
// ❌ Incorrecto
import { formatDate } from '@/types/plans'

// ✅ Correcto
import { formatDate } from '@/lib/utils'
```

### Error: "Module not found: Can't resolve '@/...'"

**Causa:** Alias `@/` no configurado o tsconfig.json incorrecto

**Solución:** Verificar que `tsconfig.json` tenga:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Error: "Cannot find module 'mercadopago'"

**Causa:** Dependencia no instalada

**Solución:**
```bash
npm install mercadopago
```

### Error: "process.env.NEXT_PUBLIC_SUPABASE_URL is undefined"

**Causa:** Variables de entorno no configuradas

**Solución:**
1. Copiar `.env.example` a `.env.local`
2. Completar todas las variables

### Error: "Attempted import error: 'Card' is not exported from '@/components/ui/Card'"

**Causa:** Import incorrecto de componente Card

**Solución:**
```typescript
// ✅ Correcto (named import)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

// ❌ Incorrecto (default import)
import Card from '@/components/ui/Card'
```

### Error: "Hydration failed because the initial UI does not match..."

**Causa:** Diferencia entre renderizado del servidor y cliente, común con fechas

**Solución:** Usar `'use client'` en componentes que usen estados o fechas dinámicas

```typescript
'use client'

import { useState, useEffect } from 'react'
// ... resto del código
```

### Error: "Invalid hook call" en AuthGuard

**Causa:** Uso de hooks fuera de componente React o múltiples versiones de React

**Solución:**
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "CORS policy" al llamar API routes

**Causa:** Configuración de CORS incorrecta

**Solución:** Verificar que `next.config.js` permita el dominio correcto

### Error: Webhook de Mercado Pago no funciona en local

**Causa:** Localhost no es accesible desde internet

**Solución:** Usar ngrok
```bash
ngrok http 3000
# Configurar webhook URL: https://xxxx.ngrok.io/api/webhooks/mercadopago
```

### Error: "Module not found: Can't resolve 'lucide-react'"

**Causa:** Dependencia no instalada

**Solución:**
```bash
npm install lucide-react
```

## 🔧 Comandos de Diagnóstico

### Verificar estructura del proyecto

```bash
# Ver árbol de archivos
tree -L 3 -I 'node_modules'
```

### Verificar variables de entorno

```bash
# En desarrollo
npm run dev
# Revisar que no haya warnings de env vars
```

### Limpiar caché

```bash
# Limpiar .next
rm -rf .next

# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install
```

### Verificar imports

```bash
# Buscar imports problemáticos
grep -r "from '@/" --include="*.tsx" --include="*.ts"
```

## 📋 Checklist de Errores de Navegación

- [ ] Todas las rutas públicas cargan correctamente
- [ ] Rutas privadas redirigen a login si no hay auth
- [ ] Login funciona y redirige a /cuenta
- [ ] Logout limpia sesión y redirige a home
- [ ] Checkout redirige correctamente a Mercado Pago
- [ ] Páginas de éxito/error se muestran correctamente
- [ ] No hay errores 404 en rutas internas
- [ ] Todos los links funcionan (Header, Footer, botones)

## 🚨 Errores Críticos

### Error: "Authentication required" en todas las páginas

**Causa:** Middleware bloqueando rutas públicas

**Solución:** Verificar `matcher` en `middleware.ts`

### Error: Loop infinito en login

**Causa:** Redirect circular en AuthGuard

**Solución:** Verificar que `/login` NO esté dentro de rutas protegidas

### Error: Suscripción no se actualiza después del pago

**Pasos de diagnóstico:**
1. Verificar logs del webhook en Vercel/consola
2. Verificar que `mp_preapproval_id` coincida en DB
3. Verificar credenciales de MP en env vars
4. Probar webhook manualmente con curl

```bash
curl -X POST http://localhost:3000/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscription_preapproval",
    "action": "authorized",
    "data": { "id": "test-id" }
  }'
```

## 📚 Recursos Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Mercado Pago API](https://www.mercadopago.com.ar/developers)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 💡 Tips de Desarrollo

1. **Usar React DevTools** para debuggear componentes
2. **Usar Network tab** para ver requests a API routes
3. **Revisar console logs** tanto en navegador como en terminal
4. **Usar breakpoints** en VS Code para debuggear server-side
5. **Verificar Supabase logs** para errores de autenticación/DB

## 🆘 Obtener Ayuda

Si seguís teniendo problemas:

1. Revisar los logs completos del error
2. Buscar el error en GitHub Issues del proyecto
3. Verificar que todas las dependencias estén actualizadas
4. Revisar la documentación oficial de cada librería

## 📝 Reportar Bugs

Al reportar un bug, incluir:

- Mensaje de error completo
- Pasos para reproducir
- Versión de Node.js (`node -v`)
- Sistema operativo
- Variables de entorno configuradas (sin valores sensibles)
- Logs relevantes
