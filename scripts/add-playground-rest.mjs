import fs from "fs";

const append = (path, extra) => {
  const current = fs.readFileSync(path, "utf8");
  fs.writeFileSync(path, current.trimEnd() + "\n\n" + extra + "\n", "utf8");
  console.log("✅", path);
};

const base = "src/lessons";

// ── 08-fetch-api: add CodePlayground ─────────────────────────────────────────
append(
  `${base}/web-api/08-fetch-api.mdx`,
  `
## Practica: simulador de peticiones HTTP

<CodePlayground
  titulo="fetch — simulador de llamadas a la API"
  codigo={\`import { useState } from "react";

// Datos simulados (en kidotag10 vendrían de la API real)
const DB = {
  alumnos: [
    { _id: "a1", nombre: "Ana García",  grado: "3°A" },
    { _id: "a2", nombre: "Luis López",  grado: "6°B" },
    { _id: "a3", nombre: "Mia Torres",  grado: "1°C" },
  ],
  login: { token: "eyJhbGciOiJIUzI1NiJ9...TRUNCADO", rol: "admin" },
};

// Simula fetch con delay y errores controlables
async function mockFetch(url, options = {}) {
  await new Promise(r => setTimeout(r, 600)); // delay realista

  if (url.includes("/auth/login")) {
    const body = JSON.parse(options.body || "{}");
    if (body.email === "admin@kidotag.mx" && body.password === "1234") {
      return { ok: true, status: 200, json: async () => DB.login };
    }
    return { ok: false, status: 401, json: async () => ({ mensaje: "Credenciales inválidas" }) };
  }
  if (url.includes("/alumnos")) {
    const auth = (options.headers || {}).Authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return { ok: false, status: 401, json: async () => ({ mensaje: "Token requerido" }) };
    }
    return { ok: true, status: 200, json: async () => ({ ok: true, data: DB.alumnos }) };
  }
  return { ok: false, status: 404, json: async () => ({ mensaje: "Ruta no encontrada" }) };
}

export default function App() {
  const [token, setToken]   = useState("");
  const [log, setLog]       = useState([]);
  const [loading, setLoading] = useState(false);

  function addLog(tipo, msg) {
    setLog(prev => [...prev, { tipo, msg, ts: new Date().toLocaleTimeString() }]);
  }

  async function doLogin() {
    setLoading(true);
    addLog("info", "POST /api/auth/login ...");
    const res = await mockFetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@kidotag.mx", password: "1234" }),
    });
    const json = await res.json();
    if (res.ok) {
      setToken(json.token);
      addLog("ok", \\\`✅ Login OK. Token guardado (rol: \\\${json.rol})\\\`);
    } else {
      addLog("error", \\\`❌ \\\${res.status}: \\\${json.mensaje}\\\`);
    }
    setLoading(false);
  }

  async function doGetAlumnos() {
    setLoading(true);
    addLog("info", "GET /api/alumnos ...");
    const res = await mockFetch("http://localhost:4000/api/alumnos", {
      headers: { Authorization: token ? \\\`Bearer \\\${token}\\\` : "" },
    });
    const json = await res.json();
    if (res.ok) {
      addLog("ok", \\\`✅ \\\${json.data.length} alumnos recibidos\\\`);
      addLog("data", JSON.stringify(json.data, null, 2));
    } else {
      addLog("error", \\\`❌ \\\${res.status}: \\\${json.mensaje}\\\`);
    }
    setLoading(false);
  }

  function doLogout() {
    setToken("");
    addLog("info", "Token eliminado (logout).");
  }

  const btnStyle = (color) => ({
    padding: "7px 14px", background: color, color: "#fff",
    border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600,
  });

  return (
    <div style={{ fontFamily: "monospace", padding: 16 }}>
      <h2 style={{ fontFamily: "sans-serif", marginBottom: 12 }}>
        Simulador fetch API
      </h2>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={doLogin}      style={btnStyle("#274c77")} disabled={loading}>
          1. Login (POST /auth/login)
        </button>
        <button onClick={doGetAlumnos} style={btnStyle("#15803d")} disabled={loading}>
          2. GET /alumnos {token ? "🔑" : "🚫"}
        </button>
        <button onClick={doLogout}     style={btnStyle("#b91c1c")} disabled={loading}>
          Logout
        </button>
        <button onClick={() => setLog([])} style={btnStyle("#64748b")} disabled={loading}>
          Limpiar
        </button>
      </div>

      {token && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0",
                      borderRadius: 6, padding: "8px 12px", marginBottom: 12,
                      fontSize: 12, wordBreak: "break-all" }}>
          🔑 Token: {token.slice(0, 40)}...
        </div>
      )}

      <div style={{ background: "#0f172a", color: "#e2e8f0", borderRadius: 8,
                    padding: 12, minHeight: 120, fontSize: 12, lineHeight: 1.6 }}>
        {log.length === 0 && (
          <span style={{ color: "#475569" }}>
            Presiona "Login" para comenzar...
          </span>
        )}
        {log.map((l, i) => (
          <div key={i} style={{
            color: l.tipo === "ok" ? "#4ade80" :
                   l.tipo === "error" ? "#f87171" :
                   l.tipo === "data" ? "#93c5fd" : "#94a3b8",
          }}>
            <span style={{ color: "#475569" }}>[{l.ts}] </span>{l.msg}
          </div>
        ))}
        {loading && <div style={{ color: "#fbbf24" }}>⏳ esperando respuesta...</div>}
      </div>
    </div>
  );
}\`}
/>
`,
);

// ── 09-css-variables: add CodePlayground ──────────────────────────────────────
append(
  `${base}/estilos-ux/09-css-variables.mdx`,
  `
## Practica: diseña tu propio tema de color

Modifica los valores de las variables para crear un tema personalizado para KidoTag.

<CodePlayground
  titulo="CSS Variables — tema interactivo"
  codigo={\`import { useState } from "react";

const TEMAS = {
  "KidoTag original": {
    accent: "#274c77",
    accentLight: "#3b6fa0",
    success: "#15803d",
    bg: "#f1f5f9",
    surface: "#ffffff",
    text: "#0f172a",
  },
  "Oscuro moderno": {
    accent: "#6366f1",
    accentLight: "#818cf8",
    success: "#22c55e",
    bg: "#0f172a",
    surface: "#1e293b",
    text: "#f1f5f9",
  },
  "Verde escolar": {
    accent: "#166534",
    accentLight: "#15803d",
    success: "#84cc16",
    bg: "#f0fdf4",
    surface: "#ffffff",
    text: "#14532d",
  },
};

function Preview({ tema }) {
  return (
    <div style={{
      background: tema.bg,
      color: tema.text,
      borderRadius: 10,
      padding: 16,
      fontFamily: "sans-serif",
      border: \\\`1px solid \\\${tema.accent}40\\\`,
    }}>
      {/* Header */}
      <div style={{
        background: tema.accent,
        color: "#fff",
        padding: "10px 14px",
        borderRadius: 6,
        marginBottom: 12,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        📚 KidoTag — {tema === TEMAS["Oscuro moderno"] ? "Dark" : tema === TEMAS["Verde escolar"] ? "Verde" : "Original"}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        {[["234", "Alumnos"], ["8", "Grupos"], ["92%", "Asistencia"]].map(([val, label]) => (
          <div key={label} style={{
            flex: 1, textAlign: "center",
            background: tema.surface,
            padding: "10px 4px",
            borderRadius: 6,
            border: \\\`1px solid \\\${tema.accent}30\\\`,
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: tema.accent }}>{val}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Botones */}
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{
          padding: "8px 16px", background: tema.accent, color: "#fff",
          border: "none", borderRadius: 6, cursor: "pointer", flex: 1, fontWeight: 600,
        }}>
          Tomar asistencia
        </button>
        <button style={{
          padding: "8px 16px", background: "transparent", color: tema.accent,
          border: \\\`2px solid \\\${tema.accent}\\\`, borderRadius: 6, cursor: "pointer", flex: 1,
        }}>
          Ver grupos
        </button>
      </div>

      {/* Alerta éxito */}
      <div style={{
        marginTop: 12, padding: "8px 12px",
        background: \\\`\\\${tema.success}20\\\`,
        color: tema.success,
        borderRadius: 6, fontSize: 13,
        border: \\\`1px solid \\\${tema.success}40\\\`,
      }}>
        ✅ Ana García marcada como presente
      </div>
    </div>
  );
}

export default function App() {
  const [nombre, setNombre] = useState("KidoTag original");
  const tema = TEMAS[nombre];

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>CSS Variables — Temas</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.keys(TEMAS).map(t => (
          <button key={t} onClick={() => setNombre(t)}
            style={{
              padding: "6px 14px", border: "none", borderRadius: 6,
              cursor: "pointer", fontWeight: 600,
              background: nombre === t ? "#274c77" : "#e2e8f0",
              color: nombre === t ? "#fff" : "#0f172a",
            }}>
            {t}
          </button>
        ))}
      </div>

      <Preview tema={tema} />

      <p style={{ marginTop: 14, fontSize: 12, color: "#64748b" }}>
        Solo cambiando 6 variables CSS se transforma toda la interfaz.
        En kidotag10, estas variables están en <code>src/index.css :root</code>.
      </p>
    </div>
  );
}\`}
/>
`,
);

// ── 09-estados-ui: add CodePlayground ────────────────────────────────────────
append(
  `${base}/estilos-ux/09-estados-ui.mdx`,
  `
## Practica: botón con todos sus estados

<CodePlayground
  titulo="Estados UI — spinner, disabled, error, éxito"
  codigo={\`import { useState } from "react";

function BotonAccion({ onClick, estado, texto }) {
  const configs = {
    idle:    { bg: "#274c77", label: texto,        icon: null,    disabled: false },
    loading: { bg: "#94a3b8", label: "Guardando…", icon: "⏳",    disabled: true  },
    success: { bg: "#15803d", label: "¡Guardado!",  icon: "✅",    disabled: false },
    error:   { bg: "#b91c1c", label: "Error",       icon: "❌",    disabled: false },
  };
  const { bg, label, icon, disabled } = configs[estado];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 22px",
        background: bg,
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 600,
        fontSize: 15,
        display: "flex",
        alignItems: "center",
        gap: 8,
        transition: "background 0.2s",
        opacity: disabled ? 0.75 : 1,
      }}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

export default function App() {
  const [estado, setEstado] = useState("idle");
  const [modo, setModo]     = useState("success"); // qué simulará el click

  async function handleClick() {
    if (estado === "loading") return;
    setEstado("loading");
    await new Promise(r => setTimeout(r, 1500));
    setEstado(modo);
    if (modo === "success") {
      setTimeout(() => setEstado("idle"), 2000);
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16 }}>
      <h2>Estados de UI</h2>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
        En kidotag10, cada operación de guardado pasa por estos estados.
      </p>

      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: "#64748b" }}>Simular: </span>
        {["success","error"].map(m => (
          <button key={m} onClick={() => { setModo(m); setEstado("idle"); }}
            style={{
              marginLeft: 8, padding: "4px 12px", border: "none",
              borderRadius: 5, cursor: "pointer",
              background: modo === m ? "#274c77" : "#e2e8f0",
              color: modo === m ? "#fff" : "#0f172a",
            }}>
            {m}
          </button>
        ))}
      </div>

      <BotonAccion
        texto="Guardar alumno"
        estado={estado}
        onClick={handleClick}
      />

      {estado === "error" && (
        <div style={{
          marginTop: 12, padding: "10px 14px",
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 8, color: "#b91c1c", fontSize: 14,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>❌ No se pudo guardar. Verifica tu conexión.</span>
          <button onClick={() => setEstado("idle")}
            style={{ background: "none", border: "none",
                     cursor: "pointer", color: "#b91c1c", fontSize: 18 }}>
            ✕
          </button>
        </div>
      )}

      <div style={{
        marginTop: 16, padding: "10px 14px",
        background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0",
        fontSize: 13, color: "#475569",
      }}>
        Estado actual: <code style={{ background: "#e2e8f0", padding: "1px 6px",
          borderRadius: 4, color: "#274c77", fontWeight: 700 }}>
          {estado}
        </code>
      </div>
    </div>
  );
}\`}
/>
`,
);

console.log(
  "\n✅ CodePlayground añadido a fetch-api, css-variables y estados-ui.",
);
