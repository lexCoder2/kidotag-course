import fs from "fs";

const write = (path, content) => {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(path, content, "utf8");
  console.log("✅", path);
};

const base = "src/lessons";

// ── 02-conectar-mongoose ──────────────────────────────────────────────────────
write(
  `${base}/mongodb-mongoose/02-conectar-mongoose.mdx`,
  `# Conectar Mongoose a MongoDB

El primer paso para usar MongoDB en kidotag10 es establecer la conexión.
Analicemos el archivo \`src/config/database.js\`.

## El archivo database.js de kidotag10

\`\`\`javascript
// src/config/database.js
const mongoose = require('mongoose');

async function conectarDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Opciones recomendadas (Mongoose 7+)
      // No son necesarias en Mongoose 8+, que las incluye por defecto
    });
    console.log('✅ Conectado a MongoDB:', mongoose.connection.host);
  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error.message);
    process.exit(1); // detener el servidor si no hay BD
  }
}

async function cerrarDB() {
  await mongoose.connection.close();
  console.log('Conexión a MongoDB cerrada');
}

module.exports = { conectarDB, cerrarDB };
\`\`\`

## Uso en src/index.js

\`\`\`javascript
// src/index.js
require('dotenv').config();
const { conectarDB } = require('./config/database');
const app = require('./app');

const PORT = process.env.PORT || 4000;

async function iniciar() {
  await conectarDB();         // 1. primero la base de datos
  app.listen(PORT, () => {    // 2. luego el servidor HTTP
    console.log(\`🚀 API en http://localhost:\${PORT}\`);
    console.log(\`📖 Swagger en http://localhost:\${PORT}/api-docs\`);
  });
}

iniciar();
\`\`\`

<Callout variante="warning" titulo="¿Por qué process.exit(1) si falla la conexión?">
  Si MongoDB no está disponible, la API no puede funcionar — todas las operaciones
  fallarían. Es mejor detener el servidor inmediatamente (exit code 1 = error) que
  arrancar en un estado roto que causa errores difíciles de depurar.
</Callout>

## La URI de conexión

\`\`\`bash
# MongoDB local
MONGODB_URI=mongodb://localhost:27017/kidotag

# MongoDB Atlas (nube)
MONGODB_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/kidotag

# Con autenticación local
MONGODB_URI=mongodb://admin:secreto@localhost:27017/kidotag?authSource=admin
\`\`\`

## Estados de conexión

Mongoose expone el estado actual de la conexión:

\`\`\`javascript
mongoose.connection.readyState
// 0 = desconectado
// 1 = conectado  ← estado normal en producción
// 2 = conectando
// 3 = desconectando
\`\`\`

<Mermaid titulo="Ciclo de vida de la conexión">
{\`stateDiagram-v2
  [*] --> Desconectado
  Desconectado --> Conectando: mongoose.connect()
  Conectando --> Conectado: conexión exitosa
  Conectando --> Desconectado: error / timeout
  Conectado --> Desconectando: mongoose.disconnect()
  Desconectando --> Desconectado: cerrado
  Conectado --> Desconectado: error de red\`}
</Mermaid>

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué kidotag10 llama a conectarDB() ANTES de app.listen() en index.js?",
      opciones: [
        { texto: "Por convención de estilo de código" },
        { texto: "Para asegurarse de que hay conexión a BD antes de aceptar peticiones que la necesitarán", correcta: true },
        { texto: "Porque mongoose.connect() bloquea el event loop" },
        { texto: "Para que MongoDB reserve el puerto antes que Express" },
      ],
      explicacion: "Si el servidor aceptara peticiones antes de tener conexión a BD, todas las operaciones de base de datos fallarían. Conectar primero garantiza que el servidor solo arranca cuando está listo para operar.",
    },
  ]}
/>
`,
);

// ── 02-referencias-embebidos ──────────────────────────────────────────────────
write(
  `${base}/mongodb-mongoose/02-referencias-embebidos.mdx`,
  `# Referencias vs documentos embebidos

Al modelar datos en MongoDB, la decisión más importante es cómo representar
las relaciones: ¿referencias (como las foreign keys de SQL) o embebidos?

## Documentos embebidos (subdocumentos)

Los datos relacionados se guardan **dentro** del documento principal:

\`\`\`json
// Alumno con contacto de emergencia EMBEBIDO
{
  "_id": "64ab12...",
  "nombre": "Ana García",
  "uid_nfc": "A1B2C3",
  "contactoEmergencia": {
    "nombre": "María García",
    "telefono": "555-1234",
    "parentesco": "madre"
  }
}
\`\`\`

**Cuándo usar embed:** datos que siempre se usan juntos, relación uno-a-uno,
los subdatos no tienen identidad propia (un contacto de emergencia no existe
sin el alumno).

## Referencias (como foreign keys)

Los documentos se guardan separados y se **referencian por ObjectId**:

\`\`\`json
// Alumno con referencia a Tutor
{
  "_id": "64ab12...",
  "nombre": "Ana García",
  "tutor": "507f19..."  // ← ObjectId del tutor
}

// Documento Tutor separado
{
  "_id": "507f19...",
  "nombre": "Carlos García",
  "email": "carlos@email.com",
  "alumnos": ["64ab12...", "64ab13..."]
}
\`\`\`

**Cuándo usar ref:** entidades independientes, relación uno-a-muchos o
muchos-a-muchos, los datos se consultan por separado frecuentemente.

## kidotag10 usa ambos

\`\`\`javascript
// src/models/alumno.model.js — mix de ambos enfoques
const alumnoSchema = new Schema({
  nombre: String,
  uid_nfc: String,

  // Referencia → Tutor es una entidad independiente con login propio
  tutor: { type: Schema.Types.ObjectId, ref: 'Tutor' },
  grupo: { type: Schema.Types.ObjectId, ref: 'Grupo' },

  // Embebido → el contacto de emergencia no existe sin el alumno
  contactoEmergencia: {
    nombre:     String,
    telefono:   String,
    parentesco: String,
  },
});
\`\`\`

## Comparativa

| Criterio | Embebido | Referencia |
|----------|----------|------------|
| Lectura (siempre juntos) | ✅ Una query | ❌ Dos queries (o populate) |
| Actualizar subdato | ✅ Simple | ✅ Simple |
| Entidad independiente | ❌ No aplica | ✅ Tiene su propio _id |
| Relación N:M | ❌ Duplicación | ✅ Adecuado |
| Tamaño de documento | ⚠️ Crece | ✅ Controlado |

<Mermaid titulo="Modelo de datos de kidotag10">
{\`erDiagram
  ESCUELA ||--o{ GRUPO : tiene
  GRUPO ||--o{ ALUMNO : contiene
  TUTOR ||--o{ ALUMNO : es-tutor-de
  ALUMNO {
    ObjectId _id
    string nombre
    string uid_nfc
    ObjectId tutor
    ObjectId grupo
    object contactoEmergencia
  }
  TUTOR {
    ObjectId _id
    string nombre
    string email
    string password_hash
  }
  GRUPO {
    ObjectId _id
    string nombre
    string grado
    ObjectId escuela
  }\`}
</Mermaid>

<Quiz
  preguntas={[
    {
      pregunta: "En kidotag10, el contactoEmergencia del alumno se guarda como documento embebido. ¿Cuál sería una razón para cambiar esto a una referencia?",
      opciones: [
        { texto: "Si el contacto de emergencia pudiera ser tutor de múltiples alumnos y tuviera su propio login", correcta: true },
        { texto: "Para que la consulta de alumnos sea más rápida" },
        { texto: "Porque MongoDB no permite strings en subdocumentos" },
        { texto: "Para reducir el tamaño del documento" },
      ],
      explicacion: "Si el contacto de emergencia tuviera identidad propia (login, gestión separada, o relacionado con múltiples documentos), pasaría a ser una colección separada con referencia.",
    },
  ]}
/>
`,
);

// ── 02-hooks-pre-save ─────────────────────────────────────────────────────────
write(
  `${base}/mongodb-mongoose/02-hooks-pre-save.mdx`,
  `# Hooks pre("save"): hashear passwords

Mongoose ofrece un sistema de **middleware** (hooks) que ejecutan funciones
automáticamente antes o después de operaciones como save, validate, deleteOne, etc.

## ¿Qué es un hook pre('save')?

\`\`\`javascript
schema.pre('save', async function(next) {
  // Se ejecuta ANTES de guardar el documento en MongoDB
  // 'this' apunta al documento que se está guardando
  // next() continúa con el guardado
  // next(error) cancela el guardado con ese error
});
\`\`\`

## El hook de kidotag10

\`\`\`javascript
// src/models/tutor.model.js
const bcrypt = require('bcryptjs');

const tutorSchema = new mongoose.Schema({
  nombre:   { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hook pre-save: hashear el password antes de guardar
tutorSchema.pre('save', async function(next) {
  // ← 'this' = instancia de Tutor (el documento)
  // Solo hashear si el campo fue modificado
  if (!this.isModified('password')) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err); // propaga el error → Mongoose cancela el save
  }
});
\`\`\`

## isModified(): la clave de la idempotencia

Sin \`isModified()\`, actualizar el nombre del tutor volvería a hashear un
hash ya existente — rompiendo la autenticación:

\`\`\`javascript
// Sin isModified:
const tutor = await Tutor.findById(id);
tutor.nombre = 'Nuevo nombre';  // ← solo cambia el nombre
await tutor.save();
// ❌ El hook volvería a hashear el hash del password → ROTO

// Con isModified:
// isModified('password') = false → el hook no hace nada ✅
\`\`\`

## Otros hooks útiles de Mongoose

\`\`\`javascript
// Post-save: ejecuta DESPUÉS de guardar
schema.post('save', function(doc) {
  console.log('Documento guardado:', doc._id);
});

// Pre-deleteOne: ejecuta antes de eliminar
schema.pre('deleteOne', { document: true }, async function(next) {
  // Limpiar registros relacionados antes de borrar el tutor
  await Alumno.updateMany({ tutor: this._id }, { $unset: { tutor: 1 } });
  next();
});

// Pre-validate: ejecuta antes de validar
schema.pre('validate', function(next) {
  this.email = this.email?.toLowerCase().trim();
  next();
});
\`\`\`

<Callout variante="warning" titulo="findByIdAndUpdate NO dispara pre('save')">
  Los hooks de \`save\` solo se ejecutan con \`doc.save()\`. Si usas
  \`Tutor.findByIdAndUpdate(id, { password: nuevoHash })\`, el hook NO se ejecuta —
  debes hashear manualmente antes de llamar a update.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué el hook pre('save') de kidotag10 verifica this.isModified('password') antes de hashear?",
      opciones: [
        { texto: "Para verificar que el password cumple los requisitos mínimos de seguridad" },
        { texto: "Para evitar hashear un password que ya fue hasheado en un save anterior — lo que rompería la autenticación", correcta: true },
        { texto: "Porque bcrypt.hash() falla si el string ya es un hash bcrypt" },
        { texto: "Por razones de rendimiento" },
      ],
      explicacion: "Si el hook no verificara isModified, actualizar cualquier otro campo del documento volvería a hashear el hash ya guardado, produciendo un hash de hash que nunca coincidiría con el password original.",
    },
  ]}
/>
`,
);

// ── 02-populate ───────────────────────────────────────────────────────────────
write(
  `${base}/mongodb-mongoose/02-populate.mdx`,
  `# populate(): joins entre colecciones

MongoDB no tiene JOINs como SQL, pero Mongoose ofrece \`.populate()\` para
hacer esas consultas de dos pasos automáticamente.

## ¿Cómo funciona?

\`\`\`javascript
// Sin populate — solo tienes el ObjectId
const alumno = await Alumno.findById(id);
// alumno.tutor = ObjectId("507f19...")  ← solo el ID

// Con populate — Mongoose hace una segunda consulta automáticamente
const alumno = await Alumno.findById(id).populate('tutor');
// alumno.tutor = { _id: "507f19...", nombre: "Carlos García", email: "..." }
\`\`\`

## Populate en kidotag10

\`\`\`javascript
// src/controllers/alumno.controller.js
async function obtenerAlumno(req, res) {
  const alumno = await Alumno
    .findById(req.params.id)
    .populate('tutor', 'nombre email telefono')  // solo esos campos
    .populate('grupo', 'nombre grado');           // populate múltiple

  if (!alumno) {
    return res.status(404).json({ ok: false, error: 'Alumno no encontrado' });
  }

  res.json({ ok: true, data: alumno });
}
\`\`\`

## Selección de campos en populate

\`\`\`javascript
// Todos los campos del tutor
.populate('tutor')

// Solo nombre y email (sin password)
.populate('tutor', 'nombre email')

// Excluir el password (-)
.populate('tutor', '-password')

// Populate con condición
.populate({
  path: 'tutor',
  select: 'nombre email',
  match: { activo: true },
})
\`\`\`

<Callout variante="warning" titulo="Nunca hagas populate del password">
  Cuando populas un usuario, siempre excluye el campo password:
  \`.populate('tutor', '-password')\`. Aunque el hash no sea el texto plano,
  nunca debe exponerse en respuestas de la API.
</Callout>

## populate vs aggregation

\`\`\`javascript
// populate: simple, legible, dos queries
const alumnos = await Alumno.find({ grupo: grupoId }).populate('tutor', 'nombre');

// $lookup (aggregation): una sola query, más potente
const alumnos = await Alumno.aggregate([
  { $match: { grupo: grupoId } },
  { $lookup: {
    from: 'tutors',
    localField: 'tutor',
    foreignField: '_id',
    as: 'tutor',
  }},
  { $unwind: '$tutor' },
]);
\`\`\`

Para la mayoría de casos en kidotag10, populate es suficiente y más legible.
Aggregation brilla en reportes complejos o cuando el rendimiento es crítico.

<Quiz
  preguntas={[
    {
      pregunta: "¿Qué hace Mongoose internamente cuando ejecutas .populate('tutor')?",
      opciones: [
        { texto: "Hace un JOIN directo en MongoDB" },
        { texto: "Ejecuta una segunda query a la colección tutors usando los ObjectIds encontrados", correcta: true },
        { texto: "Duplica los datos del tutor dentro del documento del alumno" },
        { texto: "Crea un índice temporal para la consulta" },
      ],
      explicacion: "populate hace dos queries: primero busca los alumnos, luego hace una segunda query a la colección de tutores usando los ObjectIds. Por eso se llama 'manual reference resolution'.",
    },
  ]}
/>
`,
);

// ── 02-indices-rendimiento ────────────────────────────────────────────────────
write(
  `${base}/mongodb-mongoose/02-indices-rendimiento.mdx`,
  `# Índices y rendimiento

Un **índice** en MongoDB es como el índice de un libro: en lugar de leer
todas las páginas para encontrar un tema, vas directo a la página correcta.

## Sin índice vs con índice

\`\`\`javascript
// Sin índice: MongoDB lee TODOS los documentos (collection scan)
// Con 100,000 alumnos → lee 100,000 documentos
await Alumno.findOne({ uid_nfc: 'A1B2C3' });  // lento

// Con índice en uid_nfc → va directamente al documento correcto
// Cualquier número de documentos → mismo tiempo (O(log n))
await Alumno.findOne({ uid_nfc: 'A1B2C3' });  // rápido
\`\`\`

## Índices en los modelos de kidotag10

\`\`\`javascript
// src/models/alumno.model.js
const alumnoSchema = new Schema({
  nombre:  String,
  uid_nfc: { type: String, unique: true, sparse: true },
  //                       ↑ crea índice único  ↑ permite null sin conflicto
  escuela: { type: Schema.Types.ObjectId, ref: 'Escuela', index: true },
  //                                                              ↑ índice simple
});

// src/models/anuncio.model.js — índice compuesto
anuncioSchema.index({ escuela: 1, creadoEn: -1 });
// ↑ consultas por escuela ordenadas por fecha reciente son muy rápidas
\`\`\`

## Tipos de índices

\`\`\`javascript
// Simple — búsqueda por un campo
{ email: 1 }    // 1 = ascendente, -1 = descendente

// Único — no permite duplicados
{ uid_nfc: 1 }, { unique: true }

// Compuesto — búsquedas que filtran por múltiples campos
{ escuela: 1, fecha: -1 }

// Sparse — solo indexa documentos donde el campo existe (permite null)
{ uid_nfc: 1 }, { unique: true, sparse: true }

// TTL — elimina documentos automáticamente después de X segundos
{ creadoEn: 1 }, { expireAfterSeconds: 86400 }  // 24 horas
\`\`\`

## ¿Cuándo añadir un índice?

<Callout variante="tip" titulo="Regla práctica para índices">
  Crea un índice si: (1) consultas frecuentes filtran por ese campo, (2) el campo
  tiene alta cardinalidad (muchos valores distintos), (3) la colección tiene más
  de ~1,000 documentos. Los índices aceleran lecturas pero ralentizan escrituras —
  no indexar todo.
</Callout>

| Campo | ¿Índice? | Razón |
|-------|----------|-------|
| uid_nfc | ✅ Único | Búsquedas frecuentes al pasar la tarjeta NFC |
| email | ✅ Único | Búsqueda en cada login |
| escuela | ✅ Simple | Filtrar toda la data por escuela |
| nombre | ⚠️ Solo si hay búsqueda de texto | Alta cardinalidad pero rara vez se busca |
| activo (boolean) | ❌ No | Baja cardinalidad (solo true/false) |

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué uid_nfc tiene el flag sparse: true además de unique: true en kidotag10?",
      opciones: [
        { texto: "Para que el índice ocupe menos espacio en disco" },
        { texto: "Porque algunos alumnos no tienen tarjeta NFC asignada (uid_nfc = null), y unique sin sparse rechazaría más de un null", correcta: true },
        { texto: "Para mejorar el rendimiento de las escrituras" },
        { texto: "Es obligatorio cuando se usa unique con ObjectId" },
      ],
      explicacion: "Con unique normal, MongoDB solo permite un documento con uid_nfc = null. sparse hace que solo se indexen los documentos donde el campo existe — múltiples alumnos sin tarjeta (null) son permitidos.",
    },
  ]}
/>
`,
);

// ── 02-operadores-avanzados ───────────────────────────────────────────────────
write(
  `${base}/mongodb-mongoose/02-operadores-avanzados.mdx`,
  `# Operadores y consultas avanzadas

kidotag10 usa varios operadores de MongoDB más allá del simple \`findOne\`.
Veremos los más importantes con ejemplos reales del proyecto.

## $addToSet y $pull — arrays sin duplicados

\`\`\`javascript
// Añadir alumno al grupo sin duplicar
await Grupo.findByIdAndUpdate(
  grupoId,
  { $addToSet: { alumnos: alumnoId } },  // ← solo añade si no existe
  { new: true }
);

// Remover alumno del grupo
await Grupo.findByIdAndUpdate(
  grupoId,
  { $pull: { alumnos: alumnoId } }  // ← elimina el valor del array
);

// vs $push que sí permite duplicados:
{ $push: { alumnos: alumnoId } }  // ← puede crear duplicados ⚠️
\`\`\`

## $in — buscar en una lista de valores

\`\`\`javascript
// Obtener todos los alumnos de múltiples grupos
const grupos = ['64ab1...', '64ab2...', '64ab3...'];
const alumnos = await Alumno.find({
  grupo: { $in: grupos }
});

// También con strings:
await Alumno.find({
  grado: { $in: ['1ro', '2do', '3ro'] }
});
\`\`\`

## Rangos de fecha — consultas de asistencia

\`\`\`javascript
// Asistencias del día de hoy
const hoy = new Date();
const inicio = new Date(hoy.setHours(0, 0, 0, 0));
const fin    = new Date(hoy.setHours(23, 59, 59, 999));

const asistencias = await Asistencia.find({
  escuela: escuelaId,
  fecha: { $gte: inicio, $lte: fin }
});

// Asistencias del mes actual
const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
const finMes    = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
const del_mes   = await Asistencia.find({
  fecha: { $gte: inicioMes, $lte: finMes }
});
\`\`\`

## .lean() — objetos JavaScript simples

\`\`\`javascript
// Sin .lean(): Mongoose Documents (con métodos .save(), .populate(), etc.)
const alumnos = await Alumno.find();
// alumnos[0] es un Mongoose Document — tiene overhead de memoria

// Con .lean(): Plain Old JavaScript Objects
const alumnos = await Alumno.find().lean();
// alumnos[0] es { _id: ..., nombre: ..., uid_nfc: ... }
// Sin métodos de Mongoose — más rápido y menor uso de memoria
\`\`\`

<Callout variante="tip" titulo="Usa .lean() para lectura pura">
  Si solo necesitas leer datos para enviar en una respuesta JSON (no modificar
  ni guardar), \`.lean()\` es hasta 3x más rápido porque no crea instancias de
  Mongoose Document.
</Callout>

## Promise.all() — queries en paralelo

\`\`\`javascript
// ❌ Secuencial — cada query espera a la anterior (lento)
const alumnos   = await Alumno.find({ escuela: id });
const profesores = await Profesor.find({ escuela: id });
const grupos     = await Grupo.find({ escuela: id });

// ✅ Paralelo — las tres queries corren al mismo tiempo (3x más rápido)
const [alumnos, profesores, grupos] = await Promise.all([
  Alumno.find({ escuela: id }).lean(),
  Profesor.find({ escuela: id }).lean(),
  Grupo.find({ escuela: id }).lean(),
]);
\`\`\`

<CodePlayground
  titulo="Operadores MongoDB simulados"
  descripcion="Prueba los operadores de array con datos de kidotag10"
  files={{
    "/index.js": \`// Simulación de operadores MongoDB con arrays JavaScript

// Estado inicial: grupos con listas de alumnos
let grupos = [
  { id: 'g1', nombre: '1ro A', alumnos: ['a1', 'a2', 'a3'] },
  { id: 'g2', nombre: '2do B', alumnos: ['a4', 'a5'] },
];

// $addToSet — agrega sin duplicar
function addToSet(grupo, alumnoId) {
  if (!grupo.alumnos.includes(alumnoId)) {
    grupo.alumnos.push(alumnoId);
  }
  return grupo;
}

// $pull — elimina del array
function pull(grupo, alumnoId) {
  grupo.alumnos = grupo.alumnos.filter(a => a !== alumnoId);
  return grupo;
}

// $in — filtrar
function findIn(grupos, ids) {
  return grupos.filter(g => ids.includes(g.id));
}

console.log('Estado inicial:', JSON.stringify(grupos, null, 2));

// Prueba addToSet
addToSet(grupos[0], 'a4'); // nuevo
addToSet(grupos[0], 'a1'); // duplicado — no debe añadir
console.log('Después de addToSet:', grupos[0].alumnos);

// Prueba pull
pull(grupos[0], 'a2');
console.log('Después de pull:', grupos[0].alumnos);

// Prueba $in
const resultado = findIn(grupos, ['g1']);
console.log('Grupos encontrados con $in:', resultado.map(g => g.nombre));
\`,
  }}
  entryFile="/index.js"
/>

<Quiz
  preguntas={[
    {
      pregunta: "¿Cuál es la diferencia entre $push y $addToSet en MongoDB?",
      opciones: [
        { texto: "$push es más lento que $addToSet" },
        { texto: "$addToSet solo añade el elemento si no existe ya en el array, previniendo duplicados", correcta: true },
        { texto: "$push crea un nuevo array, $addToSet añade al existente" },
        { texto: "No hay diferencia práctica" },
      ],
      explicacion: "$push siempre añade el elemento (puede duplicar), mientras que $addToSet verifica si ya existe antes de añadir — como un Set matemático.",
    },
  ]}
/>
`,
);

console.log("\n✅ Lecciones mongodb-mongoose adicionales escritas.");
