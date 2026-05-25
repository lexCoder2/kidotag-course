export interface GlossaryVideo {
  titulo: string;
  url: string;
}

export interface GlossaryEntry {
  key: string;
  titulo: string;
  descripcionCorta: string;
  descripcionLarga: string;
  ejemplo: string;
  videos: GlossaryVideo[];
}

export const GLOSSARY: GlossaryEntry[] = [
  // ── Lenguajes y runtime ──────────────────────────────────────────────────
  {
    key: "javascript",
    titulo: "JavaScript",
    descripcionCorta: "Lenguaje base de la web para dar comportamiento a apps.",
    descripcionLarga:
      "JavaScript es el único lenguaje que corre nativamente en navegadores y también en servidor a través de Node.js. Maneja eventos, manipula el DOM, realiza peticiones HTTP y ejecuta lógica de negocio. En KidoTag lo usas en el frontend React para renderizar listas de alumnos, registrar asistencias con un click y actualizar la UI en tiempo real. Es dinámicamente tipado, orientado a prototipos y soporta programación funcional y asíncrona con Promises y async/await.",
    ejemplo:
      "Un botón 'Marcar presente' llama a una función JavaScript que actualiza el estado del alumno y envía un POST a /api/asistencias, todo sin recargar la página.",
    videos: [
      {
        titulo: "JavaScript desde cero en español",
        url: "https://www.youtube.com/results?search_query=javascript+desde+cero+espanol",
      },
      {
        titulo: "JavaScript moderno: ES6 al ES2023",
        url: "https://www.youtube.com/results?search_query=javascript+moderno+es6+espanol",
      },
    ],
  },
  {
    key: "typescript",
    titulo: "TypeScript",
    descripcionCorta:
      "JavaScript con tipos estáticos para detectar errores antes de ejecutar.",
    descripcionLarga:
      "TypeScript es un superconjunto de JavaScript desarrollado por Microsoft. Agrega un sistema de tipos estáticos opcional que te permite declarar qué tipo de valor espera cada variable, parámetro y retorno de función. El compilador (tsc) verifica los tipos en tiempo de desarrollo y produce JavaScript limpio. En KidoTag defines interfaces como `interface Alumno { nombre: string; grado: string; nfcUid: string; presente: boolean }` para asegurarte de que nunca pases un objeto mal formado a un componente o endpoint. También mejora el autocompletado del editor.",
    ejemplo:
      "Si `toggleAsistencia(id: string)` espera un string y accidentalmente pasas un número, TypeScript muestra error en el editor antes de compilar, evitando bugs en producción.",
    videos: [
      {
        titulo: "TypeScript desde cero en español",
        url: "https://www.youtube.com/results?search_query=typescript+desde+cero+espanol",
      },
      {
        titulo: "TypeScript con React completo",
        url: "https://www.youtube.com/results?search_query=typescript+react+completo+espanol",
      },
    ],
  },
  {
    key: "nodejs",
    titulo: "Node.js",
    descripcionCorta: "Entorno de ejecución de JavaScript en el servidor.",
    descripcionLarga:
      "Node.js toma el motor V8 de Chrome y lo empaqueta para correr JavaScript fuera del navegador. Es no bloqueante y orientado a eventos, por lo que maneja miles de conexiones simultáneas con un solo hilo. En KidoTag toda la API Express corre sobre Node.js: recibe peticiones del frontend React y de los lectores ESP32, consulta MongoDB y emite eventos via Socket.IO. La instalación incluye npm, el gestor de paquetes más usado del mundo.",
    ejemplo:
      "El servidor de KidoTag se inicia con `node src/index.js` o `npm run dev`. Desde ese momento escucha en el puerto 5000 y responde a las peticiones del lector NFC y del frontend.",
    videos: [
      {
        titulo: "Node.js crash course español",
        url: "https://www.youtube.com/results?search_query=nodejs+crash+course+espanol",
      },
      {
        titulo: "Node.js y Express desde cero",
        url: "https://www.youtube.com/results?search_query=nodejs+express+desde+cero+espanol",
      },
    ],
  },
  {
    key: "npm",
    titulo: "npm",
    descripcionCorta: "Gestor de paquetes de Node.js para instalar librerías.",
    descripcionLarga:
      "npm (Node Package Manager) es el repositorio y herramienta de línea de comandos para instalar, actualizar y gestionar dependencias JavaScript. El archivo `package.json` declara las dependencias del proyecto. `npm install` las descarga a `node_modules`. En KidoTag se usa para instalar Express, Mongoose, jsonwebtoken, bcrypt, socket.io, react, vite y todas las demás librerías del proyecto. Los scripts definidos en `package.json` como `dev`, `build` y `start` se ejecutan con `npm run <script>`.",
    ejemplo:
      "Ejecutar `npm install jsonwebtoken bcrypt` agrega esas librerías a la API. Luego en código: `const jwt = require('jsonwebtoken')` para firmar tokens de sesión.",
    videos: [
      {
        titulo: "npm y package.json explicados",
        url: "https://www.youtube.com/results?search_query=npm+package+json+explicado+espanol",
      },
    ],
  },
  // ── Frontend ─────────────────────────────────────────────────────────────
  {
    key: "react",
    titulo: "React",
    descripcionCorta:
      "Librería para construir interfaces declarativas por componentes.",
    descripcionLarga:
      "React es una librería de Facebook/Meta para construir interfaces de usuario. Su modelo declarativo permite describir cómo se debe ver la UI según el estado actual, y React actualiza el DOM de manera eficiente. La app se divide en componentes reutilizables: cada tarjeta de alumno, el formulario de asistencia, la barra lateral, son componentes independientes que se componen. React usa un DOM virtual para comparar cambios y hacer actualizaciones mínimas al DOM real, lo que lo hace muy performante. En KidoTag el frontend completo (dashboard de docente, panel de tutor, listado de asistencias) está construido en React.",
    ejemplo:
      "El componente `<TarjetaAlumno alumno={alumno} onToggle={marcarPresente} />` se reutiliza para cada alumno del grupo. Al hacer click, llama a `onToggle` que actualiza el estado global y el backend.",
    videos: [
      {
        titulo: "React curso completo desde cero",
        url: "https://www.youtube.com/results?search_query=react+curso+completo+desde+cero+espanol",
      },
      {
        titulo: "React con Vite en español",
        url: "https://www.youtube.com/results?search_query=react+vite+espanol",
      },
    ],
  },
  {
    key: "vite",
    titulo: "Vite",
    descripcionCorta: "Herramienta de build ultrarrápida para proyectos React.",
    descripcionLarga:
      "Vite es un build tool moderno creado por Evan You (autor de Vue). Aprovecha ES Modules nativos del navegador para arrancar el servidor de desarrollo en milisegundos, sin necesidad de compilar todo el proyecto. En producción usa Rollup para generar bundles optimizados. En KidoTag el frontend React usa Vite: `npm run dev` lanza el servidor en segundos, HMR (Hot Module Replacement) actualiza los componentes en el navegador al guardar sin perder estado. El archivo `vite.config.ts` configura el proxy a la API y los alias de paths.",
    ejemplo:
      "Mientras editas `TarjetaAlumno.tsx`, Vite inyecta el cambio en el navegador en ~50ms sin recargar la página ni perder el estado de la app.",
    videos: [
      {
        titulo: "Vite desde cero con React",
        url: "https://www.youtube.com/results?search_query=vite+react+desde+cero+espanol",
      },
    ],
  },
  {
    key: "jsx",
    titulo: "JSX",
    descripcionCorta:
      "Extensión de JavaScript para escribir HTML dentro de componentes React.",
    descripcionLarga:
      "JSX (JavaScript XML) es una extensión sintáctica que permite escribir estructuras similares a HTML dentro de archivos JavaScript/TypeScript. Babel/Vite lo transforma a llamadas `React.createElement(...)`. En JSX puedes insertar expresiones JavaScript entre `{}`, lo que permite renderizar listas, condiciones y valores dinámicos directamente en la plantilla. Las diferencias con HTML son: `className` en vez de `class`, `htmlFor` en vez de `for`, y los eventos son camelCase (`onClick`, `onChange`).",
    ejemplo:
      "En KidoTag: `<div className={alumno.presente ? 'presente' : 'ausente'}>{alumno.nombre}</div>` renderiza el nombre con color verde o rojo según el estado de asistencia.",
    videos: [
      {
        titulo: "JSX explicado desde cero",
        url: "https://www.youtube.com/results?search_query=jsx+react+explicado+espanol",
      },
    ],
  },
  {
    key: "componente",
    titulo: "Componente",
    descripcionCorta: "Pieza reutilizable de UI con su propia lógica y vista.",
    descripcionLarga:
      "Un componente React es una función que recibe props y retorna JSX. Encapsula su estructura visual, lógica de interacción y estado propio. Los componentes se componen para construir interfaces complejas. Siguen el principio de responsabilidad única: cada componente hace una cosa bien. En KidoTag existen componentes como `TarjetaAlumno`, `ListaAlumnos`, `FormularioAlumno`, `BarraFiltro`, `ProgressBar`, `Sidebar`. La convención es usar PascalCase para nombres y tener un archivo por componente.",
    ejemplo:
      "`<ListaAlumnos alumnos={alumnos} onToggle={togglePresente} />` es un componente que itera la lista y renderiza un `<TarjetaAlumno>` por cada elemento, sin que el padre necesite saber cómo se dibuja cada tarjeta.",
    videos: [
      {
        titulo: "Componentes React en español",
        url: "https://www.youtube.com/results?search_query=componentes+react+espanol",
      },
    ],
  },
  {
    key: "props",
    titulo: "Props",
    descripcionCorta:
      "Datos que un componente padre pasa a un componente hijo.",
    descripcionLarga:
      "Props (propiedades) son el mecanismo de comunicación descendente en React. El padre le entrega datos inmutables al hijo a través de atributos JSX. El hijo no puede modificar sus props directamente; si necesita notificar un cambio al padre, usa una función callback pasada como prop. Este flujo unidireccional hace el comportamiento predecible y fácil de depurar. En TypeScript, se define una interfaz para las props de cada componente, lo que garantiza que siempre reciba los datos correctos.",
    ejemplo:
      "En KidoTag: `<TarjetaAlumno alumno={a} onToggle={handleToggle} />`. El componente recibe el objeto `alumno` (datos) y `onToggle` (callback). Cuando se hace click, llama a `onToggle(alumno.id)` y el padre actualiza el estado.",
    videos: [
      {
        titulo: "Props en React explicadas",
        url: "https://www.youtube.com/results?search_query=props+react+explicadas+espanol",
      },
    ],
  },
  {
    key: "estado",
    titulo: "Estado (State)",
    descripcionCorta:
      "Datos internos de un componente que provocan re-renders al cambiar.",
    descripcionLarga:
      "El estado (state) es la memoria de un componente. Cuando el estado cambia, React re-renderiza el componente para reflejar el nuevo valor en la UI. Se gestiona con el hook `useState`. A diferencia de las props (que vienen del padre), el estado es propiedad del componente. El estado puede elevarse (lifting state up) al padre cuando varios hijos necesitan compartirlo. En KidoTag, el estado de `alumnos`, `filtro` y `mostrarFormulario` vive en el componente `App` para que `ListaAlumnos` y `FormularioAlumno` puedan accederlo.",
    ejemplo:
      "`const [alumnos, setAlumnos] = useState([])`. Cuando el ESP32 registra una llegada, el frontend recibe el evento via Socket.IO y llama a `setAlumnos(prev => prev.map(a => a.id === id ? {...a, presente: true} : a))`, actualizando la tarjeta en tiempo real.",
    videos: [
      {
        titulo: "useState en React desde cero",
        url: "https://www.youtube.com/results?search_query=usestate+react+espanol",
      },
    ],
  },
  {
    key: "hooks",
    titulo: "Hooks",
    descripcionCorta:
      "Funciones de React para estado, efectos y contexto en componentes funcionales.",
    descripcionLarga:
      "Los Hooks son funciones especiales que empiezan con `use` y permiten 'enganchar' características de React (estado, ciclo de vida, contexto) en componentes funcionales. Antes de Hooks era necesario usar clases. Los principales son: `useState` para estado local, `useEffect` para efectos secundarios (fetch, suscripciones), `useContext` para consumir contexto global, `useMemo` y `useCallback` para optimizaciones de rendimiento, y `useRef` para referencias al DOM o valores persistentes sin re-render. También puedes crear Hooks personalizados (`useAlumnos`, `useAuth`) para reutilizar lógica entre componentes.",
    ejemplo:
      "En KidoTag se usan varios: `useState` para la lista de alumnos, `useEffect` para cargar datos al montar, `useContext` para el contexto de autenticación y `useMemo` para filtrar alumnos sin recalcular en cada render.",
    videos: [
      {
        titulo: "Todos los Hooks de React explicados",
        url: "https://www.youtube.com/results?search_query=react+hooks+completo+espanol",
      },
    ],
  },
  {
    key: "useeffect",
    titulo: "useEffect",
    descripcionCorta:
      "Hook para ejecutar efectos secundarios: fetch, suscripciones, timers.",
    descripcionLarga:
      "useEffect recibe una función y un array de dependencias. La función se ejecuta después de cada render donde las dependencias cambiaron. Si el array está vacío `[]`, solo se ejecuta al montar el componente. Si no se pasa array, se ejecuta en cada render. Es el lugar correcto para hacer llamadas a la API, suscribirse a eventos de Socket.IO, manipular el DOM o configurar timers. La función puede retornar un cleanup para cancelar suscripciones cuando el componente se desmonta o las dependencias cambian.",
    ejemplo:
      "En KidoTag: `useEffect(() => { fetchAlumnos().then(setAlumnos); }, [grupoId])` carga la lista de alumnos cada vez que cambia el grupo seleccionado. El cleanup cancela la petición si el usuario navega antes de que termine.",
    videos: [
      {
        titulo: "useEffect explicado a fondo",
        url: "https://www.youtube.com/results?search_query=useeffect+react+explicado+espanol",
      },
    ],
  },
  {
    key: "context-api",
    titulo: "Context API",
    descripcionCorta:
      "Mecanismo de React para compartir estado global sin prop drilling.",
    descripcionLarga:
      "Context API permite crear un estado global accesible por cualquier componente del árbol sin necesidad de pasar props por cada nivel intermedio (prop drilling). Se crea con `createContext`, se envuelve el árbol con `<Context.Provider value={...}>` y se consume con `useContext(Context)`. Es ideal para estado que muchos componentes necesitan: autenticación, tema visual, idioma. En KidoTag el contexto de autenticación guarda el usuario logueado, el token JWT y las funciones de login/logout accesibles desde cualquier pantalla.",
    ejemplo:
      "`const { usuario, logout } = useContext(AuthContext)`. El Header, el Sidebar y la página de perfil leen el mismo usuario sin que ningún componente padre deba pasarlo manualmente.",
    videos: [
      {
        titulo: "Context API en React",
        url: "https://www.youtube.com/results?search_query=context+api+react+espanol",
      },
    ],
  },
  {
    key: "react-router",
    titulo: "React Router",
    descripcionCorta:
      "Librería para navegación entre páginas en SPAs de React.",
    descripcionLarga:
      "React Router (v6+) permite definir rutas declarativas en una Single Page Application. Sin recargar la página, React Router cambia qué componente se muestra según la URL. Usa `<BrowserRouter>`, `<Routes>`, `<Route>` y `<Outlet>` para componer rutas anidadas. Los hooks `useNavigate`, `useParams`, `useLocation` permiten navegar y leer datos de la URL desde cualquier componente. En KidoTag las rutas incluyen `/dashboard`, `/alumnos/:id`, `/asistencias`, `/login` y rutas protegidas que redirigen al login si no hay sesión.",
    videos: [
      {
        titulo: "React Router v6 desde cero",
        url: "https://www.youtube.com/results?search_query=react+router+v6+espanol",
      },
    ],
    ejemplo:
      "`<Route path='/alumnos/:id' element={<PerfilAlumno />} />`. Cuando el tutor navega a `/alumnos/abc123`, el componente `PerfilAlumno` usa `useParams()` para obtener el id y cargar el historial de asistencias.",
  },
  // ── Backend ───────────────────────────────────────────────────────────────
  {
    key: "express",
    titulo: "Express",
    descripcionCorta:
      "Framework minimalista de Node.js para crear servidores y APIs.",
    descripcionLarga:
      "Express es el framework web más popular del ecosistema Node.js. Permite definir rutas (endpoints), aplicar middlewares en cadena y enviar respuestas JSON con pocas líneas. Su filosofía es minimalista: no impone estructura, lo que lo hace flexible. En KidoTag toda la API REST está construida con Express: define rutas para alumnos, asistencias, grupos, profesores, tutores y autenticación. Cada módulo tiene su router, sus controladores y sus middlewares de validación. La aplicación se inicia con `app.listen(PORT)`.",
    ejemplo:
      "`app.get('/api/alumnos', authMiddleware, alumnoController.listar)`. Esta línea define la ruta GET, aplica verificación de JWT y llama al controlador que consulta MongoDB y devuelve JSON.",
    videos: [
      {
        titulo: "Express.js desde cero",
        url: "https://www.youtube.com/results?search_query=expressjs+desde+cero+espanol",
      },
      {
        titulo: "API REST con Express y MongoDB",
        url: "https://www.youtube.com/results?search_query=api+rest+express+mongodb+espanol",
      },
    ],
  },
  {
    key: "middleware",
    titulo: "Middleware",
    descripcionCorta:
      "Función que se ejecuta entre la petición y la respuesta en Express.",
    descripcionLarga:
      "Un middleware en Express es una función `(req, res, next) => {}` que tiene acceso a la petición, la respuesta y la siguiente función en la cadena. Puede modificar `req` o `res`, terminar el ciclo de petición, o llamar a `next()` para pasar al siguiente middleware. Se usan para: autenticar tokens JWT, validar el body de peticiones, registrar logs, manejar CORS, comprimir respuestas y centralizar manejo de errores. Los middlewares se aplican globalmente con `app.use()` o en rutas específicas como segundo argumento.",
    ejemplo:
      "En KidoTag, `authMiddleware` verifica el header `Authorization: Bearer <token>`. Si el JWT es válido, agrega `req.user` con los datos del usuario y llama a `next()`. Si no, responde 401 sin llegar al controlador.",
    videos: [
      {
        titulo: "Middleware en Express explicado",
        url: "https://www.youtube.com/results?search_query=middleware+express+explicado+espanol",
      },
    ],
  },
  {
    key: "cors",
    titulo: "CORS",
    descripcionCorta:
      "Política que controla qué orígenes pueden hacer peticiones a tu API.",
    descripcionLarga:
      "CORS (Cross-Origin Resource Sharing) es una política de seguridad del navegador. Por defecto, un script en `http://localhost:5173` no puede hacer fetch a `http://localhost:5000` (diferente puerto = diferente origen). El servidor debe incluir el header `Access-Control-Allow-Origin` para autorizar el acceso. En Express se configura con el paquete `cors`. En producción se restringe a los dominios del frontend. Sin configurar CORS correctamente, el navegador bloquea todas las peticiones del frontend a la API.",
    ejemplo:
      "`app.use(cors({ origin: process.env.FRONTEND_URL }))`. Solo el dominio del frontend de KidoTag puede llamar a la API. Una petición desde otro dominio es rechazada por el navegador.",
    videos: [
      {
        titulo: "CORS explicado fácil",
        url: "https://www.youtube.com/results?search_query=cors+explicado+espanol",
      },
    ],
  },
  {
    key: "endpoint",
    titulo: "Endpoint",
    descripcionCorta:
      "URL específica de la API que responde a un tipo de petición.",
    descripcionLarga:
      "Un endpoint es la combinación de un método HTTP y una URL que realiza una operación concreta. Es el punto de entrada para cada funcionalidad de la API. Los endpoints deben ser semánticos: los sustantivos en plural para recursos (`/alumnos`, `/asistencias`) y los verbos HTTP para acciones (GET=leer, POST=crear, PUT/PATCH=actualizar, DELETE=eliminar). En KidoTag cada entidad del sistema tiene sus endpoints: alumnos, grupos, asistencias, anuncios, mensajes.",
    ejemplo:
      "KidoTag define: `GET /api/alumnos` (listar), `POST /api/alumnos` (crear), `GET /api/alumnos/:id` (detalle), `PUT /api/alumnos/:id` (editar), `DELETE /api/alumnos/:id` (eliminar). El ESP32 usa `POST /api/asistencias` para registrar cada lectura NFC.",
    videos: [
      {
        titulo: "Diseño de endpoints REST",
        url: "https://www.youtube.com/results?search_query=diseno+endpoints+rest+espanol",
      },
    ],
  },
  {
    key: "controlador",
    titulo: "Controlador (Controller)",
    descripcionCorta:
      "Función que maneja la lógica de un endpoint: leer datos y construir la respuesta.",
    descripcionLarga:
      "Un controlador es la función que recibe `(req, res)` en Express y contiene la lógica de negocio de ese endpoint: valida el body, consulta la base de datos, aplica reglas de negocio y devuelve la respuesta JSON. Separa la lógica de las definiciones de rutas, haciendo el código más organizado. En KidoTag cada entidad tiene su archivo de controlador: `alumno.controller.js`, `asistencia.controller.js`, `auth.controller.js`. Cada función del controlador hace una sola operación (listar, crear, actualizar, eliminar).",
    ejemplo:
      "`async function registrarAsistencia(req, res) { const { nfcUid } = req.body; const alumno = await Alumno.findOne({ nfcUid }); if (!alumno) return res.status(404).json({ error: 'UID no registrado' }); const registro = await Asistencia.create({ alumno: alumno._id, hora: new Date() }); io.emit('nueva-asistencia', registro); res.json(registro); }`",
    videos: [
      {
        titulo: "MVC con Express en español",
        url: "https://www.youtube.com/results?search_query=mvc+express+node+espanol",
      },
    ],
  },
  {
    key: "dotenv",
    titulo: ".env / Variables de entorno",
    descripcionCorta:
      "Archivo para guardar configuración sensible fuera del código fuente.",
    descripcionLarga:
      "Las variables de entorno son valores externos al código que cambian según el entorno (desarrollo, staging, producción). Se almacenan en un archivo `.env` que nunca se sube a git. El paquete `dotenv` las carga en `process.env`. Secretos como la clave JWT, la URL de MongoDB, el puerto del servidor y las credenciales externas siempre van en variables de entorno. En KidoTag el `.env` contiene `MONGODB_URI`, `JWT_SECRET`, `PORT` y `FRONTEND_URL`. El archivo `.env.example` documenta las variables necesarias sin valores reales.",
    ejemplo:
      "En `.env`: `JWT_SECRET=mi_clave_super_secreta`. En el código: `jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })`. Si hardcodeas el secreto en el código y lo subes a GitHub, cualquiera puede forjar tokens.",
    videos: [
      {
        titulo: "Variables de entorno con dotenv",
        url: "https://www.youtube.com/results?search_query=dotenv+variables+entorno+node+espanol",
      },
    ],
  },
  // ── API y protocolo ───────────────────────────────────────────────────────
  {
    key: "api",
    titulo: "API",
    descripcionCorta:
      "Interfaz de programación para que sistemas se comuniquen entre sí.",
    descripcionLarga:
      "Una API (Application Programming Interface) define el contrato de comunicación entre dos sistemas. En el contexto web, una API HTTP expone endpoints que reciben peticiones y devuelven datos estructurados (generalmente JSON). En KidoTag la API REST es el puente entre: el frontend React (lee y envía datos), el microcontrolador ESP32 (envía lecturas NFC) y el servidor de base de datos MongoDB. La API también maneja autenticación, autorización por roles y reglas de negocio como notificar al tutor cuando el alumno llega.",
    ejemplo:
      "El ESP32 hace `POST /api/asistencias` con `{ nfcUid: 'A3:F2:...' }`. La API busca al alumno, crea el registro, emite el evento Socket.IO al frontend y responde `{ ok: true, alumno: {...} }` al dispositivo.",
    videos: [
      {
        titulo: "Qué es una API y cómo funciona",
        url: "https://www.youtube.com/results?search_query=que+es+api+como+funciona+espanol",
      },
    ],
  },
  {
    key: "rest",
    titulo: "REST",
    descripcionCorta:
      "Estilo arquitectónico para diseñar APIs sobre HTTP con recursos y verbos.",
    descripcionLarga:
      "REST (Representational State Transfer) es un conjunto de principios para diseñar APIs web. Sus reglas principales: los recursos se identifican por URL (`/alumnos/123`), las operaciones se expresan con verbos HTTP (GET, POST, PUT, PATCH, DELETE), las respuestas son stateless (cada petición es autocontenida), y se usan códigos de estado HTTP para comunicar resultados. Una API que sigue estas reglas es RESTful. REST no es un protocolo ni un estándar, es una guía de diseño que hace las APIs predecibles y fáciles de integrar.",
    ejemplo:
      "En KidoTag: `GET /api/grupos/:id/alumnos` lista alumnos de un grupo. `PATCH /api/alumnos/:id` actualiza campos específicos. `DELETE /api/asistencias/:id` borra un registro. Los verbos y URLs comunican claramente la intención.",
    videos: [
      {
        titulo: "REST API diseño desde cero",
        url: "https://www.youtube.com/results?search_query=rest+api+diseno+desde+cero+espanol",
      },
    ],
  },
  {
    key: "http",
    titulo: "HTTP / Códigos de estado",
    descripcionCorta:
      "Protocolo de petición-respuesta web con verbos y códigos de estado.",
    descripcionLarga:
      "HTTP (HyperText Transfer Protocol) es el protocolo de comunicación base de la web. Cada petición HTTP tiene: método (GET, POST, PUT, PATCH, DELETE, OPTIONS), URL, headers y opcionalmente un body. La respuesta incluye un código de estado que comunica el resultado: 2xx (éxito: 200 OK, 201 Created, 204 No Content), 3xx (redirección), 4xx (error del cliente: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable), 5xx (error del servidor: 500 Internal Server Error). Los headers transportan metadatos como tipo de contenido, autorización y caché.",
    ejemplo:
      "Cuando el tutor intenta ver datos sin sesión activa, la API responde `401 Unauthorized`. Si intenta acceder a un grupo que no es suyo, recibe `403 Forbidden`. Si el alumno no existe, `404 Not Found`. El frontend muestra mensajes diferentes según el código.",
    videos: [
      {
        titulo: "HTTP y códigos de estado explicados",
        url: "https://www.youtube.com/results?search_query=http+codigos+estado+explicados+espanol",
      },
    ],
  },
  {
    key: "json",
    titulo: "JSON",
    descripcionCorta:
      "Formato de texto ligero para intercambiar datos estructurados.",
    descripcionLarga:
      "JSON (JavaScript Object Notation) es el formato estándar para intercambiar datos entre frontend y backend en aplicaciones web modernas. Es texto plano que representa objetos, arrays, strings, números, booleanos y null. Es más legible y compacto que XML. En JavaScript, `JSON.parse(texto)` convierte JSON a objeto y `JSON.stringify(objeto)` convierte objeto a JSON. Las APIs REST devuelven JSON y el frontend lo parsea para renderizar la UI. En KidoTag todos los endpoints producen y consumen JSON.",
    ejemplo:
      '`{ "nombre": "Ana García", "grado": "3°A", "presente": true, "hora": "07:58" }`. Este JSON representa el estado de asistencia de una alumna. El frontend lo recibe, lo guarda en estado React y lo renderiza en `TarjetaAlumno`.',
    videos: [
      {
        titulo: "JSON explicado para principiantes",
        url: "https://www.youtube.com/results?search_query=json+explicado+principiantes+espanol",
      },
    ],
  },
  {
    key: "swagger",
    titulo: "Swagger / OpenAPI",
    descripcionCorta:
      "Estándar para documentar APIs REST de forma interactiva y legible.",
    descripcionLarga:
      "OpenAPI es la especificación para describir APIs REST con un documento estructurado (YAML o JSON). Swagger UI convierte esa especificación en una página web interactiva donde puedes ver todos los endpoints, sus parámetros, respuestas posibles y hacer peticiones de prueba sin código. En Express se integra con `swagger-jsdoc` (extrae comentarios JSDoc del código) y `swagger-ui-express` (sirve la UI). En KidoTag la documentación Swagger permite que el equipo de frontend y hardware (ESP32) sepan exactamente qué endpoints existen y cómo usarlos.",
    ejemplo:
      "En el código del controlador: `/** @swagger /api/alumnos: get: summary: Listar alumnos */`. Al acceder a `/api-docs` se ve la interfaz interactiva donde puedes probar `GET /api/alumnos` con un token JWT real.",
    videos: [
      {
        titulo: "Swagger con Node.js Express",
        url: "https://www.youtube.com/results?search_query=swagger+nodejs+express+espanol",
      },
    ],
  },
  // ── Base de datos ─────────────────────────────────────────────────────────
  {
    key: "mongodb",
    titulo: "MongoDB",
    descripcionCorta:
      "Base de datos NoSQL que guarda documentos JSON en colecciones.",
    descripcionLarga:
      "MongoDB es una base de datos NoSQL orientada a documentos. En lugar de filas en tablas (como SQL), almacena documentos BSON (JSON binario) en colecciones. Cada documento puede tener una estructura diferente, lo que lo hace flexible para datos que evolucionan. Soporta índices, consultas complejas, agregaciones, referencias entre documentos y transacciones. MongoDB Atlas ofrece hosting gestionado en la nube. En KidoTag cada entidad (alumno, grupo, asistencia, anuncio, mensaje) tiene su colección en MongoDB. Se accede vía Mongoose desde Node.js.",
    ejemplo:
      "La colección `alumnos` contiene documentos como `{ _id: ObjectId, nombre: 'Ana García', grado: '3°A', nfcUid: 'A3:F2:...', tutor: ObjectId, grupo: ObjectId }`. La referencia `tutor: ObjectId` enlaza con el documento del tutor en la colección `tutores`.",
    videos: [
      {
        titulo: "MongoDB desde cero en español",
        url: "https://www.youtube.com/results?search_query=mongodb+desde+cero+espanol",
      },
      {
        titulo: "MongoDB Atlas tutorial",
        url: "https://www.youtube.com/results?search_query=mongodb+atlas+tutorial+espanol",
      },
    ],
  },
  {
    key: "mongoose",
    titulo: "Mongoose",
    descripcionCorta:
      "ODM para definir modelos, schemas y validaciones de MongoDB en Node.js.",
    descripcionLarga:
      "Mongoose es un ODM (Object Document Mapper) que añade una capa de abstracción sobre el driver nativo de MongoDB. Permite definir schemas (estructura y tipos de cada campo), validaciones (requerido, minLength, enum, custom), métodos de instancia y estáticos, middlewares pre/post (hooks como hashear la contraseña antes de guardar), y relaciones entre documentos (referencias con `populate`). En KidoTag el schema de Alumno define que `nfcUid` es único, que `grado` es un enum y que la referencia a `grupo` es un ObjectId.",
    ejemplo:
      "`const alumnoSchema = new Schema({ nombre: { type: String, required: true }, nfcUid: { type: String, unique: true }, grupo: { type: ObjectId, ref: 'Grupo' } })`. Con `await Alumno.findOne({ nfcUid }).populate('grupo')` obtienes el alumno con los datos del grupo incluidos.",
    videos: [
      {
        titulo: "Mongoose tutorial completo",
        url: "https://www.youtube.com/results?search_query=mongoose+tutorial+completo+espanol",
      },
    ],
  },
  {
    key: "populate",
    titulo: "Populate",
    descripcionCorta:
      "Método de Mongoose para resolver referencias entre documentos automáticamente.",
    descripcionLarga:
      "En MongoDB los documentos pueden referenciar otros documentos por su `_id`. `populate()` de Mongoose resuelve esas referencias haciendo consultas adicionales y reemplazando el ObjectId con el documento completo. Es equivalente a un JOIN en SQL pero a nivel de aplicación. Se puede hacer populate anidado (`populate({ path: 'grupo', populate: 'escuela' })`). En KidoTag al cargar una asistencia, se hace populate del alumno y su grupo para mostrar nombre, grado y escuela en el dashboard.",
    ejemplo:
      "`const asistencias = await Asistencia.find({ fecha: hoy }).populate('alumno', 'nombre grado').populate('grupo', 'nombre')`. El resultado incluye los datos del alumno y grupo sin necesitar múltiples consultas manuales.",
    videos: [
      {
        titulo: "Populate en Mongoose explicado",
        url: "https://www.youtube.com/results?search_query=populate+mongoose+explicado+espanol",
      },
    ],
  },
  // ── Auth y seguridad ───────────────────────────────────────────────────────
  {
    key: "jwt",
    titulo: "JWT (JSON Web Token)",
    descripcionCorta:
      "Token compacto y firmado para autenticar peticiones sin estado en servidor.",
    descripcionLarga:
      "Un JWT tiene tres partes separadas por puntos: Header (algoritmo), Payload (claims: userId, rol, expiración) y Signature (HMAC o RSA). El servidor firma el token con un secreto al hacer login. El cliente lo guarda (localStorage o cookie httpOnly) y lo envía en el header `Authorization: Bearer <token>` en cada petición. El servidor verifica la firma y extrae los claims sin consultar la base de datos. Si el token es manipulado, la verificación falla. En KidoTag el payload incluye `{ userId, rol: 'profesor'|'tutor'|'admin', grupoId }`.",
    ejemplo:
      "Al hacer login, el servidor responde `{ token: 'eyJ...' }`. El frontend guarda el token y en cada fetch agrega: `headers: { Authorization: 'Bearer ' + token }`. El middleware verifica: si expira en 1h y pasaron 2h, devuelve 401 y el frontend redirige al login.",
    videos: [
      {
        titulo: "JWT desde cero con Node.js",
        url: "https://www.youtube.com/results?search_query=jwt+desde+cero+node+espanol",
      },
      {
        titulo: "Autenticación JWT completa",
        url: "https://www.youtube.com/results?search_query=autenticacion+jwt+completa+espanol",
      },
    ],
  },
  {
    key: "bcrypt",
    titulo: "Bcrypt",
    descripcionCorta:
      "Algoritmo para hashear contraseñas de forma segura e irreversible.",
    descripcionLarga:
      "Bcrypt es una función de hash diseñada específicamente para contraseñas. A diferencia de MD5 o SHA, bcrypt es deliberadamente lento (ajustable con el 'cost factor' o 'rounds'). Agrega un 'salt' aleatorio automáticamente para que dos contraseñas iguales produzcan hashes diferentes. Nunca se puede 'deshacer' el hash (es unidireccional). Para verificar, se hashea el intento con el mismo salt y se compara con el hash guardado. En KidoTag, el middleware `pre-save` de Mongoose hashea la contraseña antes de guardar cualquier usuario.",
    ejemplo:
      "`const hash = await bcrypt.hash(password, 12)`. Al hacer login: `const esValida = await bcrypt.compare(passwordIngresada, usuario.password)`. Si el resultado es `false`, se rechaza con 401. Nunca guardes contraseñas en texto plano.",
    videos: [
      {
        titulo: "Bcrypt y hashing de contraseñas",
        url: "https://www.youtube.com/results?search_query=bcrypt+hashing+contrasenas+espanol",
      },
    ],
  },
  {
    key: "auth",
    titulo: "Autenticación",
    descripcionCorta:
      "Proceso para verificar que el usuario es quien dice ser.",
    descripcionLarga:
      "Autenticación responde a la pregunta '¿quién eres?'. El flujo típico en KidoTag: el usuario envía email y contraseña, el servidor verifica contra la base de datos usando bcrypt, si es válido firma un JWT con los datos del usuario y lo devuelve. El cliente guarda el token y lo envía en cada petición. El middleware verifica el token. Si expira, el usuario debe volver a autenticarse. La autenticación es diferente de la autorización (qué puede hacer). Un usuario puede estar autenticado pero no autorizado para ver los datos de otro grupo.",
    ejemplo:
      "Un profesor intenta acceder al dashboard. Sin token válido, el middleware responde 401. Con token válido pero vencido, también 401. Solo con token válido y vigente, `req.user` se llena con `{ id, rol: 'profesor' }` y pasa al controlador.",
    videos: [
      {
        titulo: "Autenticación con JWT en Express",
        url: "https://www.youtube.com/results?search_query=autenticacion+jwt+express+espanol",
      },
    ],
  },
  {
    key: "autorizacion",
    titulo: "Autorización (RBAC)",
    descripcionCorta:
      "Control de qué acciones puede realizar cada rol de usuario.",
    descripcionLarga:
      "La autorización responde a '¿qué puedes hacer?'. RBAC (Role-Based Access Control) asigna permisos por rol. En KidoTag existen roles: `admin` (gestiona escuelas y usuarios), `profesor` (ve y gestiona su grupo), `tutor` (solo ve asistencias de sus hijos). Un middleware `requireRole('profesor')` verifica que `req.user.rol` sea el correcto antes de ejecutar el controlador. Si un tutor intenta acceder a la lista completa de alumnos de un grupo ajeno, recibe 403 Forbidden aunque esté autenticado.",
    ejemplo:
      "`const requireRole = (...roles) => (req, res, next) => { if (!roles.includes(req.user.rol)) return res.status(403).json({ error: 'Acceso denegado' }); next(); }`. Uso: `router.delete('/alumnos/:id', authMiddleware, requireRole('admin', 'profesor'), controller.eliminar)`.",
    videos: [
      {
        titulo: "RBAC autorización en Node.js",
        url: "https://www.youtube.com/results?search_query=rbac+autorizacion+nodejs+espanol",
      },
    ],
  },
  {
    key: "seguridad",
    titulo: "Seguridad web",
    descripcionCorta:
      "Prácticas para proteger datos, usuarios y accesos en la aplicación.",
    descripcionLarga:
      "La seguridad web abarca múltiples capas: hashear contraseñas con bcrypt, validar y sanear todos los inputs para prevenir inyección, usar HTTPS en producción, configurar CORS restrictivo, almacenar secretos en variables de entorno, establecer expiración de tokens JWT, implementar rate limiting para prevenir fuerza bruta, usar headers HTTP de seguridad (Helmet), y validar permisos en el backend (nunca confiar solo en el frontend). Las vulnerabilidades más comunes son las del OWASP Top 10: inyección, broken auth, exposición de datos, etc.",
    ejemplo:
      "En KidoTag: `app.use(helmet())` agrega headers de seguridad. `express-rate-limit` limita 5 intentos de login por IP por minuto. El JWT expira en 1h. Las contraseñas usan 12 rounds de bcrypt. Los inputs del ESP32 se validan con Joi antes de tocar la base de datos.",
    videos: [
      {
        titulo: "Seguridad en APIs Node.js",
        url: "https://www.youtube.com/results?search_query=seguridad+api+nodejs+espanol",
      },
    ],
  },
  // ── Tiempo real ───────────────────────────────────────────────────────────
  {
    key: "socketio",
    titulo: "Socket.IO",
    descripcionCorta:
      "Librería para comunicación bidireccional en tiempo real entre cliente y servidor.",
    descripcionLarga:
      "Socket.IO establece una conexión persistente (WebSocket con fallback a long-polling) entre cliente y servidor. A diferencia de HTTP (petición-respuesta), Socket.IO permite que el servidor empuje datos al cliente sin que éste los solicite. Los eventos se emiten con `io.emit(evento, datos)` y se escuchan con `socket.on(evento, handler)`. Soporta rooms (grupos de conexiones) para enviar eventos solo a usuarios específicos. En KidoTag, cuando el ESP32 registra una nueva asistencia, el backend emite el evento `nueva-asistencia` y todos los frontends conectados actualizan la UI instantáneamente.",
    ejemplo:
      "Backend: `io.to(grupoId).emit('nueva-asistencia', { alumno, hora })`. Frontend React: `socket.on('nueva-asistencia', (data) => setAlumnos(prev => prev.map(a => a.id === data.alumno.id ? {...a, presente: true} : a)))`. El docente ve la tarjeta cambiar a verde en tiempo real.",
    videos: [
      {
        titulo: "Socket.IO desde cero con React",
        url: "https://www.youtube.com/results?search_query=socketio+react+desde+cero+espanol",
      },
      {
        titulo: "Tiempo real con Socket.IO y Node",
        url: "https://www.youtube.com/results?search_query=tiempo+real+socketio+node+espanol",
      },
    ],
  },
  // ── Hardware IoT ──────────────────────────────────────────────────────────
  {
    key: "nfc",
    titulo: "NFC",
    descripcionCorta:
      "Tecnología inalámbrica de corto alcance para leer etiquetas de identificación.",
    descripcionLarga:
      "NFC (Near Field Communication) es un estándar de comunicación inalámbrica que opera a 13.56 MHz y funciona a distancias de hasta 4 cm. Las etiquetas NFC (tags) contienen un chip con un identificador único (UID). Los lectores NFC pueden leer este UID en milisegundos sin que el tag tenga batería. En KidoTag, cada alumno tiene un tag NFC en su mochila o credencial. Al acercarla al lector ESP32 a la entrada del salón, el sistema registra automáticamente su llegada. El UID se envía a la API para identificar al alumno y crear el registro de asistencia.",
    ejemplo:
      "El alumno acerca su credencial al lector. El ESP32 lee el UID `A3:F2:B1:8C`, hace `POST /api/asistencias` con ese UID, la API busca al alumno correspondiente y crea el registro con timestamp. El frontend muestra '✅ Ana García — 07:58'.",
    videos: [
      {
        titulo: "NFC y RFID explicados",
        url: "https://www.youtube.com/results?search_query=nfc+rfid+explicados+espanol",
      },
    ],
  },
  {
    key: "esp32",
    titulo: "ESP32",
    descripcionCorta:
      "Microcontrolador con WiFi que lee tags NFC y envía datos a la API.",
    descripcionLarga:
      "El ESP32 es un microcontrolador de bajo costo con WiFi y Bluetooth integrado, fabricado por Espressif. Se programa en C++ con el framework Arduino (PlatformIO). En KidoTag el ESP32 está conectado a un módulo lector NFC (PN532), se conecta al WiFi del salón, y cuando detecta un tag NFC envía la lectura a la API de KidoTag vía HTTP POST. El código maneja: inicialización del lector PN532, bucle de lectura, debounce (evitar lecturas repetidas del mismo tag), conexión WiFi y serialización del payload JSON.",
    ejemplo:
      'Cuando el lector detecta el tag `A3:F2:...`, el ESP32 construye el JSON `{"nfcUid": "A3F2B18C", "dispositivoId": "salon-3A"}` y hace `http.POST("http://api.kidotag.com/api/asistencias", payload)`. Si la respuesta es 200, enciende el LED verde 1 segundo.',
    videos: [
      {
        titulo: "ESP32 con Arduino y HTTP",
        url: "https://www.youtube.com/results?search_query=esp32+arduino+http+request+espanol",
      },
      {
        titulo: "ESP32 lector NFC PN532",
        url: "https://www.youtube.com/results?search_query=esp32+pn532+nfc+espanol",
      },
    ],
  },
  // ── Programación asíncrona ─────────────────────────────────────────────────
  {
    key: "async-await",
    titulo: "Async / Await",
    descripcionCorta:
      "Sintaxis para escribir código asíncrono de forma secuencial y legible.",
    descripcionLarga:
      "JavaScript es single-threaded pero no bloqueante. Las operaciones lentas (consultas a BD, fetch HTTP, lectura de archivos) son asíncronas y devuelven Promises. `async/await` es azúcar sintáctica sobre Promises que permite escribir código asíncrono con apariencia sincrónica. Una función `async` siempre devuelve una Promise. Dentro de ella, `await` pausa la ejecución hasta que la Promise se resuelve, sin bloquear el event loop. El manejo de errores se hace con `try/catch`, equivalente a `.catch()` en promesas encadenadas.",
    ejemplo:
      "En KidoTag: `async function registrarAsistencia(uid) { try { const alumno = await Alumno.findOne({ nfcUid: uid }); if (!alumno) throw new Error('UID no registrado'); const reg = await Asistencia.create({ alumno: alumno._id }); return reg; } catch(err) { console.error(err); throw err; } }`. Sin async/await sería un infierno de callbacks anidados.",
    videos: [
      {
        titulo: "Async Await desde cero",
        url: "https://www.youtube.com/results?search_query=async+await+javascript+desde+cero+espanol",
      },
    ],
  },
  {
    key: "promesas",
    titulo: "Promesas (Promises)",
    descripcionCorta:
      "Objeto que representa el resultado eventual de una operación asíncrona.",
    descripcionLarga:
      "Una Promise es un objeto que puede estar en tres estados: `pending` (esperando), `fulfilled` (resuelto con valor) o `rejected` (fallido con error). Se crea con `new Promise((resolve, reject) => {...})`. Se consume con `.then(valor => ...)` para el éxito y `.catch(err => ...)` para el error. `async/await` es la forma moderna de consumir promesas. La mayoría de las APIs de Node.js (fs, http, Mongoose) y del navegador (fetch, IndexedDB) devuelven promesas. Entender el modelo de ejecución del event loop es clave para escribir código asíncrono correcto.",
    ejemplo:
      "`const fetchAlumnos = () => new Promise((resolve) => setTimeout(() => resolve(DATA), 400))`. Esta función simula una llamada a API con retraso. El frontend la consume con `fetchAlumnos().then(setAlumnos)` o `const data = await fetchAlumnos()`.",
    videos: [
      {
        titulo: "Promesas en JavaScript explicadas",
        url: "https://www.youtube.com/results?search_query=promesas+javascript+explicadas+espanol",
      },
    ],
  },
  {
    key: "fetch",
    titulo: "Fetch API",
    descripcionCorta:
      "API nativa del navegador para hacer peticiones HTTP con Promises.",
    descripcionLarga:
      "La Fetch API reemplaza a XMLHttpRequest con una interfaz más moderna y basada en Promises. `fetch(url, options)` devuelve una Promise con un objeto Response. Para leer el body como JSON se llama a `.json()` que también es asíncrono. Importante: fetch solo rechaza (lanza error) cuando hay fallo de red, no por status 4xx o 5xx, por lo que hay que verificar `response.ok` o `response.status` manualmente. En producción se complementa con AbortController para cancelar peticiones y con manejo de timeout.",
    ejemplo:
      "`async function guardarAlumno(datos) { const res = await fetch('/api/alumnos', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(datos) }); if (!res.ok) throw new Error(await res.text()); return res.json(); }`",
    videos: [
      {
        titulo: "Fetch API completo en español",
        url: "https://www.youtube.com/results?search_query=fetch+api+completo+espanol",
      },
    ],
  },
  // ── Estilos y UX ─────────────────────────────────────────────────────────
  {
    key: "css",
    titulo: "CSS",
    descripcionCorta:
      "Lenguaje para definir el estilo visual de la interfaz web.",
    descripcionLarga:
      "CSS (Cascading Style Sheets) controla la presentación de HTML: colores, tipografía, espaciado, layout (Flexbox, Grid), animaciones y diseño responsivo. Las variables CSS (`--color-accent`, `--font-mono`) permiten un sistema de diseño coherente y fácil de modificar globalmente. Las media queries adaptan el layout a diferentes tamaños de pantalla. En KidoTag se usa un sistema de variables CSS en `:root` para todos los colores, tamaños y sombras, garantizando consistencia visual en el dashboard del docente, el panel del tutor y las notificaciones.",
    ejemplo:
      "`.tarjeta.presente { border-left: 4px solid var(--color-success); background: var(--color-success-soft); }` — Una tarjeta verde con borde left indica alumno presente. La misma variable `--color-success` se reutiliza en badges, mensajes y botones de confirmación.",
    videos: [
      {
        titulo: "CSS desde cero completo",
        url: "https://www.youtube.com/results?search_query=css+desde+cero+completo+espanol",
      },
      {
        titulo: "Flexbox y Grid CSS explicados",
        url: "https://www.youtube.com/results?search_query=flexbox+grid+css+espanol",
      },
    ],
  },
  {
    key: "ux",
    titulo: "UX (Experiencia de Usuario)",
    descripcionCorta:
      "Diseño centrado en facilitar el uso claro, eficiente y satisfactorio de la app.",
    descripcionLarga:
      "UX (User Experience) busca que los usuarios logren sus objetivos con el mínimo esfuerzo y confusión. Implica: jerarquía visual clara (qué es más importante a primera vista), estados de carga para evitar incertidumbre, mensajes de error descriptivos y accionables, feedback inmediato ante acciones del usuario, flujos predecibles y consistentes. En KidoTag un docente debe poder tomar asistencia de 30 alumnos en segundos. Cada segundo de carga extra, cada error sin mensaje claro y cada paso innecesario impacta la adopción del sistema.",
    ejemplo:
      "Al marcar presente: aparece '✅ Guardado' por 2 segundos (feedback). Al perder conexión: banner 'Sin internet — los cambios se guardarán al reconectar' (transparencia). Al filtrar 'ausentes' y no haber ninguno: '✓ Todos presentes hoy' (estado vacío informativo).",
    videos: [
      {
        titulo: "Principios de UX para desarrolladores",
        url: "https://www.youtube.com/results?search_query=principios+ux+desarrolladores+espanol",
      },
    ],
  },
  // ── Módulos y herramientas ────────────────────────────────────────────────
  {
    key: "modulos",
    titulo: "Módulos ES (import / export)",
    descripcionCorta:
      "Sistema nativo de JavaScript para dividir el código en archivos reutilizables.",
    descripcionLarga:
      "Los módulos ES permiten dividir el código en archivos independientes con scope propio. Con `export` se expone lo que otros archivos pueden usar y con `import` se consume. Hay exports nombrados (`export function fetchAlumnos()`) y exports por defecto (`export default function App()`). En Node.js también existe CommonJS (`require/module.exports`), que convive con ES Modules. Vite y el navegador moderno soportan ES Modules nativamente. En KidoTag cada componente, hook, utilidad y controlador es un módulo separado, lo que facilita el mantenimiento y las pruebas.",
    ejemplo:
      "`// api.js: export function fetchAlumnos() {...}` — `// App.jsx: import { fetchAlumnos } from './api'`. El componente `App` importa solo lo que necesita. Si `api.js` cambia internamente, los demás módulos no se ven afectados.",
    videos: [
      {
        titulo: "Módulos ES import export JavaScript",
        url: "https://www.youtube.com/results?search_query=modulos+es+import+export+javascript+espanol",
      },
    ],
  },
  {
    key: "localstorage",
    titulo: "localStorage / sessionStorage",
    descripcionCorta:
      "Almacenamiento del navegador para persistir datos entre sesiones.",
    descripcionLarga:
      "El navegador ofrece dos storages de clave-valor: `localStorage` (persiste hasta que el usuario lo borra) y `sessionStorage` (se borra al cerrar la pestaña). Ambos almacenan solo strings, por lo que hay que usar `JSON.stringify/parse` para objetos. Se usan para guardar tokens de sesión, preferencias de usuario, datos en caché, y progreso de formularios. En KidoTag se usa localStorage para guardar el progreso del sandbox de cada lección del curso, y sessionStorage para la configuración temporal de sandboxes abiertos.",
    ejemplo:
      "`localStorage.setItem('kidotag-token', token)` — guarda el JWT. Al iniciar la app: `const token = localStorage.getItem('kidotag-token')`. Para cerrar sesión: `localStorage.removeItem('kidotag-token')` y navegar al login.",
    videos: [
      {
        titulo: "localStorage y sessionStorage explicados",
        url: "https://www.youtube.com/results?search_query=localstorage+sessionstorage+javascript+espanol",
      },
    ],
  },
  {
    key: "crud",
    titulo: "CRUD",
    descripcionCorta:
      "Las cuatro operaciones básicas de persistencia: Crear, Leer, Actualizar y Eliminar.",
    descripcionLarga:
      "CRUD (Create, Read, Update, Delete) describe las operaciones fundamentales de cualquier sistema de datos. Se mapean a verbos HTTP en una API REST: Create=POST, Read=GET, Update=PUT/PATCH, Delete=DELETE. En Mongoose se implementan con: `Model.create()`, `Model.find()/findById()`, `Model.findByIdAndUpdate()`, `Model.findByIdAndDelete()`. En KidoTag todos los recursos (alumnos, grupos, asistencias, anuncios) tienen operaciones CRUD. El diseño de la API gira en torno a estos cuatro tipos de operaciones.",
    ejemplo:
      "Para gestionar alumnos: `POST /api/alumnos` (Create), `GET /api/alumnos` (Read list), `GET /api/alumnos/:id` (Read one), `PUT /api/alumnos/:id` (Update), `DELETE /api/alumnos/:id` (Delete). El frontend consume estos endpoints desde React con fetch.",
    videos: [
      {
        titulo: "CRUD con Express y MongoDB",
        url: "https://www.youtube.com/results?search_query=crud+express+mongodb+espanol",
      },
    ],
  },
  {
    key: "schema",
    titulo: "Schema / Validación",
    descripcionCorta:
      "Estructura que define los campos, tipos y reglas de validación de un modelo de datos.",
    descripcionLarga:
      "Un schema define la forma esperada de los datos: qué campos existen, de qué tipo son, si son requeridos, sus valores válidos (enum), longitudes mínimas/máximas y validaciones personalizadas. En Mongoose los schemas se definen con `new Schema({...})`. En el frontend con TypeScript se usan interfaces y tipos. Para validar el body de peticiones HTTP se pueden usar librerías como Joi, Yup o Zod. La validación debe hacerse siempre en el backend (el frontend puede ser eludido). En KidoTag el schema de Asistencia incluye alumno (ObjectId requerido), hora (Date), tipo ('llegada'|'salida') y dispositivoId.",
    ejemplo:
      "`const asistenciaSchema = new Schema({ alumno: { type: ObjectId, ref: 'Alumno', required: true }, hora: { type: Date, default: Date.now }, tipo: { type: String, enum: ['llegada', 'salida'], default: 'llegada' } })`. Si el ESP32 envía `tipo: 'entrada'` (no está en el enum), Mongoose rechaza el documento.",
    videos: [
      {
        titulo: "Validación con Mongoose Schema",
        url: "https://www.youtube.com/results?search_query=validacion+mongoose+schema+espanol",
      },
    ],
  },
  // ── Entidades del dominio KidoTag ─────────────────────────────────────────
  {
    key: "asistencia",
    titulo: "Asistencia",
    descripcionCorta:
      "Registro de llegada o salida de un alumno vinculado a una lectura NFC.",
    descripcionLarga:
      "En KidoTag, una asistencia es un documento MongoDB que registra: el alumno (referencia), la hora exacta del evento, el tipo ('llegada' o 'salida'), el dispositivo que realizó la lectura y la fecha del día escolar. Cada vez que el ESP32 lee un tag NFC, crea un registro de asistencia. El sistema consolida estas lecturas para generar reportes diarios, semanales y mensuales. Los tutores pueden ver en tiempo real si su hijo llegó. Los profesores ven el resumen del grupo. Los reportes se pueden exportar a CSV.",
    ejemplo:
      "`{ alumno: ObjectId('Ana García'), hora: '2026-05-23T07:58:00Z', tipo: 'llegada', dispositivoId: 'lector-salon-3A', fechaEscolar: '2026-05-23' }`. El frontend muestra: 'Ana García — Llegó a las 07:58 ✅'.",
    videos: [
      {
        titulo: "Sistema de asistencia con Node y React",
        url: "https://www.youtube.com/results?search_query=sistema+asistencia+node+react+espanol",
      },
    ],
  },
  {
    key: "rol",
    titulo: "Rol de usuario",
    descripcionCorta:
      "Categoría que determina los permisos y vistas disponibles para cada tipo de usuario.",
    descripcionLarga:
      "KidoTag tiene tres roles principales: `admin` (gestiona la escuela: crea grupos, registra alumnos, genera reportes globales), `profesor` (ve su grupo, toma asistencia manual, envía anuncios a tutores), `tutor` (padre/madre, recibe notificaciones, ve historial de asistencia de sus hijos). Cada rol ve una interfaz diferente: el admin ve estadísticas de toda la escuela, el profesor ve solo su grupo, el tutor solo la información de sus hijos. El backend verifica el rol en cada endpoint con middleware de autorización.",
    ejemplo:
      "El endpoint `GET /api/grupos` con rol `admin` devuelve todos los grupos de la escuela. Con rol `profesor` devuelve solo los grupos que ese profesor imparte. Con rol `tutor` devuelve 403 Forbidden porque los tutores no tienen acceso a la lista de grupos.",
    videos: [
      {
        titulo: "Roles y permisos en aplicaciones web",
        url: "https://www.youtube.com/results?search_query=roles+permisos+aplicaciones+web+espanol",
      },
    ],
  },
  // ── Nuevas entradas wiki ─────────────────────────────────────────────────
  {
    key: "git",
    titulo: "Git",
    descripcionCorta:
      "Sistema de control de versiones distribuido para rastrear cambios en el código.",
    descripcionLarga:
      "Git permite guardar el historial completo de tu proyecto, trabajar en ramas paralelas y colaborar con otros desarrolladores sin pisar el código ajeno. Los comandos básicos son git init, git add, git commit, git push y git pull. Con Git puedes revertir errores, comparar versiones y mantener código en producción mientras desarrollas nuevas funciones.",
    ejemplo:
      "En KidoTag usas git commit -m 'feat: registro NFC de asistencia' para guardar cada avance, y git push para subir el código al repositorio compartido del equipo.",
    videos: [
      {
        titulo: "Git y GitHub desde cero en español",
        url: "https://www.youtube.com/results?search_query=git+github+desde+cero+espanol",
      },
    ],
  },
  {
    key: "cli",
    titulo: "CLI (Interfaz de Línea de Comandos)",
    descripcionCorta:
      "Terminal de texto para ejecutar programas y navegar el sistema de archivos.",
    descripcionLarga:
      "La CLI (Command Line Interface) permite interactuar con el sistema operativo escribiendo comandos de texto en lugar de hacer clics. Es fundamental para un desarrollador: ejecutas npm install, inicias servidores con node index.js, navegas entre carpetas con cd y creas archivos con touch. Dominar la terminal acelera enormemente el flujo de trabajo.",
    ejemplo:
      "En KidoTag abrís la terminal, vas a la carpeta api/ con cd kidotag10/api y ejecutás npm run dev para arrancar el servidor Express en modo desarrollo.",
    videos: [
      {
        titulo: "Terminal y línea de comandos para principiantes",
        url: "https://www.youtube.com/results?search_query=terminal+linea+comandos+principiantes+espanol",
      },
    ],
  },
  {
    key: "html",
    titulo: "HTML",
    descripcionCorta:
      "Lenguaje de marcado que define la estructura de las páginas web.",
    descripcionLarga:
      "HTML (HyperText Markup Language) usa etiquetas como <div>, <p>, <h1>, <form> y <button> para dar estructura semántica al contenido. Aunque en React trabajas con JSX (que se parece a HTML), el resultado final siempre es HTML que interpreta el navegador. Entender HTML te ayuda a construir componentes accesibles y semánticamente correctos.",
    ejemplo:
      "El panel de asistencias de KidoTag es en el fondo un <table> HTML con filas <tr> por alumno, aunque en React lo escribís como JSX con map() sobre el array de alumnos.",
    videos: [
      {
        titulo: "HTML desde cero en español",
        url: "https://www.youtube.com/results?search_query=html+desde+cero+espanol",
      },
    ],
  },
  {
    key: "cliente-servidor",
    titulo: "Arquitectura Cliente-Servidor",
    descripcionCorta:
      "Modelo donde el cliente solicita recursos y el servidor los provee.",
    descripcionLarga:
      "En la arquitectura cliente-servidor, el cliente (navegador, app móvil, ESP32) envía peticiones HTTP y el servidor (Node.js/Express) las procesa y devuelve respuestas. Son procesos separados que se comunican por la red. Esta separación permite escalar cada parte independientemente y reutilizar el mismo backend para múltiples clientes.",
    ejemplo:
      "En KidoTag el ESP32 (cliente) envía el UID de la tarjeta NFC al servidor Express (servidor) mediante un POST /api/asistencias. El servidor consulta MongoDB y responde con el nombre del alumno.",
    videos: [
      {
        titulo: "Arquitectura cliente servidor explicada",
        url: "https://www.youtube.com/results?search_query=arquitectura+cliente+servidor+explicada+espanol",
      },
    ],
  },
  {
    key: "hoisting",
    titulo: "Hoisting",
    descripcionCorta:
      "Comportamiento de JavaScript que mueve declaraciones al tope del ámbito.",
    descripcionLarga:
      "Hoisting es el mecanismo por el que JavaScript 'eleva' las declaraciones de variables (var) y funciones al inicio de su ámbito antes de ejecutar el código. Las funciones declaradas con function son completamente hoisted (puedes llamarlas antes de declararlas), mientras que var se eleva pero no su valor. let y const no son hoisted de la misma forma y causan un error si se usan antes de declararse.",
    ejemplo:
      "Si en un archivo de utilidades usás function calcularXP(){...} al final del archivo pero la invocás al principio, funciona por hoisting. Con const calcularXP = () => {...} tendrías un error.",
    videos: [
      {
        titulo: "Hoisting en JavaScript explicado",
        url: "https://www.youtube.com/results?search_query=hoisting+javascript+espanol",
      },
    ],
  },
  {
    key: "closure",
    titulo: "Closure",
    descripcionCorta:
      "Función que recuerda las variables del ámbito donde fue creada.",
    descripcionLarga:
      "Un closure ocurre cuando una función interna tiene acceso a variables de su función externa incluso después de que esta última haya terminado de ejecutarse. Es la base de muchos patrones en JavaScript: módulos, callbacks con estado, hooks de React. Cada llamada a useState internamente usa closures para mantener el valor del estado entre renders.",
    ejemplo:
      "El hook useProgress() retorna funciones que 'cierran' sobre el estado interno del progreso. Cuando llamás incrementarXP(), esa función recuerda y modifica el estado gracias a los closures.",
    videos: [
      {
        titulo: "Closures en JavaScript en español",
        url: "https://www.youtube.com/results?search_query=closures+javascript+espanol",
      },
    ],
  },
  {
    key: "event-loop",
    titulo: "Event Loop",
    descripcionCorta:
      "Mecanismo que permite a JavaScript ejecutar código asíncrono sin bloquear.",
    descripcionLarga:
      "JavaScript es single-threaded (un solo hilo), pero el Event Loop le permite manejar operaciones asíncronas como peticiones de red o timers sin bloquear la ejecución. Cuando usás await fetch(), el hilo continúa ejecutando otro código mientras espera la respuesta. Al completarse, la respuesta se coloca en la cola de microtareas y el Event Loop la procesa.",
    ejemplo:
      "Cuando el panel de KidoTag carga la lista de alumnos con await fetch('/api/alumnos'), el Event Loop permite que la UI siga respondiendo a clicks mientras espera los datos del servidor.",
    videos: [
      {
        titulo: "Event Loop de JavaScript en español",
        url: "https://www.youtube.com/results?search_query=event+loop+javascript+espanol",
      },
    ],
  },
  {
    key: "destructuring",
    titulo: "Destructuring",
    descripcionCorta:
      "Sintaxis para extraer valores de arrays u objetos en variables individuales.",
    descripcionLarga:
      "El destructuring de ES6 permite desempacar valores de arrays o propiedades de objetos en variables distintas con una sintaxis concisa. Es omnipresente en React: const { nombre, email } = alumno extrae propiedades del objeto, const [estado, setEstado] = useState() desempaca el array retornado por el hook. Hace el código más legible y reduce la repetición.",
    ejemplo:
      "En los componentes de KidoTag usás const { nombre, nivel, xp } = props para acceder directamente a las propiedades sin escribir props.nombre, props.nivel cada vez.",
    videos: [
      {
        titulo: "Destructuring en JavaScript y React",
        url: "https://www.youtube.com/results?search_query=destructuring+javascript+react+espanol",
      },
    ],
  },
  {
    key: "spread",
    titulo: "Spread / Rest (...)",
    descripcionCorta:
      "Operador que expande o agrupa elementos de arrays y objetos.",
    descripcionLarga:
      "El operador spread (...) expande un iterable en sus elementos individuales. En objetos copia las propiedades: {...alumno, presente: true} crea un nuevo objeto con todas las propiedades de alumno más presente. En arrays [...lista, nuevoItem] crea un nuevo array. El operador rest hace lo contrario: agrupa el resto de argumentos en un array, como en function log(primero, ...resto).",
    ejemplo:
      "Al actualizar el estado de un alumno en KidoTag: setAlumno(prev => ({...prev, asistencias: prev.asistencias + 1})) usás spread para copiar el objeto anterior y solo modificar un campo.",
    videos: [
      {
        titulo: "Spread y Rest en JavaScript en español",
        url: "https://www.youtube.com/results?search_query=spread+rest+javascript+espanol",
      },
    ],
  },
  {
    key: "usestate",
    titulo: "useState",
    descripcionCorta:
      "Hook de React para declarar y actualizar estado en componentes funcionales.",
    descripcionLarga:
      "useState es el hook más usado en React. Recibe un valor inicial y retorna un array con el valor actual y una función para actualizarlo. Cuando llamás a la función setter, React re-renderiza el componente con el nuevo valor. Es la forma de hacer que la UI reaccione a cambios: datos cargados, formularios, toggles, contadores.",
    ejemplo:
      "En el panel de asistencias: const [alumnos, setAlumnos] = useState([]). Cuando llega la respuesta de la API, setAlumnos(data) actualiza el estado y React re-renderiza la tabla automáticamente.",
    videos: [
      {
        titulo: "useState hook de React en español",
        url: "https://www.youtube.com/results?search_query=usestate+hook+react+espanol",
      },
    ],
  },
  {
    key: "mvc",
    titulo: "MVC (Modelo-Vista-Controlador)",
    descripcionCorta:
      "Patrón arquitectónico que separa la lógica de datos, presentación y control.",
    descripcionLarga:
      "MVC divide la aplicación en tres capas: el Modelo maneja los datos y la lógica de negocio (schemas de Mongoose, funciones de base de datos), la Vista presenta la información al usuario (componentes React, HTML), y el Controlador recibe las peticiones, coordina el modelo y devuelve la respuesta (funciones de controlador en Express). Esta separación facilita el mantenimiento y el testing.",
    ejemplo:
      "En el backend de KidoTag: Alumno.js es el Modelo (schema Mongoose), alumnoController.js es el Controlador (lógica getAlumnos, crearAlumno), y el frontend React es la Vista que muestra los datos.",
    videos: [
      {
        titulo: "Patrón MVC explicado en español",
        url: "https://www.youtube.com/results?search_query=patron+mvc+explicado+espanol",
      },
    ],
  },
  {
    key: "websockets",
    titulo: "WebSockets",
    descripcionCorta:
      "Protocolo de comunicación bidireccional y persistente entre cliente y servidor.",
    descripcionLarga:
      "A diferencia de HTTP (donde el cliente siempre inicia la petición), WebSockets establece un canal de comunicación permanente donde tanto cliente como servidor pueden enviar mensajes en cualquier momento. Socket.IO usa WebSockets como transporte principal. Son ideales para aplicaciones en tiempo real: notificaciones instantáneas, dashboards en vivo, juegos multijugador.",
    ejemplo:
      "En KidoTag el servidor emite socket.emit('nueva-asistencia', datos) cuando detecta una tarjeta NFC, y todos los navegadores conectados reciben la notificación sin necesidad de hacer polling.",
    videos: [
      {
        titulo: "WebSockets en JavaScript en español",
        url: "https://www.youtube.com/results?search_query=websockets+javascript+espanol",
      },
    ],
  },
  {
    key: "rbac",
    titulo: "RBAC (Control de Acceso Basado en Roles)",
    descripcionCorta:
      "Sistema de permisos donde cada usuario tiene un rol que define qué puede hacer.",
    descripcionLarga:
      "RBAC (Role-Based Access Control) asigna permisos a roles en lugar de a usuarios individuales. Un usuario tiene un rol (admin, tutor, alumno) y ese rol determina qué rutas y recursos puede acceder. Es más escalable que asignar permisos uno a uno. En Express se implementa con middleware que verifica el campo role del JWT antes de ejecutar el controlador.",
    ejemplo:
      "En KidoTag solo los tutores y admins pueden ver el historial de asistencias de todos los alumnos. Un alumno solo puede ver el suyo. El middleware verificaRol('tutor','admin') bloquea el acceso a los demás.",
    videos: [
      {
        titulo: "RBAC control de acceso basado en roles",
        url: "https://www.youtube.com/results?search_query=rbac+control+acceso+roles+express+espanol",
      },
    ],
  },
  {
    key: "css-variables",
    titulo: "CSS Custom Properties (Variables)",
    descripcionCorta:
      "Variables nativas de CSS para reutilizar valores de diseño en toda la hoja de estilos.",
    descripcionLarga:
      "Las CSS Custom Properties (--nombre: valor) permiten definir valores reutilizables en :root o en cualquier selector. A diferencia de variables Sass, estas son dinámicas: se pueden cambiar con JavaScript en tiempo real para implementar temas (dark/light mode). Son la base del sistema de diseño de KidoTag: colores, radios, sombras y transiciones se definen una vez y se usan en todos los componentes.",
    ejemplo:
      "El sistema de colores de KidoTag usa --color-accent, --color-bg-surface, --color-text-primary. Al cambiar entre tema claro y oscuro, solo se redefinien estas variables en :root y toda la UI cambia automáticamente.",
    videos: [
      {
        titulo: "CSS Variables Custom Properties en español",
        url: "https://www.youtube.com/results?search_query=css+variables+custom+properties+espanol",
      },
    ],
  },
  {
    key: "reconciliacion",
    titulo: "Reconciliación de React",
    descripcionCorta:
      "Algoritmo que compara el Virtual DOM anterior con el nuevo para actualizar solo lo necesario.",
    descripcionLarga:
      "Cuando el estado cambia, React genera un nuevo Virtual DOM (árbol de objetos JS) y lo compara con el anterior mediante su algoritmo de reconciliación (diffing). Solo los nodos que realmente cambiaron se actualizan en el DOM real, lo que hace las actualizaciones muy eficientes. La prop key en listas ayuda a React a identificar qué elementos se movieron, agregaron o eliminaron.",
    ejemplo:
      "Cuando agregás una asistencia en KidoTag, React no re-renderiza toda la tabla sino solo la fila del alumno modificado, gracias a la reconciliación con key={alumno._id}.",
    videos: [
      {
        titulo: "Virtual DOM y reconciliación en React",
        url: "https://www.youtube.com/results?search_query=virtual+dom+reconciliacion+react+espanol",
      },
    ],
  },
  {
    key: "openapi",
    titulo: "OpenAPI / Swagger",
    descripcionCorta:
      "Estándar para describir APIs REST de forma legible por máquinas y humanos.",
    descripcionLarga:
      "OpenAPI es la especificación (formato YAML/JSON) que describe todos los endpoints de una API: rutas, métodos HTTP, parámetros, cuerpos de petición, respuestas y autenticación. Swagger es el conjunto de herramientas que generan interfaces visuales interactivas (Swagger UI) a partir de esa especificación. Con swagger-jsdoc en Express podés generar la spec automáticamente desde comentarios en el código.",
    ejemplo:
      "La ruta GET /api/alumnos de KidoTag está documentada en Swagger con su schema de respuesta, parámetros de query y código de error 401. Cualquier desarrollador puede probarla desde /api-docs sin instalar nada.",
    videos: [
      {
        titulo: "Swagger y OpenAPI en Node.js en español",
        url: "https://www.youtube.com/results?search_query=swagger+openapi+nodejs+espanol",
      },
    ],
  },
];

export const GLOSSARY_MAP: Record<string, GlossaryEntry> = Object.fromEntries(
  GLOSSARY.map((item) => [item.key, item]),
);
