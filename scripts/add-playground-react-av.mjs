import fs from "fs";

const append = (path, extra) => {
  const current = fs.readFileSync(path, "utf8");
  fs.writeFileSync(path, current.trimEnd() + "\n\n" + extra + "\n", "utf8");
  console.log("✅", path);
};

const base = "src/lessons";

// ── 07-context-api: add CodePlayground ───────────────────────────────────────
append(
  `${base}/react-avanzado/07-context-api.mdx`,
  `
## Practica: contexto de escuela

<CodePlayground
  titulo="Context API — datos globales de escuela"
  codigo={\`import { createContext, useContext, useState } from "react";

// 1. Crear el contexto
const EscuelaCtx = createContext(null);

// 2. Proveedor del contexto
function EscuelaProvider({ children }) {
  const [escuela, setEscuela] = useState({
    nombre: "Primaria Juárez",
    alumnosActivos: 234,
    gruposActivos: 8,
  });

  function actualizarNombre(nuevoNombre) {
    setEscuela(prev => ({ ...prev, nombre: nuevoNombre }));
  }

  return (
    <EscuelaCtx.Provider value={{ escuela, actualizarNombre }}>
      {children}
    </EscuelaCtx.Provider>
  );
}

// 3. Consumidor (cualquier nivel de profundidad)
function Header() {
  const { escuela } = useContext(EscuelaCtx);
  return (
    <header style={{
      background: "#274c77", color: "#fff",
      padding: "12px 16px", borderRadius: "8px 8px 0 0",
    }}>
      <h2 style={{ margin: 0 }}>📚 {escuela.nombre}</h2>
    </header>
  );
}

function Stats() {
  const { escuela } = useContext(EscuelaCtx);
  return (
    <div style={{ display: "flex", gap: 12, padding: "12px 16px",
                  background: "#f8fafc" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 24, fontWeight: 700 }}>
          {escuela.alumnosActivos}
        </div>
        <div style={{ fontSize: 12, color: "#64748b" }}>Alumnos</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 24, fontWeight: 700 }}>
          {escuela.gruposActivos}
        </div>
        <div style={{ fontSize: 12, color: "#64748b" }}>Grupos</div>
      </div>
    </div>
  );
}

function EditorNombre() {
  const { escuela, actualizarNombre } = useContext(EscuelaCtx);
  const [val, setVal] = useState(escuela.nombre);
  return (
    <div style={{ padding: "12px 16px", background: "#fff",
                  borderTop: "1px solid #e2e8f0" }}>
      <label style={{ fontSize: 13, color: "#64748b" }}>
        Cambiar nombre de la escuela:
      </label>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <input value={val} onChange={e => setVal(e.target.value)}
          style={{ flex: 1, padding: "6px 10px", border: "1px solid #cbd5e1",
                   borderRadius: 6, fontFamily: "sans-serif" }} />
        <button onClick={() => actualizarNombre(val)}
          style={{ padding: "6px 14px", background: "#274c77", color: "#fff",
                   border: "none", borderRadius: 6, cursor: "pointer" }}>
          Guardar
        </button>
      </div>
      <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
        Header y Stats se actualizan sin pasar props.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <EscuelaProvider>
      <div style={{ fontFamily: "sans-serif", border: "1px solid #e2e8f0",
                    borderRadius: 8, overflow: "hidden", maxWidth: 360 }}>
        <Header />
        <Stats />
        <EditorNombre />
      </div>
    </EscuelaProvider>
  );
}\`}
/>
`,
);

// ── 07-custom-hooks: add CodePlayground ───────────────────────────────────────
append(
  `${base}/react-avanzado/07-custom-hooks.mdx`,
  `
## Practica: escribe tu propio useAlumnos

<CodePlayground
  titulo="Custom Hook — useAlumnos"
  codigo={\`import { useState, useCallback } from "react";

// ── Hook personalizado ──────────────────────────────────────
function useAlumnos(inicial = []) {
  const [alumnos, setAlumnos] = useState(inicial);
  const [filtro, setFiltro]   = useState("todos");

  const agregar = useCallback((nombre) => {
    if (!nombre.trim()) return;
    setAlumnos(prev => [
      ...prev,
      { id: Date.now(), nombre: nombre.trim(), presente: false },
    ]);
  }, []);

  const togglePresente = useCallback((id) => {
    setAlumnos(prev =>
      prev.map(a => a.id === id ? { ...a, presente: !a.presente } : a)
    );
  }, []);

  const visibles = alumnos.filter(a =>
    filtro === "todos"     ? true :
    filtro === "presentes" ? a.presente :
    !a.presente
  );

  const stats = {
    total: alumnos.length,
    presentes: alumnos.filter(a => a.presente).length,
  };

  return { alumnos: visibles, stats, filtro, setFiltro, agregar, togglePresente };
}

// ── Componente que usa el hook ──────────────────────────────
export default function App() {
  const { alumnos, stats, filtro, setFiltro,
          agregar, togglePresente } = useAlumnos([
    { id: 1, nombre: "Ana García",  presente: true  },
    { id: 2, nombre: "Luis López",  presente: false },
  ]);
  const [nuevo, setNuevo] = useState("");

  const s = { btn: {
    padding: "5px 14px", border: "none", borderRadius: 5, cursor: "pointer",
  }};

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16, maxWidth: 340 }}>
      <h2>useAlumnos hook</h2>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>
        {stats.presentes}/{stats.total} presentes
      </p>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {["todos","presentes","ausentes"].map(f => (
          <button key={f}
            onClick={() => setFiltro(f)}
            style={{
              ...s.btn,
              background: filtro === f ? "#274c77" : "#e2e8f0",
              color: filtro === f ? "#fff" : "#0f172a",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Lista */}
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px" }}>
        {alumnos.map(a => (
          <li key={a.id}
            style={{
              display: "flex", justifyContent: "space-between",
              padding: "8px 10px", marginBottom: 4,
              background: a.presente ? "#f0fdf4" : "#fef2f2",
              borderRadius: 6, cursor: "pointer",
            }}
            onClick={() => togglePresente(a.id)}
          >
            <span>{a.nombre}</span>
            <span>{a.presente ? "✅" : "🔴"}</span>
          </li>
        ))}
        {alumnos.length === 0 && (
          <li style={{ color: "#64748b", fontSize: 13 }}>Sin alumnos.</li>
        )}
      </ul>

      {/* Agregar */}
      <div style={{ display: "flex", gap: 6 }}>
        <input value={nuevo} onChange={e => setNuevo(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { agregar(nuevo); setNuevo(""); }}}
          placeholder="Nombre del alumno..."
          style={{ flex: 1, padding: "6px 10px",
                   border: "1px solid #cbd5e1", borderRadius: 6 }} />
        <button onClick={() => { agregar(nuevo); setNuevo(""); }}
          style={{ ...s.btn, background: "#274c77", color: "#fff" }}>
          Agregar
        </button>
      </div>
      <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
        Click en un alumno para marcar/desmarcar asistencia.
      </p>
    </div>
  );
}\`}
/>
`,
);

// ── 07-rutas-protegidas: add CodePlayground ────────────────────────────────────
append(
  `${base}/react-avanzado/07-rutas-protegidas.mdx`,
  `
## Practica: simulador de ruta protegida

<CodePlayground
  titulo="PrivateRoute — simulador de login"
  codigo={\`import { useState } from "react";

// ── Simulación de AuthContext ───────────────────────────────
function AuthProvider({ children }) {
  // Normalmente vendría de un JWT en localStorage
  const [usuario, setUsuario] = useState(null);
  return (
    <AuthCtx.Provider value={{ usuario, setUsuario }}>
      {children}
    </AuthCtx.Provider>
  );
}

// Inline para que funcione en el playground sin imports externos
const { createContext, useContext } = React;
const AuthCtx = createContext(null);

// ── PrivateRoute: el mismo patrón que usa kidotag10 ────────
function PrivateRoute({ children, rol }) {
  const { usuario } = useContext(AuthCtx);

  if (!usuario) {
    return (
      <div style={{ padding: 20, background: "#fef2f2", borderRadius: 8,
                    border: "1px solid #fecaca" }}>
        <h3>🔒 Acceso denegado</h3>
        <p>Debes iniciar sesión para ver esta página.</p>
      </div>
    );
  }

  if (rol && usuario.rol !== rol) {
    return (
      <div style={{ padding: 20, background: "#fffbeb", borderRadius: 8,
                    border: "1px solid #fde68a" }}>
        <h3>⛔ Sin permisos</h3>
        <p>Tu rol es <strong>{usuario.rol}</strong>,
           pero esta ruta requiere <strong>{rol}</strong>.</p>
      </div>
    );
  }

  return children;
}

// ── Páginas de ejemplo ─────────────────────────────────────
function Dashboard() {
  const { usuario } = useContext(AuthCtx);
  return (
    <div style={{ padding: 16, background: "#f0fdf4", borderRadius: 8,
                  border: "1px solid #bbf7d0" }}>
      <h3>✅ Dashboard</h3>
      <p>Bienvenido, <strong>{usuario.nombre}</strong>
         (rol: <em>{usuario.rol}</em>).</p>
    </div>
  );
}

function AdminPanel() {
  return (
    <div style={{ padding: 16, background: "#eff6ff", borderRadius: 8,
                  border: "1px solid #bfdbfe" }}>
      <h3>🔧 Panel de Administrador</h3>
      <p>Solo visible si tu rol es <strong>admin</strong>.</p>
    </div>
  );
}

// ── App principal ─────────────────────────────────────────
function App() {
  const { usuario, setUsuario } = useContext(AuthCtx);
  const [pagina, setPagina] = useState("dashboard");

  const usuarios = [
    { nombre: "Ana García",  rol: "admin"   },
    { nombre: "Luis López",  rol: "profesor" },
    { nombre: "Mia Torres",  rol: "tutor"   },
  ];

  if (!usuario) {
    return (
      <div style={{ fontFamily: "sans-serif", padding: 16 }}>
        <h2>Selecciona un usuario para iniciar sesión:</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {usuarios.map(u => (
            <button key={u.nombre} onClick={() => setUsuario(u)}
              style={{ padding: "8px 14px", background: "#274c77", color: "#fff",
                       border: "none", borderRadius: 6, cursor: "pointer" }}>
              {u.nombre} ({u.rol})
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["dashboard","admin"].map(p => (
          <button key={p} onClick={() => setPagina(p)}
            style={{ padding: "6px 14px",
                     background: pagina === p ? "#274c77" : "#e2e8f0",
                     color: pagina === p ? "#fff" : "#0f172a",
                     border: "none", borderRadius: 6, cursor: "pointer" }}>
            {p}
          </button>
        ))}
        <button onClick={() => setUsuario(null)}
          style={{ padding: "6px 14px", background: "#b91c1c", color: "#fff",
                   border: "none", borderRadius: 6, cursor: "pointer", marginLeft: "auto" }}>
          Cerrar sesión
        </button>
      </div>

      {pagina === "dashboard" && (
        <PrivateRoute><Dashboard /></PrivateRoute>
      )}
      {pagina === "admin" && (
        <PrivateRoute rol="admin"><AdminPanel /></PrivateRoute>
      )}
    </div>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

// Nota: El playground inyecta React globalmente, por eso accedemos
// a createContext/useContext desde window.React en el hack de arriba.\`}
/>
`,
);

console.log("\n✅ CodePlayground añadido a 3 lecciones react-avanzado.");
