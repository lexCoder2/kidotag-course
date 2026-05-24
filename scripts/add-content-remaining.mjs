import fs from "fs";

const append = (path, extra) => {
  const current = fs.readFileSync(path, "utf8");
  fs.writeFileSync(path, current.trimEnd() + "\n\n" + extra + "\n", "utf8");
  console.log("✅", path);
};

const base = "src/lessons";

// ── 00-que-es-kidotag: add flujo completo ────────────────────────────────────
append(
  `${base}/bienvenida/00-que-es-kidotag.mdx`,
  `
## Flujo completo: registro de asistencia

Para entender por qué existen todas estas capas, observa cómo fluye un evento de
asistencia desde el hardware hasta el tutor:

<Mermaid
  titulo="Flujo: el alumno pasa su tarjeta NFC"
  diagrama={\`
sequenceDiagram
  participant ESP as 📟 ESP32 (NFC)
  participant API as 🖥️ API Express
  participant DB  as 🗄️ MongoDB
  participant WS  as ⚡ Socket.IO
  participant APP as 🌐 App React

  ESP->>API: POST /asistencias { uid_nfc: "A1B2C3" }
  API->>DB: Buscar alumno con uid_nfc = "A1B2C3"
  DB-->>API: { nombre: "Ana García", grupo: "3°A" }
  API->>DB: Guardar { alumno, hora, tipo: "entrada" }
  DB-->>API: Asistencia guardada ✅
  API->>WS: emit("asistencia", { alumno, hora })
  WS->>APP: Notificación en tiempo real
  APP->>APP: Actualizar tabla de asistencias
\`}
/>

<Callout variante="tip" titulo="¿Por qué necesitamos todas estas piezas?">
  Cada capa tiene una responsabilidad específica: el **ESP32** solo lee tarjetas,
  la **API Express** aplica las reglas del negocio, **MongoDB** guarda el historial,
  y **Socket.IO** evita que el maestro tenga que recargar la página.
  Este patrón de separación se llama *arquitectura en capas*.
</Callout>
`,
);

// ── 02-populate: add CodePlayground ──────────────────────────────────────────
append(
  `${base}/mongodb-mongoose/02-populate.mdx`,
  `
## Practica: simula populate

<CodePlayground
  titulo="populate() — resolución de referencias"
  codigo={\`import { useState } from "react";

// ── Datos simulados (como si fueran colecciones de MongoDB) ──
const TUTORES = {
  "t1": { _id: "t1", nombre: "Carlos García", email: "carlos@mail.com", telefono: "555-1001" },
  "t2": { _id: "t2", nombre: "María López",   email: "maria@mail.com",  telefono: "555-1002" },
  "t3": { _id: "t3", nombre: "Pedro Ruiz",    email: "pedro@mail.com",  telefono: "555-1003" },
};

const GRUPOS = {
  "g1": { _id: "g1", nombre: "Grupo A", grado: "3° Primaria" },
  "g2": { _id: "g2", nombre: "Grupo B", grado: "6° Primaria" },
};

const ALUMNOS = [
  { _id: "a1", nombre: "Ana García",  tutor: "t1", grupo: "g1" },
  { _id: "a2", nombre: "Luis López",  tutor: "t2", grupo: "g1" },
  { _id: "a3", nombre: "Mia Torres",  tutor: "t1", grupo: "g2" },
  { _id: "a4", nombre: "Pedro Díaz",  tutor: "t3", grupo: "g2" },
];

// ── Simula populate (lo que hace Mongoose internamente) ──────
function simularPopulate(alumno, campos) {
  const result = { ...alumno };
  if (campos.includes("tutor")) {
    result.tutor = TUTORES[alumno.tutor]; // segunda query
  }
  if (campos.includes("grupo")) {
    result.grupo = GRUPOS[alumno.grupo]; // segunda query
  }
  return result;
}

export default function App() {
  const [modo, setModo] = useState("sin-populate");
  const [campos, setCampos] = useState(["tutor"]);

  const toggleCampo = (c) =>
    setCampos(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const datos = ALUMNOS.map(a =>
    modo === "con-populate" ? simularPopulate(a, campos) : a
  );

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16 }}>
      <h2>populate() — visualizador</h2>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {["sin-populate", "con-populate"].map(m => (
          <button key={m} onClick={() => setModo(m)}
            style={{
              padding: "6px 14px", border: "none", borderRadius: 6,
              cursor: "pointer", fontWeight: 600,
              background: modo === m ? "#274c77" : "#e2e8f0",
              color: modo === m ? "#fff" : "#0f172a",
            }}>
            {m === "sin-populate" ? "Sin .populate()" : "Con .populate()"}
          </button>
        ))}
      </div>

      {modo === "con-populate" && (
        <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
          {["tutor", "grupo"].map(c => (
            <label key={c} style={{ display: "flex", alignItems: "center",
                                    gap: 4, cursor: "pointer", fontSize: 13 }}>
              <input type="checkbox" checked={campos.includes(c)}
                onChange={() => toggleCampo(c)} />
              populate("{c}")
            </label>
          ))}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <pre style={{
          background: "#0f172a", color: "#e2e8f0",
          padding: 14, borderRadius: 8, fontSize: 12, lineHeight: 1.6,
        }}>
          {JSON.stringify(datos, null, 2)}
        </pre>
      </div>

      <p style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
        Sin populate: solo ves IDs como "t1", "g1".
        Con populate: Mongoose hace una segunda query y reemplaza el ID por el objeto completo.
      </p>
    </div>
  );
}\`}
/>
`,
);

// ── 08-bearer-token: add CodePlayground ──────────────────────────────────────
append(
  `${base}/web-api/08-bearer-token.mdx`,
  `
## Practica: fetchAuth con manejo de 401

<CodePlayground
  titulo="Bearer Token — fetchAuth simulado"
  codigo={\`import { useState } from "react";

// ── Simula el backend de kidotag10 ──────────────────────────
async function mockApi(path, options = {}) {
  await new Promise(r => setTimeout(r, 500));
  const auth = options.headers?.Authorization || "";
  const [, token] = auth.split(" ");

  // Tokens válidos simulados
  const TOKENS = {
    "token-admin":    { rol: "admin",    nombre: "Ana García"  },
    "token-profesor": { rol: "profesor", nombre: "Luis López"  },
  };

  if (path === "/auth/login") {
    const { email, password } = JSON.parse(options.body || "{}");
    if (email === "admin@kidotag.mx" && password === "1234") {
      return { ok: true, data: { token: "token-admin", rol: "admin" } };
    }
    return { ok: false, status: 401, data: { error: "Credenciales inválidas" } };
  }

  if (!token || !TOKENS[token]) {
    return { ok: false, status: 401, data: { error: "Token inválido o expirado" } };
  }

  if (path === "/alumnos") {
    return { ok: true, data: [
      { nombre: "Mia Torres",  grado: "3°A" },
      { nombre: "Pedro Ruiz",  grado: "6°B" },
    ]};
  }

  return { ok: false, status: 404, data: { error: "Ruta no encontrada" } };
}

// ── fetchAuth: función utilitaria de kidotag10 ──────────────
async function fetchAuth(path, options = {}, token) {
  const res = await mockApi(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: \\\`Bearer \\\${token}\\\` }),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // En kidotag10 real: localStorage.removeItem('token') + redirect
    throw new Error("401: sesión expirada — redirigir a /login");
  }
  if (!res.ok) throw new Error(res.data?.error || "Error del servidor");
  return res.data;
}

export default function App() {
  const [token, setToken]   = useState("");
  const [usuario, setUsuario] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true); setError(""); setResultado(null);
    try {
      const data = await fetchAuth("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "admin@kidotag.mx", password: "1234" }),
      }, "");
      setToken(data.token);
      setUsuario(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  async function getAlumnos() {
    setLoading(true); setError(""); setResultado(null);
    try {
      const data = await fetchAuth("/alumnos", {}, token);
      setResultado(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  function expireToken() {
    setToken("token-invalido");
    setError("");
  }

  const btnS = (bg) => ({
    padding: "7px 14px", background: bg, color: "#fff",
    border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600,
    opacity: loading ? 0.6 : 1,
  });

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16, maxWidth: 400 }}>
      <h2>fetchAuth — Bearer token</h2>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={login}       style={btnS("#274c77")} disabled={loading}>
          1. Login
        </button>
        <button onClick={getAlumnos}  style={btnS("#15803d")} disabled={loading}>
          2. GET /alumnos {token ? "🔑" : "🚫"}
        </button>
        <button onClick={expireToken} style={btnS("#92400e")} disabled={loading}>
          Simular token expirado
        </button>
      </div>

      {token && !error && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0",
                      borderRadius: 6, padding: "6px 10px", marginBottom: 10,
                      fontSize: 12 }}>
          🔑 Token: <code>{token}</code>
          {usuario && <span> (rol: {usuario.rol})</span>}
        </div>
      )}

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca",
                      borderRadius: 6, padding: "8px 12px", marginBottom: 10,
                      color: "#b91c1c", fontSize: 13 }}>
          ❌ {error}
          {error.includes("401") && (
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "#7f1d1d" }}>
              En kidotag10 real: token eliminado de localStorage + redirect a /login
            </p>
          )}
        </div>
      )}

      {resultado && (
        <pre style={{ background: "#0f172a", color: "#4ade80",
                      borderRadius: 8, padding: 12, fontSize: 12 }}>
          {JSON.stringify(resultado, null, 2)}
        </pre>
      )}
    </div>
  );
}\`}
/>
`,
);

console.log("\n✅ Contenido adicional añadido a 3 lecciones.");
