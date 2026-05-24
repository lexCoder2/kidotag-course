/**
 * Mock API en memoria para el ApiPlayground del curso.
 * Simula los endpoints principales de kidotag10 sin necesitar un servidor real.
 */

// ──────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────
export interface MockResponse {
  status: number;
  body: unknown;
  delay?: number; // ms simulados de latencia
}

export interface MockRequest {
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

// ──────────────────────────────────────────────
// Datos en memoria
// ──────────────────────────────────────────────
const db = {
  tutores: [
    {
      _id: "tutor1",
      nombre: "María García",
      email: "maria@kidotag.test",
      activo: true,
    },
    {
      _id: "tutor2",
      nombre: "Carlos López",
      email: "carlos@kidotag.test",
      activo: true,
    },
  ],
  profesores: [
    {
      _id: "prof1",
      nombre: "Dr. Ana Martínez",
      email: "ana@kidotag.test",
      esAdmin: true,
      activo: true,
    },
    {
      _id: "prof2",
      nombre: "Prof. Juan Pérez",
      email: "juan@kidotag.test",
      esAdmin: false,
      activo: true,
    },
  ],
  alumnos: [
    {
      _id: "alum1",
      nombre: "Luis",
      apellidos: "García Rodríguez",
      uidTarjeta: "A1B2C3D4",
      tutor: "tutor1",
      fechaNacimiento: "2015-03-10",
    },
    {
      _id: "alum2",
      nombre: "Sofía",
      apellidos: "López Martínez",
      uidTarjeta: "E5F6G7H8",
      tutor: "tutor2",
      fechaNacimiento: "2014-07-22",
    },
    {
      _id: "alum3",
      nombre: "Diego",
      apellidos: "García Rodríguez",
      uidTarjeta: "I9J0K1L2",
      tutor: "tutor1",
      fechaNacimiento: "2016-11-05",
    },
  ],
  grupos: [
    {
      _id: "grupo1",
      nombre: "Primero A",
      nivel: "Primaria",
      alumnos: ["alum1", "alum2"],
      profesor: "prof1",
    },
    {
      _id: "grupo2",
      nombre: "Segundo B",
      nivel: "Primaria",
      alumnos: ["alum3"],
      profesor: "prof2",
    },
  ],
  asistencias: [
    {
      _id: "asist1",
      alumnoId: "alum1",
      nombre: "Luis García",
      uidTarjeta: "A1B2C3D4",
      tipo: "entrada",
      fechaHora: new Date().toISOString(),
    },
  ],
  tokens: {} as Record<string, { id: string; tipo: string; email: string }>,
};

// ──────────────────────────────────────────────
// Token JWT simulado
// ──────────────────────────────────────────────
function generarTokenMock(payload: {
  id: string;
  tipo: string;
  email: string;
}): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
    }),
  );
  const sig = btoa("kidotag-mock-signature");
  const token = `${header}.${body}.${sig}`;
  db.tokens[token] = payload;
  return token;
}

function verificarTokenMock(
  authHeader?: string,
): { id: string; tipo: string; email: string } | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return db.tokens[token] ?? null;
}

// ──────────────────────────────────────────────
// Router
// ──────────────────────────────────────────────
export async function fetchMock(req: MockRequest): Promise<MockResponse> {
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 200)); // latencia simulada

  const { method, endpoint, body, headers } = req;
  const path = endpoint.replace(/^\/?(api\/v1\/)?/, "").replace(/\/$/, "");
  const usuario = verificarTokenMock(headers?.Authorization);

  // ── AUTH ─────────────────────────────────────
  if (path === "auth/login" && method === "POST") {
    const { email, password } = (body ?? {}) as Record<string, string>;
    if (!email || !password) {
      return {
        status: 400,
        body: {
          ok: false,
          error: {
            codigo: "DATOS_INVALIDOS",
            mensaje: "Email y password son requeridos",
          },
        },
      };
    }
    const prof = db.profesores.find((p) => p.email === email);
    const tutor = db.tutores.find((t) => t.email === email);
    const usuario = prof ?? tutor;
    if (!usuario) {
      return {
        status: 401,
        body: {
          ok: false,
          error: {
            codigo: "CREDENCIALES_INVALIDAS",
            mensaje: "Email o password incorrectos",
          },
        },
      };
    }
    // En el mock siempre aceptamos password "Demo123!"
    if (password !== "Demo123!") {
      return {
        status: 401,
        body: {
          ok: false,
          error: {
            codigo: "CREDENCIALES_INVALIDAS",
            mensaje: "Password incorrecto (usa Demo123!)",
          },
        },
      };
    }
    const tipo = prof ? "profesor" : "tutor";
    const token = generarTokenMock({
      id: usuario._id,
      tipo,
      email: usuario.email,
    });
    return {
      status: 200,
      body: {
        ok: true,
        data: {
          token,
          tipo,
          usuario: {
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            tipo,
          },
          expiresIn: "7d",
        },
      },
    };
  }

  // ── ESTADO ───────────────────────────────────
  if (path === "estado" && method === "GET") {
    return {
      status: 200,
      body: {
        ok: true,
        data: {
          estado: "ok",
          version: "1.0.0",
          timestamp: new Date().toISOString(),
        },
      },
    };
  }

  // ── RUTAS PROTEGIDAS ─────────────────────────
  if (!usuario && !["estado", "auth/login"].includes(path)) {
    return {
      status: 401,
      body: {
        ok: false,
        error: {
          codigo: "TOKEN_REQUERIDO",
          mensaje:
            "Se requiere token de autenticación. Usa POST /auth/login primero.",
        },
      },
    };
  }

  // ── ALUMNOS ───────────────────────────────────
  if (path === "alumnos") {
    if (method === "GET") {
      return {
        status: 200,
        body: { ok: true, data: db.alumnos, total: db.alumnos.length },
      };
    }
    if (method === "POST") {
      const { nombre, apellidos, uidTarjeta, tutor } = (body ?? {}) as Record<
        string,
        string
      >;
      if (!nombre || !uidTarjeta || !tutor) {
        return {
          status: 400,
          body: {
            ok: false,
            error: {
              codigo: "DATOS_INVALIDOS",
              mensaje: "nombre, uidTarjeta y tutor son requeridos",
            },
          },
        };
      }
      if (db.alumnos.find((a) => a.uidTarjeta === uidTarjeta)) {
        return {
          status: 409,
          body: {
            ok: false,
            error: {
              codigo: "UID_DUPLICADO",
              mensaje: `Ya existe un alumno con UID ${uidTarjeta}`,
            },
          },
        };
      }
      const nuevo = {
        _id: `alum${Date.now()}`,
        nombre,
        apellidos: apellidos ?? "",
        uidTarjeta,
        tutor,
        fechaNacimiento: "",
      };
      db.alumnos.push(nuevo);
      return { status: 201, body: { ok: true, data: nuevo } };
    }
  }

  // ── ALUMNOS/:ID ───────────────────────────────
  const alumnoMatch = path.match(/^alumnos\/(.+)$/);
  if (alumnoMatch) {
    const id = alumnoMatch[1];
    const alumno = db.alumnos.find((a) => a._id === id);
    if (!alumno)
      return {
        status: 404,
        body: {
          ok: false,
          error: { codigo: "NO_ENCONTRADO", mensaje: "Alumno no encontrado" },
        },
      };
    if (method === "GET")
      return { status: 200, body: { ok: true, data: alumno } };
    if (method === "PUT") {
      Object.assign(alumno, body);
      return { status: 200, body: { ok: true, data: alumno } };
    }
    if (method === "DELETE") {
      db.alumnos = db.alumnos.filter((a) => a._id !== id);
      return { status: 200, body: { ok: true, mensaje: "Alumno eliminado" } };
    }
  }

  // ── TUTORES ───────────────────────────────────
  if (path === "tutores" && method === "GET") {
    return { status: 200, body: { ok: true, data: db.tutores } };
  }

  // ── PROFESORES ────────────────────────────────
  if (path === "profesores" && method === "GET") {
    return { status: 200, body: { ok: true, data: db.profesores } };
  }

  // ── GRUPOS ────────────────────────────────────
  if (path === "grupos" && method === "GET") {
    return { status: 200, body: { ok: true, data: db.grupos } };
  }

  // ── ASISTENCIAS ───────────────────────────────
  if (path === "asistencias") {
    if (method === "GET") {
      return { status: 200, body: { ok: true, data: db.asistencias } };
    }
    if (method === "POST") {
      const { uidTarjeta, tipo } = (body ?? {}) as Record<string, string>;
      if (!uidTarjeta)
        return {
          status: 400,
          body: {
            ok: false,
            error: {
              codigo: "DATOS_INVALIDOS",
              mensaje: "uidTarjeta es requerido",
            },
          },
        };
      const alumno = db.alumnos.find((a) => a.uidTarjeta === uidTarjeta);
      if (!alumno)
        return {
          status: 404,
          body: {
            ok: false,
            error: {
              codigo: "TARJETA_NO_REGISTRADA",
              mensaje: `No existe alumno con UID ${uidTarjeta}`,
            },
          },
        };
      const nueva = {
        _id: `asist${Date.now()}`,
        alumnoId: alumno._id,
        nombre: `${alumno.nombre} ${alumno.apellidos}`,
        uidTarjeta,
        tipo: tipo ?? "entrada",
        fechaHora: new Date().toISOString(),
      };
      db.asistencias.push(nueva);
      return {
        status: 201,
        body: {
          ok: true,
          data: nueva,
          mensaje: `Asistencia de ${alumno.nombre} registrada correctamente`,
        },
      };
    }
  }

  return {
    status: 404,
    body: {
      ok: false,
      error: {
        codigo: "RUTA_NO_ENCONTRADA",
        mensaje: `No existe la ruta ${method} /${path}`,
      },
    },
  };
}

// ──────────────────────────────────────────────
// Descripción de endpoints para el Playground UI
// ──────────────────────────────────────────────
export interface EndpointInfo {
  method: MockRequest["method"];
  endpoint: string;
  descripcion: string;
  requiereAuth: boolean;
  ejemploBody?: Record<string, unknown>;
}

export const ENDPOINTS: EndpointInfo[] = [
  {
    method: "GET",
    endpoint: "estado",
    descripcion: "Health check del servidor",
    requiereAuth: false,
  },
  {
    method: "POST",
    endpoint: "auth/login",
    descripcion: "Iniciar sesión (devuelve JWT)",
    requiereAuth: false,
    ejemploBody: { email: "ana@kidotag.test", password: "Demo123!" },
  },
  {
    method: "GET",
    endpoint: "alumnos",
    descripcion: "Listar todos los alumnos",
    requiereAuth: true,
  },
  {
    method: "POST",
    endpoint: "alumnos",
    descripcion: "Registrar un nuevo alumno",
    requiereAuth: true,
    ejemploBody: {
      nombre: "Pedro",
      apellidos: "Sánchez Ruiz",
      uidTarjeta: "M3N4O5P6",
      tutor: "tutor1",
    },
  },
  {
    method: "GET",
    endpoint: "alumnos/alum1",
    descripcion: "Obtener alumno por ID",
    requiereAuth: true,
  },
  {
    method: "GET",
    endpoint: "tutores",
    descripcion: "Listar tutores",
    requiereAuth: true,
  },
  {
    method: "GET",
    endpoint: "profesores",
    descripcion: "Listar profesores",
    requiereAuth: true,
  },
  {
    method: "GET",
    endpoint: "grupos",
    descripcion: "Listar grupos",
    requiereAuth: true,
  },
  {
    method: "GET",
    endpoint: "asistencias",
    descripcion: "Ver registro de asistencias",
    requiereAuth: true,
  },
  {
    method: "POST",
    endpoint: "asistencias",
    descripcion: "Registrar una asistencia (simula lectura NFC)",
    requiereAuth: true,
    ejemploBody: { uidTarjeta: "A1B2C3D4", tipo: "entrada" },
  },
];
