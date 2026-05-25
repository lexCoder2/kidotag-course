import type { Desafio } from "@/types/desafios";

const desafio: Desafio = {
  id: "api-rest-express",
  titulo: "Diseña una API REST con Express",
  intro:
    "Construye los 4 endpoints REST fundamentales de `kidotag10` para gestionar alumnos: **GET**, **GET /:id**, **POST** y **DELETE**.",
  objetivo:
    "Implementar una API REST completa con manejo de 200, 201, 400, 404 y una estructura de respuesta consistente `{ ok, data }` / `{ ok, error }`.",
  referenciaKidotag: "kidotag10/api/src/routes/alumnos.routes.js",
  conceptosNuevos: [
    {
      termino: "Estructura de respuesta consistente",
      explicacion:
        'Siempre responder con `{ ok: true, data: ... }` o `{ ok: false, error: "..." }`. Facilita el manejo en el frontend.',
      ejemplo:
        'res.json({ ok: true, data: alumno });\nres.status(404).json({ ok: false, error: "No encontrado" });',
    },
    {
      termino: "Status HTTP semántico",
      explicacion:
        "200 = OK, 201 = Creado, 400 = Solicitud incorrecta, 404 = No encontrado, 500 = Error del servidor.",
      ejemplo: "res.status(201).json({ ok: true, data: nuevo });",
    },
    {
      termino: "Array.find() y Array.findIndex()",
      explicacion:
        "Para buscar en un array en memoria: `find` retorna el elemento, `findIndex` retorna la posición.",
      ejemplo:
        "const alumno = alumnos.find(a => a.id === Number(id));\nif (!alumno) return res.status(404)...",
    },
  ],
  pasos: [
    {
      id: "paso-1",
      titulo: "GET /alumnos — listar todos",
      descripcion:
        "Crea la ruta `GET /alumnos` que retorne todos los alumnos del array en memoria con `{ ok: true, data: alumnos }`.",
      pista:
        "El array `alumnos` ya está definido al principio del archivo. Solo necesitas responder con `res.json({ ok: true, data: alumnos })`.",
      codigoInicial: {
        "/index.js": `const express = require("express");
const app = express();

app.use(express.json());

// Base de datos en memoria
let alumnos = [
  { id: 1, nombre: "Ana García", grado: "3A", asistencia: 95 },
  { id: 2, nombre: "Luis Méndez", grado: "3A", asistencia: 78 },
  { id: 3, nombre: "Mía Torres", grado: "4B", asistencia: 100 },
];
let siguienteId = 4;

// TODO 1: Añade GET /alumnos que retorne { ok: true, data: alumnos }



module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v1-lista-alumnos",
          titulo: "GET /alumnos retorna array con los 3 alumnos",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "GET",
              url: "/alumnos",
              expect: {
                status: 200,
                jsonShape: { ok: true, data: [{}, {}, {}] },
              },
              descripcion:
                "GET /alumnos debe retornar 200 con { ok: true, data: [3 alumnos] }",
            },
          ],
        },
      ],
    },
    {
      id: "paso-2",
      titulo: "GET /alumnos/:id — buscar por id",
      descripcion:
        'Añade `GET /alumnos/:id` que busque en el array por `id`. Si lo encuentra, responde con `{ ok: true, data: alumno }`. Si no, responde con **404** y `{ ok: false, error: "Alumno no encontrado" }`.',
      pista:
        "El `:id` llega como string — conviértelo a número con `Number(req.params.id)`. Usa `alumnos.find(a => a.id === Number(id))`.",
      codigoInicial: {
        "/index.js": `const express = require("express");
const app = express();

app.use(express.json());

let alumnos = [
  { id: 1, nombre: "Ana García", grado: "3A", asistencia: 95 },
  { id: 2, nombre: "Luis Méndez", grado: "3A", asistencia: 78 },
  { id: 3, nombre: "Mía Torres", grado: "4B", asistencia: 100 },
];
let siguienteId = 4;

app.get("/alumnos", (req, res) => {
  res.json({ ok: true, data: alumnos });
});

// TODO 2: Añade GET /alumnos/:id
// - Convierte req.params.id a número
// - Busca con alumnos.find(...)
// - Si no existe → 404 { ok: false, error: "Alumno no encontrado" }
// - Si existe   → 200 { ok: true, data: alumno }



module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v2-encontrado",
          titulo: "GET /alumnos/1 retorna alumno con ok:true",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "GET",
              url: "/alumnos/1",
              expect: { status: 200, jsonShape: { ok: true } },
              descripcion: "GET /alumnos/1 debe retornar 200 y ok:true",
            },
          ],
        },
        {
          id: "v2-no-encontrado",
          titulo: "GET /alumnos/999 retorna 404",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "GET",
              url: "/alumnos/999",
              expect: { status: 404, jsonShape: { ok: false } },
              descripcion: "GET /alumnos/999 debe retornar 404 con ok:false",
            },
          ],
        },
      ],
    },
    {
      id: "paso-3",
      titulo: "POST /alumnos — crear nuevo alumno",
      descripcion:
        "Añade `POST /alumnos` que cree un alumno nuevo. Valida que `req.body.nombre` exista (→ 400 si falta). Asigna el `siguienteId`, añade al array y responde con **201** y el nuevo alumno.",
      pista:
        "Usa `siguienteId++` para incrementar el contador. Añade al array con `alumnos.push(nuevo)`. Responde con `res.status(201).json({ ok: true, data: nuevo })`.",
      codigoInicial: {
        "/index.js": `const express = require("express");
const app = express();

app.use(express.json());

let alumnos = [
  { id: 1, nombre: "Ana García", grado: "3A", asistencia: 95 },
  { id: 2, nombre: "Luis Méndez", grado: "3A", asistencia: 78 },
  { id: 3, nombre: "Mía Torres", grado: "4B", asistencia: 100 },
];
let siguienteId = 4;

app.get("/alumnos", (req, res) => {
  res.json({ ok: true, data: alumnos });
});

app.get("/alumnos/:id", (req, res) => {
  const alumno = alumnos.find(a => a.id === Number(req.params.id));
  if (!alumno) return res.status(404).json({ ok: false, error: "Alumno no encontrado" });
  res.json({ ok: true, data: alumno });
});

// TODO 3: Añade POST /alumnos
// - Valida req.body.nombre (→ 400 si falta)
// - Crea objeto { id: siguienteId++, nombre, grado: req.body.grado || "Sin grupo" }
// - Añade al array con alumnos.push(nuevo)
// - Responde 201 { ok: true, data: nuevo }



module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v3-post-sin-nombre",
          titulo: "POST /alumnos sin nombre → 400",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "POST",
              url: "/alumnos",
              body: { grado: "3A" },
              expect: { status: 400, jsonShape: { ok: false } },
              descripcion: "POST sin nombre debe retornar 400 con ok:false",
            },
          ],
        },
        {
          id: "v3-post-crea",
          titulo: "POST /alumnos con nombre → 201 y persiste en GET",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "POST",
              url: "/alumnos",
              body: { nombre: "Sara López", grado: "2A" },
              expect: {
                status: 201,
                jsonShape: { ok: true, data: { nombre: "Sara López" } },
              },
              descripcion:
                "POST con nombre debe retornar 201 con el alumno creado",
            },
            {
              method: "GET",
              url: "/alumnos",
              expect: { status: 200, jsonShape: { data: [{}, {}, {}, {}] } },
              descripcion:
                "Después de POST, GET /alumnos debe listar 4 alumnos",
            },
          ],
        },
      ],
    },
    {
      id: "paso-4",
      titulo: "DELETE /alumnos/:id — eliminar",
      descripcion:
        "Añade `DELETE /alumnos/:id` que elimine el alumno del array. Si no existe, responde con **404**. Si se eliminó, responde con **200** y `{ ok: true, eliminado: alumno }`.",
      pista:
        "Usa `alumnos.findIndex(a => a.id === Number(id))` para encontrar la posición. Si `idx === -1` → 404. Para eliminar usa `alumnos.splice(idx, 1)` que retorna el elemento eliminado.",
      codigoInicial: {
        "/index.js": `const express = require("express");
const app = express();

app.use(express.json());

let alumnos = [
  { id: 1, nombre: "Ana García", grado: "3A", asistencia: 95 },
  { id: 2, nombre: "Luis Méndez", grado: "3A", asistencia: 78 },
  { id: 3, nombre: "Mía Torres", grado: "4B", asistencia: 100 },
];
let siguienteId = 4;

app.get("/alumnos", (req, res) => {
  res.json({ ok: true, data: alumnos });
});

app.get("/alumnos/:id", (req, res) => {
  const alumno = alumnos.find(a => a.id === Number(req.params.id));
  if (!alumno) return res.status(404).json({ ok: false, error: "Alumno no encontrado" });
  res.json({ ok: true, data: alumno });
});

app.post("/alumnos", (req, res) => {
  if (!req.body.nombre) {
    return res.status(400).json({ ok: false, error: "nombre es requerido" });
  }
  const nuevo = { id: siguienteId++, nombre: req.body.nombre, grado: req.body.grado || "Sin grupo" };
  alumnos.push(nuevo);
  res.status(201).json({ ok: true, data: nuevo });
});

// TODO 4: Añade DELETE /alumnos/:id
// - Usa findIndex para localizar por id
// - Si idx === -1 → 404 { ok: false, error: "No encontrado" }
// - Si existe → alumnos.splice(idx, 1) y responde 200 { ok: true, eliminado: alumnos[idx] }



module.exports = app;
`,
      },
      verificaciones: [
        {
          id: "v4-delete-404",
          titulo: "DELETE /alumnos/999 → 404",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "DELETE",
              url: "/alumnos/999",
              expect: { status: 404, jsonShape: { ok: false } },
              descripcion: "DELETE de id inexistente debe retornar 404",
            },
          ],
        },
        {
          id: "v4-delete-elimina",
          titulo: "DELETE /alumnos/1 elimina y GET retorna 2",
          tipo: "node-api",
          entryFile: "/index.js",
          scenarios: [
            {
              method: "DELETE",
              url: "/alumnos/1",
              expect: { status: 200, jsonShape: { ok: true } },
              descripcion: "DELETE /alumnos/1 debe retornar 200 con ok:true",
            },
            {
              method: "GET",
              url: "/alumnos/1",
              expect: { status: 404 },
              descripcion: "Tras eliminar, GET /alumnos/1 debe retornar 404",
            },
            {
              method: "GET",
              url: "/alumnos",
              expect: { status: 200, jsonShape: { data: [{}, {}] } },
              descripcion: "Tras eliminar, solo quedan 2 alumnos",
            },
          ],
        },
      ],
    },
  ],
  retoFinal:
    "Añade `PUT /alumnos/:id` que actualice `nombre` y/o `grado` del alumno. Si no existe → 404. Si se actualiza → 200 con el alumno modificado. Prueba que GET /alumnos/:id refleja los cambios.",
};

export default desafio;
