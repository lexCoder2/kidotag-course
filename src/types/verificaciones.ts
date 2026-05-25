// Tipos del sistema de verificaciones automáticas estilo LeetCode
// Cada sandbox puede declarar un array de Verificacion en su prop `verificaciones`.

export type EstadoVerificacion =
  | "idle" // sin ejecutar todavía
  | "corriendo" // ejecución en curso
  | "pasada" // pasó
  | "fallida"; // falló (con mensaje)

// Patrones son strings serializables (no RegExp directos) para poder guardarse
// en sessionStorage al abrir el sandbox en página dedicada.
// Si `regex` es true, `patron` se compila como RegExp con `flags` (default "").
// Si es false/undefined, se usa `String.includes(patron)` (literal).
export interface PatronContiene {
  tipo: "contiene";
  archivo?: string; // si se omite, busca en TODOS los archivos del sandbox
  patron: string;
  regex?: boolean;
  flags?: string;
  mensajeFallo?: string;
}

export interface PatronNoContiene {
  tipo: "noContiene";
  archivo?: string;
  patron: string;
  regex?: boolean;
  flags?: string;
  mensajeFallo?: string;
}

export interface PatronArchivoExiste {
  tipo: "archivoExiste";
  archivo: string;
}

export interface PatronExportaFuncion {
  tipo: "exportaFuncion";
  archivo: string;
  funcion: string; // nombre de la función exportada
}

export interface PatronTieneImport {
  tipo: "tieneImport";
  archivo: string;
  desde: string; // nombre del módulo importado
}

export type PatronCheck =
  | PatronContiene
  | PatronNoContiene
  | PatronArchivoExiste
  | PatronExportaFuncion
  | PatronTieneImport;

// ─── Check con Jest ejecutado en Sandpack ───
export interface JestCheck {
  tipo: "jest";
  // Código fuente de un archivo de test (Jest/Vitest-like).
  // Será inyectado como /__tests__/<id>.test.{js,ts}.
  testCode: string;
  // Filtro opcional para identificar SOLO los resultados de este check si hay varios.
  describeNombre?: string;
}

// ─── JS Runtime Check (ejecuta código del usuario via new Function + shim CommonJS) ───
export interface JsRuntimeCheck {
  tipo: "js-runtime";
  // Archivo del sandbox a evaluar, ej. "/app.js"
  entryFile: string;
  // Código opcional inyectado ANTES del módulo del usuario (seed data, helpers, etc.)
  setup?: string;
  // Cuerpo de la función de aserción (string que se convierte en async function).
  // Recibe `exports` (lo que exporta el archivo) y `require` (el shim).
  // Lanzar un error = fallo con el mensaje; retornar normalmente = pasó.
  assertion: string;
  timeoutMs?: number; // default 3000
}

// ─── Node-API Scenario Check ───────────────────────────────────────────────
export interface ExpectShape {
  status?: number;
  jsonShape?: Record<string, unknown>; // deep partial match (claves extra en actual están OK)
  bodyContains?: string;
}

export interface ApiScenario {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  expect: ExpectShape;
  descripcion?: string; // texto descriptivo para el mensaje de error
}

export interface NodeApiCheck {
  tipo: "node-api";
  // Archivo del sandbox que exporta la app Express (module.exports = app)
  entryFile: string;
  // Escenarios ejecutados secuencialmente contra la app (estado persistido entre escenarios)
  scenarios: ApiScenario[];
}

// ─── Vitest-style Check ─────────────────────────────────────────────────────
export interface VitestCheck {
  tipo: "vitest";
  // Código de test completo usando describe/it/expect (subconjunto compatible con jest)
  testCode: string;
  // Nombre exacto del `it("name", ...)` a aislar para granularidad por check
  itName?: string;
}

// ─── Una verificación individual ───
export type Verificacion =
  | ({
      id: string;
      titulo: string;
      descripcion?: string;
      pista?: string;
    } & PatronCheck)
  | ({
      id: string;
      titulo: string;
      descripcion?: string;
      pista?: string;
    } & JestCheck)
  | ({
      id: string;
      titulo: string;
      descripcion?: string;
      pista?: string;
    } & JsRuntimeCheck)
  | ({
      id: string;
      titulo: string;
      descripcion?: string;
      pista?: string;
    } & NodeApiCheck)
  | ({
      id: string;
      titulo: string;
      descripcion?: string;
      pista?: string;
    } & VitestCheck);

// ─── Resultado de una corrida ───
export interface ResultadoVerificacion {
  estado: EstadoVerificacion;
  mensaje?: string;
}
