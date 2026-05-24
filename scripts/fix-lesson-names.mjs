/**
 * Script de corrección: crea TODOS los archivos MDX con los slugs correctos
 * del curriculum.ts y elimina los archivos con nombres incorrectos.
 */

import { writeFileSync, existsSync, mkdirSync, rmSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LESSONS = join(ROOT, "src", "lessons");

// ══════════════════════════════════════════════
// MAPA COMPLETO: bloque → [slug, título]
// Debe coincidir EXACTAMENTE con curriculum.ts
// ══════════════════════════════════════════════
const CURRICULUM = {
  bienvenida: [
    ["00-que-es-kidotag", "¿Qué es kidotag10?"],
    ["00-como-usar-el-curso", "Cómo usar este curso"],
    ["00-setup-entorno", "Configuración del entorno"],
  ],
  "backend-express": [
    ["01-nodejs-npm", "Node.js y npm"],
    ["01-api-rest", "¿Qué es una API REST?"],
    ["01-express-basico", "Express: primeros pasos"],
    ["01-middlewares", "Middlewares en Express"],
    ["01-dotenv-config", "Variables de entorno con dotenv"],
    ["01-arquitectura-mvc", "Arquitectura MVC en kidotag10"],
    ["01-respuestas-errores", "Respuestas normalizadas y manejo de errores"],
  ],
  "mongodb-mongoose": [
    ["02-mongodb-intro", "MongoDB: documentos y colecciones"],
    ["02-conectar-mongoose", "Conectar Mongoose a MongoDB"],
    ["02-schemas-validadores", "Schemas, tipos y validadores"],
    ["02-referencias-embebidos", "Referencias vs documentos embebidos"],
    ["02-hooks-pre-save", 'Hooks pre("save"): hashear passwords'],
    ["02-populate", "populate(): joins entre colecciones"],
    ["02-indices-rendimiento", "Índices y rendimiento"],
    ["02-operadores-avanzados", "Operadores y consultas avanzadas"],
  ],
  "auth-jwt": [
    ["03-passwords-seguros", "Por qué nunca guardar passwords en texto plano"],
    ["03-bcrypt", "bcrypt: salt, rounds y compare"],
    ["03-anatomia-jwt", "Anatomía de un JWT"],
    ["03-emitir-tokens", "Emitir tokens: loginUnificado"],
    ["03-verificar-token", "Middleware verificarToken"],
    ["03-rbac", "Control de acceso por roles (RBAC)"],
    ["03-almacenamiento-token", "Dónde guardar el token en el cliente"],
  ],
  swagger: [
    ["04-openapi-intro", "OpenAPI 3.0: especificación"],
    ["04-swagger-jsdoc", "swagger-jsdoc: docs como código"],
    ["04-schemas-seguridad", "Schemas reutilizables y seguridad"],
    ["04-swagger-ui-ejercicio", "Swagger UI y ejercicio final"],
  ],
  socketio: [
    ["05-websockets-vs-rest", "WebSockets vs polling vs SSE"],
    ["05-servidor-socketio", "Servidor Socket.IO en Express"],
    ["05-eventos-rooms", "Eventos, rooms y broadcasting"],
    ["05-cliente-react", "Cliente Socket.IO en React"],
  ],
  "react-fundamentos": [
    ["06-vite-setup", "Vite: por qué y cómo"],
    ["06-jsx-componentes", "JSX y componentes funcionales"],
    ["06-usestate", "useState: estado local"],
    ["06-useeffect", "useEffect: efectos secundarios"],
    ["06-props-composicion", "Props y composición"],
    ["06-inputs-controlados", "Inputs controlados"],
    ["06-renderizado-listas", "Renderizado condicional y listas"],
  ],
  "react-avanzado": [
    ["07-context-api", "Context API: estado global"],
    ["07-auth-context", "AuthContext: análisis completo"],
    ["07-custom-hooks", "Custom hooks: useAuth()"],
    ["07-react-router", "React Router 6: rutas y navegación"],
    ["07-rutas-protegidas", "Rutas protegidas"],
    ["07-dashboard-pattern", "Dashboard con navegación por estado"],
  ],
  "web-api": [
    ["08-fetch-api", "Fetch API moderna"],
    ["08-abortsignal-timeout", "Timeout con AbortSignal"],
    ["08-api-config", "api.config.js: capa de abstracción"],
    ["08-bearer-token", "Bearer token en cada petición"],
    ["08-polling-descarga", "Polling con setInterval y descarga de archivos"],
  ],
  "estilos-ux": [
    ["09-css-variables", "CSS variables y sistema de theming"],
    ["09-responsive-mobile-first", "Diseño responsive mobile-first"],
    ["09-estados-ui", "Estados de interfaz: carga, error y vacío"],
  ],
  capstone: [
    ["10-flujo-nfc-tiempo-real", "ESP32 → API → Socket.IO → React: en vivo"],
    ["10-exportar-excel", "Exportar reportes a Excel con xlsx"],
  ],
};

// ══════════════════════════════════════════════
// Archivos con nombres INCORRECTOS que deben borrarse
// ══════════════════════════════════════════════
const ARCHIVOS_INCORRECTOS = [
  "bienvenida/01-preparar-entorno.mdx",
  "bienvenida/02-recorrido-rapido.mdx",
  "backend-express/03-express-basico.mdx",
  "backend-express/04-middlewares.mdx",
  "backend-express/05-rutas-controladores.mdx",
  "mongodb-mongoose/08-mongodb-intro.mdx",
  "auth-jwt/16-jwt-intro.mdx",
  "react-fundamentos/27-react-intro.mdx",
  "react-fundamentos/28-use-state-effect.mdx",
  // Placeholders con nombres incorrectos creados antes
  "backend-express/06-cors-env.mdx",
  "backend-express/07-manejo-errores.mdx",
  "mongodb-mongoose/09-esquemas-modelos.mdx",
  "mongodb-mongoose/10-relaciones.mdx",
  "mongodb-mongoose/11-consultas-avanzadas.mdx",
  "mongodb-mongoose/12-asistencias-model.mdx",
  "mongodb-mongoose/13-crud-completo.mdx",
  "mongodb-mongoose/14-indices-performance.mdx",
  "mongodb-mongoose/15-mongoose-hooks.mdx",
  "auth-jwt/17-registro-hash.mdx",
  "auth-jwt/18-verificar-token.mdx",
  "auth-jwt/19-roles-permisos.mdx",
  "auth-jwt/20-refresh-tokens.mdx",
  "auth-jwt/21-cookies-vs-localstorage.mdx",
  "auth-jwt/22-testing-auth.mdx",
  "swagger/23-swagger-intro.mdx",
  "swagger/24-documentar-rutas.mdx",
  "swagger/25-schemas-components.mdx",
  "swagger/26-swagger-ui.mdx",
  "socketio/33-socket-intro.mdx",
  "socketio/34-eventos-servidor.mdx",
  "socketio/35-cliente-socket.mdx",
  "socketio/36-notificaciones-asistencia.mdx",
  "react-avanzado/34-context.mdx",
  "react-avanzado/35-custom-hooks.mdx",
  "react-avanzado/36-formularios.mdx",
  "react-avanzado/37-react-router.mdx",
  "react-avanzado/38-optimizacion.mdx",
  "react-avanzado/39-patrones.mdx",
  "web-api/40-fetch-axios.mdx",
  "web-api/41-auth-context.mdx",
  "web-api/42-socket-react.mdx",
  "web-api/43-flujo-asistencias.mdx",
  "web-api/44-despliegue.mdx",
  "estilos-ux/45-css-variables.mdx",
  "estilos-ux/46-responsive.mdx",
  "estilos-ux/47-ux-feedback.mdx",
  "capstone/48-proyecto-final.mdx",
  "capstone/49-recursos-next.mdx",
];

// ══════════════════════════════════════════════
// CONTENIDO COMPLETO para lecciones prioritarias
// El resto recibe placeholder
// ══════════════════════════════════════════════

const CONTENIDO_COMPLETO = {
  // Ya existe con contenido completo
  "bienvenida/00-que-es-kidotag.mdx": null, // no tocar

  "react-fundamentos/06-jsx-componentes.mdx": `# JSX y componentes funcionales

**React** es la biblioteca que usa kidotag10 para su frontend. En lugar de manipular el DOM directamente, describes **cómo debería verse la UI** y React se encarga de actualizarla.

## ¿Qué es JSX?

JSX es una extensión de JavaScript que permite escribir HTML dentro de tu código JS. Vite/Babel lo transforma en llamadas a \`React.createElement()\`.

\`\`\`jsx
// JSX
const elemento = <h1 className="titulo">Hola, {nombre}</h1>

// Lo que genera el compilador:
const elemento = React.createElement('h1', { className: 'titulo' }, 'Hola, ' + nombre)
\`\`\`

<CodePlayground
  titulo="Componentes funcionales en React"
  archivos={{
    '/App.jsx': \`import { useState } from 'react'

// Componente simple — solo recibe props, no tiene estado
function TarjetaAlumno({ nombre, grado, activo }) {
  return (
    <div style={{
      padding: '1rem',
      border: '2px solid',
      borderColor: activo ? '#15803d' : '#e2e8f0',
      borderRadius: 8,
      marginBottom: 8,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div>
        <strong>{nombre}</strong>
        <span style={{ marginLeft: 8, color: '#64748b', fontSize: 13 }}>
          Grado {grado}
        </span>
      </div>
      <span style={{
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: 12,
        background: activo ? '#dcfce7' : '#f1f5f9',
        color: activo ? '#15803d' : '#64748b',
      }}>
        {activo ? '✓ Presente' : '— Ausente'}
      </span>
    </div>
  )
}

// Componente con estado — gestiona su propia lista
export default function App() {
  const [alumnos, setAlumnos] = useState([
    { id: 1, nombre: 'Ana García',   grado: '3A', activo: true },
    { id: 2, nombre: 'Luis Méndez',  grado: '2B', activo: false },
    { id: 3, nombre: 'Sara Ríos',    grado: '3A', activo: true },
  ])

  const toggleActivo = (id) => {
    setAlumnos(prev =>
      prev.map(a => a.id === id ? { ...a, activo: !a.activo } : a)
    )
  }

  const presentes = alumnos.filter(a => a.activo).length

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '1.5rem', maxWidth: 400 }}>
      <h2 style={{ marginBottom: '.5rem' }}>
        Lista de asistencia
        <span style={{ marginLeft: 8, fontSize: 14, color: '#64748b' }}>
          {presentes}/{alumnos.length} presentes
        </span>
      </h2>
      {alumnos.map(a => (
        <div key={a.id} onClick={() => toggleActivo(a.id)} style={{ cursor: 'pointer' }}>
          <TarjetaAlumno {...a} />
        </div>
      ))}
      <p style={{ marginTop: '1rem', fontSize: 13, color: '#64748b' }}>
        Haz clic en un alumno para cambiar su asistencia.
      </p>
    </div>
  )
}
\`,
  }}
/>

## Reglas de JSX

\`\`\`jsx
// 1. Un solo elemento raíz (o Fragment)
return (
  <>
    <h1>Título</h1>
    <p>Párrafo</p>
  </>
)

// 2. Atributos en camelCase
<div className="caja" onClick={fn} tabIndex={0} />
//   ↑ class → className     ↑ eventos en camelCase

// 3. Expresiones entre llaves {}
<p>Bienvenido, {usuario.nombre.toUpperCase()}</p>
<input value={edad * 2 + 1} />

// 4. Elementos de cierre obligatorio
<input type="text" />   // ← barra de cierre
<img src={url} alt="" />
\`\`\`

<Callout variante="kidotag" titulo="En kidotag10/web">
Todos los componentes en \`web/src/components/\` son funciones JavaScript con JSX.
Por ejemplo, \`web/src/components/Navbar.js\` exporta una función que retorna
la barra de navegación. Los componentes de página están en \`web/src/pages/\`.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: '¿Por qué se usa className en JSX en lugar de class?',
      opciones: [
        { texto: 'Es un error histórico sin razón técnica' },
        { texto: 'class es una palabra reservada en JavaScript', correcta: true },
        { texto: 'Para diferenciarlo del CSS' },
      ],
      explicacion: 'En JavaScript, class es una palabra reservada (para definir clases ES6). JSX se compila a JavaScript, por eso usa className para evitar conflictos.',
    },
    {
      pregunta: '¿Qué retorna obligatoriamente un componente funcional de React?',
      opciones: [
        { texto: 'Un objeto JavaScript' },
        { texto: 'Un elemento JSX (o null para no renderizar nada)', correcta: true },
        { texto: 'Un string con HTML' },
      ],
      explicacion: 'Los componentes funcionales retornan JSX (que se convierte en elementos React), o null si no deben renderizar nada. No retornan strings HTML directamente.',
    },
  ]}
/>
`,

  "react-fundamentos/06-usestate.mdx": `# useState: estado local

El hook \`useState\` permite que un componente "recuerde" valores entre renders. Cuando el estado cambia, React vuelve a renderizar el componente automáticamente.

## Sintaxis

\`\`\`jsx
const [valor, setValor] = useState(valorInicial)
//     ↑         ↑               ↑
// estado actual  setter para    valor al montar
//               actualizarlo    (solo se usa 1 vez)
\`\`\`

**Regla fundamental:** nunca mutes el estado directamente; siempre usa el setter.

\`\`\`jsx
// ❌ INCORRECTO — React no detecta el cambio
lista.push({ id: 4, nombre: 'Pedro' })

// ✅ CORRECTO — nuevo array = nuevo estado
setLista([...lista, { id: 4, nombre: 'Pedro' }])
\`\`\`

<CodePlayground
  titulo="useState con objetos y arrays"
  archivos={{
    '/App.jsx': \`import { useState } from 'react'

export default function FormularioAlumno() {
  // Estado con objeto
  const [alumno, setAlumno] = useState({
    nombre: '',
    grado: '1A',
    matricula: '',
  })
  
  // Estado booleano
  const [guardado, setGuardado] = useState(false)
  
  // Estado de lista
  const [alumnos, setAlumnos] = useState([])

  // Actualizar un campo del objeto sin perder los demás
  const actualizar = (campo, valor) => {
    setAlumno(prev => ({ ...prev, [campo]: valor }))
    setGuardado(false)
  }

  const guardar = () => {
    if (!alumno.nombre.trim() || !alumno.matricula.trim()) return
    setAlumnos(prev => [...prev, { ...alumno, id: Date.now() }])
    setAlumno({ nombre: '', grado: '1A', matricula: '' }) // reset
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  const eliminar = (id) => {
    setAlumnos(prev => prev.filter(a => a.id !== id))
  }

  const grados = ['1A', '1B', '2A', '2B', '3A', '3B']

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '1.5rem', maxWidth: 420 }}>
      <h2>Registrar Alumno</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          placeholder="Nombre completo"
          value={alumno.nombre}
          onChange={e => actualizar('nombre', e.target.value)}
          style={{ padding: '8px', borderRadius: 6, border: '1px solid #e2e8f0' }}
        />
        <input
          placeholder="Matrícula"
          value={alumno.matricula}
          onChange={e => actualizar('matricula', e.target.value)}
          style={{ padding: '8px', borderRadius: 6, border: '1px solid #e2e8f0' }}
        />
        <select
          value={alumno.grado}
          onChange={e => actualizar('grado', e.target.value)}
          style={{ padding: '8px', borderRadius: 6, border: '1px solid #e2e8f0' }}
        >
          {grados.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <button
          onClick={guardar}
          style={{ background: '#274c77', color: 'white', border: 'none', padding: '10px', borderRadius: 6, cursor: 'pointer' }}
        >
          ＋ Agregar alumno
        </button>
      </div>

      {guardado && (
        <p style={{ color: '#15803d', fontWeight: 600, margin: '8px 0' }}>✓ Alumno guardado</p>
      )}

      {alumnos.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {alumnos.map(a => (
            <li key={a.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px', borderBottom: '1px solid #f1f5f9',
            }}>
              <span><strong>{a.nombre}</strong> — <em>{a.grado}</em></span>
              <button onClick={() => eliminar(a.id)} style={{
                background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16,
              }}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
\`,
  }}
/>

<Callout variante="kidotag" titulo="Patrón en kidotag10/web">
En las páginas de kidotag10 (como \`web/src/pages/Alumnos.js\`) encontrarás este
patrón constantemente: \`useState\` para \`alumnos\`, \`loading\`, \`error\` y el formulario.
El formulario de registro usa un objeto de estado con \`{ nombre, matricula, grupoId, ... }\`.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: 'Tienes const [count, setCount] = useState(0). ¿Qué hace setCount(prev => prev + 1)?',
      opciones: [
        { texto: 'Es un error — no se puede pasar una función a setCount' },
        { texto: 'Actualiza count usando el valor más reciente del estado', correcta: true },
        { texto: 'Resetea count a 0' },
      ],
      explicacion: 'Pasar una función al setter (forma funcional) garantiza que usas el valor más reciente del estado. Es la forma recomendada cuando el nuevo valor depende del anterior.',
    },
    {
      pregunta: '¿Por qué setAlumno({ ...alumno, nombre: "Ana" }) en lugar de alumno.nombre = "Ana"?',
      opciones: [
        { texto: 'Es solo una convención de estilo' },
        { texto: 'Porque React no detecta mutaciones directas — necesita un nuevo objeto para re-renderizar', correcta: true },
        { texto: 'Porque los objetos en JavaScript son inmutables' },
      ],
      explicacion: 'React detecta cambios por referencia. Si mutes el mismo objeto, la referencia no cambia y React no sabe que debe re-renderizar. Crear un nuevo objeto con spread garantiza la detección.',
    },
  ]}
/>
`,

  "react-fundamentos/06-useeffect.mdx": `# useEffect: efectos secundarios

Los efectos secundarios son operaciones que ocurren **fuera del flujo de renderizado**: llamadas a APIs, suscripciones, timers, o actualizar el DOM manualmente. \`useEffect\` es el hook para manejarlos.

## Cuándo se ejecuta

\`\`\`jsx
useEffect(() => {
  // 👈 Este código se ejecuta según las dependencias
  
  return () => {
    // Cleanup: limpia timers, cancela peticiones, desuscribe
  }
}, [dependencias])
\`\`\`

| Dependencias | Cuándo ejecuta | Caso de uso |
|---|---|---|
| Sin array | Cada render | Raro — casi nunca lo necesitas |
| \`[]\` vacío | Solo al montar | Cargar datos iniciales |
| \`[userId]\` | Cuando userId cambia | Cargar datos del usuario activo |

<CodePlayground
  titulo="useEffect: cargar datos y polling"
  archivos={{
    '/App.jsx': \`import { useState, useEffect } from 'react'

// Datos simulados (en kidotag10 sería fetch a la API)
const datosAlumnos = [
  { id: 1, nombre: 'Ana García', asistencias: 18 },
  { id: 2, nombre: 'Luis Pérez', asistencias: 20 },
  { id: 3, nombre: 'Sara Ríos', asistencias: 15 },
]

export default function App() {
  const [alumnos, setAlumnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [seleccionado, setSeleccionado] = useState(null)
  const [tick, setTick] = useState(0) // para el contador en vivo

  // Efecto 1: Cargar alumnos UNA VEZ al montar
  useEffect(() => {
    setLoading(true)
    // Simular delay de red
    const timer = setTimeout(() => {
      setAlumnos(datosAlumnos)
      setLoading(false)
    }, 1200)
    
    return () => clearTimeout(timer) // cleanup
  }, [])

  // Efecto 2: Actualizar título del documento cuando cambia la selección
  useEffect(() => {
    if (seleccionado) {
      document.title = \\\`Alumno: \\\${seleccionado.nombre}\\\`
    } else {
      document.title = 'Lista de alumnos'
    }
  }, [seleccionado]) // solo cuando seleccionado cambia

  // Efecto 3: Contador en vivo (simula polling)
  useEffect(() => {
    const intervalo = setInterval(() => {
      setTick(t => t + 1)
    }, 1000)
    
    return () => clearInterval(intervalo) // ← cleanup crucial
  }, []) // sin deps: el intervalo se crea una sola vez

  if (loading) return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <p>⏳ Cargando alumnos...</p>
    </div>
  )

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'sans-serif', maxWidth: 420 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Alumnos</h2>
        <span style={{ color: '#64748b', fontSize: 13 }}>🕐 {tick}s activo</span>
      </div>
      
      {alumnos.map(a => (
        <div
          key={a.id}
          onClick={() => setSeleccionado(prev => prev?.id === a.id ? null : a)}
          style={{
            padding: '12px',
            border: '2px solid',
            borderColor: seleccionado?.id === a.id ? '#274c77' : '#e2e8f0',
            borderRadius: 8,
            marginBottom: 8,
            cursor: 'pointer',
            background: seleccionado?.id === a.id ? '#eff6ff' : 'white',
          }}
        >
          <strong>{a.nombre}</strong>
          <span style={{ float: 'right', color: '#64748b' }}>
            {a.asistencias} asistencias
          </span>
        </div>
      ))}
      
      {seleccionado && (
        <p style={{ marginTop: '1rem', color: '#274c77', fontWeight: 600 }}>
          ✅ Seleccionado: {seleccionado.nombre}
        </p>
      )}
    </div>
  )
}
\`,
  }}
/>

## Error común: loop infinito

\`\`\`jsx
// ❌ LOOP INFINITO
useEffect(() => {
  setDatos([...]) // Actualiza estado → re-render → useEffect corre de nuevo → loop
}) // ← sin array de dependencias

// ✅ CORRECTO
useEffect(() => {
  setDatos([...])
}, []) // [] = solo una vez
\`\`\`

<Callout variante="kidotag" titulo="Polling en kidotag10/web">
En \`web/src/context/AuthContext.js\`, useEffect con \`setInterval\` hace polling cada
30 segundos para verificar mensajes no leídos. Siempre retorna el cleanup con
\`clearInterval\` para evitar memory leaks al desmontar el componente.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: '¿Por qué es importante retornar una función de cleanup en useEffect con setInterval?',
      opciones: [
        { texto: 'Para mejorar el rendimiento del render' },
        { texto: 'Para evitar que el intervalo continúe ejecutándose después de desmontar el componente', correcta: true },
        { texto: 'Es opcional, no tiene consecuencias reales' },
      ],
      explicacion: 'Sin cleanup, el intervalo seguiría ejecutándose en segundo plano y trataría de actualizar el estado de un componente ya desmontado, causando memory leaks y errores.',
    },
    {
      pregunta: 'useEffect(() => { fetchDatos() }, [userId]) — ¿cuándo se vuelve a ejecutar?',
      opciones: [
        { texto: 'En cada render del componente' },
        { texto: 'Solo cuando userId cambia de valor', correcta: true },
        { texto: 'Nunca, porque userId está en el array' },
      ],
      explicacion: 'React compara las dependencias del render anterior con el actual. Si userId cambió, ejecuta el efecto de nuevo. Si no cambió, lo omite.',
    },
  ]}
/>
`,
};

// ══════════════════════════════════════════════
// Plantilla placeholder
// ══════════════════════════════════════════════
function placeholder(titulo) {
  return `# ${titulo}

> 📝 Esta lección está siendo desarrollada.

Los conceptos de esta lección serán añadidos próximamente.
Mientras tanto, explora el código de referencia de kidotag10 indicado en los bloques anteriores.
`;
}

// ══════════════════════════════════════════════
// EJECUCIÓN
// ══════════════════════════════════════════════

// 1. Borrar archivos con nombres incorrectos
console.log("\n🗑️  Eliminando archivos con nombres incorrectos...");
let borrados = 0;
for (const rel of ARCHIVOS_INCORRECTOS) {
  const abs = join(LESSONS, rel);
  if (existsSync(abs)) {
    rmSync(abs);
    console.log(`  ✗ ${rel}`);
    borrados++;
  }
}
console.log(`  → ${borrados} archivos eliminados\n`);

// 2. Crear archivos con nombres correctos (skip si ya existe)
console.log("📝 Creando archivos MDX con slugs correctos...");
let creados = 0;
let saltados = 0;

for (const [bloque, lecciones] of Object.entries(CURRICULUM)) {
  const dir = join(LESSONS, bloque);
  mkdirSync(dir, { recursive: true });

  for (const [slug, titulo] of lecciones) {
    const abs = join(dir, `${slug}.mdx`);
    const rel = `${bloque}/${slug}.mdx`;

    if (existsSync(abs)) {
      // Ya existe (00-que-es-kidotag, etc.) — no tocar
      console.log(`  ⏭  ${rel} (ya existe)`);
      saltados++;
      continue;
    }

    // ¿Hay contenido completo para este archivo?
    const contenido =
      CONTENIDO_COMPLETO[`${bloque}/${slug}.mdx`] ?? placeholder(titulo);
    writeFileSync(abs, contenido, "utf8");
    console.log(`  ✅ ${rel}`);
    creados++;
  }
}

console.log(
  `\n✅ Resumen: ${creados} creados, ${saltados} ya existían, ${borrados} borrados.\n`,
);

// 3. Verificar que no quedan archivos huérfanos
console.log("🔍 Verificando archivos huérfanos...");
for (const bloque of Object.keys(CURRICULUM)) {
  const dir = join(LESSONS, bloque);
  if (!existsSync(dir)) continue;
  const archivos = readdirSync(dir);
  const slugsValidos = new Set(CURRICULUM[bloque].map(([s]) => `${s}.mdx`));
  for (const archivo of archivos) {
    if (!slugsValidos.has(archivo)) {
      console.log(`  ⚠️  Huérfano: ${bloque}/${archivo}`);
    }
  }
}
console.log("  → Verificación completa.\n");
