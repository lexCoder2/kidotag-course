import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function write(rel, content) {
  const abs = join(ROOT, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content, "utf8");
  console.log(`  ✅ ${rel}`);
}

// Plantilla de placeholder para lecciones en desarrollo
function placeholder(titulo, conceptos) {
  return `# ${titulo}

> 📝 Esta lección está en desarrollo.

## Conceptos clave que aprenderás:

${conceptos.map((c) => `- ${c}`).join("\n")}

Mientras tanto, explora el código de kidotag10 en las referencias indicadas.
`;
}

// Lecciones faltantes del bloque backend-express
const backendLecciones = [
  [
    "backend-express/06-cors-env.mdx",
    "CORS y Variables de Entorno",
    [
      "Qué es CORS y cómo habilitarlo",
      "dotenv para gestionar variables de entorno",
      "Por qué nunca hardcodear credenciales",
      "process.env en Node.js",
    ],
  ],
  [
    "backend-express/07-manejo-errores.mdx",
    "Manejo de Errores Asíncrono",
    [
      "try/catch con async/await",
      "Middleware global de errores en Express",
      "Códigos de estado HTTP correctos",
      "Mensajes de error descriptivos vs seguros",
    ],
  ],
];

// Lecciones faltantes de mongodb-mongoose
const mongoLecciones = [
  [
    "mongodb-mongoose/09-esquemas-modelos.mdx",
    "Esquemas y Modelos Avanzados",
    [
      "Tipos de datos en Mongoose",
      "Validaciones personalizadas",
      "Índices y rendimiento",
      "Métodos de instancia y estáticos",
    ],
  ],
  [
    "mongodb-mongoose/10-relaciones.mdx",
    "Relaciones entre Documentos",
    [
      "Referencias vs documentos embebidos",
      "populate() y sus variantes",
      "Relaciones uno-a-muchos en kidotag10",
      "Alumno → Grupo → Asistencias",
    ],
  ],
  [
    "mongodb-mongoose/11-consultas-avanzadas.mdx",
    "Consultas Avanzadas",
    [
      "Filtros con operadores ($gt, $in, $regex)",
      "Ordenar y paginar resultados",
      "Aggregation pipeline básico",
      "Proyecciones y campos virtuales",
    ],
  ],
  [
    "mongodb-mongoose/12-asistencias-model.mdx",
    "El Modelo de Asistencias",
    [
      "Diseño del modelo de asistencias en kidotag10",
      "Registrar entrada/salida con RFID",
      "Consultar asistencias por alumno y fecha",
      "Exportar a Excel con xlsx",
    ],
  ],
  [
    "mongodb-mongoose/13-crud-completo.mdx",
    "CRUD Completo con Mongoose",
    [
      "Crear, leer, actualizar y eliminar",
      "Transacciones en MongoDB",
      "Soft delete (borrado lógico)",
      "Populate con múltiples niveles",
    ],
  ],
  [
    "mongodb-mongoose/14-indices-performance.mdx",
    "Índices y Rendimiento",
    [
      "Qué son los índices",
      "Índice único (unique)",
      "Índice compuesto",
      "Analizar consultas con explain()",
    ],
  ],
  [
    "mongodb-mongoose/15-mongoose-hooks.mdx",
    "Hooks de Mongoose (Middleware)",
    [
      "pre y post hooks",
      "Hash de contraseñas en el hook pre-save",
      "Auditoría automática con hooks",
      "Hooks de validación",
    ],
  ],
];

// Auth JWT
const authLecciones = [
  [
    "auth-jwt/17-registro-hash.mdx",
    "Registro y Hash de Contraseñas",
    [
      "bcryptjs: genSalt y hash",
      "Por qué no usar MD5 ni SHA1",
      "Cómo verificar contraseñas con compare()",
      "Almacenamiento seguro en MongoDB",
    ],
  ],
  [
    "auth-jwt/18-verificar-token.mdx",
    "Verificar Tokens en el Backend",
    [
      "jwt.verify() y sus parámetros",
      "Manejo de errores: TokenExpiredError",
      "Middleware verificarToken en kidotag10",
      "Roles y autorización",
    ],
  ],
  [
    "auth-jwt/19-roles-permisos.mdx",
    "Roles y Permisos",
    [
      "Rol de admin, tutor y profesor en kidotag10",
      "Middleware de autorización por rol",
      "Proteger rutas sensibles",
      "Principio de mínimo privilegio",
    ],
  ],
  [
    "auth-jwt/20-refresh-tokens.mdx",
    "Refresh Tokens",
    [
      "Por qué los tokens expiran",
      "Flujo con refresh token",
      "Almacenamiento seguro en el cliente",
      "Logout correcto",
    ],
  ],
  [
    "auth-jwt/21-cookies-vs-localstorage.mdx",
    "Cookies vs localStorage",
    [
      "Dónde guardar el JWT en el cliente",
      "Riesgos de XSS y CSRF",
      "HttpOnly cookies",
      "Cómo lo hace kidotag10",
    ],
  ],
  [
    "auth-jwt/22-testing-auth.mdx",
    "Pruebas de Autenticación",
    [
      "Probar el login con el API Playground",
      "Casos de error: token expirado, inválido",
      "Probar rutas protegidas",
      "Herramientas: Postman, Thunder Client",
    ],
  ],
];

// Swagger
const swaggerLecciones = [
  [
    "swagger/23-swagger-intro.mdx",
    "Documentación con Swagger",
    [
      "Qué es OpenAPI y Swagger UI",
      "swagger-jsdoc en kidotag10",
      "Comentarios JSDoc para documentar rutas",
      "Probar endpoints desde la interfaz",
    ],
  ],
  [
    "swagger/24-documentar-rutas.mdx",
    "Documentar Rutas con JSDoc",
    [
      "Sintaxis @openapi en comentarios",
      "Definir schemas y respuestas",
      "Tags y agrupación de endpoints",
      "Parámetros, body y headers",
    ],
  ],
  [
    "swagger/25-schemas-components.mdx",
    "Schemas y Componentes Reutilizables",
    [
      "Definir schemas de modelos",
      "Componentes reutilizables en Swagger",
      "Respuestas de error estándar",
      "securitySchemes para JWT",
    ],
  ],
  [
    "swagger/26-swagger-ui.mdx",
    "Configurar Swagger UI",
    [
      "swagger-ui-express en kidotag10",
      "Ruta /api-docs",
      "Personalizar la interfaz",
      "Entornos development vs production",
    ],
  ],
];

// Socket.IO
const socketLecciones = [
  [
    "socketio/33-socket-intro.mdx",
    "Tiempo Real con Socket.IO",
    [
      "WebSockets vs HTTP",
      "Eventos en Socket.IO",
      "Configurar Socket.IO en Express",
      "Socket.IO en kidotag10",
    ],
  ],
  [
    "socketio/34-eventos-servidor.mdx",
    "Eventos en el Servidor",
    [
      'io.on("connection")',
      "socket.emit y io.emit",
      "Salas (rooms)",
      "Emitir desde controladores",
    ],
  ],
  [
    "socketio/35-cliente-socket.mdx",
    "Socket.IO en el Cliente React",
    [
      "socket.io-client",
      "Conectar y desconectar",
      "Escuchar eventos con useEffect",
      "Cleanup correcto de listeners",
    ],
  ],
  [
    "socketio/36-notificaciones-asistencia.mdx",
    "Notificaciones de Asistencia",
    [
      "Flujo RFID → ESP32 → API → Socket.IO → React",
      "Emitir al registrar asistencia",
      "Actualizar la UI en tiempo real",
      "Manejo de reconexiones",
    ],
  ],
];

// React avanzado
const reactAvanzadoLecciones = [
  [
    "react-avanzado/34-context.mdx",
    "Context API: Estado Global",
    [
      "Cuándo usar Context vs useState",
      "createContext y useContext",
      "AuthContext en kidotag10",
      "Evitar re-renders innecesarios",
    ],
  ],
  [
    "react-avanzado/35-custom-hooks.mdx",
    "Custom Hooks",
    [
      "Extraer lógica a hooks reutilizables",
      "useAlumnos, useAsistencias en kidotag10",
      "Reglas de los hooks",
      "Testing de hooks",
    ],
  ],
  [
    "react-avanzado/36-formularios.mdx",
    "Formularios y Validación",
    [
      "Formularios controlados vs no controlados",
      "Validación manual en kidotag10",
      "Estado del formulario: loading, error",
      "Feedback al usuario",
    ],
  ],
  [
    "react-avanzado/37-react-router.mdx",
    "React Router en kidotag10",
    [
      "BrowserRouter y Routes",
      "Rutas protegidas (PrivateRoute)",
      "useNavigate y useParams",
      "Estructura de navegación en kidotag10",
    ],
  ],
  [
    "react-avanzado/38-optimizacion.mdx",
    "Optimización de Rendimiento",
    [
      "memo y useMemo",
      "useCallback para callbacks estables",
      "Carga diferida (lazy y Suspense)",
      "Evitar renders innecesarios",
    ],
  ],
  [
    "react-avanzado/39-patrones.mdx",
    "Patrones de Componentes",
    [
      "Compound Components",
      "Render Props",
      "Higher-Order Components",
      "Cómo kidotag10 organiza sus componentes",
    ],
  ],
];

// Web API Integration
const webApiLecciones = [
  [
    "web-api/40-fetch-axios.mdx",
    "Fetch y la API de kidotag10",
    [
      "fetch() nativo vs axios",
      "Configurar la baseURL desde .env",
      "Interceptors para el token JWT",
      "Manejo de errores de red",
    ],
  ],
  [
    "web-api/41-auth-context.mdx",
    "Contexto de Autenticación",
    [
      "Guardar el token en localStorage",
      "Proveer usuario a toda la app",
      "Login y logout desde el contexto",
      "Persistir la sesión al recargar",
    ],
  ],
  [
    "web-api/42-socket-react.mdx",
    "Socket.IO en React",
    [
      "Conectar socket.io-client",
      "Escuchar eventos en tiempo real",
      "Actualizar estado desde eventos",
      "Cleanup al desmontar",
    ],
  ],
  [
    "web-api/43-flujo-asistencias.mdx",
    "Flujo Completo de Asistencias",
    [
      "RFID → ESP32 → API → MongoDB",
      "Socket.IO emite el evento",
      "React actualiza la pantalla",
      "Notificar al tutor",
    ],
  ],
  [
    "web-api/44-despliegue.mdx",
    "Variables de Entorno y Despliegue",
    [
      "VITE_API_URL en el frontend",
      "Build de producción con Vite",
      "Variables de entorno en el backend",
      "Opciones de despliegue",
    ],
  ],
];

// Estilos
const estilosLecciones = [
  [
    "estilos-ux/45-css-variables.mdx",
    "Sistema de Diseño con CSS Variables",
    [
      "Variables CSS en :root",
      "Temas light/dark",
      "Paleta de colores de kidotag10",
      "Tokens de diseño reutilizables",
    ],
  ],
  [
    "estilos-ux/46-responsive.mdx",
    "Diseño Responsivo",
    [
      "Mobile-first con media queries",
      "Flexbox y CSS Grid",
      "Sidebar colapsable en kidotag10",
      "Breakpoints estándar",
    ],
  ],
  [
    "estilos-ux/47-ux-feedback.mdx",
    "UX y Feedback al Usuario",
    [
      "Estados de carga (skeleton, spinner)",
      "Mensajes de éxito y error",
      "Confirmaciones antes de eliminar",
      "Accesibilidad básica (ARIA)",
    ],
  ],
];

// Capstone
const capstoneLecciones = [
  [
    "capstone/48-proyecto-final.mdx",
    "Proyecto Final: Construye KidoTag",
    [
      "Revisar toda la arquitectura",
      "Conectar frontend con backend real",
      "Desplegar API y frontend",
      "Próximos pasos: testing, CI/CD",
    ],
  ],
  [
    "capstone/49-recursos-next.mdx",
    "Recursos y Próximos Pasos",
    [
      "Documentación oficial de cada tecnología",
      "Comunidades y foros",
      "Proyectos para practicar",
      "Roadmap de desarrollo web fullstack",
    ],
  ],
];

const todas = [
  ...backendLecciones,
  ...mongoLecciones,
  ...authLecciones,
  ...swaggerLecciones,
  ...socketLecciones,
  ...reactAvanzadoLecciones,
  ...webApiLecciones,
  ...estilosLecciones,
  ...capstoneLecciones,
];

console.log("\n📝 Creando lecciones placeholder...\n");

for (const [ruta, titulo, conceptos] of todas) {
  const fullRuta = `src/lessons/${ruta}`;
  write(fullRuta, placeholder(titulo, conceptos));
}

console.log(`\n✅ ${todas.length} lecciones creadas.\n`);
