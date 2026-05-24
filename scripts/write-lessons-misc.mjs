import fs from "fs";

const write = (path, content) => {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(path, content, "utf8");
  console.log("✅", path);
};

const base = "src/lessons";

// ── 01-respuestas-errores ─────────────────────────────────────────────────────
write(
  `${base}/backend-express/01-respuestas-errores.mdx`,
  `# Respuestas HTTP y manejo de errores

El backend de kidotag10 sigue un patrón consistente para respuestas y errores.

## Códigos de estado HTTP más usados en kidotag10

| Código | Significado | Cuándo kidotag10 lo usa |
|--------|-------------|------------------------|
| 200 | OK | GET, PUT, PATCH exitosos |
| 201 | Created | POST que crea un recurso |
| 400 | Bad Request | Campos requeridos faltantes |
| 401 | Unauthorized | Token ausente, inválido o expirado |
| 403 | Forbidden | Token válido pero sin permiso (rol) |
| 404 | Not Found | Recurso no existe en BD |
| 500 | Server Error | Error inesperado del servidor |

## Patrón de respuesta de kidotag10

\`\`\`javascript
// ✅ Siempre: { ok, data } en éxito o { ok, error } en error

// Éxito:
res.status(200).json({ ok: true, data: alumnos });
res.status(201).json({ ok: true, data: nuevoAlumno });

// Error de cliente (4xx):
res.status(400).json({ ok: false, error: 'EMAIL_REQUERIDO' });
res.status(401).json({ ok: false, error: 'TOKEN_INVALIDO' });
res.status(403).json({ ok: false, error: 'SIN_PERMISO' });
res.status(404).json({ ok: false, error: 'ALUMNO_NO_ENCONTRADO' });

// Error de servidor (5xx):
res.status(500).json({ ok: false, error: 'ERROR_INTERNO' });
\`\`\`

## Middleware de errores global

\`\`\`javascript
// src/app.js de kidotag10
// Debe ir DESPUÉS de todas las rutas

app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  // Errores de Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      ok: false,
      error: 'VALIDACION_FALLIDA',
      detalles: Object.values(err.errors).map(e => e.message),
    });
  }

  if (err.code === 11000) {
    // Error de duplicado (índice único violado)
    return res.status(409).json({
      ok: false,
      error: 'DUPLICADO',
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    ok: false,
    error: err.message || 'ERROR_INTERNO',
  });
});
\`\`\`

## Try/catch en controladores

\`\`\`javascript
// Patrón estándar en todos los controladores de kidotag10
async function listarAlumnos(req, res, next) {
  try {
    const alumnos = await Alumno.find({ escuela: req.usuario.escuelaId })
      .populate('tutor', 'nombre email')
      .lean();

    res.json({ ok: true, data: alumnos });
  } catch (err) {
    next(err); // ← pasar al middleware de errores global
  }
}
\`\`\`

<Callout variante="tip" titulo="Usa códigos de error en string, no mensajes libres">
  Devolver \`{ error: 'TOKEN_EXPIRADO' }\` en lugar de \`{ error: 'El token ha expirado' }\`
  permite al frontend hacer lógica exacta: \`if (json.error === 'TOKEN_EXPIRADO')\`.
  Los mensajes en lenguaje natural son inconsistentes y difíciles de manejar programáticamente.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Cuál es la diferencia entre HTTP 401 y 403?",
      opciones: [
        { texto: "Son equivalentes — ambos significan error de autenticación" },
        { texto: "401 = No autenticado (token ausente/inválido/expirado); 403 = Autenticado pero sin permiso (token válido pero el rol no tiene acceso)", correcta: true },
        { texto: "401 = Error del servidor; 403 = Error del cliente" },
        { texto: "401 es para REST; 403 es para WebSockets" },
      ],
      explicacion: "En kidotag10: un tutor con token válido que intenta acceder a /api/alumnos (solo para profesores) recibe 403 — está autenticado pero no autorizado. Un usuario sin token (o con token expirado) recibe 401.",
    },
  ]}
/>
`,
);

// ── 09-css-variables ──────────────────────────────────────────────────────────
write(
  `${base}/estilos-ux/09-css-variables.mdx`,
  `# CSS Variables: el sistema de diseño

kidotag10 usa variables CSS personalizadas para definir colores, espaciado y
tipografía de manera consistente en toda la aplicación.

## Definir variables en :root

\`\`\`css
/* src/App.css o index.css de kidotag10 web */
:root {
  /* ── Colores primarios ──────────────── */
  --color-primary:      #0ea5e9;  /* azul principal */
  --color-primary-dark: #0284c7;  /* hover */
  --color-primary-light:#e0f2fe;  /* fondos suaves */

  /* ── Colores de estado ──────────────── */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger:  #ef4444;

  /* ── Texto ──────────────────────────── */
  --color-text:         #1e293b;
  --color-text-muted:   #64748b;
  --color-text-inverse: #ffffff;

  /* ── Fondo ──────────────────────────── */
  --color-bg:           #f8fafc;
  --color-bg-card:      #ffffff;
  --color-border:       #e2e8f0;

  /* ── Espaciado ──────────────────────── */
  --space-xs:   4px;
  --space-sm:   8px;
  --space-md:   16px;
  --space-lg:   24px;
  --space-xl:   32px;

  /* ── Bordes ─────────────────────────── */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  16px;

  /* ── Sombras ─────────────────────────── */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}
\`\`\`

## Usar las variables

\`\`\`css
/* En cualquier archivo CSS de kidotag10 */
.alumno-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);
}

.alumno-card.presente {
  border-left: 4px solid var(--color-success);
}

.alumno-card.ausente {
  border-left: 4px solid var(--color-danger);
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}
\`\`\`

## Dark mode con variables

\`\`\`css
/* Las variables hacen el dark mode trivial */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text:    #f1f5f9;
    --color-bg:      #0f172a;
    --color-bg-card: #1e293b;
    --color-border:  #334155;
  }
  /* Los componentes no necesitan cambios — usan las variables */
}
\`\`\`

<Callout variante="tip" titulo="Variables CSS vs variables de Sass">
  Las variables de Sass (\`$color: blue\`) se resuelven en build time y no
  existen en el navegador. Las CSS variables (\`--color: blue\`) existen en
  tiempo de ejecución y se pueden cambiar con JavaScript. Eso hace posible
  el dark mode y la personalización sin recompilar.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué las CSS variables facilitan el cambio de tema (dark/light) sin tocar los componentes?",
      opciones: [
        { texto: "Porque los navegadores aplican los temas automáticamente" },
        { texto: "Porque los componentes usan var(--color-bg) — al cambiar ese valor en :root, todos los elementos que usan esa variable se actualizan automáticamente", correcta: true },
        { texto: "Porque CSS variables se sincronizan con localStorage" },
        { texto: "Solo funciona en Safari y Chrome" },
      ],
      explicacion: "El sistema de diseño con variables crea una indirección: los componentes referencian variables, no valores directos. Cambiar el valor de la variable en :root (o sobreescribirla en [data-theme='dark']) actualiza toda la interfaz.",
    },
  ]}
/>
`,
);

// ── 09-estados-ui ─────────────────────────────────────────────────────────────
write(
  `${base}/estilos-ux/09-estados-ui.mdx`,
  `# Estados de la UI: loading, error y vacío

Una buena UX comunica siempre el estado de la aplicación al usuario.
kidotag10 tiene tres estados que manejar en cada vista de datos.

## Los tres estados que toda vista debe manejar

\`\`\`jsx
function ListaAlumnos() {
  const { datos: alumnos, cargando, error } = useFetch('/alumnos');

  // 1. Estado de carga
  if (cargando) return <EstadoCargando />;

  // 2. Estado de error
  if (error) return <EstadoError mensaje={error} onReintentar={() => {}} />;

  // 3. Estado vacío
  if (!alumnos || alumnos.length === 0) return <EstadoVacio />;

  // 4. Estado con datos
  return <ul>{alumnos.map(a => <AlumnoItem key={a._id} alumno={a} />)}</ul>;
}
\`\`\`

## Componentes de estado reutilizables

\`\`\`jsx
// Spinner de carga
function EstadoCargando({ texto = 'Cargando...' }) {
  return (
    <div className="estado-cargando">
      <div className="spinner" aria-label="Cargando" />
      <p>{texto}</p>
    </div>
  );
}

// Error con opción de reintentar
function EstadoError({ mensaje, onReintentar }) {
  return (
    <div className="estado-error" role="alert">
      <span>⚠️</span>
      <p>{mensaje}</p>
      {onReintentar && (
        <button onClick={onReintentar}>Reintentar</button>
      )}
    </div>
  );
}

// Estado vacío con acción
function EstadoVacio({ titulo = 'Sin datos', accion }) {
  return (
    <div className="estado-vacio">
      <p>{titulo}</p>
      {accion}
    </div>
  );
}
\`\`\`

## CSS del spinner

\`\`\`css
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}
\`\`\`

## Feedback en acciones: botón con estado

\`\`\`jsx
function BotonGuardar({ onGuardar }) {
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado]   = useState(false);

  async function handleClick() {
    setGuardando(true);
    try {
      await onGuardar();
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000); // reset después de 2s
    } finally {
      setGuardando(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={guardando}>
      {guardando ? 'Guardando...' : guardado ? '✅ Guardado' : 'Guardar'}
    </button>
  );
}
\`\`\`

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué es importante deshabilitar el botón de submit mientras guardando=true?",
      opciones: [
        { texto: "Para que el botón se vea diferente" },
        { texto: "Para evitar que el usuario haga clic múltiples veces y envíe la misma petición varias veces al servidor (double-submit), lo que podría crear duplicados en la BD", correcta: true },
        { texto: "React requiere que los botones estén deshabilitados durante fetch" },
        { texto: "Para mejorar el rendimiento" },
      ],
      explicacion: "Si el usuario hace clic dos veces rápido en 'Guardar', sin disabled={guardando} se harían dos peticiones POST al servidor, potencialmente creando el mismo registro dos veces en MongoDB.",
    },
  ]}
/>
`,
);

// ── 09-responsive-mobile-first ────────────────────────────────────────────────
write(
  `${base}/estilos-ux/09-responsive-mobile-first.mdx`,
  `# Responsive y Mobile First

kidotag10 web se usa desde tablets en las escuelas y también desde desktop.
El enfoque Mobile First diseña primero para pantallas pequeñas.

## Media queries en kidotag10

\`\`\`css
/* Mobile First: los estilos base son para móvil */
.layout {
  display: flex;
  flex-direction: column; /* columna en móvil */
}

.sidebar {
  width: 100%;
  order: 2; /* sidebar al fondo en móvil */
}

.contenido {
  width: 100%;
  order: 1;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .layout {
    flex-direction: row; /* fila en tablet/desktop */
  }

  .sidebar {
    width: 240px;
    order: 1;
  }

  .contenido {
    flex: 1;
    order: 2;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .sidebar { width: 280px; }
}
\`\`\`

## Grid de alumnos responsive

\`\`\`css
/* 1 columna en móvil, 2 en tablet, 3+ en desktop */
.grid-alumnos {
  display: grid;
  grid-template-columns: 1fr;             /* móvil */
  gap: var(--space-md);
}

@media (min-width: 640px) {
  .grid-alumnos {
    grid-template-columns: repeat(2, 1fr); /* tablet pequeña */
  }
}

@media (min-width: 1024px) {
  .grid-alumnos {
    grid-template-columns: repeat(3, 1fr); /* desktop */
  }
}

/* Auto-fill: el navegador decide cuántas columnas caben */
.grid-tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-md);
}
\`\`\`

## Tipografía responsive con clamp()

\`\`\`css
/* clamp(mínimo, ideal, máximo) — escala fluidamente */
h1 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  /* en móvil: ~1.5rem, escala con el viewport, máximo 2.5rem en desktop */
}
\`\`\`

## Imágenes y contenido responsive

\`\`\`css
img {
  max-width: 100%;
  height: auto; /* mantener proporción */
}

/* Tabla responsive — scroll horizontal en móvil */
.tabla-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table { min-width: 600px; }
\`\`\`

<Callout variante="tip" titulo="DevTools: simular dispositivos">
  En Chrome/Firefox DevTools, el ícono de responsive (Ctrl+Shift+M) permite
  probar en distintos tamaños. Los breakpoints de kidotag10:
  sm=640px, md=768px, lg=1024px, xl=1280px.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué el enfoque 'Mobile First' define los estilos base para móvil y usa min-width en las media queries?",
      opciones: [
        { texto: "Porque los móviles son más lentos y necesitan menos CSS" },
        { texto: "Porque es más fácil añadir complejidad al escalar hacia arriba que quitarla al escalar hacia abajo — los estilos de desktop son extensiones de los de móvil", correcta: true },
        { texto: "Google penaliza a los sitios que no usan Mobile First" },
        { texto: "Las media queries min-width son más rápidas que max-width" },
      ],
      explicacion: "Con Desktop First (max-width), escribes el diseño complejo primero y luego simplificarlo para móvil — más difícil. Con Mobile First, el diseño simple base funciona en móvil, y las media queries añaden complejidad para pantallas más grandes.",
    },
  ]}
/>
`,
);

console.log("\n✅ backend/estilos-ux escritos.");
