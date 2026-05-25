/**
 * JsRuntimeRunner — ejecuta código del usuario via new Function() + shim CommonJS.
 *
 * Diseño:
 * - requireShim(files) mapea rutas (ej. "./app", "/app.js") a los archivos del
 *   sandbox, evaluando cada uno con new Function("require","module","exports", code)
 *   y cacheando el resultado. Soporta CommonJS y ES module con transforms básicos.
 * - El assertion string se convierte en el cuerpo de `async function(exports, require)`.
 *   Si lanza, el check falla con el mensaje del error. Si retorna, pasa.
 * - Timeout configurable (default 3000ms).
 */

import type { SandpackFiles } from "@codesandbox/sandpack-react";
import type {
  JsRuntimeCheck,
  ResultadoVerificacion,
} from "@/types/verificaciones";

// ─── ES → CJS transforms ────────────────────────────────────────────────────

/**
 * Convierte sintaxis ES module básica a CommonJS para poder evaluar con new Function.
 * No es un transpilador completo; cubre los patrones usados en las lecciones.
 */
export function transformEsToCjs(code: string): string {
  let out = code;

  // import defaultExport from "module"  →  const defaultExport = require("module")
  out = out.replace(
    /^import\s+(\w+)\s+from\s+["']([^"']+)["']\s*;?/gm,
    'const $1 = require("$2");',
  );

  // import { a, b as c } from "module"  →  const { a, b: c } = require("module")
  out = out.replace(
    /^import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["']\s*;?/gm,
    (_m, names: string, mod: string) => {
      const normalized = names
        .split(",")
        .map((n) => n.trim().replace(/\s+as\s+/, ": "))
        .join(", ");
      return `const { ${normalized} } = require("${mod}");`;
    },
  );

  // import * as ns from "module"  →  const ns = require("module")
  out = out.replace(
    /^import\s+\*\s+as\s+(\w+)\s+from\s+["']([^"']+)["']\s*;?/gm,
    'const $1 = require("$2");',
  );

  // export default X  →  module.exports = X  (expression or declaration)
  out = out.replace(/^export\s+default\s+/gm, "module.exports = ");

  // export function X(  →  const X = exports.X = function X(
  out = out.replace(
    /^export\s+(async\s+)?function\s+(\w+)\s*\(/gm,
    (_m, async = "", name: string) =>
      `const ${name} = exports.${name} = ${async}function ${name}(`,
  );

  // export const/let/var X =  →  const X = exports.X =
  out = out.replace(
    /^export\s+(?:const|let|var)\s+(\w+)\s*=/gm,
    (_m, name: string) => `const ${name} = exports.${name} =`,
  );

  // export class X  →  class X ... ; exports.X = X
  out = out.replace(/^export\s+class\s+(\w+)/gm, "class $1");

  // export { a, b }  →  exports.a = a; exports.b = b;
  out = out.replace(/^export\s+\{([^}]+)\}\s*;?/gm, (_m, names: string) =>
    names
      .split(",")
      .map((n) => {
        const parts = n.trim().split(/\s+as\s+/);
        const local = parts[0].trim();
        const exported = (parts[1] || parts[0]).trim();
        return `exports.${exported} = ${local};`;
      })
      .join(" "),
  );

  return out;
}

// ─── CommonJS require shim ───────────────────────────────────────────────────

type ModuleCache = Map<string, Record<string, unknown>>;

/**
 * Construye un shim de require() que resuelve archivos del sandbox.
 * Los módulos externos (no presentes en files) retornan un objeto vacío.
 * Se puede extender pasando `extraModules` para inyectar mocks (express, mongoose, etc.)
 */
export function buildRequireShim(
  files: SandpackFiles,
  extraModules: Record<string, unknown> = {},
): (id: string) => unknown {
  const cache: ModuleCache = new Map();

  function resolveFilePath(id: string, fromFile?: string): string | null {
    // Absolute path (ej. "/app.js", "/utils/helper.js")
    if (id.startsWith("/")) {
      const candidates = [id, `${id}.js`, `${id}.ts`, `${id}/index.js`];
      return candidates.find((p) => files[p] != null) ?? null;
    }

    // Relative path (ej. "./app", "../utils/helper")
    if (id.startsWith(".")) {
      const base = fromFile ? fromFile.replace(/\/[^/]+$/, "") : "";
      const joined = base + "/" + id;
      const normalized = joined
        .replace(/\/\.\//g, "/")
        .replace(/[^/]+\/\.\.\//g, "");
      const candidates = [
        normalized,
        `${normalized}.js`,
        `${normalized}.ts`,
        `${normalized}/index.js`,
      ];
      return candidates.find((p) => files[p] != null) ?? null;
    }

    return null; // módulo externo
  }

  function requireFile(id: string, fromFile?: string): unknown {
    // Módulos externos / mocks inyectados
    if (extraModules[id] !== undefined) return extraModules[id];

    const filePath = resolveFilePath(id, fromFile);
    if (!filePath) {
      // Retorna objeto vacío para módulos no disponibles (evita crashes)
      return {};
    }

    if (cache.has(filePath)) return cache.get(filePath)!;

    const fileEntry = files[filePath];
    const rawCode =
      typeof fileEntry === "string"
        ? fileEntry
        : (fileEntry as { code: string }).code;

    const cjsCode = transformEsToCjs(rawCode);
    const mod: { exports: Record<string, unknown> } = { exports: {} };
    cache.set(filePath, mod.exports);

    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(
        "require",
        "module",
        "exports",
        "__filename",
        "__dirname",
        cjsCode,
      );
      fn(
        (dep: string) => requireFile(dep, filePath),
        mod,
        mod.exports,
        filePath,
        filePath.replace(/\/[^/]+$/, ""),
      );
    } catch (err) {
      // Propaga error de evaluación con contexto
      throw new Error(
        `Error al evaluar ${filePath}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return mod.exports;
  }

  return (id: string) => requireFile(id);
}

// ─── Runner principal ────────────────────────────────────────────────────────

function rejectAfter(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(`Tiempo de espera agotado (${ms}ms)`)),
      ms,
    ),
  );
}

/**
 * Ejecuta un JsRuntimeCheck: evalúa el entryFile del sandbox y corre la aserción.
 */
export async function ejecutarJsRuntimeCheck(
  files: SandpackFiles,
  check: JsRuntimeCheck,
): Promise<ResultadoVerificacion> {
  const timeout = check.timeoutMs ?? 3000;

  try {
    const req = buildRequireShim(files);
    const userExports = req(check.entryFile);

    // La aserción es el cuerpo de async function(exports, require) { ... }
    // eslint-disable-next-line no-new-func
    const assertFn = new Function(
      "exports",
      "require",
      `return (async function() { ${check.assertion} })()`,
    );

    await Promise.race([assertFn(userExports, req), rejectAfter(timeout)]);

    return { estado: "pasada" };
  } catch (err) {
    return {
      estado: "fallida",
      mensaje: err instanceof Error ? err.message : String(err),
    };
  }
}
