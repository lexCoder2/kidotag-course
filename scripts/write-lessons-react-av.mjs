import fs from "fs";

const write = (path, content) => {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(path, content, "utf8");
  console.log("✅", path);
};

const base = "src/lessons";

// ── 07-context-api ────────────────────────────────────────────────────────────
write(
  `${base}/react-avanzado/07-context-api.mdx`,
  `# Context API: estado global en React

El problema de pasar props a través de múltiples niveles se llama "prop drilling".
Context API resuelve eso proveyendo un estado accesible por cualquier componente.

## ¿Cuándo usar Context?

\`\`\`
Props (correcto para):         Context (correcto para):
  datos entre padre-hijo         datos globales de la app
  callbacks de eventos           usuario autenticado
  configuración local            tema (dark/light)
                                 idioma
                                 escuelaId del usuario
\`\`\`

## Crear un Context

\`\`\`jsx
// src/context/EscuelaContext.jsx
import { createContext, useContext, useState } from 'react';

// 1. Crear el contexto con valor por defecto
const EscuelaContext = createContext(null);

// 2. Crear el Provider
export function EscuelaProvider({ children }) {
  const [escuela, setEscuela] = useState(null);
  const [grupos, setGrupos]   = useState([]);

  return (
    <EscuelaContext.Provider value={{ escuela, setEscuela, grupos, setGrupos }}>
      {children}
    </EscuelaContext.Provider>
  );
}

// 3. Custom hook para consumir el contexto
export function useEscuela() {
  const ctx = useContext(EscuelaContext);
  if (!ctx) throw new Error('useEscuela debe usarse dentro de EscuelaProvider');
  return ctx;
}
\`\`\`

## Usar el Context

\`\`\`jsx
// src/main.jsx — envolver la app con el Provider
import { EscuelaProvider } from './context/EscuelaContext';

<EscuelaProvider>
  <App />
</EscuelaProvider>

// src/components/GrupoSelector.jsx — consumir en cualquier nivel
import { useEscuela } from '../context/EscuelaContext';

function GrupoSelector() {
  const { grupos } = useEscuela();
  return (
    <select>
      {grupos.map(g => <option key={g._id} value={g._id}>{g.nombre}</option>)}
    </select>
  );
}
\`\`\`

## Estructura de contextos en kidotag10

\`\`\`
AuthContext     → usuario, token, login(), logout()
EscuelaContext  → escuelaId, escuela, configuración
\`\`\`

<Callout variante="warning" titulo="Context no reemplaza el estado local">
  No pongas todo el estado en Context. Un formulario local, un modal abierto/cerrado,
  o un dato que solo usa un componente deben seguir siendo \`useState\` local.
  Context es para datos que necesitan múltiples componentes en distintos niveles.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Qué problema resuelve Context API en React?",
      opciones: [
        { texto: "Hace los componentes más rápidos" },
        { texto: "Evita prop drilling: pasar props a través de múltiples niveles de componentes intermedios que no los usan para que lleguen a un componente profundo", correcta: true },
        { texto: "Permite conectarse a MongoDB directamente desde React" },
        { texto: "Reemplaza el uso de useEffect" },
      ],
      explicacion: "Sin Context, para que un componente profundo acceda al usuario autenticado necesitarías pasar el prop a través de App → Dashboard → Panel → ListaAlumnos → AlumnoCard. Con Context, cualquier componente consume el contexto directamente.",
    },
  ]}
/>
`,
);

// ── 07-auth-context ───────────────────────────────────────────────────────────
write(
  `${base}/react-avanzado/07-auth-context.mdx`,
  `# AuthContext: manejo de autenticación global

El AuthContext centraliza el estado de autenticación en kidotag10: el token
JWT, los datos del usuario y las funciones de login/logout.

## Implementación del AuthContext

\`\`\`jsx
// web/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('token'));
  const [cargando, setCargando] = useState(true);

  // Al iniciar la app: verificar si el token guardado sigue válido
  useEffect(() => {
    if (token) {
      try {
        // Decodificar el payload del JWT (no verifica la firma)
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Verificar si no expiró
        if (payload.exp * 1000 > Date.now()) {
          setUsuario(payload); // { id, nombre, rol, escuelaId }
        } else {
          logout(); // token expirado
        }
      } catch {
        logout(); // token inválido
      }
    }
    setCargando(false);
  }, []);

  async function login(email, password, rol) {
    const res = await fetch(\`\${import.meta.env.VITE_API_URL}/auth/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rol }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);

    const { token: nuevoToken, usuario: datosUsuario } = json.data;
    localStorage.setItem('token', nuevoToken);
    setToken(nuevoToken);
    setUsuario(datosUsuario);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
\`\`\`

## Uso en la app

\`\`\`jsx
// Cualquier componente puede saber quién está logueado
function Header() {
  const { usuario, logout } = useAuth();
  return (
    <header>
      <span>Hola, {usuario?.nombre}</span>
      <span className="badge">{usuario?.rol}</span>
      <button onClick={logout}>Cerrar sesión</button>
    </header>
  );
}

// Login page
function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    await login(email, password, rol);
    navigate('/dashboard');
  }
}
\`\`\`

<Callout variante="info" titulo="atob() decodifica el payload del JWT">
  Un JWT es base64url(header).base64url(payload).firma
  \`atob(token.split('.')[1])\` decodifica el payload a JSON sin verificar la firma.
  Esto es seguro para leer los datos del usuario en el frontend — la verificación
  real de la firma ocurre en el servidor con \`jwt.verify()\`.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué el AuthContext verifica si el token expiró al iniciar la app (useEffect inicial)?",
      opciones: [
        { texto: "Para renovar el token automáticamente" },
        { texto: "Porque si el usuario cerró el navegador ayer con un token de 7 días, al volver hoy podría usar un token ya expirado — la verificación previene sesiones fantasma", correcta: true },
        { texto: "Para validar el token contra el servidor" },
        { texto: "React borra localStorage al cerrar" },
      ],
      explicacion: "localStorage persiste entre sesiones del navegador. Sin verificar la expiración, un token del mes pasado seguiría cargando el estado de usuario. El payload del JWT contiene 'exp' (Unix timestamp de expiración) que se puede verificar en el cliente.",
    },
  ]}
/>
`,
);

// ── 07-react-router ───────────────────────────────────────────────────────────
write(
  `${base}/react-avanzado/07-react-router.mdx`,
  `# React Router v6: navegación en SPAs

React Router maneja la navegación en kidotag10 web sin recargar la página.

## Configuración de rutas

\`\`\`jsx
// web/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route path="/" element={<PrivateRoute />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard"    element={<Dashboard />} />
          <Route path="alumnos"      element={<Alumnos />} />
          <Route path="alumnos/:id"  element={<DetalleAlumno />} />
          <Route path="grupos"       element={<Grupos />} />
          <Route path="asistencias"  element={<Asistencias />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<PaginaNoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}
\`\`\`

## Hooks de React Router

\`\`\`jsx
import {
  useNavigate,  // navegar programáticamente
  useParams,    // parámetros de la URL (:id)
  useLocation,  // URL actual
  Link,         // enlace sin recarga
} from 'react-router-dom';

// useNavigate
function FormNuevoAlumno() {
  const navigate = useNavigate();
  async function guardar() {
    await crearAlumno(form);
    navigate('/alumnos'); // ← redirigir después de guardar
  }
}

// useParams
function DetalleAlumno() {
  const { id } = useParams(); // /alumnos/507f1f77bcf86cd799439011
  const [alumno, setAlumno] = useState(null);
  useEffect(() => {
    fetchAuth(\`/alumnos/\${id}\`).then(setAlumno);
  }, [id]);
}

// Link
<Link to="/alumnos">Ver todos los alumnos</Link>
\`\`\`

## Outlet: rutas anidadas

\`\`\`jsx
// El layout padre usa <Outlet /> para renderizar los hijos
function LayoutDashboard() {
  return (
    <div className="layout">
      <Sidebar />
      <main>
        <Outlet />  {/* ← aquí se renderiza la ruta hija activa */}
      </main>
    </div>
  );
}

<Route path="/" element={<LayoutDashboard />}>
  <Route path="alumnos" element={<Alumnos />} />
  <Route path="grupos"  element={<Grupos />} />
</Route>
\`\`\`

<Quiz
  preguntas={[
    {
      pregunta: "¿Cuál es la diferencia entre <Link to='/alumnos'> y <a href='/alumnos'>?",
      opciones: [
        { texto: "No hay diferencia en el resultado visual" },
        { texto: "Link de React Router actualiza la URL y renderiza el componente sin recargar la página (SPA). <a href> hace una petición HTTP completa que recarga toda la app", correcta: true },
        { texto: "Link solo funciona con rutas definidas en Routes" },
        { texto: "<a href> no funciona en React" },
      ],
      explicacion: "Una SPA (Single Page Application) carga el HTML/JS una sola vez. Todos los cambios de vista son actualizaciones del DOM en JavaScript. Link intercepta el clic y usa la History API del navegador para cambiar la URL sin recargar.",
    },
  ]}
/>
`,
);

// ── 07-rutas-protegidas ───────────────────────────────────────────────────────
write(
  `${base}/react-avanzado/07-rutas-protegidas.mdx`,
  `# Rutas protegidas: solo usuarios autenticados

En kidotag10, el dashboard y sus subpáginas solo son accesibles si hay un
usuario autenticado. El componente \`PrivateRoute\` implementa este guard.

## Implementación de PrivateRoute

\`\`\`jsx
// web/src/components/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ rolesPermitidos }) {
  const { usuario, cargando } = useAuth();

  // Mientras verifica el token guardado, no redirigir todavía
  if (cargando) return <div>Verificando sesión...</div>;

  // Sin usuario → redirigir al login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Con rolesPermitidos, verificar el rol
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  // Autenticado y autorizado → renderizar la ruta hija
  return <Outlet />;
}

export default PrivateRoute;
\`\`\`

## Uso en App.jsx

\`\`\`jsx
<Routes>
  <Route path="/login" element={<LoginPage />} />

  {/* Todas las rutas dentro requieren estar autenticado */}
  <Route path="/" element={<PrivateRoute />}>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="alumnos"   element={<Alumnos />} />
  </Route>

  {/* Ruta solo para admin */}
  <Route path="/admin" element={<PrivateRoute rolesPermitidos={['admin']} />}>
    <Route path="escuelas" element={<GestionEscuelas />} />
  </Route>
</Routes>
\`\`\`

## Flujo de navegación

\`\`\`
Usuario accede a /dashboard:
  1. React Router renderiza <PrivateRoute />
  2. PrivateRoute: useAuth() → ¿hay usuario?
     ├── Cargando → mostrar spinner
     ├── No autenticado → <Navigate to="/login" replace />
     └── Autenticado → <Outlet /> (renderiza <Dashboard />)
\`\`\`

<Mermaid titulo="Flujo de rutas protegidas">
{\`flowchart TD
  A[Usuario navega a /dashboard] --> B{¿Está cargando?}
  B -->|Sí| C[Mostrar spinner]
  B -->|No| D{¿Hay usuario en AuthContext?}
  D -->|No| E[Redirigir a /login]
  D -->|Sí| F{¿Requiere rol específico?}
  F -->|No| G[Renderizar Dashboard]
  F -->|Sí, y tiene el rol| G
  F -->|Sí, pero no tiene el rol| H[Redirigir a /no-autorizado]\`}
</Mermaid>

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué PrivateRoute espera con un spinner mientras 'cargando' es true?",
      opciones: [
        { texto: "Para que la UI se vea mejor" },
        { texto: "Porque al iniciar la app, AuthContext verifica el token de localStorage de forma asíncrona — si se redirige al login inmediatamente, los usuarios con token válido serían expulsados antes de que la verificación termine", correcta: true },
        { texto: "React Router requiere una confirmación antes de navegar" },
        { texto: "Para dar tiempo al servidor de responder" },
      ],
      explicacion: "El useEffect en AuthContext que verifica el token es asíncrono. Al cargar la app, cargando=true hasta que termine. Si PrivateRoute no espera, el usuario=null inicial causaría una redirección falsa al login incluso con un token válido guardado.",
    },
  ]}
/>
`,
);

// ── 07-custom-hooks ───────────────────────────────────────────────────────────
write(
  `${base}/react-avanzado/07-custom-hooks.mdx`,
  `# Custom Hooks: reutilizar lógica entre componentes

Un custom hook es una función JavaScript que usa hooks de React y cuyo nombre
empieza con "use". Permite extraer y reutilizar lógica compleja.

## El problema: lógica duplicada

\`\`\`jsx
// ❌ Sin custom hook — la misma lógica en múltiples componentes
function ListaAlumnos() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchAuth('/alumnos', { signal: controller.signal })
      .then(setDatos)
      .catch(e => { if (e.name !== 'AbortError') setError(e.message); })
      .finally(() => setCargando(false));
    return () => controller.abort();
  }, []);
  // ...
}

// El mismo patrón repetido en Grupos, Asistencias, Mensajes...
\`\`\`

## La solución: custom hook useFetch

\`\`\`jsx
// web/src/hooks/useFetch.js
import { useState, useEffect } from 'react';
import fetchAuth from '../utils/fetchAuth';

export function useFetch(path, deps = []) {
  const [datos, setDatos]     = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    setCargando(true);
    setError(null);

    fetchAuth(path, { signal: controller.signal })
      .then(setDatos)
      .catch(e => { if (e.name !== 'AbortError') setError(e.message); })
      .finally(() => setCargando(false));

    return () => controller.abort();
  }, [path, ...deps]);

  return { datos, cargando, error };
}
\`\`\`

\`\`\`jsx
// ✅ Con custom hook — limpio y reutilizable
function ListaAlumnos() {
  const { datos: alumnos, cargando, error } = useFetch('/alumnos');
  if (cargando) return <Spinner />;
  if (error)    return <p>Error: {error}</p>;
  return <ul>{alumnos.map(a => <li key={a._id}>{a.nombre}</li>)}</ul>;
}

function ListaGrupos() {
  const { datos: grupos, cargando } = useFetch('/grupos');
  // Misma lógica, ninguna duplicación
}
\`\`\`

## Custom hooks en kidotag10

\`\`\`javascript
// hooks del web de kidotag10:
useAuth()                    // → { usuario, token, login, logout }
useAsistenciaRealTime(id)    // → Socket.IO listener
useFetch(path)               // → { datos, cargando, error }
useAlumnos(grupoId)          // → lista de alumnos filtrada
\`\`\`

<Callout variante="tip" titulo="Reglas de los Hooks">
  Los hooks (incluidos custom hooks) solo se pueden llamar en:
  1. El nivel superior de un componente funcional
  2. Dentro de otro custom hook
  
  No se pueden llamar en bucles, condiciones o funciones anidadas.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Qué convierte a una función JavaScript regular en un 'custom hook' de React?",
      opciones: [
        { texto: "Que esté en la carpeta /hooks/" },
        { texto: "Que su nombre empiece con 'use' y que use uno o más hooks de React internamente", correcta: true },
        { texto: "Que sea exportada como default" },
        { texto: "Que acepte props como parámetros" },
      ],
      explicacion: "React identifica los hooks por el prefijo 'use'. Esto no es solo convención — eslint-plugin-react-hooks usa el prefijo para aplicar las Reglas de Hooks (no llamar en condiciones, etc.). Una función sin el prefijo puede usar hooks pero los linters no la validarán.",
    },
  ]}
/>
`,
);

// ── 07-dashboard-pattern ─────────────────────────────────────────────────────
write(
  `${base}/react-avanzado/07-dashboard-pattern.mdx`,
  `# El patrón Dashboard en kidotag10

El dashboard es el corazón del web de kidotag10. Integra autenticación,
tiempo real, fetch de datos y renderizado condicional por rol.

## Arquitectura del Dashboard

\`\`\`
App
└── AuthProvider
    └── BrowserRouter
        └── PrivateRoute (requiere auth)
            └── LayoutDashboard (sidebar + outlet)
                ├── Dashboard (home)
                │   ├── ResumenAsistencias (useFetch)
                │   └── ListaReciente (useAsistenciaRealTime)
                ├── Alumnos
                │   ├── ListaAlumnos (useFetch)
                │   └── DetalleAlumno (useParams + useFetch)
                └── Grupos
                    └── ListaGrupos (useFetch)
\`\`\`

## Container / Presentational pattern

\`\`\`jsx
// Container: lógica de datos
function AlumnosContainer() {
  const { usuario } = useAuth();
  const { datos, cargando, error } = useFetch('/alumnos');
  const [seleccionado, setSeleccionado] = useState(null);

  if (cargando) return <Spinner />;
  if (error)    return <MensajeError texto={error} />;

  return (
    <AlumnosView
      alumnos={datos}
      rolUsuario={usuario.rol}
      onSeleccionar={setSeleccionado}
    />
  );
}

// Presentational: solo renderizado
function AlumnosView({ alumnos, rolUsuario, onSeleccionar }) {
  return (
    <div>
      <h1>Alumnos ({alumnos.length})</h1>
      {rolUsuario === 'admin' && <BotonNuevoAlumno />}
      <ListaAlumnos alumnos={alumnos} onSeleccionar={onSeleccionar} />
    </div>
  );
}
\`\`\`

## Renderizado según el rol

\`\`\`jsx
// kidotag10 muestra diferentes opciones según el rol
function Sidebar() {
  const { usuario } = useAuth();

  return (
    <nav>
      <Link to="/dashboard">Inicio</Link>
      
      {/* Solo profesores y admin */}
      {['profesor', 'admin'].includes(usuario.rol) && (
        <>
          <Link to="/alumnos">Alumnos</Link>
          <Link to="/asistencias">Asistencias</Link>
        </>
      )}

      {/* Solo admin */}
      {usuario.rol === 'admin' && (
        <Link to="/escuela">Configuración</Link>
      )}

      {/* Solo tutores */}
      {usuario.rol === 'tutor' && (
        <Link to="/mis-hijos">Mis hijos</Link>
      )}
    </nav>
  );
}
\`\`\`

<Callout variante="info" titulo="Estado del tiempo real se combina con datos iniciales">
  El patrón de kidotag10: cargar los datos del día con \`useFetch\` al montar
  el componente, y luego actualizar con los eventos de Socket.IO.
  \`useFetch\` provee el estado inicial; \`useAsistenciaRealTime\` agrega
  eventos al estado en tiempo real.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Cuál es la ventaja del patrón Container/Presentational en React?",
      opciones: [
        { texto: "Hace los componentes más rápidos" },
        { texto: "Separa la lógica de datos del renderizado — el componente presentational es fácil de testear y reutilizar porque no depende de fetch ni de context", correcta: true },
        { texto: "Reduce el número de re-renders" },
        { texto: "Es requerido por React Router" },
      ],
      explicacion: "Un componente presentational solo recibe props y renderiza. Se puede probar pasándole props directamente, sin mockear fetch ni context. El container encapsula la complejidad de obtener y transformar los datos.",
    },
  ]}
/>
`,
);

console.log("\n✅ Lecciones react-avanzado escritas.");
