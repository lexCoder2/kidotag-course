import type { Desafio } from "@/types/desafios";

const desafio: Desafio = {
  id: "anatomia-jwt",
  titulo: "Decodifica y explora un JWT",
  intro:
    "Usa `jsonwebtoken` para firmar tokens y explorar sus tres partes: **header**, **payload** y **signature**. Exactamente como hace `kidotag10` en `auth.controller.js`.",
  objetivo:
    "Entender la estructura de un JWT, qué datos van en el payload y por qué el payload NO es secreto (solo firmado).",
  referenciaKidotag: "kidotag10/api/src/controllers/auth.controller.js",
  conceptosNuevos: [
    {
      termino: "jwt.sign(payload, secret, options)",
      explicacion:
        "Crea un token firmado. El payload es cualquier objeto JavaScript. El secret es la clave con la que se firma (y verifica). Retorna un string con formato header.payload.signature.",
      ejemplo:
        'const token = jwt.sign({ id: "u1", rol: "profesor" }, "mi_secreto", { expiresIn: "7d" });',
    },
    {
      termino: "jwt.verify(token, secret)",
      explicacion:
        "Verifica la firma del token. Si es válido, retorna el payload. Si el secret es incorrecto o el token expiró, lanza un error.",
      ejemplo:
        'const payload = jwt.verify(token, "mi_secreto");\n// → { id: "u1", rol: "profesor", iat: ..., exp: ... }',
    },
    {
      termino: "Payload NO encriptado",
      explicacion:
        "La segunda parte del JWT (payload) es solo Base64URL. Cualquiera puede decodificarla sin el secret. Nunca guardes passwords u otros datos sensibles en el payload.",
      ejemplo:
        'atob(token.split(".")[1]) // → { id: "u1", rol: "profesor", iat: ... }',
    },
  ],
  pasos: [
    {
      id: "paso-1",
      titulo: "Firma un token con jwt.sign()",
      descripcion:
        'Usa `jwt.sign()` para crear un token con payload `{ id: "u001", rol: "profesor" }` y el secret `"secreto_kidotag"`. Guarda el resultado en `token` y confirma que tiene 3 partes separadas por `.`.',
      pista:
        "El tercer argumento es opcional (opciones como `expiresIn`). El token retornado es un string con formato `xxxxx.yyyyy.zzzzz`.",
      codigoInicial: {
        "/index.js": `const jwt = require("jsonwebtoken");

const SECRET = "secreto_kidotag";

// TODO 1: Firma un token con payload { id: "u001", rol: "profesor" }
// const token = jwt.sign(...)

console.log("Token:", token);
console.log("Partes:", token.split(".").length);

module.exports = { token };
`,
      },
      verificaciones: [
        {
          id: "v1-token-tres-partes",
          titulo: "Token tiene 3 partes separadas por '.'",
          tipo: "js-runtime",
          entryFile: "/index.js",
          assertion: `
const { token } = exports;
if (!token || typeof token !== "string") {
  throw new Error("Debes exportar 'token'. ¿Olvidaste asignarlo con jwt.sign()?");
}
const partes = token.split(".");
if (partes.length !== 3) {
  throw new Error("Un JWT debe tener exactamente 3 partes separadas por '.'. Tu token tiene " + partes.length);
}
`,
        },
      ],
    },
    {
      id: "paso-2",
      titulo: "Decodifica el payload con atob()",
      descripcion:
        "Sin usar `jwt.verify()`, decodifica **solo el payload** (segunda parte) con `atob()`. Guarda el resultado parseado en `payloadDecodificado`. Esto demuestra que el payload es solo Base64 — cualquiera puede leerlo.",
      pista:
        'Extrae la segunda parte con `token.split(".")[1]`. Luego `atob(partes[1])` te da el JSON en texto. Finalmente `JSON.parse(...)` convierte el texto a objeto.',
      codigoInicial: {
        "/index.js": `const jwt = require("jsonwebtoken");

const SECRET = "secreto_kidotag";
const token = jwt.sign({ id: "u001", rol: "profesor" }, SECRET, { expiresIn: "7d" });

// TODO 2: Decodifica el payload (segunda parte) sin usar jwt.verify
// 1. Obtén la segunda parte: token.split(".")[1]
// 2. Decodifica con atob(...)
// 3. Parsea con JSON.parse(...)
// const payloadDecodificado = JSON.parse(atob(token.split(".")[1]))

console.log("Payload decodificado:", payloadDecodificado);

module.exports = { token, payloadDecodificado };
`,
      },
      verificaciones: [
        {
          id: "v2-payload-decodificado",
          titulo: "Payload decodificado contiene id y rol",
          tipo: "js-runtime",
          entryFile: "/index.js",
          assertion: `
const { payloadDecodificado } = exports;
if (!payloadDecodificado || typeof payloadDecodificado !== "object") {
  throw new Error("payloadDecodificado debe ser un objeto. ¿Usaste JSON.parse(atob(...))?");
}
if (!payloadDecodificado.id) {
  throw new Error("El payload debe contener el campo 'id'. ¿Firmaste con { id: 'u001', rol: 'profesor' }?");
}
if (!payloadDecodificado.rol) {
  throw new Error("El payload debe contener el campo 'rol'.");
}
`,
        },
      ],
    },
    {
      id: "paso-3",
      titulo: "Verifica el token con jwt.verify()",
      descripcion:
        "Usa `jwt.verify(token, SECRET)` para verificar el token con el secreto correcto. Guarda el resultado en `payloadVerificado`. Confirma que tiene los mismos datos del payload original.",
      pista:
        "`jwt.verify()` retorna el payload si la firma es válida. A diferencia de `atob`, también verifica que nadie modificó el token.",
      codigoInicial: {
        "/index.js": `const jwt = require("jsonwebtoken");

const SECRET = "secreto_kidotag";
const token = jwt.sign({ id: "u001", rol: "profesor" }, SECRET, { expiresIn: "7d" });

// TODO 3: Verifica el token con jwt.verify()
// const payloadVerificado = jwt.verify(token, SECRET)

console.log("Payload verificado:", payloadVerificado);
console.log("¿ID correcto?", payloadVerificado.id === "u001");

module.exports = { token, payloadVerificado };
`,
      },
      verificaciones: [
        {
          id: "v3-verify-correcto",
          titulo: "jwt.verify() retorna payload con id y rol",
          tipo: "js-runtime",
          entryFile: "/index.js",
          assertion: `
const { payloadVerificado } = exports;
if (!payloadVerificado || typeof payloadVerificado !== "object") {
  throw new Error("payloadVerificado debe ser un objeto. ¿Usaste jwt.verify(token, SECRET)?");
}
if (payloadVerificado.id !== "u001") {
  throw new Error("El id en el payload debe ser 'u001'. ¿Firmaste con el payload correcto?");
}
if (payloadVerificado.rol !== "profesor") {
  throw new Error("El rol en el payload debe ser 'profesor'.");
}
`,
        },
      ],
    },
    {
      id: "paso-4",
      titulo: "Verificar con secreto incorrecto → lanza error",
      descripcion:
        'Intenta verificar el token con un secreto diferente (`"secreto_falso"`). Captura el error con `try/catch` y guarda el mensaje en `errorMensaje`. Esto confirma que la firma del token es infalsificable.',
      pista:
        'Usa un `try { jwt.verify(token, "secreto_falso") } catch(err) { errorMensaje = err.message }`. Si no lanza, significa que el secreto no fue validado correctamente.',
      codigoInicial: {
        "/index.js": `const jwt = require("jsonwebtoken");

const SECRET = "secreto_kidotag";
const token = jwt.sign({ id: "u001", rol: "profesor" }, SECRET);

let errorMensaje = null;

// TODO 4: Intenta verificar con secreto incorrecto y captura el error
// try {
//   jwt.verify(token, "secreto_falso")
// } catch (err) {
//   errorMensaje = err.message
// }

console.log("Error capturado:", errorMensaje);

module.exports = { errorMensaje };
`,
      },
      verificaciones: [
        {
          id: "v4-secreto-invalido",
          titulo: "jwt.verify() con secreto incorrecto lanza un error",
          tipo: "js-runtime",
          entryFile: "/index.js",
          assertion: `
const { errorMensaje } = exports;
if (!errorMensaje || typeof errorMensaje !== "string") {
  throw new Error(
    "errorMensaje debe ser un string con el mensaje del error. " +
    "¿Capturaste el error con try/catch? jwt.verify() con secreto incorrecto debe lanzar."
  );
}
`,
        },
      ],
    },
  ],
  retoFinal:
    "Implementa la función `crearToken(usuario, secret)` que firme `{ id: usuario._id, rol: usuario.rol, escuelaId: usuario.escuela }` con expiración de `'7d'`. Luego implementa `verificarToken(token, secret)` que retorne el payload o lance en caso de error. Estos son los helpers de `kidotag10`.",
};

export default desafio;
