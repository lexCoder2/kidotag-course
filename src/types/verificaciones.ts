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
    } & JestCheck);

// ─── Resultado de una corrida ───
export interface ResultadoVerificacion {
  estado: EstadoVerificacion;
  mensaje?: string;
}
