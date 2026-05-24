import fs from "fs";

const write = (path, content) => {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(path, content, "utf8");
  console.log("✅", path);
};

const base = "src/lessons";

// ── 06-vite-setup ─────────────────────────────────────────────────────────────
write(
  `${base}/react-fundamentos/06-vite-setup.mdx`,
  `# Vite: el bundler moderno

Vite reemplaza a Webpack en proyectos modernos de React. El web de kidotag10
usa Vite 5.1.

<LibCard
  nombre="vite"
  version="5.1.0"
  npm="vite"
  categoria="devtools"
  docs="https://vitejs.dev/guide/"
  descripcion="Bundler y servidor de desarrollo ultrarrápido para proyectos web modernos. Usa ES modules nativos en desarrollo y Rollup para el build de producción."
  porque="Webpack puede tardar 10-30 segundos en iniciar y 1-5s en HMR. Vite inicia en <500ms y el HMR es casi instantáneo. kidotag10 eligió Vite para una experiencia de desarrollo ágil."
  usoEjemplo={\`// vite.config.js (web de kidotag10)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000' // evita CORS en dev
    }
  }
})\`}
  alternativas={[
    { nombre: "Create React App (Webpack)", porque_no: "Lento en start y HMR, configuración rígida, deprecado por Meta." },
    { nombre: "Parcel", porque_no: "Zero-config pero menos personalizable que Vite." },
    { nombre: "Next.js", porque_no: "Ideal para SSR, pero kidotag10 web es una SPA pura — Vite es más simple." },
  ]}
/>

## Estructura del proyecto web

\`\`\`
web/
├── index.html         ← punto de entrada (Vite lo transforma)
├── vite.config.js     ← configuración
├── .env               ← VITE_API_URL=http://localhost:4000/api
├── package.json
└── src/
    ├── main.jsx       ← monta <App /> en #root
    ├── App.jsx        ← rutas principales
    └── ...
\`\`\`

\`\`\`html
<!-- index.html — el punto de entrada de Vite -->
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Kidotag</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
    <!-- ↑ type="module" → Vite sirve ES modules nativos en dev -->
  </body>
</html>
\`\`\`

## Scripts npm

\`\`\`bash
npm run dev      # servidor de desarrollo (HMR en http://localhost:5173)
npm run build    # bundle de producción en dist/
npm run preview  # sirve dist/ localmente para verificar el build
\`\`\`

## HMR (Hot Module Replacement)

\`\`\`
Sin HMR (Webpack antiguo):
  Cambias un componente → recarga toda la página → pierdes el estado

Con HMR de Vite:
  Cambias un componente → solo ese módulo se actualiza → estado preservado
  Tiempo: ~50ms vs ~2-5 segundos
\`\`\`

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué el proxy de Vite (configurado en vite.config.js) ayuda con CORS en desarrollo?",
      opciones: [
        { texto: "Desactiva las restricciones CORS del navegador" },
        { texto: "Las peticiones a /api se redirigen al servidor Express en el mismo origen, por lo que el navegador no ve una petición cross-origin — no hay CORS", correcta: true },
        { texto: "Vite añade los headers CORS automáticamente" },
        { texto: "El proxy solo funciona con peticiones GET" },
      ],
      explicacion: "CORS es una restricción del navegador para peticiones entre orígenes distintos (ej: localhost:5173 → localhost:4000). El proxy de Vite reescribe la URL en el servidor de desarrollo: la petición del navegador va a localhost:5173/api (mismo origen) y Vite la reenvía a localhost:4000.",
    },
  ]}
/>
`,
);

// ── 06-props-composicion ──────────────────────────────────────────────────────
write(
  `${base}/react-fundamentos/06-props-composicion.mdx`,
  `# Props y composición de componentes

Las props son la manera en que los componentes React se comunican.
La composición permite construir UIs complejas combinando componentes simples.

## Props básicas

\`\`\`jsx
// Definir un componente con props
function AlumnoCard({ nombre, presente, hora }) {
  return (
    <div className={\`alumno-card \${presente ? 'presente' : 'ausente'}\`}>
      <h3>{nombre}</h3>
      <span>{presente ? '✅ Presente' : '🔴 Ausente'}</span>
      <small>{hora}</small>
    </div>
  );
}

// Usar el componente con props
<AlumnoCard
  nombre="Ana García"
  presente={true}
  hora="08:23"
/>
\`\`\`

## Props especiales

\`\`\`jsx
// children — contenido entre las etiquetas
function Card({ titulo, children }) {
  return (
    <div className="card">
      <h2>{titulo}</h2>
      {children}
    </div>
  );
}

// Uso:
<Card titulo="Asistencias de hoy">
  <AlumnoCard nombre="Ana" presente={true} hora="08:23" />
  <AlumnoCard nombre="Luis" presente={false} hora="" />
</Card>
\`\`\`

## Pasar funciones como props (callbacks)

\`\`\`jsx
// kidotag10 pattern: lista + acción
function ListaAlumnos({ alumnos, onSeleccionar }) {
  return (
    <ul>
      {alumnos.map(a => (
        <li key={a._id}>
          {a.nombre}
          <button onClick={() => onSeleccionar(a)}>Ver detalle</button>
        </li>
      ))}
    </ul>
  );
}

// El padre controla qué pasa al seleccionar
function Dashboard() {
  const [seleccionado, setSeleccionado] = useState(null);
  return (
    <>
      <ListaAlumnos
        alumnos={alumnos}
        onSeleccionar={setSeleccionado}  // ← función como prop
      />
      {seleccionado && <DetalleAlumno alumno={seleccionado} />}
    </>
  );
}
\`\`\`

## Composición vs herencia

React usa **composición** en lugar de herencia de clases para reutilizar lógica:

\`\`\`jsx
// ✅ Composición — combinar componentes
function PaginaConSidebar({ sidebar, contenido }) {
  return (
    <div className="layout">
      <aside>{sidebar}</aside>
      <main>{contenido}</main>
    </div>
  );
}

// Uso flexible:
<PaginaConSidebar
  sidebar={<MenuNavegacion />}
  contenido={<ListaAlumnos />}
/>
\`\`\`

<Callout variante="tip" titulo="Regla de las props: flujo unidireccional">
  Las props fluyen siempre de padre a hijo. Si un hijo necesita modificar
  datos del padre, el padre le pasa una función callback como prop.
  Este patrón se llama "lifting state up".
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "En el componente ListaAlumnos, ¿por qué onSeleccionar se pasa como prop en lugar de definirla dentro del componente?",
      opciones: [
        { texto: "Porque las funciones no se pueden definir dentro de componentes" },
        { texto: "Para que ListaAlumnos sea reutilizable — distintos padres pueden decidir qué hacer al seleccionar un alumno (ver detalle, editar, eliminar)", correcta: true },
        { texto: "Por razones de rendimiento" },
        { texto: "React requiere que todas las funciones vengan de props" },
      ],
      explicacion: "El componente ListaAlumnos solo sabe mostrar una lista. Qué pasa al seleccionar depende del contexto de uso. Al recibir onSeleccionar como prop, el mismo componente sirve para un dashboard (ver detalle), para un formulario (asignar a grupo), etc.",
    },
  ]}
/>
`,
);

// ── 06-renderizado-listas ─────────────────────────────────────────────────────
write(
  `${base}/react-fundamentos/06-renderizado-listas.mdx`,
  `# Renderizado condicional y listas

Dos de los patrones más comunes en React: mostrar/ocultar elementos y
renderizar colecciones de datos.

## Renderizado condicional

\`\`\`jsx
// && — mostrar solo si la condición es verdadera
function BannerCargando({ cargando }) {
  return (
    <div>
      {cargando && <p>Cargando...</p>}
      {!cargando && <p>Datos listos</p>}
    </div>
  );
}

// Ternario — dos opciones
function EstadoAlumno({ presente }) {
  return (
    <span className={presente ? 'verde' : 'rojo'}>
      {presente ? '✅ Presente' : '🔴 Ausente'}
    </span>
  );
}

// if antes del return — para lógica más compleja
function PaginaDetalle({ alumno, cargando, error }) {
  if (cargando) return <Spinner />;
  if (error)    return <MensajeError texto={error} />;
  if (!alumno)  return <p>Alumno no encontrado</p>;

  return <DetalleAlumno alumno={alumno} />;
}
\`\`\`

## Listas con .map()

\`\`\`jsx
// Siempre requiere una prop key única y estable
function ListaAsistencias({ asistencias }) {
  return (
    <ul>
      {asistencias.map(a => (
        <li key={a._id}>  {/* ← _id de MongoDB es perfecto como key */}
          <strong>{a.alumno.nombre}</strong>
          <span>{a.presente ? 'Presente' : 'Ausente'}</span>
        </li>
      ))}
    </ul>
  );
}
\`\`\`

<Callout variante="warning" titulo="Nunca uses el índice del array como key">
  \`key={index}\` parece funcionar pero causa bugs sutiles cuando el array
  se reordena o se eliminan elementos. React usa la key para identificar
  qué elemento cambió. Usa siempre un ID único y estable del dato.
</Callout>

## Lista vacía y estados de carga

\`\`\`jsx
function ListaAlumnos({ alumnos, cargando }) {
  if (cargando) {
    return <p>Cargando alumnos...</p>;
  }

  if (alumnos.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay alumnos en este grupo.</p>
        <button>Agregar el primero</button>
      </div>
    );
  }

  return (
    <ul>
      {alumnos.map(a => (
        <li key={a._id}>{a.nombre}</li>
      ))}
    </ul>
  );
}
\`\`\`

## Filtrar y transformar antes de renderizar

\`\`\`jsx
// Mostrar solo los alumnos presentes
const presentes = alumnos.filter(a => a.presente);

// Mostrar los últimos 5
const recientes = asistencias.slice(0, 5);

// Ordenar por nombre
const ordenados = [...alumnos].sort((a, b) =>
  a.nombre.localeCompare(b.nombre)
);
\`\`\`

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué React requiere una prop 'key' única al renderizar listas?",
      opciones: [
        { texto: "Es solo un requisito de sintaxis sin impacto real" },
        { texto: "React usa la key para identificar qué elemento cambió, se agregó o se eliminó en el DOM virtual — sin ella, React puede re-renderizar elementos innecesariamente o actualizar el elemento equivocado", correcta: true },
        { texto: "Para que el navegador pueda indexar los elementos" },
        { texto: "Es necesario para que CSS funcione en listas" },
      ],
      explicacion: "El reconciliador de React compara el árbol anterior con el nuevo. La key es el identificador que usa para hacer el match. Sin keys únicas, React puede reutilizar el DOM de un elemento para otro diferente, causando bugs de estado.",
    },
  ]}
/>
`,
);

// ── 06-inputs-controlados ─────────────────────────────────────────────────────
write(
  `${base}/react-fundamentos/06-inputs-controlados.mdx`,
  `# Inputs controlados y formularios

En React, un **input controlado** es aquel cuyo valor está sincronizado con
el estado de React mediante \`value\` + \`onChange\`.

## Input controlado básico

\`\`\`jsx
import { useState } from 'react';

function FormLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  async function handleSubmit(e) {
    e.preventDefault();        // ← evitar recarga de página
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rol: 'profesor' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      localStorage.setItem('token', json.data.token);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="correo@escuela.mx"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Iniciar sesión</button>
    </form>
  );
}
\`\`\`

## Select controlado

\`\`\`jsx
const [rol, setRol] = useState('profesor');

<select value={rol} onChange={e => setRol(e.target.value)}>
  <option value="profesor">Profesor</option>
  <option value="tutor">Tutor / Padre</option>
  <option value="admin">Administrador</option>
</select>
\`\`\`

## Formularios con múltiples campos (objeto de estado)

\`\`\`jsx
function FormNuevoAlumno({ onGuardar }) {
  const [form, setForm] = useState({
    nombre:  '',
    grado:   '1',
    grupoId: '',
  });

  // Un solo handler para todos los campos
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onGuardar(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="nombre"  value={form.nombre}  onChange={handleChange} />
      <input name="grado"   value={form.grado}   onChange={handleChange} />
      <input name="grupoId" value={form.grupoId} onChange={handleChange} />
      <button type="submit">Guardar</button>
    </form>
  );
}
\`\`\`

<Callout variante="tip" titulo="¿Cuándo usar un objeto de estado vs múltiples useState?">
  Usa un objeto cuando los campos están relacionados (pertenecen al mismo
  formulario). Usa \`useState\` separados cuando son estados independientes.
  El objeto de estado facilita el submit: \`fetch(..., { body: JSON.stringify(form) })\`.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Qué hace e.preventDefault() en el handler onSubmit de un formulario?",
      opciones: [
        { texto: "Evita que los datos se envíen al servidor" },
        { texto: "Evita el comportamiento predeterminado del navegador de recargar la página al enviar un form — permite manejar el submit con JavaScript", correcta: true },
        { texto: "Limpia los campos del formulario" },
        { texto: "Valida los campos antes de enviar" },
      ],
      explicacion: "Por defecto, un <form> sin preventDefault() hace una petición HTTP tradicional y recarga la página. En React SPA, queremos manejar el submit con fetch y actualizar el estado sin recargar.",
    },
  ]}
/>
`,
);

console.log("\n✅ Lecciones react-fundamentos adicionales escritas.");
