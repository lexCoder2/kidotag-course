import fs from "fs";

const write = (path, content) => {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(path, content, "utf8");
  console.log("✅", path);
};

const base = "src/lessons";

// ── 08-fetch-api ──────────────────────────────────────────────────────────────
write(
  `${base}/web-api/08-fetch-api.mdx`,
  `# fetch API: peticiones HTTP desde React

\`fetch\` es la API nativa del navegador para hacer peticiones HTTP. En el web de
kidotag10 se usa para comunicarse con la API REST.

## fetch básico

\`\`\`javascript
// GET — obtener datos
const res = await fetch('http://localhost:4000/api/alumnos');
const json = await res.json();
console.log(json); // { ok: true, data: [...] }

// POST — enviar datos
const res = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, rol }),
});
const json = await res.json();
\`\`\`

<Callout variante="warning" titulo="fetch NO lanza error en 4xx/5xx">
  A diferencia de axios, \`fetch\` solo lanza un error de red (sin conexión).
  Un 401 o 404 llega como una respuesta exitosa desde el punto de vista de
  la Promise. Siempre debes revisar \`res.ok\` o \`res.status\`.
</Callout>

## Manejo correcto de errores

\`\`\`javascript
async function loginApi(email, password, rol) {
  const res = await fetch(\`\${import.meta.env.VITE_API_URL}/auth/login\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, rol }),
  });

  const json = await res.json(); // siempre parsear, incluso en errores

  if (!res.ok) {
    // El servidor devolvió 4xx o 5xx
    throw new Error(json.error || 'Error del servidor');
  }

  return json.data; // { token, usuario }
}

// Uso:
try {
  const { token, usuario } = await loginApi(email, password, 'profesor');
  localStorage.setItem('token', token);
} catch (err) {
  setError(err.message); // mostrar al usuario
}
\`\`\`

## Anatomía de la respuesta

\`\`\`javascript
const res = await fetch(url);

// res es un objeto Response
res.ok        // true si status 200-299
res.status    // 200, 401, 404, 500...
res.statusText // "OK", "Unauthorized"...

// Métodos para leer el body (solo se pueden llamar UNA vez):
await res.json()  // → objeto JavaScript
await res.text()  // → string
await res.blob()  // → Blob (para archivos/imágenes)
\`\`\`

<Quiz
  preguntas={[
    {
      pregunta: "Si el servidor devuelve 401 Unauthorized, ¿qué sucede con la Promise de fetch?",
      opciones: [
        { texto: "La Promise se rechaza (throw) automáticamente con un error de autenticación" },
        { texto: "La Promise se resuelve con el objeto Response — res.ok será false y res.status será 401", correcta: true },
        { texto: "fetch redirige automáticamente al login" },
        { texto: "fetch intenta la petición de nuevo" },
      ],
      explicacion: "fetch solo rechaza la Promise por errores de red (sin conexión, CORS, DNS). Los códigos de estado HTTP — incluyendo errores 4xx y 5xx — llegan como respuestas normales. Por eso siempre hay que revisar res.ok.",
    },
  ]}
/>
`,
);

// ── 08-bearer-token ───────────────────────────────────────────────────────────
write(
  `${base}/web-api/08-bearer-token.mdx`,
  `# Peticiones autenticadas con Bearer token

Los endpoints protegidos de kidotag10 requieren el JWT en el header
\`Authorization: Bearer <token>\`.

## Cómo añadir el token a fetch

\`\`\`javascript
const token = localStorage.getItem('token');

const res = await fetch(\`\${BASE_URL}/alumnos\`, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`,   // ← el header clave
  },
});
\`\`\`

## Función helper: fetchAuth

\`\`\`javascript
// src/utils/fetchAuth.js (kidotag10 web)
const BASE = import.meta.env.VITE_API_URL;

async function fetchAuth(path, options = {}) {
  const token = localStorage.getItem('token');

  const res = await fetch(\`\${BASE}\${path}\`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: \`Bearer \${token}\` }),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // Token expirado — limpiar sesión
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error del servidor');
  return json.data;
}

// Uso:
const alumnos = await fetchAuth('/alumnos');
const nuevo   = await fetchAuth('/alumnos', {
  method: 'POST',
  body: JSON.stringify({ nombre: 'Ana García' }),
});
\`\`\`

## ¿Por qué 401 redirige al login?

\`\`\`
Token JWT expirado → servidor devuelve 401
fetchAuth detecta 401 → localStorage.removeItem('token')
fetchAuth redirige a /login
Usuario inicia sesión de nuevo → nuevo token de 7 días
\`\`\`

<Callout variante="info" titulo="Bearer vs Cookie">
  kidotag10 usa Bearer en \`localStorage\` por simplicidad. En apps
  de mayor seguridad, se usarían cookies HttpOnly (que no son accesibles
  via JavaScript). Ver la lección de almacenamiento de tokens en el módulo JWT.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Cuál es el formato correcto del header de autorización en kidotag10?",
      opciones: [
        { texto: "Authorization: JWT eyJhbGci..." },
        { texto: "Authorization: Bearer eyJhbGci...", correcta: true },
        { texto: "X-Auth-Token: eyJhbGci..." },
        { texto: "Token: Bearer eyJhbGci..." },
      ],
      explicacion: "El estándar Bearer Token (RFC 6750) define el formato 'Authorization: Bearer <token>'. El backend de kidotag10 extrae el token haciendo req.headers.authorization.split(' ')[1] — espera exactamente ese formato.",
    },
  ]}
/>
`,
);

// ── 08-api-config ─────────────────────────────────────────────────────────────
write(
  `${base}/web-api/08-api-config.mdx`,
  `# Módulo de configuración de la API

En lugar de escribir la URL base en cada componente, kidotag10 centraliza
la configuración de la API en un módulo dedicado.

## Qué es VITE_API_URL

\`\`\`bash
# web/.env
VITE_API_URL=http://localhost:4000/api
\`\`\`

\`\`\`bash
# web/.env.production
VITE_API_URL=https://api.kidotag.mx/api
\`\`\`

Solo las variables con prefijo \`VITE_\` están disponibles en el navegador.
Vite las embebe en el bundle en build time (no en runtime).

## El módulo src/config/api.js

\`\`\`javascript
// web/src/config/api.js de kidotag10
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const API_ENDPOINTS = {
  LOGIN:       \`\${BASE_URL}/auth/login\`,
  ALUMNOS:     \`\${BASE_URL}/alumnos\`,
  GRUPOS:      \`\${BASE_URL}/grupos\`,
  ASISTENCIAS: \`\${BASE_URL}/asistencias\`,
  ANUNCIOS:    \`\${BASE_URL}/anuncios\`,
  TUTORES:     \`\${BASE_URL}/tutores\`,
  MENSAJES:    \`\${BASE_URL}/mensajes\`,
};

export default BASE_URL;
\`\`\`

\`\`\`javascript
// Uso en un componente:
import { API_ENDPOINTS } from '../config/api';

const res = await fetch(API_ENDPOINTS.ALUMNOS, {
  headers: { Authorization: \`Bearer \${token}\` },
});
\`\`\`

## Ventajas de centralizar la URL

\`\`\`
Sin centralizar:
  Dashboard.jsx:   fetch('http://localhost:4000/api/alumnos')
  Grupos.jsx:      fetch('http://localhost:4000/api/grupos')
  Asistencias.jsx: fetch('http://localhost:4000/api/asistencias')
  → Al cambiar de localhost a producción: editar 20+ archivos

Con centralizar:
  .env:            VITE_API_URL=https://api.kidotag.mx/api
  → Cambiar un solo valor → todo actualizado
\`\`\`

<Callout variante="warning" titulo="VITE_ solo es en Vite (web de kidotag10)">
  En Create React App, el prefijo es \`REACT_APP_\`. En Next.js es \`NEXT_PUBLIC_\`.
  En Vite es \`VITE_\`. Siempre revisar la documentación del bundler que uses.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué las variables de entorno en Vite necesitan el prefijo VITE_?",
      opciones: [
        { texto: "Por convención estética del equipo de Vite" },
        { texto: "Vite solo expone al código del navegador las variables con prefijo VITE_ — las demás quedan solo en el servidor de build, evitando filtrar secrets", correcta: true },
        { texto: "Sin el prefijo, Node.js no puede leer las variables" },
        { texto: "Es un requisito del ECMAScript" },
      ],
      explicacion: "Las variables sin VITE_ (como DATABASE_URL o JWT_SECRET) no deben llegar al navegador — serían visibles en el bundle para cualquiera que abra DevTools. Vite filtra explícitamente para evitar fugas accidentales.",
    },
  ]}
/>
`,
);

// ── 08-polling-descarga ───────────────────────────────────────────────────────
write(
  `${base}/web-api/08-polling-descarga.mdx`,
  `# Polling manual y descarga de archivos (Excel)

kidotag10 permite exportar reportes de asistencia como archivos Excel.
En el frontend, esto requiere manejar respuestas binarias (\`Blob\`).

## Descarga de archivos con fetch + Blob

\`\`\`javascript
// web/src/utils/descargarReporte.js
async function descargarReporteExcel(grupoId, fecha) {
  const token = localStorage.getItem('token');

  const res = await fetch(
    \`\${API_URL}/asistencias/reporte?grupoId=\${grupoId}&fecha=\${fecha}\`,
    { headers: { Authorization: \`Bearer \${token}\` } }
  );

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error);
  }

  // Respuesta binaria — no llamar .json()
  const blob = await res.blob();

  // Crear URL temporal y simular un clic en un enlace <a>
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = \`asistencias-\${fecha}.xlsx\`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Liberar la URL temporal de memoria
  URL.revokeObjectURL(url);
}
\`\`\`

## Polling: verificar estado periódicamente

Aunque kidotag10 usa Socket.IO para tiempo real, hay casos donde un simple
polling es suficiente (ej: verificar si el servidor está disponible):

\`\`\`javascript
// Polling con setInterval + cleanup en React
import { useEffect } from 'react';

function useServerStatus(url) {
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(url);
        setOnline(res.ok);
      } catch {
        setOnline(false);
      }
    };

    check(); // primera vez inmediatamente
    const id = setInterval(check, 30_000); // cada 30 segundos

    return () => clearInterval(id); // cleanup al desmontar
  }, [url]);
}
\`\`\`

<Callout variante="warning" titulo="Libera siempre la URL del Blob">
  \`URL.createObjectURL(blob)\` crea una referencia al Blob en memoria del
  navegador. Si no llamas a \`URL.revokeObjectURL(url)\`, esa memoria
  nunca se libera hasta cerrar la pestaña.
</Callout>

## El backend: xlsx genera el archivo

\`\`\`javascript
// src/controllers/asistencia.controller.js
const xlsx = require('xlsx');

async function descargarReporte(req, res) {
  const asistencias = await Asistencia.find({ /* filtros */ })
    .populate('alumno', 'nombre');

  const filas = asistencias.map(a => ({
    Alumno:  a.alumno.nombre,
    Fecha:   a.fecha.toLocaleDateString('es-MX'),
    Estado:  a.presente ? 'Presente' : 'Ausente',
  }));

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(filas);
  xlsx.utils.book_append_sheet(wb, ws, 'Asistencias');

  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition',
    'attachment; filename="reporte.xlsx"');
  res.send(buffer);
}
\`\`\`

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué al descargar el Excel NO se debe llamar res.json() en el frontend?",
      opciones: [
        { texto: "Porque res.json() solo funciona con arrays" },
        { texto: "Porque el servidor envía un buffer binario (xlsx), no JSON — llamar .json() intentaría parsear bytes binarios como texto JSON y fallaría", correcta: true },
        { texto: "Porque los navegadores bloquean .json() en descargas" },
        { texto: "Por razones de seguridad de CORS" },
      ],
      explicacion: "El servidor envía bytes binarios del archivo Excel con Content-Type application/vnd.openxmlformats... — no JSON. Se debe usar .blob() para obtener los datos binarios y luego crear una URL temporal para la descarga.",
    },
  ]}
/>
`,
);

// ── 08-abortsignal-timeout ────────────────────────────────────────────────────
write(
  `${base}/web-api/08-abortsignal-timeout.mdx`,
  `# AbortController: cancelar peticiones

Si el usuario navega a otra página mientras una petición está en curso,
React puede intentar actualizar un componente ya desmontado — causando
el clásico warning "Can't perform a React state update on an unmounted component".

## AbortController básico

\`\`\`javascript
const controller = new AbortController();

// Pasar el signal a fetch
const res = await fetch(url, {
  signal: controller.signal,
});

// Cancelar la petición
controller.abort(); // ← fetch lanza un AbortError
\`\`\`

## Patrón useEffect + AbortController

\`\`\`javascript
import { useEffect, useState } from 'react';

function useAlumnos(grupoId) {
  const [alumnos, setAlumnos]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function cargar() {
      try {
        setLoading(true);
        const res = await fetch(
          \`\${API_URL}/alumnos?grupo=\${grupoId}\`,
          {
            headers: { Authorization: \`Bearer \${localStorage.getItem('token')}\` },
            signal: controller.signal,  // ← asociar el signal
          }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setAlumnos(json.data);
      } catch (err) {
        if (err.name === 'AbortError') return; // ← ignorar la cancelación
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    cargar();

    // Cleanup: cancelar si el componente se desmonta o grupoId cambia
    return () => controller.abort();
  }, [grupoId]);

  return { alumnos, loading, error };
}
\`\`\`

## Timeout con AbortSignal.timeout()

En navegadores modernos, puedes crear un signal de timeout sin AbortController:

\`\`\`javascript
// Abortar automáticamente si tarda más de 5 segundos
const res = await fetch(url, {
  signal: AbortSignal.timeout(5000),
  headers: { Authorization: \`Bearer \${token}\` },
});
\`\`\`

## Resumen de patrones de fetch en kidotag10

| Patrón | Cuándo usarlo |
|--------|---------------|
| \`fetch\` básico | Peticiones simples sin cleanup |
| \`fetchAuth\` helper | Cualquier endpoint protegido |
| \`AbortController\` + \`useEffect\` | Carga de datos en componentes |
| \`res.blob()\` | Descargar archivos (Excel) |
| \`AbortSignal.timeout()\` | Límite de tiempo global |

<Callout variante="tip" titulo="React Query / TanStack Query — la alternativa">
  Las librerías como TanStack Query manejan automáticamente el AbortController,
  caché, revalidación y estados de carga. kidotag10 usa fetch nativo para
  no añadir dependencias, pero en proyectos más grandes React Query es la
  elección estándar.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué el catch no debe mostrar un error al usuario cuando err.name === 'AbortError'?",
      opciones: [
        { texto: "Porque AbortError no contiene un mensaje de error" },
        { texto: "Porque el AbortError es intencional — nosotros cancelamos la petición al desmontar el componente, no es un error real del servidor ni de red", correcta: true },
        { texto: "Porque los AbortErrors son errores del navegador, no de la app" },
        { texto: "Porque al componente estar desmontado, no se puede llamar setState" },
      ],
      explicacion: "Cuando el cleanup del useEffect llama a controller.abort(), fetch lanza un AbortError. Ese error es esperado y controlado — el componente se desmontó, no hay nada que mostrar. Solo se deben mostrar errores reales (red, servidor, auth).",
    },
  ]}
/>
`,
);

console.log("\n✅ Lecciones web-api escritas.");
