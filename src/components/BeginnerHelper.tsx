import type { Bloque, Leccion } from "@/data/curriculum";

interface Props {
  leccion: Leccion & { bloque: Bloque };
}

type BeginnerGuide = {
  objetivo: string;
  aplicacion: string;
  enfoque: string;
  /** Consejo practico especifico para esta leccion. Si se omite usa el nivel. */
  consejoPractico?: string;
  /** Contexto tecnico profundo — solo para lecciones avanzadas o complejas. */
  profundidad?: string;
};

// ─── Guias por leccion individual ────────────────────────────────────────────
// Keyed by leccion.slug. Fallback: GUIDE_BY_BLOCK below.

const GUIDE_BY_LESSON: Record<string, BeginnerGuide> = {
  // ── Bienvenida ──────────────────────────────────────────────────────────────
  "00-que-es-kidotag": {
    objetivo:
      "conocer el dominio escolar de kidotag10, sus tres roles (tutor, profesor, admin) y la arquitectura general antes de tocar codigo",
    aplicacion:
      "cada modulo del curso cubre una pieza de esta arquitectura, por eso entenderla aqui te orienta en todo lo demas",
    enfoque:
      "dibuja o escribe los tres roles y sus responsabilidades antes de seguir al siguiente tema",
    consejoPractico:
      "Identifica en el diagrama de arquitectura que capa construiras primero y anota una pregunta concreta sobre ella.",
  },
  "00-como-usar-el-curso": {
    objetivo:
      "aprovechar el editor de codigo en vivo, los quizzes, ejercicios y el sistema de progreso del curso",
    aplicacion:
      "esta leccion define tu flujo de estudio para todas las demas; saltarla hace que el entorno parezca confuso en los modulos siguientes",
    enfoque:
      "prueba el editor interactivo y completa un quiz antes de cerrar la leccion para confirmar que el entorno funciona en tu dispositivo",
    consejoPractico:
      "Completa al menos un snippet interactivo ahora y verifica que el resultado aparece en pantalla antes de continuar.",
  },
  "00-setup-entorno": {
    objetivo:
      "instalar y configurar Node 18+, MongoDB, VS Code y las extensiones necesarias para trabajar en kidotag10 localmente",
    aplicacion:
      "sin este entorno correcto ninguna practica de backend ni frontend del curso funcionara en tu maquina",
    enfoque:
      "sigue cada paso en orden y ejecuta el comando de verificacion indicado antes de pasar al siguiente; no des por hecho que funciono",
    consejoPractico:
      "Corre node -v y mongod --version en la terminal y confirma que ambos responden con la version correcta.",
  },
  "00-librerias-del-proyecto": {
    objetivo:
      "entender por que se eligio cada dependencia de kidotag10 — backend y frontend — y que alternativas existen para cada una",
    aplicacion:
      "cuando leas codigo real del proyecto reconoceras cada importacion sin tener que buscarlo en Google",
    enfoque:
      "para cada libreria preguntate que problema resuelve; si ya sabes la respuesta, avanza rapido y detente solo en las desconocidas",
    consejoPractico:
      "Abre package.json de kidotag10/api y ubica tres dependencias que no conocias; lee su descripcion en npm antes de seguir.",
  },

  // ── JS/TS Fundamentos ───────────────────────────────────────────────────────
  "11-js-variables-tipos": {
    objetivo:
      "distinguir let, const y los tipos primitivos de JS (string, number, boolean, null, undefined) con ejemplos cotidianos",
    aplicacion:
      "cada campo de un modelo Mongoose y cada variable de estado en React usa estos tipos; entenderlos previene bugs silenciosos desde el inicio",
    enfoque:
      "escribe tres ejemplos propios con tipos distintos y usa typeof en la consola para confirmar como los interpreta JS",
    consejoPractico:
      "Declara una variable de cada tipo primitivo y verifica con typeof que JS la clasifica como esperas.",
  },
  "11-js-condicionales-bucles": {
    objetivo:
      "escribir if/else, switch y bucles for/while para controlar el flujo de ejecucion paso a paso con logica clara",
    aplicacion:
      "los controladores del backend usan if para validar roles y datos; los componentes React los usan para renderizado condicional de vistas",
    enfoque:
      "antes de escribir el codigo, escribe en espanol la condicion que quieres evaluar; luego la traduces a sintaxis JS",
    consejoPractico:
      "Toma una condicion de un controlador real de kidotag10 y escribela primero en pseudocodigo antes de leer el codigo fuente.",
  },
  "11-js-funciones": {
    objetivo:
      "declarar funciones con parametros y return, y entender la diferencia de sintaxis entre funciones normales y arrow functions",
    aplicacion:
      "casi todo en kidotag10 — middlewares, controllers, componentes React — es una funcion; este concepto es la base del proyecto completo",
    enfoque:
      "reescribe cada ejemplo con funcion normal y con arrow function; nota la diferencia de sintaxis y el contexto de this en cada una",
    consejoPractico:
      "Escribe una funcion que reciba un objeto alumno y devuelva su nombre completo formateado con apellido primero.",
  },
  "11-js-arrays-objetos": {
    objetivo:
      "crear, leer y modificar arrays y objetos, y acceder a sus propiedades con punto, corchetes y desestructuracion",
    aplicacion:
      "los documentos de MongoDB son objetos; las listas de alumnos y asistencias son arrays que se transforman en casi todos los endpoints",
    enfoque:
      "practica desestructuracion y el operador spread; son los patrones mas frecuentes en React y en los controllers de la API",
    consejoPractico:
      "Modela un alumno como objeto JS con sus materias como array; extrae el primer elemento y clona el objeto con spread.",
  },
  "11-js-metodos-array": {
    objetivo:
      "usar map, filter y reduce para transformar listas de forma funcional sin mutar el array original",
    aplicacion:
      "en React se usa .map() para renderizar listas, .filter() para mostrar solo asistencias activas y .reduce() para calcular totales de asistencias",
    enfoque:
      "implementa cada metodo primero con un for equivalente; eso revela exactamente lo que hace internamente y fija el concepto",
    consejoPractico:
      "Convierte un .map() existente a un for clasico y luego al reves; confirma que el resultado es identico en ambos casos.",
  },
  "11-js-asincronia": {
    objetivo:
      "entender Promises y async/await para manejar operaciones que tardan — como peticiones HTTP y consultas a MongoDB",
    aplicacion:
      "todos los controladores del backend y todos los fetch del frontend son async; sin dominar esto el codigo es ilegible e impredecible",
    enfoque:
      "visualiza el tiempo: async no bloquea el hilo principal, solo pausa esa funcion especifica; tener eso claro elimina la confusion inicial",
    consejoPractico:
      "Escribe una funcion async con dos await en secuencia y agrega console.log antes de cada uno para confirmar el orden de ejecucion.",
  },
  "11-ts-tipos-basicos": {
    objetivo:
      "agregar tipos, interfaces y anotaciones a JavaScript para que el compilador detecte errores antes de ejecutar el codigo",
    aplicacion:
      "los modelos de Mongoose y las props de componentes React de kidotag10 usan interfaces TypeScript para documentar la forma esperada de los datos",
    enfoque:
      "escribe el tipo antes de escribir el valor; eso te obliga a pensar la estructura de los datos primero y el codigo despues",
    consejoPractico:
      "Define una interfaz Alumno con nombre, matricula y activo; intenta asignarle un campo inexistente y observa el error de TS.",
  },
  "11-ts-en-react": {
    objetivo:
      "tipar props de componentes y estado en hooks de React para eliminar errores de tipo en tiempo de compilacion",
    aplicacion:
      "cada componente de kidotag10 web define su interfaz Props; tiparlos bien previene que el componente padre pase datos en formato incorrecto",
    enfoque:
      "empieza anotando solo las props obligatorias; agrega las opcionales con ? cuando compruebes que el componente las usa de forma condicional",
    consejoPractico:
      "Toma un componente sin tipos y agrega una interfaz Props; verifica que TypeScript marca error al pasarle un valor del tipo incorrecto.",
  },

  // ── Backend Express ─────────────────────────────────────────────────────────
  "01-nodejs-npm": {
    objetivo:
      "entender el sistema de modulos de Node, el package.json y como usar npm para instalar dependencias y correr scripts de desarrollo",
    aplicacion:
      "toda la API de kidotag10 corre en Node; los scripts npm start y npm run dev definidos en package.json son el punto de entrada del servidor",
    enfoque:
      "abre el package.json de kidotag10/api y localiza cada script; entiende que ejecuta antes de correrlo en la terminal",
    consejoPractico:
      "Crea un archivo JS simple que importe el modulo path nativo y muestre el directorio actual; correlo con node.",
  },
  "01-api-rest": {
    objetivo:
      "comprender HTTP, los verbos REST (GET, POST, PUT, DELETE) y los codigos de estado correctos para cada tipo de operacion",
    aplicacion:
      "cada endpoint de kidotag10 — /alumnos, /asistencias, /auth — sigue estas convenciones; conocerlas te permite leer cualquier ruta sin documentacion",
    enfoque:
      "mapea los verbos a CRUD: GET=leer, POST=crear, PUT=actualizar, DELETE=borrar; ese mapa es universal y no cambia entre proyectos",
    consejoPractico:
      "Dibuja una tabla con los 5 endpoints principales de kidotag10 y anota que verbo y status code correcto usa cada uno.",
  },
  "01-express-basico": {
    objetivo:
      "crear una app Express minima con rutas, req/res y JSON body parser, y analizar el app.js real de kidotag10",
    aplicacion:
      "app.js es el punto de entrada del servidor; cada middleware y grupo de rutas del proyecto se registra ahi en orden especifico",
    enfoque:
      "lee app.js de kidotag10 linea por linea y anota para que sirve cada app.use(); el archivo deja de parecer magico despues de eso",
    consejoPractico:
      "Agrega una ruta GET /ping que devuelva { ok: true, version: '1.0' } y verificala con el navegador o con curl.",
  },
  "01-middlewares": {
    objetivo:
      "dominar el patron (req, res, next), el orden de ejecucion de middlewares y como manejar errores globalmente con un error handler",
    aplicacion:
      "cors, express.json, verificarToken y el error handler global son todos middlewares registrados en app.js de kidotag10 en orden especifico",
    enfoque:
      "piensa en middlewares como una cadena de responsabilidad; si uno no llama next(), todos los siguientes se saltan silenciosamente",
    consejoPractico:
      "Escribe un middleware de logging que imprima metodo y URL de cada peticion; registralo antes de las rutas y prueba que aparece en consola.",
  },
  "01-dotenv-config": {
    objetivo:
      "gestionar variables de entorno con dotenv para separar configuracion del codigo fuente y proteger credenciales del repositorio",
    aplicacion:
      "JWT_SECRET, MONGO_URI y PORT de kidotag10 viven en el .env; sin esto las credenciales quedarian en git y expuestas publicamente",
    enfoque:
      "centraliza la lectura de process.env en un unico archivo config.js; nunca leas variables de entorno dentro de funciones o controladores",
    consejoPractico:
      "Agrega PUERTO_APP al .env, leela en app.js con process.env.PUERTO_APP y verifica que el servidor arranca en ese puerto.",
  },
  "01-arquitectura-mvc": {
    objetivo:
      "entender la separacion routes/controllers/models/middlewares y trazar el flujo completo de una peticion de punta a punta en kidotag10",
    aplicacion:
      "cada recurso del proyecto — alumnos, tutores, asistencias — sigue esta estructura; conocerla te permite localizar cualquier bug rapidamente",
    enfoque:
      "traza una peticion real de extremo a extremo: ruta → middleware → controller → model → respuesta; hazlo para /auth/login como ejercicio",
    consejoPractico:
      "Abre auth.routes.js, auth.controller.js y tutor.model.js y sigue el flujo de loginUnificado linea por linea hasta la respuesta.",
  },
  "01-respuestas-errores": {
    objetivo:
      "implementar el patron { ok, data, error } de kidotag10 y un error handler global que estandarice todas las respuestas de la API",
    aplicacion:
      "cada res.json() del proyecto devuelve este patron; el frontend lo espera y falla si la estructura cambia en alguna ruta",
    enfoque:
      "nunca devuelvas datos planos sin el wrapper { ok, data }; uniformidad en respuestas elimina una clase entera de bugs en el frontend",
    consejoPractico:
      "Localiza el error handler de app.js y verifica que captura por separado errores de Mongoose, de JWT y errores genericos inesperados.",
  },

  // ── MongoDB / Mongoose ──────────────────────────────────────────────────────
  "02-mongodb-intro": {
    objetivo:
      "entender la diferencia entre documentos NoSQL y tablas relacionales, y familiarizarte con BSON y MongoDB Compass",
    aplicacion:
      "todas las entidades del proyecto — Alumno, Tutor, Grupo, Asistencia — son documentos en colecciones de MongoDB sin schema rigido",
    enfoque:
      "abre MongoDB Compass y explora las colecciones de kidotag10; ver los datos reales fija el concepto mejor que cualquier diagrama teorico",
    consejoPractico:
      "Crea un documento alumno manualmente en Compass y observa que MongoDB asigna _id automaticamente con tipo ObjectId.",
  },
  "02-conectar-mongoose": {
    objetivo:
      "usar mongoose.connect() correctamente con manejo de errores de conexion y entender la config centralizada de kidotag10",
    aplicacion:
      "el archivo src/config/database.js centraliza la conexion; si falla, toda la API falla con el — es el primer punto de diagnostico",
    enfoque:
      "lee el mensaje de error de conexion completo; Mongoose da pistas especificas sobre que fallo (auth, timeout, URI incorrecta)",
    consejoPractico:
      "Cambia temporalmente MONGO_URI a un valor incorrecto y observa el mensaje de error exacto que imprime el servidor al arrancar.",
  },
  "02-schemas-validadores": {
    objetivo:
      "definir Schemas de Mongoose con tipos, required, unique, enum, trim y valores por defecto como se hace en el modelo Alumno",
    aplicacion:
      "los validadores del schema son la primera linea de defensa contra datos incorrectos antes de que lleguen a la base de datos",
    enfoque:
      "piensa primero que reglas de negocio aplican a cada campo; los validadores son codigo que expresa esas reglas de forma ejecutable",
    consejoPractico:
      "Agrega un validador personalizado al campo matricula del modelo Alumno que rechace valores con menos de 5 caracteres.",
  },
  "02-referencias-embebidos": {
    objetivo:
      "decidir cuando usar ref (ObjectId a otro documento) versus subdocumentos embebidos, con los tradeoffs concretos de cada enfoque",
    aplicacion:
      "Tutor referencia a sus Alumnos con ref, mientras contactoEmergencia esta embebido en Alumno; entender por que te prepara para disenar modelos propios",
    enfoque:
      "preguntate si el subdato existe independientemente del padre; si solo tiene sentido dentro del padre, embebed; si no, usa ref",
    consejoPractico:
      "Identifica un caso en kidotag10 donde sea mas eficiente usar ref en lugar de datos embebidos y escribe tu justificacion.",
  },
  "02-hooks-pre-save": {
    objetivo:
      "usar hooks pre('save') de Mongoose para ejecutar logica antes de persistir un documento, como hashear el password con bcryptjs",
    aplicacion:
      "tutor.model.js usa un hook pre('save') que hashea el password solo cuando el campo fue modificado, usando isModified()",
    enfoque:
      "siempre verifica isModified() dentro del hook; sin esa guarda el hash se aplica en cada guardado y el password queda corrupto tras la segunda vez",
    consejoPractico:
      "Agrega un hook post('save') al modelo Alumno que imprima en consola el _id del documento recien guardado exitosamente.",
  },
  "02-populate": {
    objetivo:
      "usar .populate() para resolver referencias ObjectId entre colecciones y obtener documentos relacionados sin hacer consultas manuales extra",
    aplicacion:
      "para mostrar un grupo con sus alumnos completos se usa populate en lugar de dos consultas separadas y un join manual en codigo",
    enfoque:
      "populate solo funciona con campos definidos como ObjectId con ref en el schema; si falla, ese es el primer lugar donde verificar",
    consejoPractico:
      "Usa .populate() en una consulta de grupos o tutores y cuenta cuantas queries genera; luego hazlo manual y compara el codigo.",
  },
  "02-indices-rendimiento": {
    objetivo:
      "crear indices simples y compuestos en Mongoose para acelerar consultas criticas, y usar explain() para medir el impacto real en datos reales",
    aplicacion:
      "el modelo Anuncio de kidotag10 usa indices compuestos para filtrar por grupo y fecha; sin indices, las consultas se degradan con el volumen de datos",
    enfoque:
      "ejecuta explain('executionStats') antes y despues de crear el indice; los numeros de docsExamined vs nReturned no mienten",
    consejoPractico:
      "Corre explain() en una consulta por fecha en Asistencia antes y despues de agregar el indice y compara el valor de docsExamined.",
    profundidad:
      "Un indice acelera lecturas pero agrega costo en cada escritura (INSERT, UPDATE, DELETE). Si la coleccion se escribe mucho y se lee poco, un indice mal elegido puede ser mas danino que util. Los indices compuestos tienen orden de prefijo: index({ grupo: 1, fecha: -1 }) acelera consultas que filtran primero por grupo; si filtras solo por fecha, ese indice no se usa. explain('executionStats') revela docsExamined (cuantos documentos toco MongoDB) frente a nReturned (cuantos devolvio): si docsExamined >> nReturned, necesitas un indice. En produccion usa createIndex con background: true (MongoDB < 4.2) o el modo rolling en Atlas para no bloquear la coleccion durante la construccion del indice.",
  },
  "02-operadores-avanzados": {
    objetivo:
      "usar $addToSet, $in, rangos de fecha, .lean() y Promise.all() para consultas complejas, seguras y eficientes en Mongoose",
    aplicacion:
      "kidotag10 usa $addToSet para evitar duplicados en arrays de IDs, $in para filtrar por lista de grupos y .lean() en endpoints de solo lectura para reducir overhead",
    enfoque:
      "usa .lean() solo en consultas de lectura pura; devuelve JS plano sin metodos de Mongoose, lo cual impide llamar .save() o .populate() despues",
    consejoPractico:
      "Reescribe una consulta con dos await secuenciales usando Promise.all() y mide la diferencia de tiempo con console.time.",
    profundidad:
      "$addToSet es atomico: MongoDB garantiza que no inserta duplicados aunque dos peticiones lleguen al mismo tiempo, a diferencia de $push. .lean() elimina el prototype y el tracking de cambios de Mongoose y puede ser 2-5x mas rapido en lecturas masivas, pero el resultado es un objeto plano sin .save() ni metodos virtuales disponibles. Promise.all() paraleliza consultas independientes: si tienes dos await que no dependen uno del otro, el tiempo total se reduce al maximo entre ambos en lugar de la suma. Usar Promise.all con muchas consultas en paralelo puede saturar el pool de conexiones de Mongoose; si haces mas de 10 consultas en paralelo, evalua usar un pool mas grande o encolar las consultas.",
  },

  // ── Auth JWT ────────────────────────────────────────────────────────────────
  "03-passwords-seguros": {
    objetivo:
      "entender por que guardar passwords en texto plano es peligroso y como el hash con salt lo soluciona de forma practica",
    aplicacion:
      "cada tutor de kidotag10 tiene su password hasheado en la base de datos; si alguien roba el dump de MongoDB, los passwords no son legibles",
    enfoque:
      "nunca asumas que la app es demasiado pequena para ser atacada; la seguridad de passwords no es opcional en ningun sistema con usuarios reales",
    consejoPractico:
      "Busca el campo password en la coleccion tutores de MongoDB Compass y confirma que es un hash bcrypt, no texto plano.",
  },
  "03-bcrypt": {
    objetivo:
      "usar bcryptjs para hashear passwords con un factor de costo configurable y verificarlos en el login con bcrypt.compare()",
    aplicacion:
      "tutor.model.js hashea el password con bcrypt.hash() en el hook pre('save') y lo verifica en loginUnificado con bcrypt.compare()",
    enfoque:
      "el factor de costo (rounds) define la velocidad vs seguridad; en kidotag10 se usa 10, que es el estandar recomendado para produccion actual",
    consejoPractico:
      "Prueba bcrypt.hash() con rounds=10 y rounds=14 en la consola y mide cuanto tarda cada uno para comprender el impacto del factor.",
  },
  "03-anatomia-jwt": {
    objetivo:
      "leer y entender las tres partes de un JWT (header, payload, signature) y los claims estandar como exp, iat e iss",
    aplicacion:
      "el token que genera kidotag10 en login incluye el _id del usuario, su rol y la fecha de expiracion en el payload",
    enfoque:
      "pega un token real de kidotag10 en jwt.io y lee el payload directamente; ver datos reales fija el concepto mas rapido que cualquier teoria",
    consejoPractico:
      "Decodifica un token del proyecto en jwt.io, localiza el campo exp y calcula la fecha de expiracion a partir del timestamp Unix.",
  },
  "03-emitir-tokens": {
    objetivo:
      "implementar el controlador loginUnificado que busca el usuario por tipo de rol, verifica el password y firma un JWT con los datos correctos",
    aplicacion:
      "auth.controller.js de kidotag10 maneja los tres tipos de usuario (tutor, profesor, admin) en una sola funcion de login reutilizable",
    enfoque:
      "el orden importa: primero busca el usuario, luego verifica el password, luego firma el token; invertir cualquier paso es un riesgo de seguridad",
    consejoPractico:
      "Agrega un campo issuedAt con la fecha actual al payload del token y verifica que aparece al decodificarlo en jwt.io.",
  },
  "03-verificar-token": {
    objetivo:
      "escribir el middleware verificarToken que extrae el Bearer token del header, lo verifica con jwt.verify() y adjunta el usuario decodificado a req",
    aplicacion:
      "cada ruta protegida de kidotag10 pasa por este middleware antes de llegar al controlador; es el guardian de todos los endpoints privados",
    enfoque:
      "maneja TOKEN_INVALIDO y TOKEN_EXPIRADO como errores distintos; el frontend necesita saber si debe redirigir al login o simplemente refrescar el token",
    consejoPractico:
      "Simula una peticion con un token expirado y verifica que el middleware devuelve el codigo de error correcto con el status HTTP 401.",
  },
  "03-rbac": {
    objetivo:
      "implementar autorizacion por roles con middlewares esTutor(), esProfesor() y esAdmin() que leen el rol desde req.usuario",
    aplicacion:
      "en kidotag10 solo tutores ven sus hijos, solo profesores registran asistencias y solo admins gestionan usuarios del sistema",
    enfoque:
      "autenticacion (quien eres) y autorizacion (que puedes hacer) son dos pasos distintos; el middleware RBAC va siempre despues de verificarToken",
    consejoPractico:
      "Intenta acceder a una ruta de admin con un token de tutor y verifica que el servidor devuelve 403 Forbidden, no 401 Unauthorized.",
  },
  "03-almacenamiento-token": {
    objetivo:
      "evaluar los tradeoffs de seguridad entre localStorage, sessionStorage y cookies HttpOnly para persistir el JWT en el cliente web",
    aplicacion:
      "kidotag10 web guarda el token en localStorage para persistir entre recargas; la leccion explica por que esa decision es aceptable para este contexto",
    enfoque:
      "no hay solucion perfecta; evalua el modelo de amenaza de tu app antes de elegir — para una app interna escolar, localStorage con HTTPS es aceptable",
    consejoPractico:
      "Abre las DevTools en kidotag10 web, busca el token en localStorage y reflexiona que pasaria si un script inyectado lo leyera.",
    profundidad:
      "localStorage es vulnerable a XSS (Cross-Site Scripting): cualquier script con acceso al DOM puede leer el token y enviarlo a un servidor externo. Las cookies HttpOnly no son accesibles por JavaScript, eliminando ese vector, pero son vulnerables a CSRF (Cross-Site Request Forgery) si no se incluye SameSite=Strict o un token CSRF separado. Una tercera opcion es guardar el token solo en memoria (variable de modulo en React), lo que es la opcion mas segura pero pierde el token en cada recarga de pagina, requiriendo un refresh token flow completo. Para kidotag10 — app interna de escuela sobre HTTPS — localStorage es un tradeoff aceptable. Para sistemas con datos financieros o medicos, la combinacion correcta es cookies HttpOnly + SameSite=Strict + refresh token de corta vida.",
  },

  // ── Swagger ─────────────────────────────────────────────────────────────────
  "04-openapi-intro": {
    objetivo:
      "entender la estructura de una especificacion OpenAPI 3.0 (info, servers, paths, components) en formato YAML o JSON",
    aplicacion:
      "el spec que genera swagger-jsdoc en kidotag10 sigue exactamente esta estructura; leerlo deja de ser intimidante despues de esta leccion",
    enfoque:
      "abre el spec generado en JSON y localiza cada seccion (info, paths, components); reconocer la estructura hace el resto trivial",
    consejoPractico:
      "Abre el endpoint /api-docs.json de kidotag10 y localiza la definicion de al menos dos rutas en la seccion paths del JSON.",
  },
  "04-swagger-jsdoc": {
    objetivo:
      "escribir anotaciones @openapi en comentarios JSDoc sobre las rutas de Express para que swagger-jsdoc genere el spec automaticamente",
    aplicacion:
      "cada controlador de kidotag10 tiene comentarios JSDoc con las anotaciones de parametros, body y respuestas de cada endpoint",
    enfoque:
      "escribe la anotacion mientras escribes la ruta, no despues; si lo dejas para despues, la documentacion nunca refleja el estado real",
    consejoPractico:
      "Agrega la anotacion JSDoc a una ruta que no este documentada y verifica que aparece en Swagger UI al recargar la pagina.",
  },
  "04-schemas-seguridad": {
    objetivo:
      "definir schemas reutilizables en components/schemas y proteger endpoints con securitySchemes de Bearer JWT en el spec OpenAPI",
    aplicacion:
      "en kidotag10 los schemas de Alumno y Tutor se reutilizan en multiples respuestas evitando duplicacion y posibles inconsistencias",
    enfoque:
      "un schema bien definido una vez vale mas que copiar la estructura en cada endpoint; la reutilizacion con $ref mantiene el spec coherente",
    consejoPractico:
      "Crea un schema reutilizable para el objeto Asistencia y referencialos con $ref en al menos dos endpoints distintos del spec.",
  },
  "04-swagger-ui-ejercicio": {
    objetivo:
      "montar swagger-ui-express en el servidor y documentar un endpoint nuevo desde cero incluyendo body requerido, parametros y respuestas",
    aplicacion:
      "el explorador en /api-docs de kidotag10 permite probar endpoints directamente desde el navegador sin necesidad de Postman",
    enfoque:
      "usa Swagger UI para probar endpoints reales del proyecto; cuando una peticion falla desde ahi, el error da mas contexto que un test manual",
    consejoPractico:
      "Documenta el endpoint de login completo con el body requerido y la respuesta con token; luego ejecutalo directamente desde Swagger UI.",
  },

  // ── React Fundamentos ───────────────────────────────────────────────────────
  "06-vite-setup": {
    objetivo:
      "entender por que Vite es mas rapido que CRA, como funciona HMR y como usar variables de entorno VITE_* en componentes",
    aplicacion:
      "el frontend de kidotag10 usa Vite; las variables VITE_API_URL se leen con import.meta.env y cambian entre entornos sin recompilar",
    enfoque:
      "abre vite.config.ts de kidotag10 y lee cada opcion; la configuracion de desarrollo y produccion tiene diferencias importantes",
    consejoPractico:
      "Agrega VITE_APP_VERSION al .env y leela en un componente con import.meta.env.VITE_APP_VERSION para confirmar que Vite la inyecta.",
  },
  "06-jsx-componentes": {
    objetivo:
      "entender JSX como azucar sintatico sobre React.createElement y crear componentes funcionales con naming en PascalCase",
    aplicacion:
      "cada pantalla de kidotag10 — Login, Dashboard, Overview — es un componente funcional; reconocer esta estructura orienta la lectura del codigo",
    enfoque:
      "cuando leas JSX piensa en el HTML que genera; el arbol de componentes es el DOM que el usuario ve en pantalla",
    consejoPractico:
      "Crea un componente TarjetaAlumno que reciba nombre y matricula como props y los muestre formateados en un parrafo.",
  },
  "06-usestate": {
    objetivo:
      "manejar estado local con useState, entender como se disparan re-renders y como actualizar objetos y arrays sin mutarlos",
    aplicacion:
      "el estado de carga, datos y errores en cada pantalla de kidotag10 se gestiona con useState dentro del componente correspondiente",
    enfoque:
      "nunca mutes el estado directamente; usa siempre el setter; cuando el estado es un objeto, spread el anterior antes de actualizar un campo",
    consejoPractico:
      "Crea un componente con estado { nombre, activo } y dos botones que actualicen cada campo; verifica que el otro campo no se pierde al actualizar.",
  },
  "06-useeffect": {
    objetivo:
      "ejecutar efectos secundarios (fetch, suscripciones, timers) con useEffect usando correctamente el array de dependencias y el cleanup",
    aplicacion:
      "en kidotag10 useEffect hace el fetch inicial de datos y configura el listener de Socket.IO; el cleanup desuscribe al desmontar el componente",
    enfoque:
      "el error mas comun es el loop infinito: un objeto o funcion en el array de dependencias se recrea en cada render y dispara el efecto de nuevo",
    consejoPractico:
      "Escribe un useEffect que loguea 'montado' al montar y 'desmontado' al desmontar; verifica el orden en consola al navegar entre pantallas.",
  },
  "06-props-composicion": {
    objetivo:
      "pasar datos de padre a hijo con props, enviar callbacks de hijo a padre y usar la prop children para composicion de componentes",
    aplicacion:
      "en kidotag10 los componentes de lista pasan callbacks onSelect al padre para actualizar el estado en el nivel correcto del arbol",
    enfoque:
      "datos fluyen hacia abajo con props; eventos fluyen hacia arriba con callbacks; si necesitas lo contrario, revisa el diseno del componente",
    consejoPractico:
      "Escribe un componente Lista que reciba items[] y onSeleccionar; al hacer clic en uno, llama al callback con el item elegido.",
  },
  "06-inputs-controlados": {
    objetivo:
      "controlar inputs de formulario con value + onChange en React y manejar el toggle de visibilidad del campo password",
    aplicacion:
      "el formulario de Login de kidotag10 usa inputs controlados; el boton de ojo en el campo password alterna su tipo entre text y password",
    enfoque:
      "si el input no responde cuando el usuario escribe, el onChange no esta llamando al setter del estado; ese es el primer lugar a revisar",
    consejoPractico:
      "Construye un formulario con email y password controlados; deshabilita el boton Submit si alguno de los dos campos esta vacio.",
  },
  "06-renderizado-listas": {
    objetivo:
      "renderizar listas con .map() usando la prop key correctamente y aplicar renderizado condicional con && y el operador ternario",
    aplicacion:
      "la lista de alumnos, asistencias y anuncios en kidotag10 se renderiza con .map() sobre el estado que llega del fetch a la API",
    enfoque:
      "la key debe ser unica y estable; nunca uses el indice del array si el orden puede cambiar o si elementos pueden eliminarse de la lista",
    consejoPractico:
      "Renderiza una lista de 5 alumnos usando el _id como key; elimina uno del array de estado y observa como React reconcilia el DOM.",
  },

  // ── Web API ─────────────────────────────────────────────────────────────────
  "08-fetch-api": {
    objetivo:
      "usar fetch() con async/await, parsear Response.json() y manejar por separado errores de red y errores HTTP",
    aplicacion:
      "toda la comunicacion entre el frontend de kidotag10 y la API pasa por fetch(); entender su API evita promesas no capturadas silenciosas",
    enfoque:
      "fetch() solo rechaza la promesa ante errores de red, no en HTTP 4xx/5xx; siempre revisa response.ok antes de parsear el body",
    consejoPractico:
      "Escribe una funcion que llame a un endpoint de kidotag10 y maneje por separado el error de red y el error HTTP 401.",
  },
  "08-abortsignal-timeout": {
    objetivo:
      "implementar timeouts de peticion con AbortSignal.timeout() y cancelar peticiones en vuelo con AbortController cuando sea necesario",
    aplicacion:
      "kidotag10 usa AbortSignal.timeout(30000) en todos los fetch para evitar que peticiones lentas o colgadas bloqueen la UI indefinidamente",
    enfoque:
      "AbortSignal.timeout() es la forma moderna y declarativa; AbortController es para casos donde necesitas cancelar manualmente, como al desmontar un componente",
    consejoPractico:
      "Simula una respuesta lenta en el servidor (setTimeout de 35s) y verifica que AbortSignal la cancela con un error de tipo AbortError.",
  },
  "08-api-config": {
    objetivo:
      "crear una capa de abstraccion api.config.js con getApiUrl(), getAuthHeaders() y funciones apiGet/Post/Put/Delete reutilizables",
    aplicacion:
      "en kidotag10 todos los fetch pasan por esta capa; cambiar la URL base de la API o el mecanismo de autenticacion requiere editar un solo archivo",
    enfoque:
      "la abstraccion vale la pena desde el primer endpoint; centraliza URL base, headers y el parse de la respuesta normalizada desde el inicio",
    consejoPractico:
      "Agrega una funcion apiPatch siguiendo el mismo patron que apiPut y usala en una actualizacion parcial de un recurso.",
  },
  "08-bearer-token": {
    objetivo:
      "enviar el JWT en el header Authorization: Bearer en cada peticion autenticada y entender el flujo completo desde useAuth() hasta la API",
    aplicacion:
      "getAuthHeaders() en api.config.js lee el token de localStorage y lo inyecta automaticamente en todos los requests que requieren autenticacion",
    enfoque:
      "el token va en el header, nunca en el body ni en la URL; si ves el token en la URL de una peticion, hay un error de implementacion critico",
    consejoPractico:
      "Abre las DevTools Network, filtra por Fetch/XHR y verifica que cada peticion autenticada incluye el header Authorization: Bearer.",
  },
  "08-polling-descarga": {
    objetivo:
      "implementar polling con setInterval dentro de useEffect con cleanup correcto, y descargar archivos con Content-Disposition usando apiDownload()",
    aplicacion:
      "kidotag10 consulta mensajes no leidos del tutor cada N segundos; apiDownload() descarga el reporte de asistencias en Excel sin abrir una nueva ventana",
    enfoque:
      "el cleanup del useEffect debe llamar clearInterval obligatoriamente; sin el, el polling sigue corriendo despues de que el componente se desmonto",
    consejoPractico:
      "Agrega un console.log dentro del interval y navega a otra pantalla; verifica que los logs se detienen con el cleanup correcto.",
    profundidad:
      "El polling con setInterval tiene dos riesgos: 1) Memory leak si no limpias el interval en el cleanup del useEffect — en modo StrictMode React monta y desmonta dos veces en desarrollo, lo que facilita detectar este bug. 2) Race condition: si el servidor tarda mas que el intervalo, dos peticiones pueden estar en vuelo al mismo tiempo; la solucion es usar un flag isCancelled o encadenar el siguiente interval solo dentro del .then() de la peticion anterior. Para apiDownload(), el navegador crea un blob URL temporal con URL.createObjectURL(); ese URL consume memoria hasta que se llama URL.revokeObjectURL(). Si el usuario descarga varias veces sin que el browser libere la memoria, la pestaña acumula objetos. Siempre llama URL.revokeObjectURL(url) inmediatamente despues de disparar el click programatico.",
  },

  // ── React Avanzado ──────────────────────────────────────────────────────────
  "07-context-api": {
    objetivo:
      "crear un Context con createContext, envolverlo en un Provider y consumirlo con useContext para compartir estado global sin prop drilling",
    aplicacion:
      "kidotag10 usa Context para el estado de autenticacion, disponible en cualquier componente del arbol sin necesidad de pasar props a mano",
    enfoque:
      "Context no reemplaza useState; usalo solo para datos que muchos componentes distantes necesitan, no como almacen global de todo el estado",
    consejoPractico:
      "Crea un ThemeContext que alterne entre modo claro y oscuro y consumelo en tres componentes de distintos niveles del arbol de componentes.",
  },
  "07-auth-context": {
    objetivo:
      "analizar AuthContext.js de kidotag10 en detalle: estado (user, token, loading), funciones login() y logout(), y el polling de mensajes no leidos",
    aplicacion:
      "cada componente que necesita saber si el usuario esta autenticado o el token actual consume useAuth(), que lee directamente este contexto",
    enfoque:
      "entiende el flujo de restauracion de sesion al recargar: el contexto lee el token de localStorage y verifica al usuario antes de mostrar la app",
    consejoPractico:
      "Agrega un console.log en la funcion login() del AuthContext y verifica el orden exacto de operaciones al hacer login en el navegador.",
    profundidad:
      "Cada vez que el value del Provider cambia, todos los componentes que usan useContext se re-renderizan. Si el value del Provider es un objeto literal { user, login, logout } que se recrea en cada render del componente padre, se disparan re-renders innecesarios en toda la app. La solucion es envolver el value en useMemo o separar el estado mutable del estable en Contexts distintos. El polling de mensajes dentro del AuthContext tiene un riesgo adicional: si el token expira mientras el interval esta activo, cada peticion devuelve 401; hay que limpiar el interval al llamar logout() y manejar el 401 redirigiendo al login automaticamente.",
  },
  "07-custom-hooks": {
    objetivo:
      "extraer logica reutilizable en custom hooks con el prefijo 'use', incluyendo guards de provider y el patron useSomething",
    aplicacion:
      "useAuth() en kidotag10 encapsula el acceso al AuthContext y lanza un error descriptivo si se usa fuera del Provider para facilitar el debug",
    enfoque:
      "si copias la misma logica de estado y efecto en dos componentes distintos, esa logica pertenece a un custom hook",
    consejoPractico:
      "Extrae la logica de fetch y estado de carga de un componente a un hook useAlumnos() y reutilizalo en dos pantallas distintas.",
  },
  "07-react-router": {
    objetivo:
      "configurar BrowserRouter, Routes, Route, Link, useNavigate y useParams para navegacion SPA completa en kidotag10",
    aplicacion:
      "la navegacion entre Login, Dashboard, Alumnos y otras pantallas de kidotag10 web usa React Router 6 con rutas declarativas",
    enfoque:
      "useNavigate es para navegacion programatica (redireccion despues de login); Link es para navegacion iniciada por el usuario",
    consejoPractico:
      "Agrega una ruta dinamica /alumno/:id, lee el parametro con useParams y muestra el nombre del alumno correspondiente.",
  },
  "07-rutas-protegidas": {
    objetivo:
      "implementar ProtectedRoute.js que redirige al login si el usuario no esta autenticado y gestiona el estado loading durante restauracion de sesion",
    aplicacion:
      "en kidotag10 todas las rutas internas pasan por ProtectedRoute; si el token expira, el usuario es redirigido automaticamente al login",
    enfoque:
      "muestra siempre un estado de carga mientras el contexto verifica la sesion; sin el, el usuario ve un parpadeo al login que resulta confuso",
    consejoPractico:
      "Borra el token de localStorage manualmente y navega a una ruta protegida; verifica que ProtectedRoute redirige al login correctamente.",
  },
  "07-dashboard-pattern": {
    objetivo:
      "implementar navegacion sin URL en Dashboard.js con useState(seccionActiva) y callbacks onCambiarSeccion, y evaluar sus tradeoffs reales",
    aplicacion:
      "el Dashboard de kidotag10 cambia de seccion (Alumnos, Asistencias, Reportes) modificando estado local sin cambiar la URL del browser",
    enfoque:
      "este patron es valido cuando ningun usuario necesita compartir o recargar en una seccion especifica; si lo necesitan, React Router es la solucion correcta",
    consejoPractico:
      "Agrega navegacion por URL para la seccion Alumnos con React Router y compara la experiencia de usuario con el patron de estado actual.",
    profundidad:
      "La navegacion sin URL sacrifica tres cosas: 1) Deep-linking: no puedes compartir la URL de Asistencias porque siempre abre el Dashboard en la seccion por defecto. 2) Historial del navegador: el boton atras no navega entre secciones del Dashboard, lo que puede desorientar al usuario. 3) Accesibilidad: los lectores de pantalla no detectan los cambios de seccion como cambios de pagina. React Router 6 resuelve todo esto con rutas anidadas: <Route path='dashboard/*'> con <Routes> internas permite que cada seccion tenga su propia URL sin perder el layout compartido, con muy pocas lineas de configuracion adicionales.",
  },

  // ── Socket.IO ───────────────────────────────────────────────────────────────
  "05-websockets-vs-rest": {
    objetivo:
      "comparar WebSockets, polling y SSE para elegir la estrategia correcta de comunicacion en tiempo real segun el caso de uso",
    aplicacion:
      "kidotag10 usa Socket.IO para notificar asistencias en tiempo real; entender por que se eligio sobre polling elimina dudas sobre el diseno",
    enfoque:
      "el criterio principal es la frecuencia de actualizacion necesaria: sub-segundo requiere WebSockets; cada pocos segundos, polling es mas simple y suficiente",
    consejoPractico:
      "Calcula cuanta banda usaria polling cada segundo para 100 usuarios y comparalo con el overhead de una conexion WebSocket persistente.",
  },
  "05-servidor-socketio": {
    objetivo:
      "integrar Socket.IO con Express usando http.createServer() y exponer io en app para que los controladores puedan emitir eventos",
    aplicacion:
      "el servidor de kidotag10 hace app.set('io', io) para que cualquier controlador pueda obtener el objeto io y emitir sin importar el modulo",
    enfoque:
      "no mezcles la logica de Socket.IO con la del controlador; el controlador guarda el dato en Mongoose y luego emite el evento a los clientes",
    consejoPractico:
      "Emite un evento test-event desde un controlador y escuchalo desde el cliente con socket.on; verifica que llega en tiempo real en las DevTools.",
  },
  "05-eventos-rooms": {
    objetivo:
      "usar io.emit(), socket.on(), rooms para aislar grupos de usuarios y socket.broadcast.emit() para enviar a todos menos al emisor",
    aplicacion:
      "en kidotag10 los grupos de alumnos se modelan como rooms de Socket.IO; cuando llega una asistencia, solo los clientes del grupo correcto la reciben",
    enfoque:
      "una room es simplemente un string identificador; cualquier socket puede unirse con socket.join('nombre') y el aislamiento es automatico",
    consejoPractico:
      "Crea dos rooms grupo-A y grupo-B y verifica que un mensaje emitido a grupo-A no llega a los clientes conectados en grupo-B.",
  },
  "05-cliente-react": {
    objetivo:
      "conectar socket.io-client en React con useEffect para conectar al montar y desconectar al desmontar, escuchando el evento nueva-asistencia",
    aplicacion:
      "Overview.js y Asistencias.js de kidotag10 escuchan nueva-asistencia para actualizar la tabla en tiempo real sin necesidad de recargar la pagina",
    enfoque:
      "la desconexion en el cleanup del useEffect es critica; sin ella, al navegar entre pantallas acumulas listeners duplicados que disparan el handler varias veces",
    consejoPractico:
      "Abre las DevTools pestana Network/WS, registra una asistencia y verifica que el evento llega al cliente en milisegundos sin recargar.",
  },

  // ── Estilos UX ──────────────────────────────────────────────────────────────
  "09-css-variables": {
    objetivo:
      "definir custom properties CSS (--color-*, --font-*) para un sistema de theming coherente que se puede modificar en un solo lugar",
    aplicacion:
      "theme.js de kidotag10 inyecta las variables en :root; cambiar el color primario de toda la aplicacion se hace modificando un unico valor",
    enfoque:
      "nombra las variables por proposito semantico, no por valor: --color-primario en lugar de --azul-500; el nombre debe describir su rol en la UI",
    consejoPractico:
      "Agrega --radio-tarjeta al :root y usala en todos los elementos con border-radius para unificar el estilo en un solo cambio.",
  },
  "09-responsive-mobile-first": {
    objetivo:
      "disenar primero para pantallas moviles y luego expandir con media queries en 768px y 1024px usando Flexbox y un sidebar overlay",
    aplicacion:
      "App.css de kidotag10 usa media queries para colapsar el sidebar en movil y mostrar un boton hamburguesa que lo abre como overlay",
    enfoque:
      "escribe el layout movil primero en CSS y luego agrega media queries para ampliar; invertir el orden genera media queries de sobreescritura mas complejas",
    consejoPractico:
      "Abre kidotag10 en DevTools con ancho 375px y verifica que el sidebar se colapsa y no hay scroll horizontal en ninguna pantalla.",
  },
  "09-estados-ui": {
    objetivo:
      "disenar e implementar los tres estados esenciales de cualquier pantalla async: cargando, con error y lista vacia",
    aplicacion:
      "cada pantalla de datos de kidotag10 — Alumnos, Asistencias, Anuncios — tiene los tres estados para que el usuario nunca vea un espacio en blanco sin explicacion",
    enfoque:
      "disenya primero el estado de carga, luego el de error, luego el vacio; el estado con datos siempre es el mas sencillo de los cuatro",
    consejoPractico:
      "Agrega el estado de lista vacia a una pantalla que solo tiene cargando y con datos; incluye un mensaje claro y un boton de accion.",
  },

  // ── Capstone ────────────────────────────────────────────────────────────────
  "10-flujo-nfc-tiempo-real": {
    objetivo:
      "trazar y entender el flujo end-to-end completo: ESP32 lee UID → POST /asistencias → Mongoose guarda → Socket.IO emite → React actualiza",
    aplicacion:
      "este es el flujo central de kidotag10; dominar cada salto te permite depurar cualquier falla en produccion sin adivinar donde ocurrio",
    enfoque:
      "anota el formato de dato que viaja en cada salto del flujo; un error de formato en cualquier punto rompe la cadena entera silenciosamente",
    consejoPractico:
      "Simula el POST del ESP32 con Postman usando datos reales y verifica en tiempo real que la tabla de Overview en React se actualiza.",
    profundidad:
      "El flujo completo tiene 5 puntos de falla distintos: 1) ESP32 no puede conectarse al WiFi o la API no responde — el UID se pierde sin registro. 2) El POST llega pero verificarToken rechaza el device token — 401 y la asistencia no se guarda. 3) Mongoose valida el schema y rechaza el documento — 400 con el campo invalido indicado. 4) Socket.IO emite pero el cliente no esta en la room correcta — el update en React nunca llega. 5) El componente React recibe el evento pero el estado no se actualiza porque el handler tiene una stale closure sobre un array vacio del render inicial. Para diagnosticar, agrega logs con timestamp en cada salto y compara con las trazas de red en las DevTools.",
  },
  "10-exportar-excel": {
    objetivo:
      "generar un reporte Excel en el servidor con la libreria xlsx, configurar el MIME type correcto y descargarlo desde React con apiDownload()",
    aplicacion:
      "el reporte de asistencias de kidotag10 se exporta a Excel desde la pantalla de Reportes; los tutores lo usan para registros administrativos escolares",
    enfoque:
      "la generacion ocurre en el servidor, no en el cliente; el servidor envia el buffer binario con Content-Disposition: attachment para forzar la descarga",
    consejoPractico:
      "Exporta la lista de asistencias de un grupo real y abre el archivo en Excel; verifica que los datos son correctos y las columnas tienen encabezados.",
    profundidad:
      "La libreria xlsx carga todos los datos en memoria antes de construir el workbook y enviarlo. Si exportas 10,000 filas, eso significa 10k documentos de Mongoose en RAM del servidor al mismo tiempo, bloqueando el event loop durante la construccion del buffer. Para volumenes grandes usa la API de streaming de xlsx o genera el archivo en un worker process separado con worker_threads. En el cliente, URL.createObjectURL() crea una referencia al blob en memoria del browser; esa referencia persiste hasta que se llama URL.revokeObjectURL() o se cierra la pestaña. Si el usuario descarga muchas veces sin revocar, la pestaña acumula memoria. Llama siempre URL.revokeObjectURL(url) inmediatamente despues de disparar el click() programatico sobre el enlace temporal.",
  },
};

// ─── Guias de fallback por bloque (modulo) ────────────────────────────────────
const GUIDE_BY_BLOCK: Record<string, BeginnerGuide> = {
  bienvenida: {
    objetivo:
      "entender el mapa del curso y preparar tu base para avanzar sin perderte",
    aplicacion:
      "te da contexto para saber por que cada modulo existe en KidoTag",
    enfoque: "apunta los conceptos nuevos en una nota corta antes de seguir",
  },
  "js-ts-fundamentos": {
    objetivo:
      "dominar la logica base de JavaScript y TypeScript que luego usaras en React y backend",
    aplicacion:
      "te ayuda a leer y modificar codigo real del proyecto sin miedo",
    enfoque:
      "ejecuta el snippet linea por linea y confirma que entiendes cada variable",
  },
  "backend-express": {
    objetivo:
      "construir endpoints y flujo de peticiones para la parte servidor",
    aplicacion: "impacta directamente en login, alumnos, asistencia y anuncios",
    enfoque:
      "piensa siempre en la ruta completa: request, validacion, respuesta",
  },
  "mongodb-mongoose": {
    objetivo:
      "modelar datos correctamente para evitar errores futuros en produccion",
    aplicacion: "define como se guardan y consultan alumnos, tutores y grupos",
    enfoque: "fijate en tipos y validadores antes de memorizar metodos",
  },
  "auth-jwt": {
    objetivo: "proteger accesos y manejar sesiones seguras en la API",
    aplicacion: "asegura que cada rol vea solo lo que le corresponde",
    enfoque:
      "repite el flujo completo: login, token, verificacion, autorizacion",
  },
  swagger: {
    objetivo: "documentar tu API para que otros puedan usarla sin adivinar",
    aplicacion:
      "facilita pruebas, integracion frontend y mantenimiento en equipo",
    enfoque:
      "valida en Swagger cada cambio de endpoint antes de darlo por listo",
  },
  "react-fundamentos": {
    objetivo: "entender como React renderiza UI y maneja estado",
    aplicacion: "te permite construir pantallas estables y faciles de mantener",
    enfoque:
      "si algo falla, revisa props, estado y ciclo de render en ese orden",
  },
  "web-api": {
    objetivo: "consumir APIs de forma robusta, clara y segura",
    aplicacion: "conecta frontend con backend real de KidoTag",
    enfoque: "verifica siempre status HTTP y manejo de errores",
  },
  "react-avanzado": {
    objetivo: "organizar una app React grande sin perder claridad",
    aplicacion: "mejora escalabilidad con contextos, hooks y rutas protegidas",
    enfoque: "separa logica reutilizable de la UI en cada ejemplo",
  },
  socketio: {
    objetivo: "sincronizar eventos en tiempo real entre clientes y servidor",
    aplicacion: "habilita notificaciones y estados en vivo del sistema",
    enfoque: "traza evento emitido y evento recibido para depurar rapido",
  },
  "estilos-ux": {
    objetivo: "hacer interfaces claras, consistentes y faciles de usar",
    aplicacion: "mejora comprension y velocidad de uso para docentes y tutores",
    enfoque: "evalua contraste, jerarquia visual y feedback de acciones",
  },
  capstone: {
    objetivo: "integrar todo lo aprendido en una solucion completa",
    aplicacion: "simula trabajo real de producto end-to-end",
    enfoque: "divide el proyecto en entregas pequenas y verificables",
  },
};

function getGuide(leccion: Leccion & { bloque: Bloque }): BeginnerGuide {
  return (
    GUIDE_BY_LESSON[leccion.slug] ||
    GUIDE_BY_BLOCK[leccion.bloque.id] || {
      objetivo: "entender el concepto principal de esta leccion",
      aplicacion: "aplicar lo aprendido en una mejora concreta de KidoTag",
      enfoque: "avanzar en bloques cortos y validar cada paso",
    }
  );
}

function getStepByLevel(nivel: Leccion["nivel"]): string {
  if (nivel === "basico") {
    return "Primero identifica entradas y salidas del ejemplo antes de editar codigo.";
  }
  if (nivel === "intermedio") {
    return "Luego intenta cambiar una condicion o parametro y observa que se rompe y por que.";
  }
  return "Reto: explica con tus palabras el tradeoff tecnico de esta leccion antes de continuar.";
}

export function BeginnerHelper({ leccion }: Props) {
  const tags = leccion.tags.slice(0, 4);
  const guide = getGuide(leccion);
  const pasoSiguiente = guide.consejoPractico ?? getStepByLevel(leccion.nivel);
  const nivelEtiqueta =
    leccion.nivel === "basico"
      ? "Basico"
      : leccion.nivel === "intermedio"
        ? "Intermedio"
        : "Avanzado";

  return (
    <section className="beginner-helper" aria-label="Explicacion simple">
      <div className="beginner-helper-head">
        <h3 className="beginner-helper-title">Resumen de la lección</h3>
        <div className="beginner-helper-meta" aria-label="Datos de la leccion">
          <span className="beginner-helper-pill">{nivelEtiqueta}</span>
          <span className="beginner-helper-pill">{leccion.duracion}</span>
          <span className="beginner-helper-pill">{leccion.bloque.titulo}</span>
        </div>
      </div>

      <p className="beginner-helper-text">
        En <strong>{leccion.titulo}</strong> vas a {guide.objetivo}. Esta clase
        te ayudara a avanzar con un camino claro y practico.
      </p>

      <ul className="beginner-helper-list">
        <li>
          En el contexto de <strong>{leccion.bloque.titulo}</strong>, este tema{" "}
          {guide.aplicacion}.
        </li>
        <li>Si te atoras, usa este enfoque: {guide.enfoque}.</li>
        {guide.profundidad && (
          <li>
            <strong>Profundidad tecnica:</strong> {guide.profundidad}
          </li>
        )}
        <li>Siguiente paso practico: {pasoSiguiente}</li>
      </ul>

      <div className="beginner-helper-tags" aria-label="Palabras clave">
        {tags.map((tag) => (
          <span key={tag} className="beginner-helper-tag">
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}
