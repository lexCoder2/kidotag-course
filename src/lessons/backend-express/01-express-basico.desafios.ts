import type { Desafio } from "@/types/desafios";

const desafio: Desafio = {
  id: "express-basico",
  titulo: "Construye tu primer servidor Express",
  intro:
    "Replica la estructura de `kidotag10/api/src/app.js`: inicializa Express, añade middlewares, define rutas y exporta la app.",
  objetivo:
    "Crear una API Express funcional con middleware, rutas GET/POST con parámetros y manejo de errores.",
  referenciaKidotag: "kidotag10/api/src/app.js",
  conceptosNuevos: [
    {
      termino: "express.json()",
      explicacion:
        "Middleware que parsea el cuerpo de la petición como JSON. Sin él, `req.body` siempre es `undefined` en POST/PUT.",
      ejemplo: "app.use(express.json()); // antes de las rutas",
    },
    {
      termino: "req.params",
      explicacion:
        "Objeto con los segmentos dinámicos de la URL. Para `/alumnos/:id`, `req.params.id` contiene el valor.",
      ejemplo:
        'app.get("/alumnos/:id", (req, res) => { const { id } = req.params; });',
    },
    {
      termino: "module.exports",
      explicacion:
        "Exporta la app para que el runner (y en producción, el servidor) puedan montarla.",
      ejemplo: "module.exports = app; // al final del archivo",
    },
  ],
  pasos: [
    {
      id: "paso-1",
      titulo: "Inicializa la app y añade express.json()",
      descripcion:
        "Crea la app Express y registra el middleware `express.json()` con `app.use()`. Al final, exporta la app con `module.exports = app`.",
      pista:
        "`app.use(express.json())` debe ir ANTES de cualquier ruta. Sin este middleware `req.body` es `undefined` en peticiones POST/PUT.",
      codigoInicial: {
        "/index.js": `const express = require("express");
const app = express();

// TODO 1: Añade el middleware express.json() para parsear el body
// Tip: app.use(express.json())



module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v1-contiene-json",
          titulo: "express.json() registrado con app.use()",
          tipo: "contiene",
          patron: "express.json()",
          mensajeFallo:
            "Falta `app.use(express.json())`. Añade esta línea antes de las rutas.",
        },
        {
          id: "v1-exporta-app",
          titulo: "App exportada con module.exports = app",
          tipo: "contiene",
          patron: "module.exports",
          mensajeFallo: "Falta `module.exports = app` al final del archivo.",
        },
      ],
    },
    {
      id: "paso-2",
      titulo: "Ruta GET / — health check",
      descripcion:
        'Añade la ruta `GET /` que responda con el JSON `{ mensaje: "API funcionando", version: "1.0" }`. Esta será la ruta de verificación de que el servidor está vivo.',
      pista:
        'Usa `app.get("/", (req, res) => { res.json({ ... }); })`. El campo `mensaje` debe ser exactamente `"API funcionando"` y `version` debe ser `"1.0"`.',
      codigoInicial: {
        "/index.js": `const express = require("express");
const app = express();

app.use(express.json());

// TODO 2: Añade GET / que retorne { mensaje: "API funcionando", version: "1.0" }



module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v2-get-raiz",
          titulo:
            'GET / retorna { mensaje: "API funcionando", version: "1.0" }',
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "GET",
              url: "/",
              expect: {
                status: 200,
                jsonShape: { mensaje: "API funcionando", version: "1.0" },
              },
              descripcion:
                'GET / debe retornar status 200 con { mensaje: "API funcionando", version: "1.0" }',
            },
          ],
        },
      ],
    },
    {
      id: "paso-3",
      titulo: "Ruta con parámetro GET /alumnos/:id",
      descripcion:
        'Añade la ruta `GET /alumnos/:id` que extraiga el `id` de `req.params` y lo retorne en `{ id, nombre: "Demo", grado: "3A" }`. Con esta ruta practicas los **route params**.',
      pista:
        "Desestructura con `const { id } = req.params;`. El `id` siempre llega como string.",
      codigoInicial: {
        "/index.js": `const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensaje: "API funcionando", version: "1.0" });
});

// TODO 3: Añade GET /alumnos/:id
// Extrae req.params.id y responde con { id, nombre: "Demo", grado: "3A" }



module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v3-params",
          titulo: "GET /alumnos/:id devuelve el id correcto",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "GET",
              url: "/alumnos/42",
              expect: {
                status: 200,
                jsonShape: { id: "42" },
              },
              descripcion:
                'GET /alumnos/42 debe retornar status 200 con { id: "42" }',
            },
            {
              method: "GET",
              url: "/alumnos/abc-99",
              expect: {
                status: 200,
                jsonShape: { id: "abc-99" },
              },
              descripcion:
                "GET /alumnos/abc-99 debe retornar el id tal como llega",
            },
          ],
        },
      ],
    },
    {
      id: "paso-4",
      titulo: "Ruta POST /alumnos con validación del body",
      descripcion:
        "Añade `POST /alumnos` que valide que `req.body.nombre` exista. Si no existe, responde con status **400**. Si existe, responde con status **201** y el nuevo alumno.",
      pista:
        "Comprueba con `if (!req.body.nombre)` antes de procesar. Usa `res.status(400).json(...)` para el error y `res.status(201).json(...)` para el éxito.",
      codigoInicial: {
        "/index.js": `const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensaje: "API funcionando", version: "1.0" });
});

app.get("/alumnos/:id", (req, res) => {
  const { id } = req.params;
  res.json({ id, nombre: "Demo", grado: "3A" });
});

// TODO 4: Añade POST /alumnos
// - Si req.body.nombre falta → 400 { ok: false, error: "nombre requerido" }
// - Si existe → 201 { ok: true, data: { id: "nuevo", nombre: req.body.nombre } }



module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v4-post-sin-nombre",
          titulo: "POST /alumnos sin nombre → 400",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "POST",
              url: "/alumnos",
              body: { grado: "3A" },
              expect: { status: 400 },
              descripcion: "POST /alumnos sin campo nombre debe retornar 400",
            },
          ],
        },
        {
          id: "v4-post-con-nombre",
          titulo: "POST /alumnos con nombre → 201 con datos",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "POST",
              url: "/alumnos",
              body: { nombre: "Ana García", grado: "3A" },
              expect: {
                status: 201,
                jsonShape: { ok: true },
              },
              descripcion:
                "POST /alumnos con nombre debe retornar 201 con ok: true",
            },
          ],
        },
      ],
    },
    {
      id: "paso-5",
      titulo: "Middleware de error (4 parámetros)",
      descripcion:
        "Añade el error handler al **final** de todos los middlewares y rutas. Debe tener exactamente 4 parámetros `(err, req, res, next)`. Express lo distingue de un middleware normal por la firma de 4 args.",
      pista:
        "El error handler se declara con `app.use((err, req, res, next) => { ... })`. Responde con `res.status(500).json({ ok: false, error: err.message })`. Debe ir DESPUÉS de todas las rutas.",
      codigoInicial: {
        "/index.js": `const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensaje: "API funcionando", version: "1.0" });
});

app.get("/alumnos/:id", (req, res) => {
  const { id } = req.params;
  res.json({ id, nombre: "Demo", grado: "3A" });
});

app.post("/alumnos", (req, res) => {
  if (!req.body.nombre) {
    return res.status(400).json({ ok: false, error: "nombre requerido" });
  }
  res.status(201).json({ ok: true, data: { id: "nuevo", nombre: req.body.nombre } });
});

// TODO 5: Añade el error handler de 4 parámetros al final
// app.use((err, req, res, next) => { ... })



module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v5-error-handler-firma",
          titulo: "Error handler con 4 parámetros declarado",
          tipo: "contiene",
          patron: "err, req, res, next",
          mensajeFallo:
            "Falta el error handler. Añade `app.use((err, req, res, next) => { res.status(500).json({ ok: false, error: err.message }); })` al final.",
        },
        {
          id: "v5-error-handler-responde",
          titulo: "Error handler responde 500 cuando una ruta lanza",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "GET",
              url: "/",
              expect: { status: 200 },
              descripcion:
                "GET / sigue funcionando con el error handler presente",
            },
          ],
        },
      ],
    },
  ],
  retoFinal:
    'Agrega la ruta `DELETE /alumnos/:id` que devuelva `{ ok: true, eliminado: id }`. Luego agrega una ruta que deliberadamente lanza un error (`throw new Error("prueba")`) y verifica que el error handler responde con 500.',
};

export default desafio;
