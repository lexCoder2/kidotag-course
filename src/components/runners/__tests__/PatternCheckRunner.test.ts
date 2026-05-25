import { describe, it, expect } from "vitest";
import { ejecutarPatronCheck } from "../PatternCheckRunner";
import type { SandpackFiles } from "@codesandbox/sandpack-react";

const files: SandpackFiles = {
  "/app.js": `
const express = require("express");
const app = express();
module.exports = app;
`,
  "/utils/helper.js": `
function sumar(a, b) { return a + b; }
module.exports = { sumar };
`,
};

describe("PatternCheckRunner", () => {
  it("contiene: encuentra patrón literal en archivo específico", () => {
    const r = ejecutarPatronCheck(files, {
      tipo: "contiene",
      archivo: "/app.js",
      patron: "express",
    });
    expect(r.estado).toBe("pasada");
  });

  it("contiene: falla si patrón no existe", () => {
    const r = ejecutarPatronCheck(files, {
      tipo: "contiene",
      archivo: "/app.js",
      patron: "mongoose",
    });
    expect(r.estado).toBe("fallida");
  });

  it("contiene: busca en todos los archivos si no se especifica archivo", () => {
    const r = ejecutarPatronCheck(files, {
      tipo: "contiene",
      patron: "sumar",
    });
    expect(r.estado).toBe("pasada");
  });

  it("contiene: soporta regex", () => {
    const r = ejecutarPatronCheck(files, {
      tipo: "contiene",
      archivo: "/app.js",
      patron: "require\\(['\"]express['\"]\\)",
      regex: true,
    });
    expect(r.estado).toBe("pasada");
  });

  it("noContiene: pasa si el patrón no está", () => {
    const r = ejecutarPatronCheck(files, {
      tipo: "noContiene",
      archivo: "/app.js",
      patron: "console.log",
    });
    expect(r.estado).toBe("pasada");
  });

  it("noContiene: falla si el patrón está presente", () => {
    const r = ejecutarPatronCheck(files, {
      tipo: "noContiene",
      archivo: "/app.js",
      patron: "express",
    });
    expect(r.estado).toBe("fallida");
  });

  it("archivoExiste: pasa para archivo presente", () => {
    const r = ejecutarPatronCheck(files, {
      tipo: "archivoExiste",
      archivo: "/app.js",
    });
    expect(r.estado).toBe("pasada");
  });

  it("archivoExiste: falla para archivo ausente", () => {
    const r = ejecutarPatronCheck(files, {
      tipo: "archivoExiste",
      archivo: "/server.js",
    });
    expect(r.estado).toBe("fallida");
  });

  it("exportaFuncion: detecta CJS exports.X", () => {
    const r = ejecutarPatronCheck(files, {
      tipo: "exportaFuncion",
      archivo: "/utils/helper.js",
      funcion: "sumar",
    });
    expect(r.estado).toBe("pasada");
  });

  it("tieneImport: detecta require", () => {
    const r = ejecutarPatronCheck(files, {
      tipo: "tieneImport",
      archivo: "/app.js",
      desde: "express",
    });
    expect(r.estado).toBe("pasada");
  });
});
