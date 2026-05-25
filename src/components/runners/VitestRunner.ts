/**
 * VitestRunner — harness de tests inline que soporta la sintaxis describe/it/expect.
 *
 * Diseño:
 * - No usa Worker ni bundler externo — corre directamente en el main thread.
 * - Subconjunto de jest/vitest API: describe, it, test, expect, beforeEach, afterEach.
 * - expect(val): .toBe, .toEqual, .toStrictEqual, .toContain, .toBeTruthy,
 *   .toBeFalsy, .toBeNull, .toBeUndefined, .toBeDefined, .toHaveLength,
 *   .toHaveProperty, .toThrow, .toMatchObject, .not.X()
 * - Las aserciones que fallan lanzan un Error con el mensaje descriptivo.
 * - `itName` filtra a sólo ejecutar el `it` cuyo nombre coincide exactamente.
 * - El código del test tiene acceso al require shim del sandbox.
 */

import type { SandpackFiles } from "@codesandbox/sandpack-react";
import type {
  VitestCheck,
  ResultadoVerificacion,
} from "@/types/verificaciones";
import { buildRequireShim } from "./JsRuntimeRunner";

// ─── Expect ──────────────────────────────────────────────────────────────────

class ExpectError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExpectError";
  }
}

// Recursivo: igual que jest.toEqual pero ignora undefined
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return a === b;
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj).filter((k) => aObj[k] !== undefined);
  const bKeys = Object.keys(bObj).filter((k) => bObj[k] !== undefined);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k) => deepEqual(aObj[k], bObj[k]));
}

function deepMatchObject(actual: unknown, expected: unknown): boolean {
  if (typeof expected !== "object" || expected === null)
    return actual === expected;
  const exp = expected as Record<string, unknown>;
  const act = actual as Record<string, unknown>;
  return Object.keys(exp).every((k) => deepMatchObject(act?.[k], exp[k]));
}

type ExpectValue = {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toStrictEqual(expected: unknown): void;
  toContain(item: unknown): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeNull(): void;
  toBeUndefined(): void;
  toBeDefined(): void;
  toHaveLength(n: number): void;
  toHaveProperty(path: string, value?: unknown): void;
  toThrow(msg?: string | RegExp): void;
  toMatchObject(expected: Record<string, unknown>): void;
  not: Omit<ExpectValue, "not">;
};

function makeExpect(val: unknown, negated = false): ExpectValue {
  const assert = (condition: boolean, msg: string): void => {
    if (negated ? condition : !condition) {
      throw new ExpectError(negated ? `NOT ${msg}` : msg);
    }
  };

  const matchers = {
    toBe(expected: unknown) {
      assert(
        val === expected,
        `esperado ${JSON.stringify(expected)} pero fue ${JSON.stringify(val)}`,
      );
    },
    toEqual(expected: unknown) {
      assert(
        deepEqual(val, expected),
        `esperado ${JSON.stringify(expected)} pero fue ${JSON.stringify(val)}`,
      );
    },
    toStrictEqual(expected: unknown) {
      assert(
        JSON.stringify(val) === JSON.stringify(expected),
        `esperado ${JSON.stringify(expected)} pero fue ${JSON.stringify(val)}`,
      );
    },
    toContain(item: unknown) {
      if (typeof val === "string") {
        assert(
          (val as string).includes(item as string),
          `"${val}" no contiene "${item}"`,
        );
      } else if (Array.isArray(val)) {
        assert(
          (val as unknown[]).includes(item),
          `el array no contiene ${JSON.stringify(item)}`,
        );
      } else {
        throw new ExpectError("toContain sólo funciona con strings y arrays");
      }
    },
    toBeTruthy() {
      assert(Boolean(val), `esperado truthy pero fue ${JSON.stringify(val)}`);
    },
    toBeFalsy() {
      assert(!Boolean(val), `esperado falsy pero fue ${JSON.stringify(val)}`);
    },
    toBeNull() {
      assert(val === null, `esperado null pero fue ${JSON.stringify(val)}`);
    },
    toBeUndefined() {
      assert(
        val === undefined,
        `esperado undefined pero fue ${JSON.stringify(val)}`,
      );
    },
    toBeDefined() {
      assert(val !== undefined, `esperado definido pero fue undefined`);
    },
    toHaveLength(n: number) {
      const len = (val as string | unknown[])?.length;
      assert(len === n, `esperado longitud ${n} pero fue ${len}`);
    },
    toHaveProperty(path: string, value?: unknown) {
      const keys = path.split(".");
      let cursor: unknown = val;
      for (const k of keys) {
        cursor = (cursor as Record<string, unknown>)?.[k];
      }
      if (value !== undefined) {
        assert(
          deepEqual(cursor, value),
          `propiedad "${path}" esperada ${JSON.stringify(value)} pero fue ${JSON.stringify(cursor)}`,
        );
      } else {
        assert(
          cursor !== undefined,
          `propiedad "${path}" no existe en ${JSON.stringify(val)}`,
        );
      }
    },
    toThrow(msg?: string | RegExp) {
      if (typeof val !== "function")
        throw new ExpectError("toThrow requiere una función");
      let threw = false;
      let errorMsg = "";
      try {
        (val as () => void)();
      } catch (e) {
        threw = true;
        errorMsg = e instanceof Error ? e.message : String(e);
      }
      assert(threw, "se esperaba que lanzara pero no lo hizo");
      if (msg !== undefined) {
        if (msg instanceof RegExp) {
          assert(
            msg.test(errorMsg),
            `el error "${errorMsg}" no coincide con ${msg}`,
          );
        } else {
          assert(
            errorMsg.includes(msg),
            `el error "${errorMsg}" no incluye "${msg}"`,
          );
        }
      }
    },
    toMatchObject(expected: Record<string, unknown>) {
      assert(
        deepMatchObject(val, expected),
        `el objeto ${JSON.stringify(val)} no coincide con ${JSON.stringify(expected)}`,
      );
    },
  };

  return {
    ...matchers,
    get not() {
      return makeExpect(val, !negated) as Omit<ExpectValue, "not">;
    },
  };
}

// ─── Harness describe/it ─────────────────────────────────────────────────────

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runVitestCheck(
  files: SandpackFiles,
  check: VitestCheck,
): Promise<ResultadoVerificacion> {
  const results: TestResult[] = [];
  let beforeEachFns: Array<() => void | Promise<void>> = [];
  let afterEachFns: Array<() => void | Promise<void>> = [];
  // Collect all test Promises so we can await them after the test code runs
  const testPromises: Promise<void>[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const req = buildRequireShim(files);

  function scheduleIt(name: string, fn: () => void | Promise<void>): void {
    if (check.itName && name !== check.itName) return; // filtro por nombre
    const p = (async () => {
      for (const bfn of beforeEachFns) await bfn();
      try {
        await fn();
        results.push({ name, passed: true });
      } catch (e) {
        results.push({
          name,
          passed: false,
          error: e instanceof Error ? e.message : String(e),
        });
      } finally {
        for (const afn of afterEachFns) await afn();
      }
    })();
    testPromises.push(p);
  }

  const globals = {
    describe: (_name: string, fn: () => void) => {
      const savedBefore = [...beforeEachFns];
      const savedAfter = [...afterEachFns];
      beforeEachFns = [];
      afterEachFns = [];
      fn(); // sync — collect it() calls inside
      beforeEachFns = savedBefore;
      afterEachFns = savedAfter;
    },
    it: (name: string, fn: () => void | Promise<void>) => {
      scheduleIt(name, fn);
    },
    test: (name: string, fn: () => void | Promise<void>) => {
      scheduleIt(name, fn);
    },
    expect: (val: unknown) => makeExpect(val),
    beforeEach: (fn: () => void | Promise<void>) => {
      beforeEachFns.push(fn);
    },
    afterEach: (fn: () => void | Promise<void>) => {
      afterEachFns.push(fn);
    },
    beforeAll: (fn: () => void | Promise<void>) => {
      testPromises.push(Promise.resolve(fn()));
    },
    afterAll: (_fn: () => void | Promise<void>) => {},
    vi: {
      fn: (impl?: (...args: unknown[]) => unknown) => {
        const mock = (...args: unknown[]) => impl?.(...args);
        (mock as Record<string, unknown>).mock = { calls: [] as unknown[][] };
        return mock;
      },
      spyOn: () => ({ mockReturnValue: () => {} }),
    },
  };

  try {
    // Construir la función de test con el harness inyectado
    // eslint-disable-next-line no-new-func
    const testFn = new Function(
      "describe",
      "it",
      "test",
      "expect",
      "beforeEach",
      "afterEach",
      "beforeAll",
      "afterAll",
      "vi",
      "require",
      `return (async function() { ${check.testCode} })()`,
    );

    // Run the test code synchronously (it schedules it() calls into testPromises)
    await testFn(
      globals.describe,
      globals.it,
      globals.test,
      globals.expect,
      globals.beforeEach,
      globals.afterEach,
      globals.beforeAll,
      globals.afterAll,
      globals.vi,
      req,
    );
    // Await all scheduled test Promises
    await Promise.all(testPromises);
  } catch (e) {
    return {
      estado: "fallida",
      mensaje: `Error al ejecutar el código de test: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  if (results.length === 0) {
    // Ningún test corrió — verificar si era por filtro itName
    if (check.itName) {
      return {
        estado: "fallida",
        mensaje: `No se encontró el test "${check.itName}"`,
      };
    }
    return {
      estado: "fallida",
      mensaje: "El código de test no contiene ningún it/test",
    };
  }

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    const msgs = failed
      .map((r) => `• "${r.name}": ${r.error ?? "falló"}`)
      .join("\n");
    return { estado: "fallida", mensaje: msgs };
  }

  return { estado: "pasada" };
}
