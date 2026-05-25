// Fuente de verdad del currículo del curso
// Cada bloque tiene un id, título y lista de lecciones ordenadas

export interface Leccion {
  slug: string; // URL-friendly id único
  titulo: string;
  descripcion: string;
  tags: string[];
  duracion: string; // estimado lectura/práctica
  nivel: "basico" | "intermedio" | "avanzado";
}

export interface Bloque {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  icono: string; // emoji
  color: string; // hex o css var
  lecciones: Leccion[];
}

const CURRICULUM_BASE: Bloque[] = [
  {
    id: "bienvenida",
    numero: 0,
    titulo: "Bienvenida al curso",
    descripcion:
      "Conoce el proyecto kidotag10, el entorno de trabajo y cómo aprovechar al máximo este curso.",
    icono: "🎓",
    color: "#6366f1",
    lecciones: [
      {
        slug: "00-que-es-kidotag",
        titulo: "¿Qué es kidotag10?",
        descripcion:
          "Dominio escolar, control de asistencia con NFC, roles (tutor, profesor, admin) y la arquitectura general del proyecto.",
        tags: ["intro", "dominio", "arquitectura"],
        duracion: "10 min",
        nivel: "basico",
      },
      {
        slug: "00-como-usar-el-curso",
        titulo: "Cómo usar este curso",
        descripcion:
          "Editor de código en vivo, quizzes, ejercicios, diagramas y cómo guardar tu progreso.",
        tags: ["intro", "metodología"],
        duracion: "5 min",
        nivel: "basico",
      },
      {
        slug: "00-setup-entorno",
        titulo: "Configuración del entorno",
        descripcion:
          "Node 18+, MongoDB local o Atlas, VS Code, extensiones recomendadas y clonar el repositorio.",
        tags: ["setup", "node", "mongodb", "vscode"],
        duracion: "20 min",
        nivel: "basico",
      },
      {
        slug: "00-librerias-del-proyecto",
        titulo: "Librerías del proyecto: ¿por qué cada una?",
        descripcion:
          "Recorrido interactivo por todas las dependencias de kidotag10 — backend y frontend — con comparativas de alternativas.",
        tags: ["librerias", "npm", "dependencias", "ecosistema"],
        duracion: "25 min",
        nivel: "basico",
      },
      {
        slug: "00-arbol-conocimiento",
        titulo: "Árbol de conocimiento del curso",
        descripcion:
          "Mapa visual completo de todos los conceptos del curso, sus prerequisitos y la ruta óptima de aprendizaje — desde JavaScript hasta el Capstone.",
        tags: ["mapa", "prerequisitos", "ruta", "conocimiento", "overview"],
        duracion: "15 min",
        nivel: "basico",
      },
    ],
  },
  {
    id: "backend-express",
    numero: 1,
    titulo: "Backend con Node.js y Express",
    descripcion:
      "Construye una API REST desde cero: rutas, middlewares, controladores y configuración de entorno.",
    icono: "⚙️",
    color: "#0ea5e9",
    lecciones: [
      {
        slug: "01-nodejs-npm",
        titulo: "Node.js y npm",
        descripcion:
          "Módulos CommonJS, package.json, scripts npm y nodemon para desarrollo.",
        tags: ["node", "npm", "commonjs", "modules"],
        duracion: "15 min",
        nivel: "basico",
      },
      {
        slug: "01-api-rest",
        titulo: "¿Qué es una API REST?",
        descripcion:
          "HTTP, verbos (GET, POST, PUT, DELETE), status codes, recursos y convenciones REST.",
        tags: ["rest", "http", "api", "status-codes"],
        duracion: "20 min",
        nivel: "basico",
      },
      {
        slug: "01-express-basico",
        titulo: "Express: primeros pasos",
        descripcion:
          "Crear un app Express, req/res, JSON body parser, rutas simples. Análisis de app.js de kidotag10.",
        tags: ["express", "req", "res", "rutas"],
        duracion: "25 min",
        nivel: "basico",
      },
      {
        slug: "01-middlewares",
        titulo: "Middlewares en Express",
        descripcion:
          "El patrón (req, res, next), orden de middlewares, cors, express.json, middlewares de error.",
        tags: ["middleware", "cors", "express", "next"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "01-dotenv-config",
        titulo: "Variables de entorno con dotenv",
        descripcion:
          "Configuración 12-factor, archivos .env, process.env y seguridad de credenciales.",
        tags: ["dotenv", "config", "env", "seguridad"],
        duracion: "15 min",
        nivel: "basico",
      },
      {
        slug: "01-arquitectura-mvc",
        titulo: "Arquitectura MVC en kidotag10",
        descripcion:
          "Separación routes / controllers / models / middlewares. Flujo completo de una petición desde el cliente hasta la base de datos.",
        tags: ["mvc", "arquitectura", "routes", "controllers"],
        duracion: "25 min",
        nivel: "intermedio",
      },
      {
        slug: "01-respuestas-errores",
        titulo: "Respuestas normalizadas y manejo de errores",
        descripcion:
          "El patrón { ok, data, error } de kidotag10, HTTP status codes correctos y error handler global.",
        tags: ["errores", "respuestas", "patron", "error-handler"],
        duracion: "20 min",
        nivel: "intermedio",
      },
    ],
  },
  {
    id: "mongodb-mongoose",
    numero: 2,
    titulo: "MongoDB y Mongoose",
    descripcion:
      "Modela y persiste datos con MongoDB. Aprende schemas, relaciones, hooks y consultas avanzadas.",
    icono: "🍃",
    color: "#10b981",
    lecciones: [
      {
        slug: "02-mongodb-intro",
        titulo: "MongoDB: documentos y colecciones",
        descripcion:
          "Documentos vs tablas relacionales, BSON, colecciones, ObjectId y MongoDB Compass.",
        tags: ["mongodb", "documentos", "colecciones", "nosql"],
        duracion: "20 min",
        nivel: "basico",
      },
      {
        slug: "02-conectar-mongoose",
        titulo: "Conectar Mongoose a MongoDB",
        descripcion:
          "mongoose.connect(), manejo de errores de conexión, src/config/database.js de kidotag10.",
        tags: ["mongoose", "conexion", "mongodb", "config"],
        duracion: "15 min",
        nivel: "basico",
      },
      {
        slug: "02-schemas-validadores",
        titulo: "Schemas, tipos y validadores",
        descripcion:
          "required, unique, enum, trim, default, min/max. Análisis del modelo Alumno.",
        tags: ["schema", "validadores", "mongoose", "alumno"],
        duracion: "25 min",
        nivel: "intermedio",
      },
      {
        slug: "02-referencias-embebidos",
        titulo: "Referencias vs documentos embebidos",
        descripcion:
          "Cuándo usar ref (Tutor↔Alumno) vs subdocumentos (contactoEmergencia). Ventajas y tradeoffs.",
        tags: ["referencias", "subdocumentos", "relaciones", "diseño"],
        duracion: "25 min",
        nivel: "intermedio",
      },
      {
        slug: "02-hooks-pre-save",
        titulo: 'Hooks pre("save"): hashear passwords',
        descripcion:
          "Mongoose middleware pre/post, isModified(), integración con bcryptjs en tutor.model.js.",
        tags: ["hooks", "pre-save", "bcrypt", "seguridad"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "02-populate",
        titulo: "populate(): joins entre colecciones",
        descripcion:
          "Cómo funciona .populate(), selección de campos, populate anidado, ventajas vs aggregation.",
        tags: ["populate", "joins", "relaciones", "mongoose"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "02-indices-rendimiento",
        titulo: "Índices y rendimiento",
        descripcion:
          "index: true, índices compuestos en Anuncio, cuándo indexar, explain() para profiling.",
        tags: ["indices", "rendimiento", "optimizacion", "mongodb"],
        duracion: "20 min",
        nivel: "avanzado",
      },
      {
        slug: "02-operadores-avanzados",
        titulo: "Operadores y consultas avanzadas",
        descripcion:
          "$addToSet, $in, rangos de fecha, .lean(), Promise.all() para consultas en paralelo.",
        tags: ["operadores", "consultas", "lean", "avanzado"],
        duracion: "25 min",
        nivel: "avanzado",
      },
    ],
  },
  {
    id: "auth-jwt",
    numero: 3,
    titulo: "Autenticación con JWT y bcrypt",
    descripcion:
      "Implementa autenticación segura sin estado: contraseñas con bcrypt y tokens JWT.",
    icono: "🔐",
    color: "#f59e0b",
    lecciones: [
      {
        slug: "03-passwords-seguros",
        titulo: "Por qué nunca guardar passwords en texto plano",
        descripcion:
          "Ataques de diccionario, rainbow tables, por qué el hash es la solución y qué es el salt.",
        tags: ["seguridad", "password", "hash", "salt"],
        duracion: "15 min",
        nivel: "basico",
      },
      {
        slug: "03-bcrypt",
        titulo: "bcrypt: salt, rounds y compare",
        descripcion:
          "Cómo funciona bcryptjs, elegir el factor de costo, bcrypt.hash() vs bcrypt.compare().",
        tags: ["bcrypt", "hash", "salt", "seguridad"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "03-anatomia-jwt",
        titulo: "Anatomía de un JWT",
        descripcion:
          "Header, payload y signature. Codificación Base64URL, claims estándar (iss, exp, iat) y claims personalizados.",
        tags: ["jwt", "token", "base64", "claims"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "03-emitir-tokens",
        titulo: "Emitir tokens: loginUnificado",
        descripcion:
          "Análisis completo de auth.controller.js: buscar usuario por tipo, verificar password, firmar JWT.",
        tags: ["jwt", "login", "controller", "autenticacion"],
        duracion: "25 min",
        nivel: "intermedio",
      },
      {
        slug: "03-verificar-token",
        titulo: "Middleware verificarToken",
        descripcion:
          "Extraer Bearer token del header, jwt.verify(), adjuntar req.usuario, errores TOKEN_INVALIDO y TOKEN_EXPIRADO.",
        tags: ["middleware", "jwt", "verificar", "bearer"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "03-rbac",
        titulo: "Control de acceso por roles (RBAC)",
        descripcion:
          "esTutor(), esProfesor(), esAdmin() — cómo kidotag10 aplica autorización por rol en cada ruta.",
        tags: ["rbac", "roles", "autorizacion", "middleware"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "03-almacenamiento-token",
        titulo: "Dónde guardar el token en el cliente",
        descripcion:
          "localStorage vs sessionStorage vs cookies HttpOnly. Tradeoffs de seguridad, XSS y CSRF. Expiración y refresh.",
        tags: ["localStorage", "cookies", "seguridad", "xss", "csrf"],
        duracion: "20 min",
        nivel: "avanzado",
      },
    ],
  },
  {
    id: "swagger",
    numero: 4,
    titulo: "Documentación con Swagger",
    descripcion:
      "Documenta tu API automáticamente con OpenAPI 3.0 y JSDoc, y ofrece un explorador interactivo.",
    icono: "📖",
    color: "#84cc16",
    lecciones: [
      {
        slug: "04-openapi-intro",
        titulo: "OpenAPI 3.0: especificación",
        descripcion:
          "Qué es OpenAPI, estructura del spec (info, servers, paths, components), formato YAML/JSON.",
        tags: ["openapi", "swagger", "especificacion", "api"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "04-swagger-jsdoc",
        titulo: "swagger-jsdoc: docs como código",
        descripcion:
          "Anotaciones JSDoc en las rutas, generar spec automáticamente con swagger-jsdoc, config/swagger.js.",
        tags: ["swagger-jsdoc", "jsdoc", "openapi", "documentacion"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "04-schemas-seguridad",
        titulo: "Schemas reutilizables y seguridad",
        descripcion:
          "components/schemas para reutilizar tipos, securitySchemes con Bearer JWT, global security.",
        tags: ["schemas", "seguridad", "bearer", "components"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "04-swagger-ui-ejercicio",
        titulo: "Swagger UI y ejercicio final",
        descripcion:
          "Montar swagger-ui-express, personalizar UI, ejercicio: documentar un nuevo endpoint con schema propio.",
        tags: ["swagger-ui", "ejercicio", "practica"],
        duracion: "25 min",
        nivel: "intermedio",
      },
    ],
  },
  {
    id: "socketio",
    numero: 5,
    titulo: "Tiempo real con Socket.IO",
    descripcion:
      "Añade comunicación en tiempo real a tu API y a tu frontend con Socket.IO.",
    icono: "⚡",
    color: "#a855f7",
    lecciones: [
      {
        slug: "05-websockets-vs-rest",
        titulo: "WebSockets vs polling vs SSE",
        descripcion:
          "Cuándo necesitas tiempo real, comparación de estrategias, casos de uso en kidotag10 (asistencias en vivo).",
        tags: ["websockets", "polling", "sse", "tiempo-real"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "05-servidor-socketio",
        titulo: "Servidor Socket.IO en Express",
        descripcion:
          'http.createServer() + new Server(io), app.set("io"), emisión desde controladores.',
        tags: ["socketio", "servidor", "express", "http"],
        duracion: "25 min",
        nivel: "intermedio",
      },
      {
        slug: "05-eventos-rooms",
        titulo: "Eventos, rooms y broadcasting",
        descripcion:
          "io.emit(), socket.on(), rooms para aislar grupos, socket.broadcast.emit().",
        tags: ["eventos", "rooms", "broadcast", "socketio"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "05-cliente-react",
        titulo: "Cliente Socket.IO en React",
        descripcion:
          "socket.io-client, useEffect para conectar/desconectar, listener nueva-asistencia en Overview.js y Asistencias.js.",
        tags: ["socketio", "cliente", "react", "useeffect"],
        duracion: "25 min",
        nivel: "intermedio",
      },
    ],
  },
  {
    id: "react-fundamentos",
    numero: 6,
    titulo: "React y Vite: fundamentos",
    descripcion:
      "Domina los conceptos esenciales de React moderno con hooks, usando el web de kidotag10 como referencia.",
    icono: "⚛️",
    color: "#06b6d4",
    lecciones: [
      {
        slug: "06-vite-setup",
        titulo: "Vite: por qué y cómo",
        descripcion:
          "Vite vs CRA, HMR, import.meta.env.VITE_*, configuración de puertos y alias.",
        tags: ["vite", "bundler", "hmr", "env-vars"],
        duracion: "15 min",
        nivel: "basico",
      },
      {
        slug: "06-jsx-componentes",
        titulo: "JSX y componentes funcionales",
        descripcion:
          "JSX como sintaxis, transpilación, componentes como funciones, naming PascalCase.",
        tags: ["jsx", "componentes", "react", "funcional"],
        duracion: "20 min",
        nivel: "basico",
      },
      {
        slug: "06-usestate",
        titulo: "useState: estado local",
        descripcion:
          "Estado en React, re-renders, setState, estado complejo con objetos, batching.",
        tags: ["useState", "estado", "hooks", "react"],
        duracion: "25 min",
        nivel: "basico",
      },
      {
        slug: "06-useeffect",
        titulo: "useEffect: efectos secundarios",
        descripcion:
          "Cuándo usar useEffect, array de dependencias, cleanup, errores comunes (loop infinito).",
        tags: ["useEffect", "efectos", "hooks", "dependencias"],
        duracion: "25 min",
        nivel: "intermedio",
      },
      {
        slug: "06-props-composicion",
        titulo: "Props y composición",
        descripcion:
          "Pasar datos hacia abajo, callbacks hacia arriba, children prop, composición vs herencia.",
        tags: ["props", "composicion", "callbacks", "react"],
        duracion: "20 min",
        nivel: "basico",
      },
      {
        slug: "06-inputs-controlados",
        titulo: "Inputs controlados",
        descripcion:
          "value + onChange, manejo de formularios, campo show/hide password en Login.js.",
        tags: ["inputs", "formularios", "controlados", "react"],
        duracion: "20 min",
        nivel: "basico",
      },
      {
        slug: "06-renderizado-listas",
        titulo: "Renderizado condicional y listas",
        descripcion:
          "&&, ternario, .map() con key, por qué key importa, fragmentos.",
        tags: ["condicional", "listas", "map", "key"],
        duracion: "20 min",
        nivel: "basico",
      },
    ],
  },
  {
    id: "react-avanzado",
    numero: 7,
    titulo: "React avanzado en kidotag10",
    descripcion:
      "Context API, hooks personalizados, React Router 6 y patrones de arquitectura del web de kidotag10.",
    icono: "🚀",
    color: "#ec4899",
    lecciones: [
      {
        slug: "07-context-api",
        titulo: "Context API: estado global",
        descripcion:
          "createContext, Provider, useContext. Cuándo usar Context vs props vs estado local.",
        tags: ["context", "estado-global", "useContext", "provider"],
        duracion: "25 min",
        nivel: "intermedio",
      },
      {
        slug: "07-auth-context",
        titulo: "AuthContext: análisis completo",
        descripcion:
          "Estructura de AuthContext.js: estado (user, token, loading), login(), logout(), polling de mensajes.",
        tags: ["authcontext", "auth", "context", "polling"],
        duracion: "30 min",
        nivel: "avanzado",
      },
      {
        slug: "07-custom-hooks",
        titulo: "Custom hooks: useAuth()",
        descripcion:
          'Por qué extraer lógica en hooks, naming con "use", guard de provider, useSomething pattern.',
        tags: ["custom-hooks", "useAuth", "hooks", "react"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "07-react-router",
        titulo: "React Router 6: rutas y navegación",
        descripcion:
          "BrowserRouter, Routes, Route, Link, useNavigate, useParams — navegación SPA.",
        tags: ["react-router", "rutas", "navegacion", "spa"],
        duracion: "25 min",
        nivel: "intermedio",
      },
      {
        slug: "07-rutas-protegidas",
        titulo: "Rutas protegidas",
        descripcion:
          "ProtectedRoute.js: isAuthenticated(), Navigate, loading state durante restauración de sesión.",
        tags: ["rutas-protegidas", "auth", "navigate", "protected"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "07-dashboard-pattern",
        titulo: "Dashboard con navegación por estado",
        descripcion:
          "Navegación sin URL en Dashboard.js: useState(seccionActiva), callbacks onCambiarSeccion, trade-offs vs React Router.",
        tags: ["dashboard", "navegacion", "patron", "estado"],
        duracion: "20 min",
        nivel: "avanzado",
      },
    ],
  },
  {
    id: "web-api",
    numero: 8,
    titulo: "Integración Web ↔ API",
    descripcion:
      "Conecta el frontend a la API REST: Fetch API, autorización, timeout, polling y descarga de archivos.",
    icono: "🔗",
    color: "#f97316",
    lecciones: [
      {
        slug: "08-fetch-api",
        titulo: "Fetch API moderna",
        descripcion:
          "fetch() vs axios, Promises vs async/await, Response.json(), manejo de errores de red.",
        tags: ["fetch", "async-await", "promises", "http"],
        duracion: "20 min",
        nivel: "basico",
      },
      {
        slug: "08-abortsignal-timeout",
        titulo: "Timeout con AbortSignal",
        descripcion:
          "Por qué los timeouts importan, AbortSignal.timeout(30000), AbortController para cancelar peticiones.",
        tags: ["abortsignal", "timeout", "fetch", "cancelacion"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "08-api-config",
        titulo: "api.config.js: capa de abstracción",
        descripcion:
          "getApiUrl(), getAuthHeaders(), apiGet/Post/Put/Delete, respuesta normalizada { ok, data, error }.",
        tags: ["abstraccion", "api-config", "patron", "arquitectura"],
        duracion: "25 min",
        nivel: "intermedio",
      },
      {
        slug: "08-bearer-token",
        titulo: "Bearer token en cada petición",
        descripcion:
          "Authorization header, cómo pasan token desde useAuth(), flujo completo request-response.",
        tags: ["bearer", "token", "auth", "header"],
        duracion: "15 min",
        nivel: "intermedio",
      },
      {
        slug: "08-polling-descarga",
        titulo: "Polling con setInterval y descarga de archivos",
        descripcion:
          "setInterval en useEffect para mensajes no leídos, cleanup, apiDownload() con Content-Disposition.",
        tags: ["polling", "setInterval", "descarga", "blob"],
        duracion: "25 min",
        nivel: "avanzado",
      },
    ],
  },
  {
    id: "estilos-ux",
    numero: 9,
    titulo: "Estilos y experiencia de usuario",
    descripcion:
      "CSS variables para theming, diseño responsive mobile-first y estados de interfaz (carga, error, vacío).",
    icono: "🎨",
    color: "#14b8a6",
    lecciones: [
      {
        slug: "09-css-variables",
        titulo: "CSS variables y sistema de theming",
        descripcion:
          "Custom properties (--color-*), var(), herencia en el DOM, theme.js de kidotag10.",
        tags: ["css-variables", "theming", "design-tokens", "css"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "09-responsive-mobile-first",
        titulo: "Diseño responsive mobile-first",
        descripcion:
          "Breakpoints 768px/1024px en App.css, Flexbox, sidebar overlay en móvil.",
        tags: ["responsive", "mobile-first", "flexbox", "breakpoints"],
        duracion: "20 min",
        nivel: "intermedio",
      },
      {
        slug: "09-estados-ui",
        titulo: "Estados de interfaz: carga, error y vacío",
        descripcion:
          "Loading spinners, mensajes de error user-friendly, empty state, feedback al usuario.",
        tags: ["ux", "loading", "error", "empty-state"],
        duracion: "20 min",
        nivel: "basico",
      },
    ],
  },
  {
    id: "js-ts-fundamentos",
    numero: 10,
    titulo: "Fundamentos clave de JavaScript y TypeScript",
    descripcion:
      "Refuerza las bases mas importantes de JS/TS con ejemplos simples antes de seguir avanzando.",
    icono: "🧠",
    color: "#0f766e",
    lecciones: [
      {
        slug: "11-js-variables-tipos",
        titulo: "Variables y tipos en JS",
        descripcion:
          "Diferencia entre let, const, string, number, boolean, null y undefined, con ejemplos cotidianos.",
        tags: ["javascript", "variables", "tipos", "basico"],
        duracion: "20 min",
        nivel: "basico",
      },
      {
        slug: "11-js-condicionales-bucles",
        titulo: "Condicionales y bucles sin dolor",
        descripcion:
          "if, else, switch, for, while y como pensar la logica paso a paso.",
        tags: ["javascript", "if", "for", "logica"],
        duracion: "20 min",
        nivel: "basico",
      },
      {
        slug: "11-js-funciones",
        titulo: "Funciones que si se entienden",
        descripcion:
          "Parametros, return, funciones flecha y como reutilizar codigo.",
        tags: ["javascript", "funciones", "arrow-function"],
        duracion: "20 min",
        nivel: "basico",
      },
      {
        slug: "11-js-arrays-objetos",
        titulo: "Arrays y objetos en lenguaje humano",
        descripcion:
          "Como guardar listas y datos agrupados, acceder y modificar informacion.",
        tags: ["javascript", "arrays", "objetos", "datos"],
        duracion: "25 min",
        nivel: "basico",
      },
      {
        slug: "11-js-metodos-array",
        titulo: "map, filter y reduce con ejemplos reales",
        descripcion:
          "Aprende los metodos que mas se usan en React para transformar listas.",
        tags: ["javascript", "map", "filter", "reduce"],
        duracion: "25 min",
        nivel: "intermedio",
      },
      {
        slug: "11-js-asincronia",
        titulo: "Promesas y async/await desde cero",
        descripcion: "Entiende peticiones HTTP y codigo asincrono sin enredos.",
        tags: ["javascript", "promesas", "async-await", "fetch"],
        duracion: "25 min",
        nivel: "intermedio",
      },
      {
        slug: "11-ts-tipos-basicos",
        titulo: "TypeScript basico: tipos, interfaces y errores utiles",
        descripcion:
          "Que agrega TypeScript a JavaScript y como te ayuda a evitar bugs.",
        tags: ["typescript", "tipos", "interfaces", "basico"],
        duracion: "25 min",
        nivel: "intermedio",
      },
      {
        slug: "11-ts-en-react",
        titulo: "TypeScript en React: props y estado tipado",
        descripcion:
          "Tipa componentes y hooks en React con ejemplos simples y practicos.",
        tags: ["typescript", "react", "props", "hooks"],
        duracion: "25 min",
        nivel: "intermedio",
      },
    ],
  },
  {
    id: "capstone",
    numero: 11,
    titulo: "Capstone: flujo completo end-to-end",
    descripcion:
      "Recorre el sistema completo: desde que un alumno toca el lector NFC hasta que el tutor ve la asistencia en tiempo real.",
    icono: "🏆",
    color: "#ef4444",
    lecciones: [
      {
        slug: "10-flujo-nfc-tiempo-real",
        titulo: "ESP32 → API → Socket.IO → React: en vivo",
        descripcion:
          'Flujo completo: ESP32 lee UID NFC → POST /asistencias → Mongoose guarda → io.emit("nueva-asistencia") → React Overview actualiza.',
        tags: ["capstone", "e2e", "socketio", "nfc", "flujo"],
        duracion: "30 min",
        nivel: "avanzado",
      },
      {
        slug: "10-exportar-excel",
        titulo: "Exportar reportes a Excel con xlsx",
        descripcion:
          "Librería xlsx en el servidor, worksheets, MIME type, Content-Disposition, descarga desde React con apiDownload().",
        tags: ["xlsx", "excel", "exportar", "reportes", "descarga"],
        duracion: "25 min",
        nivel: "avanzado",
      },
    ],
  },
];

const ORDEN_APRENDIZAJE = [
  "bienvenida",
  "js-ts-fundamentos",
  "backend-express",
  "mongodb-mongoose",
  "auth-jwt",
  "swagger",
  "react-fundamentos",
  "web-api",
  "react-avanzado",
  "socketio",
  "estilos-ux",
  "capstone",
] as const;

const POSICION_ORDEN = Object.fromEntries(
  ORDEN_APRENDIZAJE.map((id, idx) => [id, idx]),
) as Record<string, number>;

export const CURRICULUM: Bloque[] = [...CURRICULUM_BASE]
  .sort((a, b) => {
    const pa = POSICION_ORDEN[a.id] ?? Number.MAX_SAFE_INTEGER;
    const pb = POSICION_ORDEN[b.id] ?? Number.MAX_SAFE_INTEGER;
    return pa - pb;
  })
  .map((bloque, idx) => ({
    ...bloque,
    numero: idx,
  }));

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** Lista plana de todas las lecciones en orden */
export function todasLasLecciones(): (Leccion & { bloque: Bloque })[] {
  return CURRICULUM.flatMap((bloque) =>
    bloque.lecciones.map((l) => ({ ...l, bloque })),
  );
}

/** Encuentra una lección por slug */
export function buscarLeccion(
  slug: string,
): (Leccion & { bloque: Bloque }) | undefined {
  return todasLasLecciones().find((l) => l.slug === slug);
}

/** Lección anterior y siguiente dado un slug */
export function navegacionLeccion(slug: string): {
  anterior: (Leccion & { bloque: Bloque }) | null;
  siguiente: (Leccion & { bloque: Bloque }) | null;
} {
  const todas = todasLasLecciones();
  const idx = todas.findIndex((l) => l.slug === slug);
  return {
    anterior: idx > 0 ? todas[idx - 1] : null,
    siguiente: idx >= 0 && idx < todas.length - 1 ? todas[idx + 1] : null,
  };
}

/** Total de lecciones */
export const TOTAL_LECCIONES = todasLasLecciones().length;
