# Documentos Legales para Web - Gakal

Este directorio contiene los documentos legales de Gakal en formatos exportables para usar en el sitio web.

## 📄 Archivos Disponibles

### JSON (Para APIs y Aplicaciones Web)

1. **terminos-condiciones.json**
   - Términos y Condiciones completos en formato JSON
   - Versión: 1.0
   - Fecha: 2026-01-21

2. **politica-privacidad.json**
   - Política de Privacidad completa en formato JSON
   - Versión: 1.0
   - Legislación: Ley 25.326 (Argentina)

## 🚀 Uso en Sitio Web

### Opción 1: Renderizar desde JSON (React/Next.js)

```javascript
import terminosData from './terminos-condiciones.json';

function TerminosPage() {
  return (
    <div>
      <h1>{terminosData.documento}</h1>
      <p>Versión {terminosData.version} - {terminosData.fecha_actualizacion}</p>

      {terminosData.secciones.map((seccion) => (
        <section key={seccion.numero}>
          <h2>{seccion.numero}. {seccion.titulo}</h2>
          {seccion.contenido.map((parrafo, idx) => (
            <p key={idx}>{parrafo}</p>
          ))}
        </section>
      ))}

      <div className="aviso">
        {terminosData.aviso_importante}
      </div>

      <footer>
        <p>Contacto: {terminosData.contacto.email}</p>
      </footer>
    </div>
  );
}
```

### Opción 2: Endpoint API

Crear endpoint en tu backend para servir los JSON:

```javascript
// /api/legal/terminos
export default function handler(req, res) {
  const terminos = require('./terminos-condiciones.json');
  res.status(200).json(terminos);
}

// /api/legal/privacidad
export default function handler(req, res) {
  const privacidad = require('./politica-privacidad.json');
  res.status(200).json(privacidad);
}
```

Consumir desde frontend:

```javascript
const response = await fetch('/api/legal/terminos');
const terminos = await response.json();
```

### Opción 3: HTML Estático

Generar HTML estático desde los JSON usando un script de build:

```javascript
const fs = require('fs');
const terminos = require('./terminos-condiciones.json');

let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${terminos.documento} - ${terminos.empresa}</title>
</head>
<body>
  <h1>${terminos.documento}</h1>
  <p>Versión ${terminos.version} - ${terminos.fecha_actualizacion}</p>
`;

terminos.secciones.forEach(seccion => {
  html += `<section>
    <h2>${seccion.numero}. ${seccion.titulo}</h2>`;

  seccion.contenido.forEach(parrafo => {
    html += `<p>${parrafo}</p>`;
  });

  html += `</section>`;
});

html += `
  <div class="aviso">
    <p><strong>Importante:</strong> ${terminos.aviso_importante}</p>
  </div>
  <footer>
    <p>Contacto: <a href="mailto:${terminos.contacto.email}">${terminos.contacto.email}</a></p>
  </footer>
</body>
</html>`;

fs.writeFileSync('./public/terminos-condiciones.html', html);
```

## 📋 Formulario de Registro con Aceptación

### Ejemplo React con Checkbox

```jsx
import { useState } from 'react';

function RegistroForm() {
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [aceptoPrivacidad, setAceptoPrivacidad] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!aceptoTerminos || !aceptoPrivacidad) {
      alert('Debes aceptar los Términos y la Política de Privacidad');
      return;
    }

    // Enviar datos al backend incluyendo:
    const registroData = {
      email: '...',
      password: '...',
      terminos_aceptados: true,
      terminos_version_aceptada: '1.0',
      terminos_fecha_aceptacion: new Date().toISOString(),
      terminos_ip_aceptacion: userIP, // Obtener IP del usuario
    };

    // POST a /api/auth/register
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}

      <div className="legal-checkboxes">
        <label>
          <input
            type="checkbox"
            checked={aceptoTerminos}
            onChange={(e) => setAceptoTerminos(e.target.checked)}
            required
          />
          He leído y acepto los{' '}
          <a href="/terminos-condiciones" target="_blank">
            Términos y Condiciones
          </a>
        </label>

        <label>
          <input
            type="checkbox"
            checked={aceptoPrivacidad}
            onChange={(e) => setAceptoPrivacidad(e.target.checked)}
            required
          />
          He leído y acepto la{' '}
          <a href="/politica-privacidad" target="_blank">
            Política de Privacidad
          </a>
        </label>

        <p className="legal-notice">
          Entiendo que mis datos serán tratados conforme a la Ley 25.326 de
          Protección de Datos Personales de Argentina.
        </p>
      </div>

      <button type="submit" disabled={!aceptoTerminos || !aceptoPrivacidad}>
        Registrarse
      </button>
    </form>
  );
}
```

## 🔒 Almacenar Aceptación en Base de Datos

### Schema Supabase

```sql
-- Ya está implementado en la migración 20240101000027_terminos_condiciones.sql

-- Campos en tabla perfiles:
terminos_aceptados          BOOLEAN      -- Si aceptó
terminos_fecha_aceptacion   TIMESTAMPTZ  -- Cuándo aceptó
terminos_ip_aceptacion      TEXT         -- IP (opcional)
terminos_version_aceptada   TEXT         -- Versión (ej: "1.0")
```

### Endpoint de Registro (Backend)

```javascript
// POST /api/auth/register
export default async function handler(req, res) {
  const { email, password, nombre, terminos_aceptados, ip } = req.body;

  // Validar que aceptó términos
  if (!terminos_aceptados) {
    return res.status(400).json({
      error: 'Debes aceptar los Términos y Condiciones'
    });
  }

  // Crear usuario en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre }
    }
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  // Actualizar perfil con aceptación de términos
  const { error: profileError } = await supabase
    .from('perfiles')
    .update({
      terminos_aceptados: true,
      terminos_fecha_aceptacion: new Date().toISOString(),
      terminos_ip_aceptacion: ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      terminos_version_aceptada: '1.0',
    })
    .eq('id', authData.user.id);

  if (profileError) {
    console.error('Error al actualizar perfil:', profileError);
  }

  return res.status(200).json({
    success: true,
    user: authData.user
  });
}
```

## 🌐 SEO y Metadatos

### Next.js Metadata

```javascript
// app/terminos-condiciones/page.tsx
export const metadata = {
  title: 'Términos y Condiciones | Gakal',
  description: 'Términos y Condiciones de uso de Gakal, aplicación de registro nutricional con gamificación. Legislación argentina.',
  openGraph: {
    title: 'Términos y Condiciones | Gakal',
    description: 'Lee los términos completos de Gakal',
    url: 'https://gakal.app/terminos-condiciones',
  },
};
```

```javascript
// app/politica-privacidad/page.tsx
export const metadata = {
  title: 'Política de Privacidad | Gakal',
  description: 'Política de Privacidad de Gakal conforme a Ley 25.326 de Protección de Datos Personales de Argentina.',
  openGraph: {
    title: 'Política de Privacidad | Gakal',
    description: 'Conocé cómo protegemos tus datos personales',
    url: 'https://gakal.app/politica-privacidad',
  },
};
```

## 📱 Integración con App Móvil

Cuando el usuario se registra desde la web:

1. **Aceptación en web** → Se guarda en BD con IP y timestamp
2. **Usuario abre app móvil** → Login automático o manual
3. **App verifica** `terminos_aceptados = true` en perfil
4. **Si ya aceptó en web** → No se muestra onboarding de términos
5. **Si no aceptó** → Se muestra paso 0 del onboarding

### Validación en App Móvil

```typescript
// hooks/useAuth.ts (ya implementado)
const verificarTerminosAceptados = async () => {
  if (!user) return false;

  const { data } = await supabase
    .from('perfiles')
    .select('terminos_aceptados')
    .eq('id', user.id)
    .single();

  return data?.terminos_aceptados ?? false;
};
```

## 🔄 Versionado

Cuando actualices los términos:

1. **Cambiar versión** en JSON: `"version": "2.0"`
2. **Actualizar fecha**: `"fecha_actualizacion": "2026-06-15"`
3. **Notificar usuarios** con 10 días de anticipación
4. **Opcional:** Forzar re-aceptación comparando `terminos_version_aceptada` del usuario

## 📧 Notificación de Cambios

```javascript
// Cuando actualizas términos a v2.0
async function notificarCambiosTerminos() {
  // Obtener usuarios que aceptaron versión antigua
  const { data: usuarios } = await supabase
    .from('perfiles')
    .select('id, email, terminos_version_aceptada')
    .neq('terminos_version_aceptada', '2.0'); // Versión nueva

  // Enviar email a cada usuario
  for (const usuario of usuarios) {
    await enviarEmail({
      to: usuario.email,
      subject: 'Actualización de Términos y Condiciones - Gakal',
      body: `
        Hola,

        Te informamos que hemos actualizado nuestros Términos y Condiciones.
        Los cambios entrarán en vigor el XX/XX/XXXX.

        Podés leer la nueva versión en: https://gakal.app/terminos-condiciones

        Al continuar usando Gakal, aceptás los nuevos términos.

        Saludos,
        Equipo Gakal
      `
    });
  }
}
```

## ✅ Checklist de Implementación Web

- [ ] Copiar archivos JSON al proyecto web
- [ ] Crear rutas `/terminos-condiciones` y `/politica-privacidad`
- [ ] Renderizar documentos desde JSON
- [ ] Agregar checkboxes en formulario de registro
- [ ] Validar aceptación antes de crear usuario
- [ ] Guardar `terminos_aceptados`, `fecha`, `version` e `ip` en BD
- [ ] Agregar enlaces en footer del sitio
- [ ] Configurar metadatos SEO
- [ ] Testing de flujo completo de registro
- [ ] Verificar que app móvil detecta aceptación desde web

## 📞 Soporte

Para consultas sobre implementación:
- Email: soporte@gakal.app
- Documentación completa: `/Documentacion/SISTEMA-TERMINOS-CONDICIONES.md`

---

**Gakal** • Documentos Legales v1.0 • Argentina 2026
