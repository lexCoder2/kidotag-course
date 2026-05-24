import fs from "fs";

const write = (path, content) => {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(path, content, "utf8");
  console.log("✅", path);
};

const base = "src/lessons";

// ── 03-passwords-seguros ──────────────────────────────────────────────────────
write(
  `${base}/auth-jwt/03-passwords-seguros.mdx`,
  `# Por qué nunca guardar passwords en texto plano

Antes de hablar de bcrypt, entendamos el **problema** que resuelve.

<Callout variante="danger" titulo="Nunca guardar passwords como texto plano">
  Si un atacante accede a tu base de datos y los passwords están en texto plano,
  todas las cuentas están comprometidas al instante.
</Callout>

## El problema: base de datos comprometida

Imagina que tu MongoDB es accedido por un atacante. Si los passwords están así:

\`\`\`json
{ "email": "ana@escuela.mx", "password": "Mariposa2024" }
{ "email": "juan@escuela.mx", "password": "Futbol123" }
\`\`\`

El atacante tiene acceso inmediato a **todas las cuentas**. Peor aún: muchos
usuarios reutilizan passwords — ahora también tiene acceso a su correo, banco, etc.

## Ataque de diccionario y rainbow tables

\`\`\`
Diccionario de passwords comunes:
  "password123" → hash → 482c811da5d5b4bc6d497ffa98491e38
  "Mariposa2024" → hash → 9f86d081884c7d659a2feaa0c55ad015
  "Futbol123"   → hash → 5f4dcc3b5aa765d61d8327deb882cf99
\`\`\`

Un **rainbow table** es exactamente eso: una tabla precalculada de millones de
passwords → sus hashes. Si alguien roba hashes simples (MD5, SHA1), puede
buscarlos en la tabla y obtener el password original.

## La solución: hashing con salt

Un **hash** es una función de una sola vía: dado el password, siempre produce
el mismo hash, pero del hash **no puedes recuperar el password**.

El **salt** es una cadena aleatoria que se mezcla con el password antes de
hashear. Hace que dos passwords idénticos produzcan hashes completamente distintos:

\`\`\`
password: "Futbol123"
salt 1:   "$2b$10$randomsalt1..." → hash: "$2b$10$randomsalt1...hashedABC"
salt 2:   "$2b$10$randomsalt2..." → hash: "$2b$10$randomsalt2...hashedXYZ"
\`\`\`

Resultado: **los rainbow tables no sirven** porque el salt es único por usuario.

<Mermaid titulo="Flujo de registro seguro vs inseguro">
{\`flowchart LR
  A[Password del usuario] --> B{¿Cómo guardarlo?}
  B -->|❌ Texto plano| C[Base de datos\\nPassword: Futbol123]
  B -->|❌ Hash simple| D[Base de datos\\nHash MD5: 5f4dcc...]
  B -->|✅ Bcrypt + salt| E[Base de datos\\nHash: $2b$10$salt...hash]
  C -->|Base de datos comprometida| F[Acceso inmediato]
  D -->|Rainbow table| F
  E -->|Computacionalmente inviable| G[Datos protegidos]\`}
</Mermaid>

## Comparativa de algoritmos de hashing

| Algoritmo | ¿Tiene salt? | Velocidad | Seguridad para passwords |
|-----------|-------------|-----------|--------------------------|
| MD5 | No | Muy rápido | ❌ Pésima |
| SHA-256 | No | Rápido | ❌ Mala |
| SHA-256 + salt | Sí (manual) | Rápido | ⚠️ Mejorada, pero muy rápido |
| bcrypt | Sí (automático) | **Lento por diseño** | ✅ Buena |
| argon2 | Sí (automático) | Lento + memoria | ✅ Excelente |

<Callout variante="tip" titulo="¿Por qué queremos que sea LENTO?">
  Un hash lento significa que un atacante solo puede probar ~100 passwords/segundo
  con bcrypt, versus ~10 mil millones/segundo con MD5. Esa diferencia hace
  que un ataque de fuerza bruta sea completamente inviable.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Qué hace el 'salt' en el proceso de hashing de passwords?",
      opciones: [
        { texto: "Encripta el password para que sea reversible" },
        { texto: "Añade datos aleatorios únicos que hacen inútiles los rainbow tables", correcta: true },
        { texto: "Comprime el password para ocupar menos espacio" },
        { texto: "Acelera el proceso de verificación" },
      ],
      explicacion: "El salt es una cadena aleatoria única por usuario. Hace que dos passwords idénticos generen hashes completamente distintos, invalidando cualquier tabla precalculada.",
    },
    {
      pregunta: "¿Por qué usar MD5 para hashear passwords es peligroso aunque el attacker no tenga el password original?",
      opciones: [
        { texto: "Porque MD5 no produce un hash real" },
        { texto: "Porque MD5 es reversible directamente" },
        { texto: "Porque MD5 es muy rápido, permitiendo probar miles de millones de combinaciones por segundo", correcta: true },
        { texto: "Porque MD5 no acepta strings largos" },
      ],
      explicacion: "MD5 puede calcular ~10 mil millones de hashes por segundo en GPUs modernas. Combinado con rainbow tables o fuerza bruta, descifrar passwords comunes es trivial.",
    },
  ]}
/>
`,
);

// ── 03-bcrypt ─────────────────────────────────────────────────────────────────
write(
  `${base}/auth-jwt/03-bcrypt.mdx`,
  `# bcrypt: salt, rounds y compare

<LibCard
  nombre="bcryptjs"
  version="2.4.3"
  npm="bcryptjs"
  categoria="auth"
  docs="https://github.com/dcodeIO/bcrypt.js"
  descripcion="Implementación JavaScript pura del algoritmo bcrypt. Hashea passwords con salt automático y un factor de costo configurable."
  porque="bcryptjs es la elección estándar porque: genera y gestiona el salt automáticamente, tiene el factor de costo configurable (cuánto tiempo tarda en hashear), y es implementación JS pura que no requiere compilación nativa."
  usoEjemplo={\`// src/models/tutor.model.js de kidotag10
tutorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Verificar al hacer login
const match = await bcrypt.compare(passwordIngresado, tutor.password);\`}
  alternativas={[
    { nombre: "bcrypt (nativo)", porque_no: "Requiere compilar código C++. bcryptjs es JS puro y funciona en cualquier plataforma sin compilación." },
    { nombre: "argon2", porque_no: "Más moderno y recomendado para nuevos proyectos, pero requiere código nativo. Para una API educativa, bcryptjs es suficiente." },
    { nombre: "crypto (Node.js)", porque_no: "SHA-256 es demasiado rápido para passwords. Requirirías PBKDF2 con muchas iteraciones manualmente." },
  ]}
/>

## El factor de costo (rounds)

bcrypt acepta un número de **rounds** (también llamado "cost factor"). Este número
determina cuántas veces se aplica el algoritmo internamente:

\`\`\`javascript
// cost = 10 → 2^10 = 1,024 iteraciones → ~100ms
// cost = 12 → 2^12 = 4,096 iteraciones → ~400ms
// cost = 14 → 2^14 = 16,384 iteraciones → ~1.6s

const hash = await bcrypt.hash('MiPassword123', 10);
\`\`\`

| Rounds | Tiempo aprox. | Cuándo usarlo |
|--------|--------------|---------------|
| 8 | ~5ms | Tests automáticos (velocidad) |
| 10 | ~100ms | **Producción recomendado** ← kidotag10 |
| 12 | ~400ms | Alta seguridad, usuarios no notan |
| 14 | ~1.6s | Muy alta seguridad (bancos) |

kidotag10 usa **10 rounds** — el balance perfecto entre seguridad y experiencia de usuario.

## bcrypt.hash() y bcrypt.compare()

\`\`\`javascript
const bcrypt = require('bcryptjs');

// ── HASH (al registrar o cambiar password) ──────────────
const hashGuardado = await bcrypt.hash('Futbol123', 10);
// Resultado: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVBhAJf"
// ^─ algoritmo, rounds, salt (22 chars) + hash (31 chars)

// ── COMPARE (al hacer login) ─────────────────────────────
const esValido = await bcrypt.compare('Futbol123', hashGuardado); // true
const esValido2 = await bcrypt.compare('OtroPass', hashGuardado); // false
\`\`\`

<Callout variante="info" titulo="El hash incluye todo">
  El string resultante de bcrypt incluye el algoritmo, los rounds y el salt
  integrado. No necesitas guardar el salt por separado — está embebido en el hash.
  Por eso basta guardar un solo campo <code>password</code> en el documento.
</Callout>

## El hook pre('save') de kidotag10

\`\`\`javascript
// src/models/tutor.model.js
const bcrypt = require('bcryptjs');

tutorSchema.pre('save', async function(next) {
  // Solo hashear si el campo password fue modificado
  // (evita re-hashear en actualizaciones de nombre, email, etc.)
  if (!this.isModified('password')) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error); // propaga el error a Mongoose
  }
});
\`\`\`

Este hook se ejecuta **automáticamente** antes de cada \`tutor.save()\`. El
controlador de registro no necesita saber nada de hashing:

\`\`\`javascript
// src/controllers/auth.controller.js — simple y limpio
const tutor = new Tutor({ nombre, email, password }); // password en plano
await tutor.save(); // ← el hook hashea automáticamente
\`\`\`

<CodePlayground
  titulo="Simulador bcrypt"
  descripcion="Experimenta con bcrypt.hash() y bcrypt.compare()"
  files={{
    "/index.js": \`// Simulación del comportamiento de bcrypt
// (bcrypt real no funciona en el navegador, esto es una demostración)

// Simulamos el hash con una representación simplificada
function simulateHash(password, rounds) {
  // En bcrypt real esto tarda ~100ms con rounds=10
  const fakeSalt = Math.random().toString(36).substring(2, 24);
  return \\\`$2b$\\\${rounds}$\\\${fakeSalt}\\\${btoa(password + fakeSalt).substring(0,31)}\\\`;
}

function simulateCompare(password, hash) {
  // En bcrypt real: re-hashea con el mismo salt y compara
  const parts = hash.split('$');
  const rounds = parseInt(parts[2]);
  const saltAndHash = parts[3];
  const salt = saltAndHash.substring(0, 22);
  const expectedHash = btoa(password + salt).substring(0, 31);
  return saltAndHash.substring(22) === expectedHash;
}

// Registrar usuario
const passwordOriginal = "Futbol123";
console.log("Password original:", passwordOriginal);

const hash = simulateHash(passwordOriginal, 10);
console.log("Hash guardado en DB:", hash);
console.log("Longitud del hash:", hash.length, "chars");

// Login correcto
const loginCorrecto = simulateCompare("Futbol123", hash);
console.log("\\nLogin con password correcto:", loginCorrecto ? "✅ OK" : "❌ FAIL");

// Login incorrecto
const loginIncorrecto = simulateCompare("OtroPassword", hash);
console.log("Login con password incorrecto:", loginIncorrecto ? "❌ VULNERABLE" : "✅ Bloqueado");

// Mismo password, diferente hash (por el salt aleatorio)
const hash2 = simulateHash(passwordOriginal, 10);
console.log("\\nDos hashes del MISMO password son iguales?", hash === hash2 ? "❌ Error" : "✅ Diferentes (salt aleatorio)");
\`,
  }}
  entryFile="/index.js"
/>

<Quiz
  preguntas={[
    {
      pregunta: "En el hook pre('save') de kidotag10, ¿por qué se verifica 'this.isModified(password)' antes de hashear?",
      opciones: [
        { texto: "Para verificar que el password no esté vacío" },
        { texto: "Para evitar re-hashear un hash ya guardado cuando se actualizan otros campos del documento", correcta: true },
        { texto: "Para comprobar si el password cumple la política de seguridad" },
        { texto: "Porque bcrypt.hash() falla con hashes bcrypt como entrada" },
      ],
      explicacion: "Sin esta verificación, al actualizar el nombre del tutor se volvería a hashear el password ya hasheado, corrompiendo la autenticación.",
    },
  ]}
/>
`,
);

// ── 03-emitir-tokens ─────────────────────────────────────────────────────────
write(
  `${base}/auth-jwt/03-emitir-tokens.mdx`,
  `# Emitir tokens: loginUnificado

kidotag10 tiene **tres tipos de usuario** (tutor, profesor, admin), pero todos
hacen login por el mismo endpoint. Analicemos cómo funciona.

## La ruta de login

\`\`\`javascript
// src/routes/auth.routes.js
const router = require('express').Router();
const { loginUnificado } = require('../controllers/auth.controller');

router.post('/login', loginUnificado);
module.exports = router;

// Montado en src/app.js:
app.use('/api/auth', authRoutes);
// → POST /api/auth/login
\`\`\`

## El controlador loginUnificado

\`\`\`javascript
// src/controllers/auth.controller.js
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const Tutor    = require('../models/tutor.model');
const Profesor = require('../models/profesor.model');

async function loginUnificado(req, res) {
  const { email, password, rol } = req.body;

  // 1. Validación básica
  if (!email || !password || !rol) {
    return res.status(400).json({ ok: false, error: 'Campos requeridos: email, password, rol' });
  }

  try {
    // 2. Buscar en la colección correcta según el rol
    let usuario;
    switch (rol) {
      case 'tutor':    usuario = await Tutor.findOne({ email });    break;
      case 'profesor': usuario = await Profesor.findOne({ email }); break;
      default:
        return res.status(400).json({ ok: false, error: 'Rol no válido' });
    }

    if (!usuario) {
      return res.status(401).json({ ok: false, error: 'Credenciales incorrectas' });
    }

    // 3. Verificar password
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ ok: false, error: 'Credenciales incorrectas' });
    }

    // 4. Emitir JWT
    const token = jwt.sign(
      { id: usuario._id, rol, escuelaId: usuario.escuela },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      ok: true,
      data: {
        token,
        usuario: {
          id:     usuario._id,
          nombre: usuario.nombre,
          email:  usuario.email,
          rol,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
}

module.exports = { loginUnificado };
\`\`\`

<Mermaid titulo="Flujo completo del login en kidotag10">
{\`sequenceDiagram
  actor C as Cliente (React)
  participant R as auth.routes.js
  participant Ctrl as auth.controller.js
  participant DB as MongoDB
  participant JWT as jsonwebtoken

  C->>R: POST /api/auth/login { email, password, rol }
  R->>Ctrl: loginUnificado(req, res)
  Ctrl->>DB: Tutor.findOne({ email })
  DB-->>Ctrl: tutor | null
  Ctrl->>Ctrl: bcrypt.compare(password, tutor.password)
  Ctrl->>JWT: jwt.sign({ id, rol, escuelaId }, secret, { expiresIn: '7d' })
  JWT-->>Ctrl: token JWT firmado
  Ctrl-->>C: { ok: true, data: { token, usuario } }\`}
</Mermaid>

## Decisiones de diseño importantes

<Callout variante="info" titulo="¿Por qué el mismo mensaje para usuario no encontrado y password incorrecto?">
  Tanto "usuario no existe" como "password incorrecto" devuelven el mismo error
  "Credenciales incorrectas". Esto previene el **user enumeration attack**: si el
  error fuera diferente, un atacante podría saber qué emails están registrados.
</Callout>

<Callout variante="tip" titulo="¿Qué datos incluir en el payload del JWT?">
  Solo datos que el servidor necesita en cada petición sin consultar la DB:
  \`id\` (para buscar el usuario completo si se necesita), \`rol\` (para
  autorización) y \`escuelaId\` (para filtrar datos por escuela). Nunca
  incluir el password ni datos sensibles.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué loginUnificado devuelve el mismo error 'Credenciales incorrectas' tanto cuando el usuario no existe como cuando el password es incorrecto?",
      opciones: [
        { texto: "Por simplicidad — es más fácil de implementar" },
        { texto: "Para prevenir user enumeration: si los errores fueran distintos, un atacante sabría qué emails están registrados", correcta: true },
        { texto: "Porque MongoDB no puede distinguir entre los dos casos" },
        { texto: "Para cumplir con el estándar JWT" },
      ],
      explicacion: "Distinguir 'usuario no existe' de 'password incorrecto' le da información a un atacante. El mensaje unificado es una práctica de seguridad estándar.",
    },
    {
      pregunta: "¿Por qué NO se incluye el password en el payload del JWT?",
      opciones: [
        { texto: "Porque jsonwebtoken no acepta strings largos en el payload" },
        { texto: "Porque el payload del JWT está firmado pero NO encriptado — cualquiera puede decodificarlo con Base64", correcta: true },
        { texto: "Porque el password ya está en la base de datos" },
        { texto: "Por razones de rendimiento" },
      ],
      explicacion: "El JWT solo está firmado (para verificar integridad), no encriptado. Cualquiera puede decodificar el payload con Base64URL. Nunca guardar datos sensibles en el payload.",
    },
  ]}
/>
`,
);

// ── 03-verificar-token ────────────────────────────────────────────────────────
write(
  `${base}/auth-jwt/03-verificar-token.mdx`,
  `# Middleware verificarToken

Después del login, el cliente guarda el JWT y lo envía en cada petición
protegida. El middleware \`verificarToken\` intercepta esas peticiones.

## El protocolo Bearer

Por convención HTTP, los JWTs viajan en el header \`Authorization\` con
el esquema **Bearer** ("portador"):

\`\`\`
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOi...
\`\`\`

## El middleware en kidotag10

\`\`\`javascript
// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  // 1. Extraer el header
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'TOKEN_REQUERIDO' });
  }

  // 2. Aislar el token (quitar "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verificar firma y expiración
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Adjuntar datos del usuario a req para los controladores
    req.usuario = decoded; // { id, rol, escuelaId, iat, exp }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ ok: false, error: 'TOKEN_EXPIRADO' });
    }
    return res.status(401).json({ ok: false, error: 'TOKEN_INVALIDO' });
  }
}

module.exports = { verificarToken };
\`\`\`

## Cómo se aplica en las rutas

\`\`\`javascript
// src/routes/alumno.routes.js
const { verificarToken } = require('../middlewares/auth.middleware');
const { listarAlumnos, crearAlumno } = require('../controllers/alumno.controller');

router.get('/',  verificarToken, listarAlumnos); // protegida
router.post('/', verificarToken, crearAlumno);   // protegida
router.get('/publico', listarPublico);            // sin protección
\`\`\`

<Mermaid titulo="Flujo de una petición protegida">
{\`sequenceDiagram
  actor C as Cliente React
  participant M as verificarToken
  participant Ctrl as alumno.controller.js

  C->>M: GET /api/alumnos\\nAuthorization: Bearer eyJ...
  alt Header ausente o malformado
    M-->>C: 401 TOKEN_REQUERIDO
  else Token expirado
    M-->>C: 401 TOKEN_EXPIRADO
  else Token inválido
    M-->>C: 401 TOKEN_INVALIDO
  else Token válido
    M->>M: req.usuario = { id, rol, escuelaId }
    M->>Ctrl: next() → listarAlumnos(req, res)
    Ctrl-->>C: 200 { ok: true, data: [...] }
  end\`}
</Mermaid>

## Acceder al usuario en el controlador

Una vez que el middleware adjunta \`req.usuario\`, los controladores pueden
usarlo sin volver a consultar la base de datos:

\`\`\`javascript
// src/controllers/alumno.controller.js
async function listarAlumnos(req, res) {
  const { escuelaId, rol } = req.usuario; // ← disponible gracias al middleware

  // Filtrar alumnos de la escuela del usuario autenticado
  const alumnos = await Alumno.find({ escuela: escuelaId });
  res.json({ ok: true, data: alumnos });
}
\`\`\`

<Callout variante="warning" titulo="jwt.verify() lanza excepciones">
  \`jwt.verify()\` no devuelve null cuando el token es inválido — **lanza una excepción**.
  Por eso el código está dentro de un bloque try/catch. Olvidarlo causa un crash del servidor.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Qué hace jwt.verify() si el token ha expirado?",
      opciones: [
        { texto: "Devuelve null" },
        { texto: "Devuelve el payload con una bandera 'expired: true'" },
        { texto: "Lanza una excepción de tipo TokenExpiredError", correcta: true },
        { texto: "Devuelve false" },
      ],
      explicacion: "jwt.verify() siempre lanza una excepción cuando el token es inválido o expirado. Por eso es imprescindible el bloque try/catch.",
    },
    {
      pregunta: "¿Por qué el middleware adjunta los datos a req.usuario en lugar de buscar el usuario en MongoDB?",
      opciones: [
        { texto: "Porque MongoDB no está disponible en el middleware" },
        { texto: "Para evitar una consulta extra a la base de datos en cada petición — los datos ya vienen en el token", correcta: true },
        { texto: "Porque el id en el token no es suficiente para buscar en MongoDB" },
        { texto: "Por razones de seguridad" },
      ],
      explicacion: "El JWT ya contiene id, rol y escuelaId. Adjuntarlos a req.usuario evita una consulta extra a MongoDB en cada petición protegida — una de las ventajas de la autenticación stateless.",
    },
  ]}
/>
`,
);

// ── 03-rbac ───────────────────────────────────────────────────────────────────
write(
  `${base}/auth-jwt/03-rbac.mdx`,
  `# Control de acceso por roles (RBAC)

Verificar que el token es válido es solo el primer paso. También necesitamos
verificar que el usuario tiene el **rol correcto** para cada operación.

## ¿Qué es RBAC?

**Role-Based Access Control** (Control de Acceso Basado en Roles) es un patrón
de autorización donde los permisos se asignan a roles, no a usuarios individuales.

kidotag10 tiene tres roles:
- **tutor** — ve y gestiona sus propios alumnos
- **profesor** — registra asistencia, ve alumnos de su grupo
- **admin** — acceso total a la escuela

## Los middlewares de rol en kidotag10

\`\`\`javascript
// src/middlewares/auth.middleware.js
function esTutor(req, res, next) {
  if (req.usuario?.rol !== 'tutor') {
    return res.status(403).json({ ok: false, error: 'ACCESO_DENEGADO' });
  }
  next();
}

function esProfesor(req, res, next) {
  if (req.usuario?.rol !== 'profesor') {
    return res.status(403).json({ ok: false, error: 'ACCESO_DENEGADO' });
  }
  next();
}

function esAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ ok: false, error: 'ACCESO_DENEGADO' });
  }
  next();
}

module.exports = { verificarToken, esTutor, esProfesor, esAdmin };
\`\`\`

## Aplicar RBAC en las rutas

\`\`\`javascript
// src/routes/alumno.routes.js
const { verificarToken, esProfesor, esTutor, esAdmin } = require('../middlewares/auth.middleware');

// Solo profesores pueden listar todos los alumnos
router.get('/', verificarToken, esProfesor, listarAlumnos);

// Solo tutores pueden actualizar datos de contacto
router.put('/:id/contacto', verificarToken, esTutor, actualizarContacto);

// Solo admins pueden eliminar
router.delete('/:id', verificarToken, esAdmin, eliminarAlumno);
\`\`\`

<Callout variante="info" titulo="El orden importa: verificarToken SIEMPRE antes que el rol">
  \`verificarToken\` adjunta \`req.usuario\`. Si el middleware de rol se ejecuta
  primero, \`req.usuario\` sería undefined y el acceso sería denegado aunque el
  token sea válido. El orden es siempre: autenticación → autorización.
</Callout>

## 401 vs 403: la diferencia

| Código | Significado | Cuándo usarlo en kidotag10 |
|--------|-------------|---------------------------|
| 401 Unauthorized | No estás autenticado | Token ausente, inválido o expirado |
| 403 Forbidden | Estás autenticado pero no tienes permiso | Rol incorrecto para esa operación |

\`\`\`
Un tutor hace GET /api/alumnos (solo para profesores):
  ✅ verificarToken pasa (token válido)
  ❌ esProfesor falla (req.usuario.rol = 'tutor')
  → 403 ACCESO_DENEGADO
\`\`\`

<CodePlayground
  titulo="Simulador RBAC"
  descripcion="Simula el sistema de roles de kidotag10"
  files={{
    "/rbac.js": \`// Simulación del sistema RBAC de kidotag10

// Middleware simulado
function verificarToken(req) {
  if (!req.token) return { error: '401 TOKEN_REQUERIDO' };
  // Simulamos que el token contiene estos datos
  const usuarios = {
    'token-tutor':    { id: '1', rol: 'tutor',    nombre: 'Ana García' },
    'token-profesor': { id: '2', rol: 'profesor',  nombre: 'Carlos López' },
    'token-admin':    { id: '3', rol: 'admin',     nombre: 'Admin Sistema' },
  };
  req.usuario = usuarios[req.token];
  if (!req.usuario) return { error: '401 TOKEN_INVALIDO' };
  return null;
}

function requireRol(rol) {
  return function(req) {
    if (req.usuario?.rol !== rol)
      return { error: \\\`403 ACCESO_DENEGADO (requiere rol: \\\${rol}, tienes: \\\${req.usuario?.rol})\\\` };
    return null;
  };
}

// Rutas simuladas
const rutas = [
  { metodo: 'GET',    ruta: '/api/alumnos',           middlewares: [verificarToken, requireRol('profesor')] },
  { metodo: 'PUT',    ruta: '/api/alumnos/:id/contacto', middlewares: [verificarToken, requireRol('tutor')]    },
  { metodo: 'DELETE', ruta: '/api/alumnos/:id',        middlewares: [verificarToken, requireRol('admin')]     },
];

// Probar diferentes tokens en cada ruta
const tokens = ['token-tutor', 'token-profesor', 'token-admin', 'token-invalido', null];
const emojis = { tutor: '👨‍👩‍👦', profesor: '👨‍🏫', admin: '🔑' };

for (const ruta of rutas) {
  console.log(\\\`\\n\\\${ruta.metodo} \\\${ruta.ruta}\\\`);
  for (const token of tokens) {
    const req = { token };
    let error = null;
    for (const middleware of ruta.middlewares) {
      error = middleware(req);
      if (error) break;
    }
    const tokenLabel = token ? (req.usuario ? \\\`\\\${emojis[req.usuario.rol]} \\\${req.usuario.nombre}\\\` : 'token inválido') : 'sin token';
    console.log(\\\`  \\\${error ? '❌' : '✅'} \\\${tokenLabel.padEnd(25)} → \\\${error ? error.error : '200 OK'}\\\`);
  }
}
\`,
  }}
  entryFile="/rbac.js"
/>

<Quiz
  preguntas={[
    {
      pregunta: "Un profesor hace una petición a una ruta protegida con verificarToken + esAdmin. ¿Qué código HTTP recibe?",
      opciones: [
        { texto: "401 — porque el token expiró" },
        { texto: "403 — porque está autenticado pero no tiene el rol admin", correcta: true },
        { texto: "404 — porque la ruta no existe para profesores" },
        { texto: "200 — si el token es válido" },
      ],
      explicacion: "401 = no autenticado, 403 = autenticado pero sin permiso. El profesor tiene token válido (pasa verificarToken) pero no tiene rol admin (falla esAdmin) → 403 Forbidden.",
    },
  ]}
/>
`,
);

// ── 03-almacenamiento-token ───────────────────────────────────────────────────
write(
  `${base}/auth-jwt/03-almacenamiento-token.mdx`,
  `# Dónde guardar el token en el cliente

Una vez que el servidor emite el JWT, el cliente React necesita guardarlo
para enviarlo en las siguientes peticiones. Hay varias opciones, cada una con
sus tradeoffs de seguridad.

## Las tres opciones principales

### 1. localStorage

\`\`\`javascript
// Guardar
localStorage.setItem('token', token);

// Leer
const token = localStorage.getItem('token');

// Eliminar (logout)
localStorage.removeItem('token');
\`\`\`

**Ventajas:** Persiste entre pestañas y cierres del navegador.  
**Desventaja crítica:** Vulnerable a **XSS** (Cross-Site Scripting). Cualquier
script en tu página puede leer localStorage.

### 2. sessionStorage

\`\`\`javascript
sessionStorage.setItem('token', token);
\`\`\`

**Ventajas:** Se borra al cerrar la pestaña.  
**Desventaja:** También vulnerable a XSS, y el usuario pierde la sesión al cerrar.

### 3. Cookie HttpOnly

\`\`\`javascript
// El servidor envía la cookie (el JS no puede leerla)
res.cookie('token', jwt, {
  httpOnly: true,  // ← JS no puede acceder (protege de XSS)
  secure: true,    // ← solo HTTPS
  sameSite: 'strict',  // ← protege de CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
\`\`\`

**Ventaja:** El JavaScript del cliente **nunca puede leer el token** — protege de XSS.  
**Desventaja:** Requiere configuración extra contra **CSRF** (Cross-Site Request Forgery).

## Comparativa de seguridad

| Opción | XSS | CSRF | Persistencia | Implementación |
|--------|-----|------|--------------|----------------|
| localStorage | ❌ Vulnerable | ✅ Seguro | ✅ Persiste | Muy simple |
| sessionStorage | ❌ Vulnerable | ✅ Seguro | ❌ No persiste | Muy simple |
| Cookie HttpOnly | ✅ Seguro | ⚠️ Requiere CSRF token | ✅ Persiste | Más compleja |

## ¿Qué hace kidotag10-web?

kidotag10 usa **localStorage** con el contexto de React. Es la opción más sencilla
para una aplicación de red escolar interna:

\`\`\`javascript
// web/src/context/AuthContext.jsx de kidotag10
const [token, setToken] = useState(() => localStorage.getItem('token'));

const login = (tokenRecibido, datosUsuario) => {
  localStorage.setItem('token', tokenRecibido);
  setToken(tokenRecibido);
  setUsuario(datosUsuario);
};

const logout = () => {
  localStorage.removeItem('token');
  setToken(null);
  setUsuario(null);
};
\`\`\`

<Callout variante="warning" titulo="Para producción con datos sensibles: Cookie HttpOnly">
  kidotag10 usa localStorage por simplicidad educativa. Para una aplicación con
  datos médicos, bancarios o muy sensibles, las cookies HttpOnly son la
  recomendación de OWASP. La elección depende del perfil de riesgo de tu aplicación.
</Callout>

## Expiración y renovación

El token de kidotag10 expira en 7 días (\`expiresIn: '7d'\`). Cuando expira,
el cliente recibe un 401 TOKEN_EXPIRADO y debe pedir nuevas credenciales:

\`\`\`javascript
// Interceptor de peticiones en kidotag10-web
async function fetchConAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? \`Bearer \${token}\` : undefined,
    },
  });

  if (res.status === 401) {
    // Token expirado o inválido → logout
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return res;
}
\`\`\`

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué una cookie HttpOnly protege mejor contra XSS que localStorage?",
      opciones: [
        { texto: "Porque las cookies se encriptan automáticamente" },
        { texto: "Porque JavaScript no puede acceder a cookies con el flag HttpOnly — incluso código malicioso inyectado no puede robar el token", correcta: true },
        { texto: "Porque las cookies tienen una vida útil más corta" },
        { texto: "Porque las cookies solo funcionan con HTTPS" },
      ],
      explicacion: "El flag HttpOnly hace que el navegador nunca exponga la cookie a document.cookie ni a ninguna API JavaScript. Un script XSS no puede robarla, aunque sí puede hacer peticiones con ella (por eso se necesita CSRF protection).",
    },
  ]}
/>
`,
);

console.log("\n✅ Todas las lecciones auth-jwt escritas.");
