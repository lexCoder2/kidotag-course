/**
 * NodeApiRunner — ejecuta un NodeApiCheck montando la app Express del usuario
 * con todos los mocks inyectados (express, mongoose, bcryptjs, jsonwebtoken, socket.io).
 *
 * Flujo:
 * 1. Construye requireShim con extraModules = { express, mongoose, bcryptjs, jsonwebtoken, ... }
 * 2. require(check.entryFile) → obtiene la app Express (o module.exports = app)
 * 3. Para cada escenario: llama app.dispatchRequest(method, url, body, headers)
 * 4. Valida la respuesta con deepPartialMatch(actual, expected)
 */

import type { SandpackFiles } from "@codesandbox/sandpack-react";
import type {
  NodeApiCheck,
  ApiScenario,
  ResultadoVerificacion,
} from "@/types/verificaciones";
import { buildRequireShim } from "./JsRuntimeRunner";
import { mockExpressModule, MockApp } from "./mock-express";
import { mockMongooseModule, resetStore } from "./mock-mongoose";
import { mockBcryptModule } from "./mock-bcrypt";
import { mockJwtModule } from "./mock-jwt";
import { mockSocketIoModule } from "./mock-socketio";

// ─── Deep partial match ──────────────────────────────────────────────────────

/**
 * Verifica que `actual` contenga todas las claves de `expected`.
 * Claves extra en `actual` son ignoradas (partial match).
 * Arrays: verifica que `actual` contenga al menos todos los elementos de `expected`.
 */
function deepPartialMatch(
  actual: unknown,
  expected: unknown,
  path = "",
): string | null {
  if (expected === null || expected === undefined) return null;

  if (typeof expected !== typeof actual) {
    return `[${path}] esperado ${typeof expected} pero fue ${typeof actual} (${JSON.stringify(actual)})`;
  }

  if (typeof expected === "object" && !Array.isArray(expected)) {
    const exp = expected as Record<string, unknown>;
    const act = actual as Record<string, unknown>;
    for (const key of Object.keys(exp)) {
      const err = deepPartialMatch(
        act?.[key],
        exp[key],
        path ? `${path}.${key}` : key,
      );
      if (err) return err;
    }
    return null;
  }

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual))
      return `[${path}] esperado array pero fue ${typeof actual}`;
    if ((actual as unknown[]).length < expected.length) {
      return `[${path}] esperado al menos ${expected.length} elementos, hay ${(actual as unknown[]).length}`;
    }
    return null;
  }

  if (actual !== expected) {
    return `[${path}] esperado ${JSON.stringify(expected)} pero fue ${JSON.stringify(actual)}`;
  }

  return null;
}

// ─── Runner principal ────────────────────────────────────────────────────────

async function runScenario(
  app: MockApp,
  scenario: ApiScenario,
): Promise<string | null> {
  const result = await app.dispatchRequest(
    scenario.method,
    scenario.url,
    scenario.body ?? {},
    scenario.headers ?? {},
  );

  const desc = scenario.descripcion ?? `${scenario.method} ${scenario.url}`;

  if (
    scenario.expect.status !== undefined &&
    result.statusCode !== scenario.expect.status
  ) {
    return `${desc}: status esperado ${scenario.expect.status} pero fue ${result.statusCode}`;
  }

  if (scenario.expect.bodyContains !== undefined) {
    const bodyStr =
      typeof result.body === "string"
        ? result.body
        : JSON.stringify(result.body);
    if (!bodyStr.includes(scenario.expect.bodyContains)) {
      return `${desc}: el cuerpo no contiene "${scenario.expect.bodyContains}"`;
    }
  }

  if (scenario.expect.jsonShape !== undefined) {
    const err = deepPartialMatch(
      result.body,
      scenario.expect.jsonShape,
      "body",
    );
    if (err) return `${desc}: ${err}`;
  }

  return null;
}

export async function ejecutarNodeApiCheck(
  files: SandpackFiles,
  check: NodeApiCheck,
): Promise<ResultadoVerificacion> {
  // Reset mongoose store entre checks para aislamiento
  resetStore();

  try {
    const extraModules: Record<string, unknown> = {
      express: mockExpressModule,
      mongoose: mockMongooseModule,
      bcryptjs: mockBcryptModule,
      jsonwebtoken: mockJwtModule,
      "socket.io": mockSocketIoModule,
      // Módulos de Node.js estándar (stubs simples)
      path: {
        join: (...parts: string[]) => parts.join("/"),
        resolve: (...parts: string[]) => parts.join("/"),
        dirname: (p: string) => p.replace(/\/[^/]+$/, ""),
        basename: (p: string, ext?: string) => {
          const base = p.split("/").pop() ?? p;
          return ext && base.endsWith(ext) ? base.slice(0, -ext.length) : base;
        },
        extname: (p: string) => {
          const m = /(\.[^.]+)$/.exec(p);
          return m ? m[1] : "";
        },
      },
      fs: {
        readFileSync: (_path: string) => "",
        existsSync: (_path: string) => false,
        writeFileSync: () => {},
        mkdirSync: () => {},
      },
      dotenv: {
        config: () => ({}),
      },
      cors: () => (_req: unknown, _res: unknown, next: () => void) => next(),
      helmet: () => (_req: unknown, _res: unknown, next: () => void) => next(),
      "express-validator": {
        body: () => ({ notEmpty: () => ({ withMessage: () => ({}) }) }),
        validationResult: () => ({ isEmpty: () => true, array: () => [] }),
      },
      "express-rate-limit":
        () => (_req: unknown, _res: unknown, next: () => void) =>
          next(),
      "swagger-ui-express": { serve: [], setup: () => {} },
      yamljs: { load: () => ({}) },
      "js-yaml": { load: () => ({}) },
    };

    const req = buildRequireShim(files, extraModules);
    const appModule = req(check.entryFile);

    // El módulo puede exportar la app directamente o como module.exports.app
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appAny = appModule as any;
    const app: MockApp =
      appAny instanceof MockApp
        ? appAny
        : appAny?.app instanceof MockApp
          ? appAny.app
          : appAny?.default instanceof MockApp
            ? appAny.default
            : null;

    if (!app) {
      return {
        estado: "fallida",
        mensaje: `${check.entryFile} debe exportar una app Express (module.exports = app). Recibido: ${typeof appModule}`,
      };
    }

    // Ejecutar escenarios secuencialmente (el estado de la DB persiste entre ellos)
    for (const scenario of check.scenarios) {
      const err = await runScenario(app, scenario);
      if (err) {
        return { estado: "fallida", mensaje: err };
      }
    }

    return { estado: "pasada" };
  } catch (err) {
    return {
      estado: "fallida",
      mensaje: err instanceof Error ? err.message : String(err),
    };
  }
}
