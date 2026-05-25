import { describe, it, expect } from "vitest";
import {
  ejecutarJsRuntimeCheck,
  transformEsToCjs,
  buildRequireShim,
} from "../JsRuntimeRunner";
import type { SandpackFiles } from "@codesandbox/sandpack-react";

describe("transformEsToCjs", () => {
  it("transforma import default", () => {
    const out = transformEsToCjs(`import express from "express";`);
    expect(out).toContain(`const express = require("express")`);
  });

  it("transforma import named", () => {
    const out = transformEsToCjs(`import { Router, json } from "express";`);
    expect(out).toContain(`const { Router, json } = require("express")`);
  });

  it("transforma export default", () => {
    const out = transformEsToCjs(`export default function foo() {}`);
    expect(out).toContain("module.exports =");
  });

  it("transforma export function", () => {
    const out = transformEsToCjs(
      `export function sumar(a, b) { return a + b; }`,
    );
    expect(out).toContain("exports.sumar");
  });

  it("transforma export const", () => {
    const out = transformEsToCjs(`export const PI = 3.14;`);
    expect(out).toContain("exports.PI");
  });
});

describe("buildRequireShim", () => {
  it("evalúa un archivo CJS y expone module.exports", () => {
    const files: SandpackFiles = {
      "/math.js": `
function add(a, b) { return a + b; }
module.exports = { add };
`,
    };
    const req = buildRequireShim(files);
    const math = req("/math.js") as { add: (a: number, b: number) => number };
    expect(math.add(2, 3)).toBe(5);
  });

  it("resuelve dependencias entre archivos", () => {
    const files: SandpackFiles = {
      "/utils.js": `module.exports = { PI: 3.14 };`,
      "/app.js": `const { PI } = require("./utils"); module.exports = { PI };`,
    };
    const req = buildRequireShim(files);
    const app = req("/app.js") as { PI: number };
    expect(app.PI).toBe(3.14);
  });

  it("retorna objeto vacío para módulos externos desconocidos", () => {
    const files: SandpackFiles = {};
    const req = buildRequireShim(files);
    const result = req("some-unknown-module");
    expect(result).toEqual({});
  });

  it("usa extraModules para inyectar mocks", () => {
    const files: SandpackFiles = {
      "/app.js": `const x = require("mi-mock"); module.exports = x;`,
    };
    const req = buildRequireShim(files, { "mi-mock": { valor: 42 } });
    const app = req("/app.js") as { valor: number };
    expect(app.valor).toBe(42);
  });
});

describe("ejecutarJsRuntimeCheck", () => {
  it("pasa cuando la aserción no lanza", async () => {
    const files: SandpackFiles = {
      "/math.js": `module.exports = { add: (a,b) => a + b };`,
    };
    const result = await ejecutarJsRuntimeCheck(files, {
      tipo: "js-runtime",
      entryFile: "/math.js",
      assertion: `
        if (exports.add(2, 3) !== 5) throw new Error("add no funciona");
      `,
    });
    expect(result.estado).toBe("pasada");
  });

  it("falla cuando la aserción lanza", async () => {
    const files: SandpackFiles = {
      "/math.js": `module.exports = { add: (a,b) => a - b };`, // bug: resta en vez de suma
    };
    const result = await ejecutarJsRuntimeCheck(files, {
      tipo: "js-runtime",
      entryFile: "/math.js",
      assertion: `
        if (exports.add(2, 3) !== 5) throw new Error("add no funciona");
      `,
    });
    expect(result.estado).toBe("fallida");
    expect(result.mensaje).toContain("add no funciona");
  });

  it("falla con timeout si la aserción cuelga", async () => {
    const files: SandpackFiles = {
      "/app.js": `module.exports = {};`,
    };
    const result = await ejecutarJsRuntimeCheck(files, {
      tipo: "js-runtime",
      entryFile: "/app.js",
      assertion: `await new Promise(() => {});`, // nunca resuelve
      timeoutMs: 100,
    });
    expect(result.estado).toBe("fallida");
    expect(result.mensaje).toContain("agotado");
  });

  it("transforma ES modules automáticamente", async () => {
    const files: SandpackFiles = {
      "/greet.js": `
export function greet(name) { return "Hola " + name; }
`,
    };
    const result = await ejecutarJsRuntimeCheck(files, {
      tipo: "js-runtime",
      entryFile: "/greet.js",
      assertion: `
        if (exports.greet("Mundo") !== "Hola Mundo") throw new Error("greet falla");
      `,
    });
    expect(result.estado).toBe("pasada");
  });
});
