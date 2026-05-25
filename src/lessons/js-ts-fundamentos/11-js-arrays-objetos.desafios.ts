import type { Desafio } from "@/types/desafios";

const desafio: Desafio = {
  id: "js-arrays-objetos",
  titulo: "Arrays y objetos en kidotag",
  intro:
    "Practica las operaciones de array más usadas en `kidotag10` con datos reales de alumnos: acceso a propiedades, filtrado, mapeo y reducción.",
  objetivo:
    "Dominar `filter`, `map`, `find` y `reduce` con objetos anidados — las herramientas que usa kidotag10 para procesar listas de alumnos.",
  referenciaKidotag: "kidotag10/web/src/utils/alumnos.ts",
  conceptosNuevos: [
    {
      termino: "Array.filter(fn)",
      explicacion:
        "Retorna un nuevo array con solo los elementos para los que `fn` retorna `true`. No modifica el array original.",
      ejemplo: "const aprobados = alumnos.filter(a => a.asistencia >= 75);",
    },
    {
      termino: "Array.map(fn)",
      explicacion:
        "Transforma cada elemento del array aplicando `fn`. Retorna un nuevo array del mismo tamaño.",
      ejemplo: "const nombres = alumnos.map(a => a.nombre);",
    },
    {
      termino: "Array.find(fn) vs Array.filter(fn)",
      explicacion:
        "`find` retorna el **primer** elemento que coincide (o `undefined`). `filter` retorna **todos** los que coinciden como array.",
      ejemplo:
        "const ana = alumnos.find(a => a.id === 'a001');\nconst grupo3A = alumnos.filter(a => a.grado === '3A');",
    },
    {
      termino: "Array.reduce(fn, inicial)",
      explicacion:
        "Acumula un valor recorriendo el array. Útil para sumas, promedios y agrupaciones.",
      ejemplo:
        "const suma = alumnos.reduce((acc, a) => acc + a.asistencia, 0);\nconst promedio = suma / alumnos.length;",
    },
  ],
  pasos: [
    {
      id: "paso-1",
      titulo: "Accede a propiedades de objetos en el array",
      descripcion:
        "Accede al primer alumno (`alumnos[0]`) y extrae su `nombre` en `primerNombre`, su `grado` en `primerGrado` y su `asistencia` en `primeraAsistencia`. Luego accede a `registroHoy.presentes` para obtener el array de IDs presentes.",
      pista:
        "Usa notación de punto: `alumnos[0].nombre`. Para el registro: `registroHoy.presentes`.",
      codigoInicial: {
        "/data.js": `// Datos del grupo — misma estructura que usa kidotag10
export var alumnos = [
  { id: "a001", nombre: "Ana García", grado: "3A", asistencia: 95, faltas: 1 },
  { id: "a002", nombre: "Luis Méndez", grado: "3A", asistencia: 78, faltas: 5 },
  { id: "a003", nombre: "Mía Torres", grado: "4B", asistencia: 100, faltas: 0 },
  { id: "a004", nombre: "Carlos Ruiz", grado: "4B", asistencia: 62, faltas: 9 },
];

export var registroHoy = {
  fecha: "2026-05-23",
  grupo: "3A",
  presentes: ["a001", "a003"],
  ausentes: ["a002", "a004"],
};
`,
        "/index.js": `import { alumnos, registroHoy } from "./data.js";

// TODO 1: Accede al primer alumno y extrae sus propiedades
// const primerNombre = ...
// const primerGrado = ...
// const primeraAsistencia = ...
// const idsPresentes = ...

console.log("Primer nombre:", primerNombre);
console.log("Primer grado:", primerGrado);
console.log("Primera asistencia:", primeraAsistencia);
console.log("IDs presentes:", idsPresentes);

export { primerNombre, primerGrado, primeraAsistencia, idsPresentes };
`,
      },
      verificaciones: [
        {
          id: "v1-acceso-propiedades",
          titulo: "primerNombre, primerGrado y idsPresentes correctos",
          tipo: "js-runtime",
          entryFile: "/index.js",
          assertion: `
if (exports.primerNombre !== "Ana García") {
  throw new Error("primerNombre debe ser 'Ana García'. ¿Usaste alumnos[0].nombre?");
}
if (exports.primerGrado !== "3A") {
  throw new Error("primerGrado debe ser '3A'. ¿Usaste alumnos[0].grado?");
}
if (exports.primeraAsistencia !== 95) {
  throw new Error("primeraAsistencia debe ser 95. ¿Usaste alumnos[0].asistencia?");
}
if (!Array.isArray(exports.idsPresentes) || exports.idsPresentes.length !== 2) {
  throw new Error("idsPresentes debe ser un array con 2 elementos. ¿Usaste registroHoy.presentes?");
}
`,
        },
      ],
    },
    {
      id: "paso-2",
      titulo: "Filtra alumnos con .filter()",
      descripcion:
        "Crea `alumnosGrado3A` con solo los alumnos de grado `'3A'` usando `.filter()`. Crea también `alumnosEnRiesgo` con los alumnos que tienen `asistencia < 75`.",
      pista:
        "Arrow function: `alumnos.filter(a => a.grado === '3A')`. El resultado es un nuevo array — no modifica el original.",
      codigoInicial: {
        "/data.js": `export var alumnos = [
  { id: "a001", nombre: "Ana García", grado: "3A", asistencia: 95, faltas: 1 },
  { id: "a002", nombre: "Luis Méndez", grado: "3A", asistencia: 78, faltas: 5 },
  { id: "a003", nombre: "Mía Torres", grado: "4B", asistencia: 100, faltas: 0 },
  { id: "a004", nombre: "Carlos Ruiz", grado: "4B", asistencia: 62, faltas: 9 },
];

export var registroHoy = {
  fecha: "2026-05-23",
  grupo: "3A",
  presentes: ["a001", "a003"],
  ausentes: ["a002", "a004"],
};
`,
        "/index.js": `import { alumnos } from "./data.js";

// TODO 2a: Filtra los alumnos del grado "3A"
// const alumnosGrado3A = alumnos.filter(...)

// TODO 2b: Filtra los alumnos con asistencia menor a 75
// const alumnosEnRiesgo = alumnos.filter(...)

console.log("Grado 3A:", alumnosGrado3A.map(a => a.nombre));
console.log("En riesgo:", alumnosEnRiesgo.map(a => a.nombre));

export { alumnosGrado3A, alumnosEnRiesgo };
`,
      },
      verificaciones: [
        {
          id: "v2-filter-grado",
          titulo: "alumnosGrado3A tiene los 2 alumnos de 3A",
          tipo: "js-runtime",
          entryFile: "/index.js",
          assertion: `
const { alumnosGrado3A } = exports;
if (!Array.isArray(alumnosGrado3A)) throw new Error("alumnosGrado3A debe ser un array");
if (alumnosGrado3A.length !== 2) {
  throw new Error("alumnosGrado3A debe tener 2 alumnos (Ana García y Luis Méndez). Tienes " + alumnosGrado3A.length);
}
if (alumnosGrado3A.some(a => a.grado !== "3A")) {
  throw new Error("Todos los alumnos filtrados deben ser de grado '3A'");
}
`,
        },
        {
          id: "v2-filter-riesgo",
          titulo: "alumnosEnRiesgo contiene solo Carlos Ruiz (asistencia 62)",
          tipo: "js-runtime",
          entryFile: "/index.js",
          assertion: `
const { alumnosEnRiesgo } = exports;
if (!Array.isArray(alumnosEnRiesgo)) throw new Error("alumnosEnRiesgo debe ser un array");
if (alumnosEnRiesgo.length !== 1) {
  throw new Error("alumnosEnRiesgo debe tener 1 alumno (Carlos Ruiz, asistencia 62). Tienes " + alumnosEnRiesgo.length);
}
if (alumnosEnRiesgo[0].nombre !== "Carlos Ruiz") {
  throw new Error("El alumno en riesgo debe ser Carlos Ruiz");
}
`,
        },
      ],
    },
    {
      id: "paso-3",
      titulo: "Transforma el array con .map()",
      descripcion:
        "Crea `nombresAlumnos` (array de strings con solo los nombres) usando `.map()`. Crea también `reporteAsistencia` que transforme cada alumno en `{ nombre, porcentaje: alumno.asistencia + '%' }`.",
      pista:
        "`.map()` retorna un nuevo array con el mismo número de elementos pero transformados. Puedes retornar cualquier valor.",
      codigoInicial: {
        "/data.js": `export var alumnos = [
  { id: "a001", nombre: "Ana García", grado: "3A", asistencia: 95, faltas: 1 },
  { id: "a002", nombre: "Luis Méndez", grado: "3A", asistencia: 78, faltas: 5 },
  { id: "a003", nombre: "Mía Torres", grado: "4B", asistencia: 100, faltas: 0 },
  { id: "a004", nombre: "Carlos Ruiz", grado: "4B", asistencia: 62, faltas: 9 },
];
`,
        "/index.js": `import { alumnos } from "./data.js";

// TODO 3a: Extrae solo los nombres
// const nombresAlumnos = alumnos.map(...)

// TODO 3b: Crea un reporte con { nombre, porcentaje: asistencia + "%" }
// const reporteAsistencia = alumnos.map(...)

console.log("Nombres:", nombresAlumnos);
console.log("Reporte:", reporteAsistencia);

export { nombresAlumnos, reporteAsistencia };
`,
      },
      verificaciones: [
        {
          id: "v3-map-nombres",
          titulo: "nombresAlumnos es array de 4 strings",
          tipo: "js-runtime",
          entryFile: "/index.js",
          assertion: `
const { nombresAlumnos } = exports;
if (!Array.isArray(nombresAlumnos)) throw new Error("nombresAlumnos debe ser un array");
if (nombresAlumnos.length !== 4) throw new Error("Debe tener 4 nombres. Tienes " + nombresAlumnos.length);
if (typeof nombresAlumnos[0] !== "string") throw new Error("Cada elemento debe ser un string (el nombre)");
if (!nombresAlumnos.includes("Ana García")) throw new Error("El array debe incluir 'Ana García'");
`,
        },
        {
          id: "v3-map-reporte",
          titulo: "reporteAsistencia tiene { nombre, porcentaje } por alumno",
          tipo: "js-runtime",
          entryFile: "/index.js",
          assertion: `
const { reporteAsistencia } = exports;
if (!Array.isArray(reporteAsistencia)) throw new Error("reporteAsistencia debe ser un array");
if (reporteAsistencia.length !== 4) throw new Error("Debe tener 4 elementos");
const primero = reporteAsistencia[0];
if (!primero.nombre) throw new Error("Cada elemento debe tener el campo 'nombre'");
if (!primero.porcentaje || typeof primero.porcentaje !== "string") {
  throw new Error("Cada elemento debe tener 'porcentaje' como string (ej. '95%')");
}
`,
        },
      ],
    },
    {
      id: "paso-4",
      titulo: "Calcula el promedio con .reduce()",
      descripcion:
        "Usa `.reduce()` para sumar todas las asistencias y calcular el `promedioAsistencia`. Guarda el resultado como número (no como string).",
      pista:
        "`.reduce((acumulador, actual) => acumulador + actual.asistencia, 0)` suma todas las asistencias. Divide entre `alumnos.length` para el promedio.",
      codigoInicial: {
        "/data.js": `export var alumnos = [
  { id: "a001", nombre: "Ana García", grado: "3A", asistencia: 95, faltas: 1 },
  { id: "a002", nombre: "Luis Méndez", grado: "3A", asistencia: 78, faltas: 5 },
  { id: "a003", nombre: "Mía Torres", grado: "4B", asistencia: 100, faltas: 0 },
  { id: "a004", nombre: "Carlos Ruiz", grado: "4B", asistencia: 62, faltas: 9 },
];
`,
        "/index.js": `import { alumnos } from "./data.js";

// TODO 4: Calcula el promedio de asistencia con reduce
// Suma todas las asistencias → divide entre alumnos.length
// const promedioAsistencia = alumnos.reduce(...) / alumnos.length

console.log("Promedio de asistencia:", promedioAsistencia + "%");

export { promedioAsistencia };
`,
      },
      verificaciones: [
        {
          id: "v4-promedio",
          titulo: "promedioAsistencia es el promedio correcto (83.75)",
          tipo: "js-runtime",
          entryFile: "/index.js",
          assertion: `
const { promedioAsistencia } = exports;
if (typeof promedioAsistencia !== "number") {
  throw new Error("promedioAsistencia debe ser un número. ¿Usaste reduce() y dividiste entre alumnos.length?");
}
if (promedioAsistencia !== 83.75) {
  throw new Error("El promedio de [95, 78, 100, 62] es 83.75. Tu resultado: " + promedioAsistencia);
}
`,
        },
      ],
    },
    {
      id: "paso-5",
      titulo: "find() y actualizar un objeto en el array",
      descripcion:
        "Usa `alumnos.find()` para encontrar el alumno con `id === 'a002'`. Guárdalo en `alumnoEncontrado`. Luego crea `alumnosActualizados` con el array completo pero con `asistencia: 85` para ese alumno (usa `.map()` para no mutar el original).",
      pista:
        "Para actualizar sin mutar: `alumnos.map(a => a.id === 'a002' ? { ...a, asistencia: 85 } : a)`. El spread operator `...a` copia todas las propiedades y luego `asistencia: 85` sobreescribe solo esa.",
      codigoInicial: {
        "/data.js": `export var alumnos = [
  { id: "a001", nombre: "Ana García", grado: "3A", asistencia: 95, faltas: 1 },
  { id: "a002", nombre: "Luis Méndez", grado: "3A", asistencia: 78, faltas: 5 },
  { id: "a003", nombre: "Mía Torres", grado: "4B", asistencia: 100, faltas: 0 },
  { id: "a004", nombre: "Carlos Ruiz", grado: "4B", asistencia: 62, faltas: 9 },
];
`,
        "/index.js": `import { alumnos } from "./data.js";

// TODO 5a: Encuentra el alumno con id "a002"
// const alumnoEncontrado = alumnos.find(...)

// TODO 5b: Crea un nuevo array donde Luis Méndez tiene asistencia 85 (sin mutar el original)
// const alumnosActualizados = alumnos.map(a => a.id === "a002" ? { ...a, asistencia: 85 } : a)

console.log("Alumno encontrado:", alumnoEncontrado?.nombre);
console.log("Luis actualizado:", alumnosActualizados?.find(a => a.id === "a002")?.asistencia);
console.log("Original no mutado:", alumnos.find(a => a.id === "a002")?.asistencia);

export { alumnoEncontrado, alumnosActualizados };
`,
      },
      verificaciones: [
        {
          id: "v5-find",
          titulo: "alumnoEncontrado es Luis Méndez",
          tipo: "js-runtime",
          entryFile: "/index.js",
          assertion: `
const { alumnoEncontrado } = exports;
if (!alumnoEncontrado) throw new Error("alumnoEncontrado es undefined. ¿Usaste alumnos.find(a => a.id === 'a002')?");
if (alumnoEncontrado.nombre !== "Luis Méndez") {
  throw new Error("Debe encontrar a Luis Méndez. Encontraste: " + alumnoEncontrado.nombre);
}
`,
        },
        {
          id: "v5-inmutabilidad",
          titulo: "alumnosActualizados actualiza Luis sin mutar el original",
          tipo: "js-runtime",
          entryFile: "/index.js",
          assertion: `
const { alumnoEncontrado, alumnosActualizados } = exports;
if (!Array.isArray(alumnosActualizados)) throw new Error("alumnosActualizados debe ser un array");
const luisActualizado = alumnosActualizados.find(a => a.id === "a002");
if (!luisActualizado) throw new Error("Luis Méndez (a002) debe seguir en alumnosActualizados");
if (luisActualizado.asistencia !== 85) {
  throw new Error("La asistencia de Luis en alumnosActualizados debe ser 85. Es: " + luisActualizado.asistencia);
}
// El original no debe ser mutado
if (alumnoEncontrado.asistencia !== 78) {
  throw new Error("El alumno original no debe ser mutado — su asistencia debe seguir siendo 78");
}
`,
        },
      ],
    },
  ],
  retoFinal:
    "Crea la función `generarReporteGrupo(alumnos)` que retorne un objeto `{ total, promedioAsistencia, enRiesgo: [nombres...], destacados: [nombres...] }` donde enRiesgo son alumnos con asistencia < 75 y destacados son alumnos con asistencia >= 90. Pruébala con el array de 4 alumnos.",
};

export default desafio;
