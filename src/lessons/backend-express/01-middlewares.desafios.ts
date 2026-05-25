import type { Desafio } from "@/types/desafios";

const desafio: Desafio = {
  id: "middlewares-express",
  titulo: "Middlewares en Express",
  intro:
    "Implementa los tres tipos de middleware que usa `kidotag10`: un **logger**, un **verificador de token** y un **error handler** con 4 parámetros.",
  objetivo:
    "Dominar la cadena de middlewares de Express: orden, `next()`, cortocircuito de la cadena y manejo centralizado de errores.",
  referenciaKidotag: "kidotag10/api/src/middlewares/auth.middleware.js",
  conceptosNuevos: [
    {
      termino: "next() — continuar la cadena",
      explicacion:
        "Llamar `next()` pasa el control al siguiente middleware. NO llamarlo detiene la cadena (pero es necesario enviar una respuesta).",
      ejemplo:
        "function logger(req, res, next) {\n  console.log(req.method, req.url);\n  next(); // sin esto, la petición se queda colgada\n}",
    },
    {
      termino: "next(error) — propagar un error",
      explicacion:
        "Pasar un argumento a `next` hace que Express salte directamente al error handler de 4 parámetros.",
      ejemplo: 'next(new Error("Token inválido"));',
    },
    {
      termino: "Error handler (4 parámetros)",
      explicacion:
        "Se distingue de un middleware normal por tener exactamente 4 parámetros. Debe declararse AL FINAL de todos los `app.use()` y rutas.",
      ejemplo:
        "app.use((err, req, res, next) => {\n  res.status(500).json({ ok: false, error: err.message });\n});",
    },
  ],
  pasos: [
    {
      id: "paso-1",
      titulo: "Middleware de logging",
      descripcion:
        "Crea un middleware de aplicación (global) que imprima `[METHOD] /ruta` en consola y **siempre llame `next()`** para que la petición continúe.",
      pista:
        "El middleware debe estar registrado con `app.use(logger)` ANTES de las rutas. Si olvidas llamar `next()`, todas las peticiones se quedarán sin respuesta.",
      codigoInicial: {
        "/app.js": `const express = require("express");
const app = express();

app.use(express.json());

// TODO 1: Crea un middleware logger que:
// - Imprima "[METHOD] /ruta" usando console.log(req.method, req.url)
// - Llame next() para continuar la cadena
function logger(req, res, next) {
  // Tu código aquí
}

app.use(logger);

app.get("/ping", (req, res) => {
  res.json({ ok: true, mensaje: "pong" });
});

module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v1-llama-next",
          titulo: "Logger llama next() — GET /ping llega al handler",
          tipo: "node-api",
          entryFile: "/app.js",
          scenarios: [
            {
              method: "GET",
              url: "/ping",
              expect: { status: 200, jsonShape: { ok: true } },
              descripcion:
                "Si el logger no llama next(), GET /ping nunca responde. Status 200 confirma que next() fue llamado.",
            },
          ],
        },
        {
          id: "v1-usa-req",
          titulo: "Logger accede a req.method y req.url",
          tipo: "contiene",
          patron: "req.method",
          mensajeFallo:
            "El logger debe usar `req.method` para imprimir el método HTTP.",
        },
      ],
    },
    {
      id: "paso-2",
      titulo: "Middleware de autenticación (verificarToken)",
      descripcion:
        'Implementa `verificarToken(req, res, next)` que lea el header `Authorization: Bearer <token>`. Si falta el header → **401**. Si el token no es `"token-valido"` → **403**. Si es válido → añade `req.usuario = { id: "1", rol: "profesor" }` y llama `next()`.',
      pista:
        'Lee el header con `req.headers.authorization`. Comprueba que empiece con `"Bearer "`. Extrae el token con `.split(" ")[1]`.',
      codigoInicial: {
        "/app.js": `const express = require("express");
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// TODO 2: Implementa verificarToken
// - Lee req.headers.authorization
// - Sin header → res.status(401).json({ ok: false, error: "Token requerido" })
// - Token !== "token-valido" → res.status(403).json({ ok: false, error: "Token inválido" })
// - Token válido → req.usuario = { id: "1", rol: "profesor" }; next()
function verificarToken(req, res, next) {
  // Tu código aquí
}

app.get("/publico", (req, res) => {
  res.json({ mensaje: "Ruta pública" });
});

app.get("/api/alumnos", verificarToken, (req, res) => {
  res.json({ ok: true, usuario: req.usuario, data: [] });
});

module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v2-sin-token",
          titulo: "GET /api/alumnos sin token → 401",
          tipo: "node-api",
          entryFile: "/app.js",
          scenarios: [
            {
              method: "GET",
              url: "/api/alumnos",
              expect: { status: 401, jsonShape: { ok: false } },
              descripcion: "Sin header Authorization debe retornar 401",
            },
          ],
        },
        {
          id: "v2-token-invalido",
          titulo: "GET /api/alumnos con token malo → 403",
          tipo: "node-api",
          entryFile: "/app.js",
          scenarios: [
            {
              method: "GET",
              url: "/api/alumnos",
              headers: { authorization: "Bearer token-falso" },
              expect: { status: 403, jsonShape: { ok: false } },
              descripcion: "Token inválido debe retornar 403",
            },
          ],
        },
        {
          id: "v2-token-valido",
          titulo: "GET /api/alumnos con token válido → 200 con usuario",
          tipo: "node-api",
          entryFile: "/app.js",
          scenarios: [
            {
              method: "GET",
              url: "/api/alumnos",
              headers: { authorization: "Bearer token-valido" },
              expect: {
                status: 200,
                jsonShape: { ok: true, usuario: { id: "1" } },
              },
              descripcion:
                "Token válido debe retornar 200 con el objeto usuario",
            },
          ],
        },
      ],
    },
    {
      id: "paso-3",
      titulo: "Error handler centralizado (4 parámetros)",
      descripcion:
        "Añade el error handler **al final** de todos los `app.use()`. Debe tener exactamente los parámetros `(err, req, res, next)` y responder con `res.status(err.status || 500).json({ ok: false, error: err.message })`.",
      pista:
        "El error handler DEBE ser el último `app.use()`. Express lo reconoce por los 4 parámetros — si pones 3 no funciona como error handler.",
      codigoInicial: {
        "/app.js": `const express = require("express");
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

function verificarToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "Token requerido" });
  }
  const token = auth.split(" ")[1];
  if (token !== "token-valido") {
    return res.status(403).json({ ok: false, error: "Token inválido" });
  }
  req.usuario = { id: "1", rol: "profesor" };
  next();
}

app.get("/publico", (req, res) => {
  res.json({ mensaje: "Ruta pública" });
});

app.get("/api/alumnos", verificarToken, (req, res) => {
  res.json({ ok: true, usuario: req.usuario, data: [] });
});

// Ruta que deliberadamente lanza un error (para probar el handler)
app.get("/error-test", (req, res, next) => {
  next(new Error("Error de prueba"));
});

// TODO 3: Añade el error handler de 4 parámetros AL FINAL
// app.use((err, req, res, next) => { ... })



module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v3-error-handler-firma",
          titulo: "Error handler declarado con 4 parámetros",
          tipo: "contiene",
          patron: "err, req, res, next",
          mensajeFallo:
            "Falta el error handler. Decláralo con `app.use((err, req, res, next) => {...})`.",
        },
        {
          id: "v3-error-handler-actua",
          titulo: "GET /error-test retorna 500 con ok:false",
          tipo: "node-api",
          entryFile: "/app.js",
          scenarios: [
            {
              method: "GET",
              url: "/error-test",
              expect: { status: 500, jsonShape: { ok: false } },
              descripcion:
                "La ruta /error-test llama next(error). El error handler debe capturarlo y retornar 500.",
            },
          ],
        },
      ],
    },
    {
      id: "paso-4",
      titulo: "Middleware de ruta vs. aplicación",
      descripcion:
        "Agrega una ruta `GET /api/perfil` que use `verificarToken` como middleware de ruta (solo ese endpoint está protegido). Confirma que `GET /publico` sigue funcionando sin token.",
      pista:
        'Pasa el middleware como argumento intermedio: `app.get("/api/perfil", verificarToken, (req, res) => {...})`. El middleware de ruta solo se ejecuta en ese path.',
      codigoInicial: {
        "/app.js": `const express = require("express");
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

function verificarToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "Token requerido" });
  }
  const token = auth.split(" ")[1];
  if (token !== "token-valido") {
    return res.status(403).json({ ok: false, error: "Token inválido" });
  }
  req.usuario = { id: "1", rol: "profesor" };
  next();
}

app.get("/publico", (req, res) => {
  res.json({ mensaje: "Ruta pública" });
});

app.get("/api/alumnos", verificarToken, (req, res) => {
  res.json({ ok: true, usuario: req.usuario, data: [] });
});

app.get("/error-test", (req, res, next) => {
  next(new Error("Error de prueba"));
});

// TODO 4: Añade GET /api/perfil con verificarToken como middleware de ruta
// Responde con { ok: true, perfil: req.usuario }



app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ ok: false, error: err.message });
});

module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v4-publico-sin-token",
          titulo: "GET /publico funciona sin token (no está protegida)",
          tipo: "node-api",
          entryFile: "/app.js",
          scenarios: [
            {
              method: "GET",
              url: "/publico",
              expect: { status: 200 },
              descripcion: "GET /publico no debe requerir token",
            },
          ],
        },
        {
          id: "v4-perfil-protegido",
          titulo: "GET /api/perfil con token válido → 200 con perfil",
          tipo: "node-api",
          entryFile: "/app.js",
          scenarios: [
            {
              method: "GET",
              url: "/api/perfil",
              expect: { status: 401 },
              descripcion: "GET /api/perfil sin token debe retornar 401",
            },
            {
              method: "GET",
              url: "/api/perfil",
              headers: { authorization: "Bearer token-valido" },
              expect: {
                status: 200,
                jsonShape: { ok: true, perfil: { id: "1" } },
              },
              descripcion:
                "GET /api/perfil con token válido debe retornar el perfil",
            },
          ],
        },
      ],
    },
  ],
  retoFinal:
    'Implementa un middleware de **rate limiting** manual: guarda un contador por IP en un `Map`. Si supera 5 peticiones, responde con 429 y `{ ok: false, error: "Demasiadas peticiones" }`. Aplícalo globalmente con `app.use()`.',
};

export default desafio;
