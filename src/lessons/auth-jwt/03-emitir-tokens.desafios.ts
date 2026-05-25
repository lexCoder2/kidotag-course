import type { Desafio } from "@/types/desafios";

const desafio: Desafio = {
  id: "emitir-tokens",
  titulo: "Implementa loginUnificado",
  intro:
    "Construye el endpoint `POST /api/auth/login` de `kidotag10` paso a paso: validación, búsqueda del usuario, verificación de password con bcrypt y emisión del JWT.",
  objetivo:
    "Implementar el flujo completo de autenticación: validar input → buscar usuario → comparar hash → emitir token.",
  referenciaKidotag: "kidotag10/api/src/controllers/auth.controller.js",
  conceptosNuevos: [
    {
      termino: "Flujo de login seguro",
      explicacion:
        "Login = (1) validar campos, (2) buscar usuario, (3) comparar password con bcrypt, (4) emitir JWT. NUNCA comparar passwords en texto plano.",
      ejemplo:
        'const match = await bcrypt.compare(password, usuario.password);\nif (!match) return res.status(401).json({ ok: false, error: "Credenciales incorrectas" });',
    },
    {
      termino: "User enumeration prevention",
      explicacion:
        "Usar el mismo mensaje de error para 'usuario no existe' y 'password incorrecto' evita que un atacante sepa qué emails están registrados.",
      ejemplo:
        'if (!usuario || !match) return res.status(401).json({ ok: false, error: "Credenciales incorrectas" });',
    },
  ],
  pasos: [
    {
      id: "paso-1",
      titulo: "Validación de campos del body",
      descripcion:
        'En el endpoint `POST /api/auth/login`, valida que `req.body` contenga `email`, `password` y `rol`. Si falta alguno, responde con **400** y `{ ok: false, error: "Campos requeridos: email, password, rol" }`.',
      pista:
        "Desestructura los tres campos del body y verifica que ninguno sea `undefined` o vacío con `if (!email || !password || !rol)`.",
      codigoInicial: {
        "/index.js": `const express = require("express");
const app = express();

app.use(express.json());

app.post("/api/auth/login", async (req, res) => {
  // TODO 1: Desestructura email, password y rol de req.body
  // Valida que los tres existan → 400 si falta alguno

  // const { email, password, rol } = req.body;
  // if (!email || !password || !rol) { ... }

  res.json({ ok: true, mensaje: "Continúa en el siguiente paso" });
});

module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v1-campos-vacios",
          titulo: "POST sin campos → 400 con mensaje de error",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "POST",
              url: "/api/auth/login",
              body: {},
              expect: {
                status: 400,
                jsonShape: { ok: false },
              },
              descripcion: "POST sin body debe retornar 400 con ok:false",
            },
            {
              method: "POST",
              url: "/api/auth/login",
              body: { email: "a@b.com", rol: "tutor" },
              expect: { status: 400 },
              descripcion: "POST sin password debe retornar 400",
            },
          ],
        },
      ],
    },
    {
      id: "paso-2",
      titulo: "Buscar usuario y verificar password",
      descripcion:
        'Implementa la búsqueda del usuario en un array en memoria y la verificación del password con `bcrypt.compare()`. Si el usuario no existe o el password es incorrecto, responde **401** con `{ ok: false, error: "Credenciales incorrectas" }`.',
      pista:
        "Usa el mismo mensaje de error para ambos casos (usuario no encontrado y password incorrecto) — esto previene user enumeration. El password ya está hasheado en el array de usuarios.",
      codigoInicial: {
        "/index.js": `const express = require("express");
const bcrypt = require("bcryptjs");
const app = express();

app.use(express.json());

// "Base de datos" en memoria — passwords ya hasheados
const USUARIOS = [
  {
    _id: "u001",
    email: "profe@escuela.mx",
    password: "$mock$10$" + btoa("Futbol123"),
    rol: "profesor",
    nombre: "Carlos Ramírez",
    escuela: "esc001",
  },
  {
    _id: "u002",
    email: "admin@escuela.mx",
    password: "$mock$10$" + btoa("Admin2024"),
    rol: "admin",
    nombre: "Ana López",
    escuela: "esc001",
  },
];

app.post("/api/auth/login", async (req, res) => {
  const { email, password, rol } = req.body;
  if (!email || !password || !rol) {
    return res.status(400).json({ ok: false, error: "Campos requeridos: email, password, rol" });
  }

  // TODO 2a: Busca el usuario por email y rol en el array USUARIOS
  // const usuario = USUARIOS.find(u => u.email === email && u.rol === rol);

  // TODO 2b: Verifica el password con bcrypt.compare()
  // const passwordValido = await bcrypt.compare(password, usuario.password);

  // TODO 2c: Si no hay usuario o password inválido → 401 con mismo mensaje
  // Responde "Credenciales incorrectas" en AMBOS casos

  res.json({ ok: true, mensaje: "Continúa en el siguiente paso", usuario: null });
});

module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v2-usuario-no-existe",
          titulo: "Email no registrado → 401 con 'Credenciales incorrectas'",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "POST",
              url: "/api/auth/login",
              body: {
                email: "nadie@escuela.mx",
                password: "cualquier",
                rol: "profesor",
              },
              expect: {
                status: 401,
                jsonShape: { ok: false },
              },
              descripcion: "Usuario no existente debe retornar 401",
            },
          ],
        },
        {
          id: "v2-password-incorrecto",
          titulo: "Password incorrecto → 401",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "POST",
              url: "/api/auth/login",
              body: {
                email: "profe@escuela.mx",
                password: "PasswordMalo",
                rol: "profesor",
              },
              expect: { status: 401, jsonShape: { ok: false } },
              descripcion: "Password incorrecto debe retornar 401",
            },
          ],
        },
      ],
    },
    {
      id: "paso-3",
      titulo: "Emitir JWT al hacer login exitoso",
      descripcion:
        'Cuando email, password y rol son correctos, usa `jwt.sign()` para crear un token con `{ id: usuario._id, rol, escuelaId: usuario.escuela }` y el secreto `"secreto_kidotag"`. Responde con **200** y `{ ok: true, data: { token, usuario: { id, nombre, email, rol } } }`.',
      pista:
        "Usa `jwt.sign(payload, secret, { expiresIn: '7d' })`. El payload debe incluir `id`, `rol` y `escuelaId`. La respuesta incluye el token Y los datos básicos del usuario (sin el password).",
      codigoInicial: {
        "/index.js": `const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());

const JWT_SECRET = "secreto_kidotag";

const USUARIOS = [
  {
    _id: "u001",
    email: "profe@escuela.mx",
    password: "$mock$10$" + btoa("Futbol123"),
    rol: "profesor",
    nombre: "Carlos Ramírez",
    escuela: "esc001",
  },
  {
    _id: "u002",
    email: "admin@escuela.mx",
    password: "$mock$10$" + btoa("Admin2024"),
    rol: "admin",
    nombre: "Ana López",
    escuela: "esc001",
  },
];

app.post("/api/auth/login", async (req, res) => {
  const { email, password, rol } = req.body;
  if (!email || !password || !rol) {
    return res.status(400).json({ ok: false, error: "Campos requeridos: email, password, rol" });
  }

  const usuario = USUARIOS.find(u => u.email === email && u.rol === rol);
  const passwordValido = usuario && await bcrypt.compare(password, usuario.password);

  if (!usuario || !passwordValido) {
    return res.status(401).json({ ok: false, error: "Credenciales incorrectas" });
  }

  // TODO 3: Emite el JWT y responde con { ok: true, data: { token, usuario: {...} } }
  // const token = jwt.sign(...)
  // res.json({ ok: true, data: { token, usuario: { id: usuario._id, ... } } })
});

module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v3-login-exitoso",
          titulo: "Login válido → 200 con token en el body",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "POST",
              url: "/api/auth/login",
              body: {
                email: "profe@escuela.mx",
                password: "Futbol123",
                rol: "profesor",
              },
              expect: {
                status: 200,
                jsonShape: { ok: true, data: { token: "" } },
              },
              descripcion:
                "Login correcto debe retornar 200 con ok:true y un token",
            },
          ],
        },
        {
          id: "v3-token-valido",
          titulo: "Token retornado tiene 3 partes (formato JWT válido)",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "POST",
              url: "/api/auth/login",
              body: {
                email: "admin@escuela.mx",
                password: "Admin2024",
                rol: "admin",
              },
              expect: {
                status: 200,
                bodyContains: ".",
              },
              descripcion:
                "El token en la respuesta debe contener '.' (formato header.payload.signature)",
            },
          ],
        },
      ],
    },
    {
      id: "paso-4",
      titulo: "Protege una ruta con el token emitido",
      descripcion:
        "Añade una ruta `GET /api/perfil` protegida por middleware que extrae y verifica el JWT del header `Authorization: Bearer <token>`. Si el token es válido, responde con el payload (`{ id, rol }`).",
      pista:
        "Usa `jwt.verify(token, JWT_SECRET)` en el middleware. Lee el header con `req.headers.authorization.split(' ')[1]`. Si falla → 401.",
      codigoInicial: {
        "/index.js": `const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());

const JWT_SECRET = "secreto_kidotag";

const USUARIOS = [
  {
    _id: "u001",
    email: "profe@escuela.mx",
    password: "$mock$10$" + btoa("Futbol123"),
    rol: "profesor",
    nombre: "Carlos Ramírez",
    escuela: "esc001",
  },
];

app.post("/api/auth/login", async (req, res) => {
  const { email, password, rol } = req.body;
  if (!email || !password || !rol) {
    return res.status(400).json({ ok: false, error: "Campos requeridos: email, password, rol" });
  }
  const usuario = USUARIOS.find(u => u.email === email && u.rol === rol);
  const passwordValido = usuario && await bcrypt.compare(password, usuario.password);
  if (!usuario || !passwordValido) {
    return res.status(401).json({ ok: false, error: "Credenciales incorrectas" });
  }
  const token = jwt.sign({ id: usuario._id, rol, escuelaId: usuario.escuela }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ ok: true, data: { token, usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol } } });
});

// TODO 4: Implementa el middleware verificarJWT y la ruta GET /api/perfil
// function verificarJWT(req, res, next) { ... }
// app.get("/api/perfil", verificarJWT, (req, res) => { res.json({ ok: true, perfil: req.usuario }) })



module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v4-sin-token",
          titulo: "GET /api/perfil sin token → 401",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "GET",
              url: "/api/perfil",
              expect: { status: 401 },
              descripcion:
                "GET /api/perfil sin Authorization debe retornar 401",
            },
          ],
        },
        {
          id: "v4-flujo-completo",
          titulo: "Login + usar token → GET /api/perfil retorna 200",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "POST",
              url: "/api/auth/login",
              body: {
                email: "profe@escuela.mx",
                password: "Futbol123",
                rol: "profesor",
              },
              expect: { status: 200 },
              descripcion: "Primero obtenemos el token con login",
            },
          ],
        },
      ],
    },
  ],
  retoFinal:
    "Agrega un segundo modelo de usuario `admin` con email `admin@escuela.mx` y password `Admin2024`. Implementa una ruta `GET /api/admin/stats` que solo permita acceso a usuarios con `rol === 'admin'` (retorna 403 si es otro rol). Prueba el flujo completo: login como admin → acceder a stats.",
};

export default desafio;
