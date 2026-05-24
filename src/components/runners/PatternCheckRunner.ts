import type { SandpackFiles } from "@codesandbox/sandpack-react";
import type {
  PatronCheck,
  PatronContiene,
  PatronNoContiene,
  PatronArchivoExiste,
  PatronExportaFuncion,
  PatronTieneImport,
  ResultadoVerificacion,
} from "@/types/verificaciones";

// Convierte un SandpackFile (string | { code, ... }) a string plano.
function obtenerCodigo(
  files: SandpackFiles,
  archivo: string,
): string | undefined {
  const f = files[archivo];
  if (!f) return undefined;
  return typeof f === "string" ? f : f.code;
}

function compilarPatron(
  patron: string,
  regex?: boolean,
  flags?: string,
): RegExp | string {
  if (regex) {
    try {
      return new RegExp(patron, flags || "");
    } catch {
      return patron; // fallback a literal si la regex es inválida
    }
  }
  return patron;
}

function matchear(texto: string, patron: RegExp | string): boolean {
  if (patron instanceof RegExp) return patron.test(texto);
  return texto.includes(patron);
}

function checkContiene(
  files: SandpackFiles,
  check: PatronContiene,
): ResultadoVerificacion {
  const patron = compilarPatron(check.patron, check.regex, check.flags);
  // Si archivo está definido → solo busca ahí. Si no → en todos.
  if (check.archivo) {
    const codigo = obtenerCodigo(files, check.archivo);
    if (codigo == null) {
      return {
        estado: "fallida",
        mensaje:
          check.mensajeFallo || `No se encontró el archivo ${check.archivo}.`,
      };
    }
    return matchear(codigo, patron)
      ? { estado: "pasada" }
      : {
          estado: "fallida",
          mensaje:
            check.mensajeFallo ||
            `${check.archivo} no contiene el patrón esperado.`,
        };
  }

  for (const nombre of Object.keys(files)) {
    const codigo = obtenerCodigo(files, nombre);
    if (codigo && matchear(codigo, patron)) {
      return { estado: "pasada" };
    }
  }

  return {
    estado: "fallida",
    mensaje:
      check.mensajeFallo ||
      `Ningún archivo del sandbox contiene el patrón esperado.`,
  };
}

function checkNoContiene(
  files: SandpackFiles,
  check: PatronNoContiene,
): ResultadoVerificacion {
  const patron = compilarPatron(check.patron, check.regex, check.flags);
  if (check.archivo) {
    const codigo = obtenerCodigo(files, check.archivo);
    if (codigo == null) {
      return { estado: "pasada" }; // ausencia total = ausencia del patrón
    }
    return matchear(codigo, patron)
      ? {
          estado: "fallida",
          mensaje:
            check.mensajeFallo ||
            `${check.archivo} aún contiene un patrón que debería estar removido.`,
        }
      : { estado: "pasada" };
  }

  for (const nombre of Object.keys(files)) {
    const codigo = obtenerCodigo(files, nombre);
    if (codigo && matchear(codigo, patron)) {
      return {
        estado: "fallida",
        mensaje:
          check.mensajeFallo ||
          `${nombre} aún contiene un patrón que debería estar removido.`,
      };
    }
  }

  return { estado: "pasada" };
}

function checkArchivoExiste(
  files: SandpackFiles,
  check: PatronArchivoExiste,
): ResultadoVerificacion {
  return files[check.archivo]
    ? { estado: "pasada" }
    : {
        estado: "fallida",
        mensaje: `Falta el archivo ${check.archivo}.`,
      };
}

function checkExportaFuncion(
  files: SandpackFiles,
  check: PatronExportaFuncion,
): ResultadoVerificacion {
  const codigo = obtenerCodigo(files, check.archivo);
  if (codigo == null) {
    return {
      estado: "fallida",
      mensaje: `No se encontró ${check.archivo}.`,
    };
  }

  // Reconoce:  export function NAME(   |   export const NAME =   |   exports.NAME =   |   module.exports.NAME =   |   module.exports = { NAME }
  const nombre = check.funcion.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patrones = [
    new RegExp(`export\\s+(?:async\\s+)?function\\s+${nombre}\\b`),
    new RegExp(`export\\s+(?:const|let|var)\\s+${nombre}\\b`),
    new RegExp(`export\\s*\\{[^}]*\\b${nombre}\\b[^}]*\\}`),
    new RegExp(`exports\\.${nombre}\\s*=`),
    new RegExp(`module\\.exports\\.${nombre}\\s*=`),
    new RegExp(`module\\.exports\\s*=\\s*\\{[^}]*\\b${nombre}\\b[^}]*\\}`),
  ];

  return patrones.some((p) => p.test(codigo))
    ? { estado: "pasada" }
    : {
        estado: "fallida",
        mensaje: `${check.archivo} no exporta la función ${check.funcion}.`,
      };
}

function checkTieneImport(
  files: SandpackFiles,
  check: PatronTieneImport,
): ResultadoVerificacion {
  const codigo = obtenerCodigo(files, check.archivo);
  if (codigo == null) {
    return {
      estado: "fallida",
      mensaje: `No se encontró ${check.archivo}.`,
    };
  }

  const desde = check.desde.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patrones = [
    new RegExp(`import\\s+[^;]*from\\s+["']${desde}["']`),
    new RegExp(`require\\s*\\(\\s*["']${desde}["']\\s*\\)`),
  ];

  return patrones.some((p) => p.test(codigo))
    ? { estado: "pasada" }
    : {
        estado: "fallida",
        mensaje: `${check.archivo} no importa "${check.desde}".`,
      };
}

/**
 * Ejecuta un check de patrón síncronamente sobre los archivos del sandbox.
 */
export function ejecutarPatronCheck(
  files: SandpackFiles,
  check: PatronCheck,
): ResultadoVerificacion {
  switch (check.tipo) {
    case "contiene":
      return checkContiene(files, check);
    case "noContiene":
      return checkNoContiene(files, check);
    case "archivoExiste":
      return checkArchivoExiste(files, check);
    case "exportaFuncion":
      return checkExportaFuncion(files, check);
    case "tieneImport":
      return checkTieneImport(files, check);
  }
}
