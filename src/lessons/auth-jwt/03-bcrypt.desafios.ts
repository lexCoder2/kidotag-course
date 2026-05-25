import type { Desafio } from "@/types/desafios";

const desafio: Desafio = {
  id: "bcrypt-hashing",
  titulo: "Hashea passwords con bcrypt",
  intro:
    "Implementa el ciclo completo de hash y verificación de contraseñas que usa `kidotag10` en `tutor.model.js`: hashear al guardar y comparar al hacer login.",
  objetivo:
    "Entender por qué bcrypt es seguro (salt aleatorio, cost factor) y cómo usar `hash()` y `compare()` de forma asíncrona.",
  referenciaKidotag: "kidotag10/api/src/models/tutor.model.js",
  conceptosNuevos: [
    {
      termino: "bcrypt.hash(password, rounds)",
      explicacion:
        "Genera el hash del password incluyendo un salt aleatorio. `rounds` controla cuántas veces se aplica el algoritmo (10 = ~100ms). NUNCA guarda el password en texto plano.",
      ejemplo:
        'const hash = await bcrypt.hash("Futbol123", 10);\n// → "$2b$10$N9qo8uLO..." (siempre diferente)',
    },
    {
      termino: "bcrypt.compare(password, hash)",
      explicacion:
        "Extrae el salt del hash guardado, rehashea el password ingresado y compara. Retorna `true` o `false`. Nunca se puede 'desencriptar' el hash.",
      ejemplo:
        'const ok = await bcrypt.compare("Futbol123", hashGuardado); // true\nconst no = await bcrypt.compare("Futbol999", hashGuardado); // false',
    },
    {
      termino: "Salt aleatorio",
      explicacion:
        "bcrypt genera un salt diferente cada vez que hashea. Por eso dos hashes del mismo password son distintos — pero ambos pasan `compare`.",
      ejemplo:
        "// hash1 !== hash2, pero compare(password, hash1) y compare(password, hash2) son true",
    },
  ],
  pasos: [
    {
      id: "paso-1",
      titulo: "Hashea una contraseña con bcrypt.hash()",
      descripcion:
        'Llama `bcrypt.hash("Futbol123", 10)` y guarda el resultado en `hashGuardado`. Luego verifica que el resultado sea un string que empiece con `$` (el marcador del formato bcrypt).',
      pista:
        "`bcrypt.hash()` es asíncrona — usa `await`. El resultado siempre empieza con `$2b$` o `$mock$` en el simulador.",
      codigoInicial: {
        "/index.js": `const bcrypt = require("bcryptjs");

async function main() {
  const password = "Futbol123";

  // TODO 1: Hashea el password con 10 rounds y guárdalo en hashGuardado
  // const hashGuardado = await bcrypt.hash(...)

  console.log("Hash generado:", hashGuardado);
  console.log("¿Empieza con '$'?", hashGuardado.startsWith("$"));

  return { hashGuardado };
}

module.exports = { main };
`,
      },
      verificaciones: [
        {
          id: "v1-hash-generado",
          titulo: "bcrypt.hash() genera un hash que empieza con '$'",
          tipo: "js-runtime",
          entryFile: "/index.js",
          assertion: `
const { main } = exports;
const result = await main();
if (!result || typeof result.hashGuardado !== "string") {
  throw new Error("main() debe retornar { hashGuardado } como string. ¿Olvidaste el 'return'?");
}
if (!result.hashGuardado.startsWith("$")) {
  throw new Error("El hash debe empezar con '$'. ¿Llamaste bcrypt.hash() con await?");
}
if (result.hashGuardado === "Futbol123") {
  throw new Error("El hash no puede ser igual al password original. Usa bcrypt.hash().");
}
`,
        },
      ],
    },
    {
      id: "paso-2",
      titulo: "Verifica el password correcto con bcrypt.compare()",
      descripcion:
        "Usa `bcrypt.compare(password, hashGuardado)` para verificar que el password original coincide con el hash. Guarda el resultado en `esValido` y confirma que es `true`.",
      pista:
        "`bcrypt.compare()` también es asíncrona. Recibe el password en texto plano y el hash guardado — extrae el salt del hash internamente.",
      codigoInicial: {
        "/index.js": `const bcrypt = require("bcryptjs");

async function main() {
  const password = "Futbol123";
  const hashGuardado = await bcrypt.hash(password, 10);

  // TODO 2: Compara el password original con el hash
  // const esValido = await bcrypt.compare(...)

  console.log("¿Password correcto?", esValido);

  return { hashGuardado, esValido };
}

module.exports = { main };
`,
      },
      verificaciones: [
        {
          id: "v2-compare-correcto",
          titulo: "bcrypt.compare(password, hash) retorna true",
          tipo: "js-runtime",
          entryFile: "/index.js",
          assertion: `
const { main } = exports;
const result = await main();
if (result.esValido !== true) {
  throw new Error(
    "bcrypt.compare(password, hashGuardado) debe retornar true cuando el password es correcto. " +
    "¿Pasaste el password original y el hash generado?"
  );
}
`,
        },
      ],
    },
    {
      id: "paso-3",
      titulo: "Verifica password incorrecto → false",
      descripcion:
        'Llama `bcrypt.compare("passwordEquivocado", hashGuardado)` y guarda el resultado en `esInvalido`. Confirma que es `false`. Así implementas el rechazo de login incorrecto.',
      pista:
        "El mismo hash generado del paso anterior. Solo cambia el primer argumento de `compare` a un password diferente.",
      codigoInicial: {
        "/index.js": `const bcrypt = require("bcryptjs");

async function main() {
  const password = "Futbol123";
  const hashGuardado = await bcrypt.hash(password, 10);

  const esValido = await bcrypt.compare(password, hashGuardado); // true

  // TODO 3: Compara un password incorrecto con el mismo hash
  // const esInvalido = await bcrypt.compare("passwordEquivocado", hashGuardado)

  console.log("¿Password correcto?", esValido);    // true
  console.log("¿Password incorrecto?", esInvalido); // false

  return { esValido, esInvalido };
}

module.exports = { main };
`,
      },
      verificaciones: [
        {
          id: "v3-compare-incorrecto",
          titulo: "bcrypt.compare() retorna false para password incorrecto",
          tipo: "js-runtime",
          entryFile: "/index.js",
          assertion: `
const { main } = exports;
const result = await main();
if (result.esInvalido !== false) {
  throw new Error(
    "bcrypt.compare('passwordEquivocado', hash) debe retornar false. " +
    "¿Usaste un password diferente al original?"
  );
}
if (result.esValido !== true) {
  throw new Error("El compare del password correcto debe seguir siendo true.");
}
`,
        },
      ],
    },
    {
      id: "paso-4",
      titulo: "Salt aleatorio — dos hashes del mismo password son distintos",
      descripcion:
        "Hashea el mismo password dos veces (`hash1` y `hash2`). Verifica que los dos hashes son **distintos** (por el salt aleatorio), pero que **ambos** pasan `bcrypt.compare(password, hash)`.",
      pista:
        "bcrypt genera un salt aleatorio en cada llamada. Por eso los hashes son diferentes — pero ambos son válidos para ese password.",
      codigoInicial: {
        "/index.js": `const bcrypt = require("bcryptjs");

async function main() {
  const password = "Futbol123";

  // TODO 4: Hashea el mismo password DOS veces
  // const hash1 = await bcrypt.hash(password, 10)
  // const hash2 = await bcrypt.hash(password, 10)

  console.log("Hash 1:", hash1);
  console.log("Hash 2:", hash2);
  console.log("¿Son distintos?", hash1 !== hash2);

  const ok1 = await bcrypt.compare(password, hash1);
  const ok2 = await bcrypt.compare(password, hash2);
  console.log("¿Ambos válidos?", ok1, ok2);

  return { hash1, hash2, ok1, ok2 };
}

module.exports = { main };
`,
      },
      verificaciones: [
        {
          id: "v4-salt-aleatorio",
          titulo: "Dos hashes del mismo password son distintos",
          tipo: "js-runtime",
          entryFile: "/index.js",
          assertion: `
const { main } = exports;
const result = await main();
if (result.hash1 === result.hash2) {
  throw new Error(
    "hash1 y hash2 deben ser distintos (salt aleatorio). " +
    "¿Llamaste bcrypt.hash() dos veces con await?"
  );
}
if (!result.ok1 || !result.ok2) {
  throw new Error(
    "Ambos hashes deben pasar bcrypt.compare(password, hash). " +
    "¿El password que comparaste es el mismo con el que hasheaste?"
  );
}
`,
        },
      ],
    },
  ],
  retoFinal:
    "Implementa la función `login(passwordIngresado, hashEnBD)` que use `bcrypt.compare()` para verificar y retorne `{ ok: true, mensaje: 'Bienvenido' }` o `{ ok: false, mensaje: 'Credenciales incorrectas' }`. Prueba con un password correcto e incorrecto.",
};

export default desafio;
