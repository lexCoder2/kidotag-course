import fs from "fs";

const write = (path, content) => {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(path, content, "utf8");
  console.log("✅", path);
};

const base = "src/lessons";

// ── 04-openapi-intro ──────────────────────────────────────────────────────────
write(
  `${base}/swagger/04-openapi-intro.mdx`,
  `# OpenAPI 3.0: la especificación

**OpenAPI** (antes "Swagger") es el estándar de la industria para describir APIs REST.
Es un contrato escrito que dice exactamente qué hace cada endpoint.

<LibCard
  nombre="swagger-jsdoc"
  version="6.2.8"
  npm="swagger-jsdoc"
  categoria="devtools"
  docs="https://github.com/Surnet/swagger-jsdoc"
  descripcion="Genera automáticamente un spec OpenAPI 3.0 a partir de comentarios JSDoc en el código. La documentación vive junto al código que describe."
  porque="El riesgo principal de la documentación separada del código es que quede desactualizada. Con swagger-jsdoc, los comentarios están en el mismo archivo que las rutas — si cambias el endpoint, cambias el doc en el mismo commit."
  usoEjemplo={\`// src/config/swagger.js de kidotag10
const swaggerJsdoc = require('swagger-jsdoc');
const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Kidotag API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:4000' }],
  },
  apis: ['./src/routes/*.js'],  // ← archivos con los comentarios JSDoc
};
module.exports = swaggerJsdoc(options);\`}
  alternativas={[
    { nombre: "Spec YAML escrito a mano", porque_no: "Más limpio pero se desincroniza del código fácilmente." },
    { nombre: "Postman Collections", porque_no: "Útil para testing pero no produce un spec OpenAPI estándar exportable." },
  ]}
/>

## Estructura de un spec OpenAPI

\`\`\`yaml
# Simplificado — kidotag10 lo genera automáticamente con swagger-jsdoc
openapi: 3.0.0
info:
  title: Kidotag API
  version: 1.0.0
  description: API para control de asistencia escolar con NFC

servers:
  - url: http://localhost:4000
    description: Servidor local

paths:
  /api/auth/login:
    post:
      summary: Login unificado para todos los roles
      tags: [Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginInput'
      responses:
        '200':
          description: Login exitoso — devuelve el token JWT
        '401':
          description: Credenciales incorrectas

components:
  schemas:
    LoginInput:
      type: object
      required: [email, password, rol]
      properties:
        email:    { type: string, example: "profesor@escuela.mx" }
        password: { type: string, example: "MiPassword123" }
        rol:      { type: string, enum: [tutor, profesor, admin] }
\`\`\`

## Las 5 secciones clave de OpenAPI

| Sección | Propósito | Ejemplo en kidotag10 |
|---------|-----------|---------------------|
| \`info\` | Metadata de la API | título, versión, descripción |
| \`servers\` | URLs base | localhost:4000, api.kidotag.mx |
| \`paths\` | Los endpoints | /api/auth/login, /api/alumnos |
| \`components/schemas\` | Tipos reutilizables | AlumnoInput, TutorResponse |
| \`components/securitySchemes\` | Auth | Bearer JWT |

<Callout variante="tip" titulo="OpenAPI = contrato entre frontend y backend">
  Con el spec OpenAPI, el equipo frontend sabe exactamente qué esperar de cada
  endpoint sin necesidad de leer el código del backend ni preguntar al equipo.
  Es la fuente de verdad de la API.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Cuál es la ventaja principal de usar swagger-jsdoc sobre escribir el spec YAML manualmente?",
      opciones: [
        { texto: "El spec YAML generado es más pequeño" },
        { texto: "La documentación vive junto al código de las rutas — si cambias el endpoint y el doc están en el mismo archivo, es menos probable que queden desincronizados", correcta: true },
        { texto: "swagger-jsdoc genera código automáticamente" },
        { texto: "El YAML manual no soporta OpenAPI 3.0" },
      ],
      explicacion: "La documentación desactualizada es peor que no tener documentación — confunde. Al tener el JSDoc junto a la ruta, un developer que modifica el endpoint ve la documentación en el mismo contexto.",
    },
  ]}
/>
`,
);

// ── 04-swagger-jsdoc ─────────────────────────────────────────────────────────
write(
  `${base}/swagger/04-swagger-jsdoc.mdx`,
  `# swagger-jsdoc: docs como código

Veamos cómo kidotag10 documenta sus rutas con comentarios JSDoc.

## La sintaxis de anotación

\`\`\`javascript
// src/routes/auth.routes.js de kidotag10

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login unificado para todos los roles
 *     description: |
 *       Recibe email, password y rol. Busca en la colección
 *       correspondiente, verifica el password con bcrypt y
 *       devuelve un JWT con expiración de 7 días.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Campos requeridos faltantes o rol inválido
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', loginUnificado);
\`\`\`

## Definir schemas reutilizables

\`\`\`javascript
// También en JSDoc, generalmente en un archivo separado o al inicio de routes/

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       required: [email, password, rol]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "profesor@escuela.mx"
 *         password:
 *           type: string
 *           minLength: 6
 *           example: "MiPassword123"
 *         rol:
 *           type: string
 *           enum: [tutor, profesor, admin]
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *             usuario:
 *               $ref: '#/components/schemas/UsuarioBasico'
 */
\`\`\`

## La configuración en kidotag10

\`\`\`javascript
// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kidotag API',
      version: '1.0.0',
      description: 'API REST para control de asistencia escolar con NFC',
    },
    servers: [
      { url: \`http://localhost:\${process.env.PORT || 4000}\` }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }], // ← seguridad global por defecto
  },
  apis: ['./src/routes/*.js'],      // ← archivos a escanear
};

module.exports = swaggerJsdoc(options);
\`\`\`

\`\`\`javascript
// src/app.js — montar la UI
const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// → http://localhost:4000/api-docs
\`\`\`

<Callout variante="tip" titulo="El spec JSON también está disponible">
  \`GET /api-docs/swagger.json\` devuelve el spec completo en JSON.
  Herramientas como Postman pueden importarlo directamente para generar
  una colección de testing automáticamente.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Qué hace la propiedad 'apis' en la configuración de swagger-jsdoc?",
      opciones: [
        { texto: "Define los endpoints de la API" },
        { texto: "Le dice a swagger-jsdoc en qué archivos buscar los comentarios @swagger para generar el spec", correcta: true },
        { texto: "Lista las dependencias de la API" },
        { texto: "Configura los servidores donde se desplegará la API" },
      ],
      explicacion: "swagger-jsdoc escanea los archivos que matches con el patrón en 'apis' (en kidotag10, './src/routes/*.js') buscando comentarios con @swagger para construir el spec automáticamente.",
    },
  ]}
/>
`,
);

// ── 04-schemas-seguridad ──────────────────────────────────────────────────────
write(
  `${base}/swagger/04-schemas-seguridad.mdx`,
  `# Schemas reutilizables y seguridad Bearer

OpenAPI permite definir schemas en \`components/schemas\` y referenciarlos
con \`$ref\` para evitar repetición. También define cómo se autentica la API.

## Schemas en kidotag10

\`\`\`javascript
/**
 * @swagger
 * components:
 *   schemas:
 *
 *     Alumno:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         nombre:
 *           type: string
 *           example: "Ana García López"
 *         uid_nfc:
 *           type: string
 *           example: "A1B2C3D4"
 *           nullable: true
 *         tutor:
 *           $ref: '#/components/schemas/TutorBasico'
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     TutorBasico:
 *       type: object
 *       properties:
 *         _id:     { type: string }
 *         nombre:  { type: string }
 *         email:   { type: string, format: email }
 *
 *     ApiError:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "TOKEN_EXPIRADO"
 */
\`\`\`

## Seguridad Bearer JWT

\`\`\`javascript
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: |
 *         JWT obtenido desde POST /api/auth/login.
 *         Formato: "Bearer eyJhbGciOiJIUzI1NiJ9..."
 */

// Aplicar a un endpoint específico:
/**
 * @swagger
 * /api/alumnos:
 *   get:
 *     security:
 *       - bearerAuth: []    ← este endpoint requiere el token
 *     summary: Listar alumnos de la escuela
 */

// Aplicar globalmente en la definición base:
// security: [{ bearerAuth: [] }]
// Luego en endpoints públicos se puede sobrescribir:
// security: []
\`\`\`

## El patrón de respuesta de kidotag10

kidotag10 usa un patrón consistente \`{ ok, data, error }\` para todas las respuestas:

\`\`\`javascript
/**
 * @swagger
 * components:
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         ok:   { type: boolean, example: true }
 *         data: { }  # el tipo varía por endpoint
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         ok:    { type: boolean, example: false }
 *         error: { type: string, example: "RECURSO_NO_ENCONTRADO" }
 */
\`\`\`

<Callout variante="tip" titulo="Swagger UI en desarrollo">
  Con kidotag10 corriendo en modo desarrollo, visita
  \`http://localhost:4000/api-docs\` para ver la interfaz interactiva.
  Puedes hacer login, copiar el token y usarlo en los endpoints protegidos
  directamente desde el navegador.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Para qué sirve el $ref en OpenAPI como '$ref: '#/components/schemas/Alumno''?",
      opciones: [
        { texto: "Para importar el modelo de Mongoose" },
        { texto: "Para reutilizar una definición de schema en múltiples endpoints sin repetirla", correcta: true },
        { texto: "Para crear una referencia de base de datos entre colecciones" },
        { texto: "Para hacer una petición HTTP a otro endpoint" },
      ],
      explicacion: "$ref es una referencia JSON. Apunta a una definición existente en components/schemas — así defines el schema Alumno una sola vez y lo referencias en todos los endpoints que lo retornan.",
    },
  ]}
/>
`,
);

// ── 04-swagger-ui-ejercicio ───────────────────────────────────────────────────
write(
  `${base}/swagger/04-swagger-ui-ejercicio.mdx`,
  `# Swagger UI y ejercicio final

<LibCard
  nombre="swagger-ui-express"
  version="5.0.0"
  npm="swagger-ui-express"
  categoria="devtools"
  docs="https://github.com/scottie1984/swagger-ui-express"
  descripcion="Middleware Express que sirve la interfaz web de Swagger UI, permitiendo explorar e interactuar con la API directamente desde el navegador."
  porque="Swagger UI convierte el spec OpenAPI en una interfaz interactiva visual. Los desarrolladores frontend pueden ver todos los endpoints, hacer peticiones de prueba y ver las respuestas sin necesidad de Postman."
  usoEjemplo={\`// src/app.js de kidotag10
const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'Kidotag API Docs',
}));
// → Disponible en http://localhost:4000/api-docs\`}
  alternativas={[
    { nombre: "Redoc", porque_no: "Más elegante visualmente, pero read-only (no permite hacer peticiones). swagger-ui-express permite testear la API directamente." },
    { nombre: "Postman", porque_no: "Excelente para testing, pero requiere instalación por separado. Swagger UI está embebido en el servidor." },
  ]}
/>

## La interfaz de Swagger UI

Cuando visitas \`http://localhost:4000/api-docs\`, verás:

\`\`\`
┌─────────────────────────────────────────┐
│  Kidotag API  v1.0.0                    │
├─────────────────────────────────────────┤
│ ▶ Auth                                  │
│   POST /api/auth/login                  │
│                                         │
│ ▶ Alumnos                               │
│   GET  /api/alumnos                     │
│   POST /api/alumnos                     │
│   GET  /api/alumnos/{id}                │
│                                         │
│ ▶ Asistencias                           │
│   POST /api/asistencias                 │
│   GET  /api/asistencias/reporte         │
└─────────────────────────────────────────┘
\`\`\`

## Flujo de testing con Swagger UI

\`\`\`
1. POST /api/auth/login → Obtener el JWT
   Body: { "email": "profesor@escuela.mx", "password": "Test1234!", "rol": "profesor" }
   
2. Copiar el token de la respuesta
   
3. Clic en "Authorize" → pegar el token sin "Bearer "
   (Swagger UI añade "Bearer " automáticamente)
   
4. Ahora puedes llamar a los endpoints protegidos
   GET /api/alumnos → devuelve la lista de alumnos de tu escuela
\`\`\`

## Ejercicio: documentar un nuevo endpoint

Añade la documentación JSDoc a este endpoint ficticio:

\`\`\`javascript
// src/routes/alumno.routes.js

/**
 * @swagger
 * /api/alumnos/{id}/asignar-nfc:
 *   patch:
 *     summary: ???  ← escribe el summary
 *     tags: [???]   ← elige el tag
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID del alumno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [uid_nfc]
 *             properties:
 *               uid_nfc:
 *                 type: string
 *                 example: "A1B2C3D4"
 *     responses:
 *       200:
 *         description: ???  ← describe la respuesta
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/asignar-nfc', verificarToken, esProfesor, asignarNfc);
\`\`\`

<Callout variante="tip" titulo="Tip: usa los tags para agrupar endpoints">
  Los \`tags\` en cada endpoint agrupan los endpoints en la UI de Swagger.
  kidotag10 usa: \`Auth\`, \`Alumnos\`, \`Tutores\`, \`Grupos\`, \`Asistencias\`,
  \`Anuncios\`, \`Mensajes\`.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "En Swagger UI, cuando haces clic en 'Authorize' y pegas el token, ¿qué debe escribirse?",
      opciones: [
        { texto: "Bearer eyJhbGciOiJIUzI1NiJ9..." },
        { texto: "eyJhbGciOiJIUzI1NiJ9... (solo el token, sin 'Bearer')", correcta: true },
        { texto: "JWT eyJhbGciOiJIUzI1NiJ9..." },
        { texto: "El email y password del usuario" },
      ],
      explicacion: "Swagger UI con securityScheme type: 'bearer' añade automáticamente el prefijo 'Bearer ' al token. Si pegas 'Bearer token', resulta en 'Bearer Bearer token' y la autenticación falla.",
    },
  ]}
/>
`,
);

console.log("\n✅ Lecciones swagger escritas.");
