import fs from "fs";

const append = (path, extra) => {
  const current = fs.readFileSync(path, "utf8");
  fs.writeFileSync(path, current.trimEnd() + "\n\n" + extra + "\n", "utf8");
  console.log("✅", path);
};

const base = "src/lessons";

// ── 06-props-composicion: add CodePlayground ──────────────────────────────────
append(
  `${base}/react-fundamentos/06-props-composicion.mdx`,
  `
## Practica: construye una tarjeta de alumno

Modifica el componente \`AlumnoCard\` para mostrar un ícono diferente según el
nivel del alumno (primaria/secundaria). Observa cómo las props controlan todo.

<CodePlayground
  titulo="Props: AlumnoCard interactivo"
  codigo={\`import { useState } from "react";

function AlumnoCard({ nombre, grado, presente, nivel }) {
  const nivIcon = nivel === "primaria" ? "🏫" : "🎓";
  return (
    <div style={{
      border: \\\`2px solid \\\${presente ? "#15803d" : "#b91c1c"}\\\`,
      borderRadius: 8,
      padding: 12,
      margin: 8,
      background: presente ? "#f0fdf4" : "#fef2f2",
      maxWidth: 200,
    }}>
      <div style={{ fontSize: 24 }}>{nivIcon}</div>
      <strong>{nombre}</strong>
      <div>Grado: {grado}</div>
      <div style={{ color: presente ? "#15803d" : "#b91c1c", fontWeight: 600 }}>
        {presente ? "✅ Presente" : "🔴 Ausente"}
      </div>
    </div>
  );
}

// Lista de alumnos de prueba
const alumnos = [
  { id: 1, nombre: "Ana García",  grado: "3°A", presente: true,  nivel: "primaria" },
  { id: 2, nombre: "Luis López",  grado: "6°B", presente: false, nivel: "primaria" },
  { id: 3, nombre: "Mia Torres",  grado: "1°C", presente: true,  nivel: "secundaria" },
];

export default function App() {
  const [filtro, setFiltro] = useState("todos");

  const visibles = alumnos.filter(a =>
    filtro === "todos" ? true :
    filtro === "presentes" ? a.presente :
    !a.presente
  );

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16 }}>
      <h2>Lista de alumnos</h2>
      <div style={{ margin: "12px 0" }}>
        {["todos", "presentes", "ausentes"].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              marginRight: 8,
              padding: "4px 12px",
              background: filtro === f ? "#274c77" : "#e2e8f0",
              color: filtro === f ? "#fff" : "#0f172a",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {visibles.map(a => (
          <AlumnoCard key={a.id} {...a} />
        ))}
      </div>
      {visibles.length === 0 && <p>No hay alumnos en esta categoría.</p>}
    </div>
  );
}\`}
/>
`,
);

// ── 06-renderizado-listas: add CodePlayground ─────────────────────────────────
append(
  `${base}/react-fundamentos/06-renderizado-listas.mdx`,
  `
## Practica: lista de asistencias con filtro

<CodePlayground
  titulo="Listas y renderizado condicional"
  codigo={\`import { useState } from "react";

const asistencias = [
  { id: 1, nombre: "Ana García",  hora: "07:58", presente: true  },
  { id: 2, nombre: "Luis López",  hora: "08:03", presente: false },
  { id: 3, nombre: "Mia Torres",  hora: "08:12", presente: true  },
  { id: 4, nombre: "Pedro Ruiz",  hora: "",       presente: false },
  { id: 5, nombre: "Sara Díaz",   hora: "07:45", presente: true  },
];

function FilaAsistencia({ nombre, hora, presente }) {
  return (
    <tr style={{ background: presente ? "#f0fdf4" : "#fef2f2" }}>
      <td style={{ padding: "8px 12px" }}>{nombre}</td>
      <td style={{ padding: "8px 12px", color: "#64748b" }}>
        {hora || "—"}
      </td>
      <td style={{ padding: "8px 12px", fontWeight: 600,
                   color: presente ? "#15803d" : "#b91c1c" }}>
        {presente ? "✅ Presente" : "🔴 Ausente"}
      </td>
    </tr>
  );
}

export default function App() {
  const [mostrar, setMostrar] = useState("todos");

  const filtrados = asistencias.filter(a =>
    mostrar === "todos"     ? true :
    mostrar === "presentes" ? a.presente :
    !a.presente
  );

  const presentes = asistencias.filter(a => a.presente).length;

  if (asistencias.length === 0) return <p>Sin datos.</p>;

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16 }}>
      <h2>Asistencias — {presentes}/{asistencias.length} presentes</h2>

      <div style={{ margin: "12px 0" }}>
        {["todos", "presentes", "ausentes"].map(v => (
          <button
            key={v}
            onClick={() => setMostrar(v)}
            style={{
              marginRight: 8,
              padding: "4px 12px",
              background: mostrar === v ? "#274c77" : "#e2e8f0",
              color: mostrar === v ? "#fff" : "#0f172a",
              border: "none", borderRadius: 4, cursor: "pointer",
            }}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <p style={{ color: "#64748b" }}>
          No hay alumnos {mostrar} en este grupo.
        </p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Alumno</th>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Hora</th>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(a => (
              <FilaAsistencia key={a.id} {...a} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}\`}
/>
`,
);

// ── 06-inputs-controlados: add CodePlayground ─────────────────────────────────
append(
  `${base}/react-fundamentos/06-inputs-controlados.mdx`,
  `
## Practica: formulario de nuevo alumno

<CodePlayground
  titulo="Formulario controlado — nuevo alumno"
  codigo={\`import { useState } from "react";

const GRADOS = ["1°", "2°", "3°", "4°", "5°", "6°"];
const GRUPOS = ["A", "B", "C"];

export default function App() {
  const [form, setForm] = useState({
    nombre: "", grado: "1°", grupo: "A",
  });
  const [alumnos, setAlumnos] = useState([]);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(""); // limpiar error al escribir
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setError("El nombre es requerido.");
      return;
    }
    setAlumnos(prev => [...prev, { ...form, id: Date.now() }]);
    setForm({ nombre: "", grado: "1°", grupo: "A" }); // reset
  }

  const style = {
    input: {
      display: "block", width: "100%", padding: "8px 10px",
      border: "1px solid #cbd5e1", borderRadius: 6, marginBottom: 12,
      fontFamily: "sans-serif", fontSize: 14,
    },
    btn: {
      padding: "8px 20px", background: "#274c77", color: "#fff",
      border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600,
    },
    label: { display: "block", fontSize: 13, color: "#64748b", marginBottom: 4 },
    error: { color: "#b91c1c", fontSize: 13, marginTop: -8, marginBottom: 12 },
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16, maxWidth: 400 }}>
      <h2 style={{ marginBottom: 16 }}>Registrar alumno</h2>

      <form onSubmit={handleSubmit}>
        <label style={style.label}>Nombre completo *</label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Ej: Ana García López"
          style={style.input}
        />
        {error && <p style={style.error}>{error}</p>}

        <label style={style.label}>Grado</label>
        <select name="grado" value={form.grado}
                onChange={handleChange} style={style.input}>
          {GRADOS.map(g => (
            <option key={g} value={g}>{g} grado</option>
          ))}
        </select>

        <label style={style.label}>Grupo</label>
        <select name="grupo" value={form.grupo}
                onChange={handleChange} style={style.input}>
          {GRUPOS.map(g => (
            <option key={g} value={g}>Grupo {g}</option>
          ))}
        </select>

        <button type="submit" style={style.btn}>
          Agregar alumno
        </button>
      </form>

      {alumnos.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Alumnos registrados ({alumnos.length})</h3>
          <ul style={{ paddingLeft: 20 }}>
            {alumnos.map(a => (
              <li key={a.id}>
                {a.nombre} — {a.grado} grado, Grupo {a.grupo}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}\`}
/>
`,
);

console.log("\n✅ CodePlayground añadido a 3 lecciones react-fundamentos.");
