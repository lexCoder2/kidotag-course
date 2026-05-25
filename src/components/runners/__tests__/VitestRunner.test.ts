import { describe, it, expect } from "vitest";
import { runVitestCheck } from "../VitestRunner";
import type { SandpackFiles } from "@codesandbox/sandpack-react";

const filesConSumar: SandpackFiles = {
  "/math.js": `
function sumar(a, b) { return a + b; }
function restar(a, b) { return a - b; }
module.exports = { sumar, restar };
`,
};

describe("VitestRunner — harness básico", () => {
  it("ejecuta un test que pasa", async () => {
    const r = await runVitestCheck(filesConSumar, {
      tipo: "vitest",
      testCode: `
        const { sumar } = require("/math.js");
        it("sumar funciona", () => {
          expect(sumar(2, 3)).toBe(5);
        });
      `,
    });
    expect(r.estado).toBe("pasada");
  });

  it("reporta fallo cuando un test falla", async () => {
    const r = await runVitestCheck(filesConSumar, {
      tipo: "vitest",
      testCode: `
        const { sumar } = require("/math.js");
        it("sumar da 10", () => {
          expect(sumar(2, 3)).toBe(10); // incorrecto
        });
      `,
    });
    expect(r.estado).toBe("fallida");
    expect(r.mensaje).toContain("sumar da 10");
  });

  it("filtra por itName", async () => {
    const r = await runVitestCheck(filesConSumar, {
      tipo: "vitest",
      itName: "restar funciona",
      testCode: `
        const { restar } = require("/math.js");
        it("sumar da algo", () => { expect(true).toBe(false); }); // no debe correr
        it("restar funciona", () => { expect(restar(5, 3)).toBe(2); });
      `,
    });
    expect(r.estado).toBe("pasada");
  });

  it("soporta describe anidado", async () => {
    const r = await runVitestCheck(filesConSumar, {
      tipo: "vitest",
      testCode: `
        const { sumar, restar } = require("/math.js");
        describe("operaciones", () => {
          it("sumar", () => { expect(sumar(1, 1)).toBe(2); });
          it("restar", () => { expect(restar(5, 2)).toBe(3); });
        });
      `,
    });
    expect(r.estado).toBe("pasada");
  });

  it("soporta tests asíncronos", async () => {
    const files: SandpackFiles = {
      "/async.js": `
async function fetchData() {
  return { datos: [1, 2, 3] };
}
module.exports = { fetchData };
`,
    };
    const r = await runVitestCheck(files, {
      tipo: "vitest",
      testCode: `
        const { fetchData } = require("/async.js");
        it("fetchData retorna datos", async () => {
          const result = await fetchData();
          expect(result.datos).toHaveLength(3);
        });
      `,
    });
    expect(r.estado).toBe("pasada");
  });

  it("falla con mensaje descriptivo cuando no hay tests", async () => {
    const r = await runVitestCheck(
      {},
      {
        tipo: "vitest",
        testCode: `const x = 1 + 1;`, // no hay it/test
      },
    );
    expect(r.estado).toBe("fallida");
    expect(r.mensaje).toContain("ningún it/test");
  });

  it("soporta .not.toBe", async () => {
    const r = await runVitestCheck(filesConSumar, {
      tipo: "vitest",
      testCode: `
        it("not.toBe", () => {
          expect(1 + 1).not.toBe(3);
        });
      `,
    });
    expect(r.estado).toBe("pasada");
  });

  it("soporta toContain con array", async () => {
    const r = await runVitestCheck(
      {},
      {
        tipo: "vitest",
        testCode: `
        it("toContain", () => {
          expect([1, 2, 3]).toContain(2);
        });
      `,
      },
    );
    expect(r.estado).toBe("pasada");
  });

  it("soporta toMatchObject", async () => {
    const r = await runVitestCheck(
      {},
      {
        tipo: "vitest",
        testCode: `
        it("toMatchObject", () => {
          expect({ ok: true, extra: "ignorado" }).toMatchObject({ ok: true });
        });
      `,
      },
    );
    expect(r.estado).toBe("pasada");
  });
});
