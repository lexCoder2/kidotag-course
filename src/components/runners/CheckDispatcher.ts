/**
 * CheckDispatcher — enruta cada Verificacion al runner correcto.
 *
 * Todos los runners son async. Los checks de patrones (síncronos) se envuelven
 * para mantener la interfaz uniforme.
 */

import type { SandpackFiles } from "@codesandbox/sandpack-react";
import type {
  Verificacion,
  ResultadoVerificacion,
  PatronCheck,
} from "@/types/verificaciones";
import { ejecutarPatronCheck } from "./PatternCheckRunner";
import { ejecutarJsRuntimeCheck } from "./JsRuntimeRunner";
import { ejecutarNodeApiCheck } from "./NodeApiRunner";
import { runVitestCheck } from "./VitestRunner";

export async function ejecutarVerificacion(
  files: SandpackFiles,
  verificacion: Verificacion,
): Promise<ResultadoVerificacion> {
  try {
    switch (verificacion.tipo) {
      // ─── Patrones síncronos ─────────────────────────────────────────────
      case "contiene":
      case "noContiene":
      case "archivoExiste":
      case "exportaFuncion":
      case "tieneImport":
        return ejecutarPatronCheck(
          files,
          verificacion as PatronCheck & { id: string; titulo: string },
        );

      // ─── Runtime JS ──────────────────────────────────────────────────────
      case "js-runtime":
        return await ejecutarJsRuntimeCheck(files, verificacion);

      // ─── API Node/Express ─────────────────────────────────────────────────
      case "node-api":
        return await ejecutarNodeApiCheck(files, verificacion);

      // ─── Vitest inline ────────────────────────────────────────────────────
      case "vitest":
        return await runVitestCheck(files, verificacion);

      // ─── Jest (pendiente) ─────────────────────────────────────────────────
      case "jest":
        return {
          estado: "fallida",
          mensaje:
            "El runner Jest no está disponible aún. Usa tipo 'vitest' en su lugar.",
        };

      default: {
        // TypeScript exhaustiveness check
        const _exhaustive: never = verificacion;
        void _exhaustive;
        return {
          estado: "fallida",
          mensaje: `Tipo de verificación desconocido: ${(verificacion as Verificacion).tipo}`,
        };
      }
    }
  } catch (err) {
    return {
      estado: "fallida",
      mensaje: `Error inesperado en la verificación: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
