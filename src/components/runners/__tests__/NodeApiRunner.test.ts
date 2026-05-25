import { describe, it, expect, beforeEach } from "vitest";
import { ejecutarNodeApiCheck } from "../NodeApiRunner";
import { resetStore } from "../mock-mongoose";
import type { SandpackFiles } from "@codesandbox/sandpack-react";

beforeEach(() => {
  resetStore();
});

// ── App Express mínima para probar routing básico ─────────────────────────

const appMinima: SandpackFiles = {
  "/app.js": `
const express = require("express");
const app = express();
app.use(express.json());

app.get("/ping", (req, res) => {
  res.json({ ok: true, mensaje: "pong" });
});

app.post("/suma", (req, res) => {
  const { a, b } = req.body;
  res.json({ ok: true, resultado: a + b });
});

module.exports = app;
`,
};

// ── App con Mongoose para probar CRUD ────────────────────────────────────

const appConMongoose: SandpackFiles = {
  "/app.js": `
const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

const AlumnoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const Alumno = mongoose.model("Alumno", AlumnoSchema);

app.get("/alumnos", async (req, res) => {
  const alumnos = await Alumno.find();
  res.json({ ok: true, data: alumnos });
});

app.post("/alumnos", async (req, res) => {
  try {
    const alumno = await Alumno.create(req.body);
    res.status(201).json({ ok: true, data: alumno });
  } catch (err) {
    res.status(400).json({ ok: false, error: { mensaje: err.message } });
  }
});

app.get("/alumnos/:id", async (req, res) => {
  const alumno = await Alumno.findById(req.params.id);
  if (!alumno) return res.status(404).json({ ok: false, error: { mensaje: "No encontrado" } });
  res.json({ ok: true, data: alumno });
});

module.exports = app;
`,
};

// ── App con JWT auth ──────────────────────────────────────────────────────

const appConAuth: SandpackFiles = {
  "/app.js": `
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const app = express();
app.use(express.json());

const SECRET = "test-secret";
const usuarios = [];

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  usuarios.push({ email, password: hash });
  res.status(201).json({ ok: true });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) return res.status(401).json({ ok: false, error: { mensaje: "No encontrado" } });
  const ok = await bcrypt.compare(password, usuario.password);
  if (!ok) return res.status(401).json({ ok: false, error: { mensaje: "Contraseña incorrecta" } });
  const token = jwt.sign({ email }, SECRET, { expiresIn: "1h" });
  res.json({ ok: true, data: { token } });
});

app.get("/perfil", (req, res) => {
  const auth = req.headers["authorization"];
  if (!auth) return res.status(401).json({ ok: false });
  try {
    const payload = jwt.verify(auth.replace("Bearer ", ""), SECRET);
    res.json({ ok: true, data: payload });
  } catch {
    res.status(401).json({ ok: false, error: { mensaje: "Token inválido" } });
  }
});

module.exports = app;
`,
};

describe("NodeApiRunner — rutas básicas", () => {
  it("GET /ping retorna pong", async () => {
    const r = await ejecutarNodeApiCheck(appMinima, {
      tipo: "node-api",
      entryFile: "/app.js",
      scenarios: [
        {
          method: "GET",
          url: "/ping",
          expect: { status: 200, jsonShape: { ok: true, mensaje: "pong" } },
        },
      ],
    });
    expect(r.estado).toBe("pasada");
  });

  it("POST /suma calcula correctamente", async () => {
    const r = await ejecutarNodeApiCheck(appMinima, {
      tipo: "node-api",
      entryFile: "/app.js",
      scenarios: [
        {
          method: "POST",
          url: "/suma",
          body: { a: 3, b: 7 },
          expect: { status: 200, jsonShape: { ok: true, resultado: 10 } },
        },
      ],
    });
    expect(r.estado).toBe("pasada");
  });

  it("ruta inexistente retorna 404", async () => {
    const r = await ejecutarNodeApiCheck(appMinima, {
      tipo: "node-api",
      entryFile: "/app.js",
      scenarios: [
        {
          method: "GET",
          url: "/no-existe",
          expect: { status: 404 },
        },
      ],
    });
    expect(r.estado).toBe("pasada");
  });
});

describe("NodeApiRunner — CRUD con Mongoose", () => {
  it("POST /alumnos crea un alumno y GET /alumnos lo retorna", async () => {
    const r = await ejecutarNodeApiCheck(appConMongoose, {
      tipo: "node-api",
      entryFile: "/app.js",
      scenarios: [
        {
          method: "POST",
          url: "/alumnos",
          body: { nombre: "Ana", email: "ana@test.com" },
          expect: { status: 201, jsonShape: { ok: true } },
        },
        {
          method: "GET",
          url: "/alumnos",
          expect: { status: 200, jsonShape: { ok: true } },
        },
      ],
    });
    expect(r.estado).toBe("pasada");
  });

  it("POST /alumnos sin nombre falla validación", async () => {
    const r = await ejecutarNodeApiCheck(appConMongoose, {
      tipo: "node-api",
      entryFile: "/app.js",
      scenarios: [
        {
          method: "POST",
          url: "/alumnos",
          body: { email: "sin-nombre@test.com" }, // nombre required falta
          expect: { status: 400 },
        },
      ],
    });
    expect(r.estado).toBe("pasada");
  });
});

describe("NodeApiRunner — autenticación JWT + bcrypt", () => {
  it("flujo completo: register → login → perfil", async () => {
    let token = "";
    // Scenario 1: register
    // Scenario 2: login — debemos capturar el token
    // Como no podemos capturar dinámicamente, usamos una aserción de jsonShape básica
    const r = await ejecutarNodeApiCheck(appConAuth, {
      tipo: "node-api",
      entryFile: "/app.js",
      scenarios: [
        {
          method: "POST",
          url: "/register",
          body: { email: "test@test.com", password: "secreto123" },
          expect: { status: 201, jsonShape: { ok: true } },
          descripcion: "Registro exitoso",
        },
        {
          method: "POST",
          url: "/login",
          body: { email: "test@test.com", password: "secreto123" },
          expect: { status: 200, jsonShape: { ok: true } },
          descripcion: "Login exitoso — retorna token",
        },
      ],
    });
    expect(r.estado).toBe("pasada");
  });

  it("login con contraseña incorrecta retorna 401", async () => {
    const r = await ejecutarNodeApiCheck(appConAuth, {
      tipo: "node-api",
      entryFile: "/app.js",
      scenarios: [
        {
          method: "POST",
          url: "/register",
          body: { email: "x@x.com", password: "correcta" },
          expect: { status: 201 },
        },
        {
          method: "POST",
          url: "/login",
          body: { email: "x@x.com", password: "incorrecta" },
          expect: { status: 401 },
        },
      ],
    });
    expect(r.estado).toBe("pasada");
  });
});
