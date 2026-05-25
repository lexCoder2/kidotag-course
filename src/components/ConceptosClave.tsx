import type { Bloque, Leccion } from "@/data/curriculum";
import { GLOSSARY_MAP } from "@/data/glossary";
import { KeywordTooltip } from "./KeywordTooltip";

interface Props {
  leccion: Leccion & { bloque: Bloque };
}

// ── Prerequisito específico por lección ──────────────────────────────────────
// Cada entrada describe exactamente qué debes saber ANTES de esta lección.
const LESSON_PREVIO: Record<string, string> = {
  // Bienvenida
  "00-que-es-kidotag":
    "Ninguno. Solo curiosidad sobre sistemas web y control de asistencia escolar.",
  "00-como-usar-el-curso": "Haber abierto el curso. Nada más.",
  "00-setup-entorno":
    "Saber abrir una terminal y ejecutar comandos básicos como cd y ls.",
  "00-librerias-del-proyecto":
    "Haber leído '¿Qué es kidotag10?' para conocer el proyecto que vas a construir.",
  "00-arbol-conocimiento":
    "Haber completado las 4 lecciones anteriores de Bienvenida para que el mapa tenga sentido.",
  // Backend Express
  "01-nodejs-npm":
    "Saber qué es una función en JavaScript y tener Node.js instalado.",
  "01-api-rest":
    "Entender qué hace el navegador cuando escribe una URL y presiona Enter.",
  "01-express-basico":
    "Saber ejecutar un archivo .js con Node.js y haber leído la lección de API REST.",
  "01-middlewares":
    "Haber creado al menos una ruta GET/POST con Express y entender req/res.",
  "01-dotenv-config":
    "Tener un archivo app.js de Express funcionando con al menos una ruta.",
  "01-arquitectura-mvc":
    "Entender rutas, controladores y qué significa req/res en una petición HTTP.",
  "01-respuestas-errores":
    "Haber escrito rutas y controladores en Express; saber qué devuelve res.json().",
  // MongoDB / Mongoose
  "02-mongodb-intro":
    "Saber qué es una base de datos en términos generales. No se requiere SQL.",
  "02-conectar-mongoose":
    "Tener MongoDB corriendo localmente o una URI de Atlas lista.",
  "02-schemas-validadores":
    "Saber conectar Mongoose a MongoDB y conocer qué es un documento.",
  "02-referencias-embebidos":
    "Manejar schemas básicos de Mongoose y ejecutar find() y save().",
  "02-hooks-pre-save":
    "Dominar schemas y validadores; entender por qué no se guardan contraseñas en texto plano.",
  "02-populate":
    "Conocer referencias con ObjectId en schemas y ejecutar consultas simples.",
  "02-indices-rendimiento":
    "Sentirte cómodo con find(), update() y el modelo de datos de kidotag10.",
  "02-operadores-avanzados":
    "Dominar find(), update() y conocer el patrón de queries básico de Mongoose.",
  // Auth JWT
  "03-passwords-seguros":
    "Solo entender qué es un formulario de login. No se necesita código previo.",
  "03-bcrypt": "Haber leído por qué no guardar passwords en texto plano.",
  "03-anatomia-jwt":
    "Conocer qué son los headers HTTP y haber visto Base64 aunque sea de pasada.",
  "03-emitir-tokens":
    "Entender bcrypt.compare() y la estructura header.payload.signature de un JWT.",
  "03-verificar-token":
    "Saber cómo se firma un JWT con jwt.sign() y conocer el patrón middleware de Express.",
  "03-rbac":
    "Tener un middleware verificarToken funcionando que adjunta req.usuario.",
  "03-almacenamiento-token":
    "Entender qué es un JWT, cómo viaja en el header Authorization y qué es XSS.",
  // Swagger
  "04-openapi-intro":
    "Conocer los verbos HTTP (GET, POST, PUT, DELETE) y la estructura de una API REST.",
  "04-swagger-jsdoc":
    "Haber leído la intro de OpenAPI y entender qué es un spec YAML.",
  "04-schemas-seguridad":
    "Conocer las anotaciones JSDoc de swagger-jsdoc y el objeto paths de OpenAPI.",
  "04-swagger-ui-ejercicio":
    "Tener swagger-jsdoc configurado generando un spec válido en /api-docs.",
  // Socket.IO
  "05-websockets-vs-rest":
    "Conocer el ciclo request-response de HTTP y haber usado fetch() o axios.",
  "05-servidor-socketio":
    "Tener un servidor Express corriendo y entender http.createServer().",
  "05-eventos-rooms":
    "Haber instalado Socket.IO y emitido al menos un evento desde el servidor.",
  "05-cliente-react":
    "Manejar useEffect y useState en React; haber visto io.emit() en el servidor.",
  // React Fundamentos
  "06-vite-setup":
    "Conocer npm y tener Node.js instalado. No se necesita React previo.",
  "06-jsx-componentes":
    "Conocer etiquetas HTML básicas y funciones en JavaScript.",
  "06-usestate":
    "Entender el retorno de funciones y el scope de variables en JS.",
  "06-useeffect":
    "Manejar useState sin errores y entender el ciclo de renderizado de React.",
  "06-props-composicion":
    "Haber escrito al menos un componente con useState y entender qué devuelve JSX.",
  "06-inputs-controlados":
    "Conocer props y useState; haber visto un formulario HTML antes.",
  "06-renderizado-listas":
    "Manejar JSX y useState; saber qué es un array en JavaScript.",
  // React Avanzado
  "07-context-api":
    "Haber pasado props por 3 o más niveles de componentes y sentir el dolor del prop drilling.",
  "07-auth-context":
    "Entender createContext, Provider y useContext, y manejar async/await.",
  "07-custom-hooks":
    "Usar useContext, useEffect y useState sin problemas; conocer reglas de hooks.",
  "07-react-router":
    "Tener una app React con múltiples vistas lógicas y querer URLs distintas.",
  "07-rutas-protegidas":
    "Tener React Router instalado con BrowserRouter y Route básicos funcionando.",
  "07-dashboard-pattern":
    "Dominar useState y renderizado condicional con ternario y &&.",
  // Web API
  "08-fetch-api":
    "Entender async/await en JavaScript y saber qué es una promesa.",
  "08-abortsignal-timeout":
    "Haber usado fetch() y entender que las promesas pueden quedarse colgadas.",
  "08-api-config":
    "Haber escrito varios fetch() repetitivos y sentir que hay demasiado código duplicado.",
  "08-bearer-token":
    "Saber qué es un JWT y cómo lo lee el middleware verificarToken en Express.",
  "08-polling-descarga":
    "Tener useEffect con cleanup funcionando y entender setInterval.",
  // Estilos UX
  "09-css-variables":
    "Conocer selectores CSS básicos y la cascada. No se necesita SASS ni preprocesadores.",
  "09-responsive-mobile-first":
    "Entender qué son los media queries y haber visto Flexbox aunque sea brevemente.",
  "09-estados-ui":
    "Tener componentes React que cargan datos con fetch() y muestran resultados.",
  // JS/TS Fundamentos
  "11-js-variables-tipos":
    "Ninguno. Esta lección es apta para quien nunca ha programado.",
  "11-js-condicionales-bucles":
    "Conocer let, const y los tipos string, number y boolean.",
  "11-js-funciones":
    "Entender variables, tipos y al menos un condicional if/else.",
  "11-js-arrays-objetos":
    "Saber escribir funciones y usar un bucle for básico.",
  "11-js-metodos-array":
    "Manejar arrays con push/pop y saber pasar funciones como argumentos.",
  "11-js-asincronia":
    "Entender funciones, callbacks y saber qué hace el navegador con una URL.",
  "11-ts-tipos-basicos":
    "Sentirte cómodo escribiendo funciones y objetos en JavaScript puro.",
  "11-ts-en-react":
    "Conocer los tipos básicos e interfaces de TypeScript y tener un componente React.",
  // Capstone
  "10-flujo-nfc-tiempo-real":
    "Haber completado los módulos de Socket.IO, MongoDB, Express y React Avanzado.",
  "10-exportar-excel":
    "Entender rutas Express, cómo enviar un Buffer como respuesta y cómo usar fetch() desde React.",
};

// ── Tip accionable específico por lección ────────────────────────────────────
const LESSON_TIP: Record<string, string> = {
  // Bienvenida
  "00-que-es-kidotag":
    "Dibuja en papel los 3 roles (tutor, profesor, admin) y qué puede hacer cada uno. Te ayudará en todo el curso.",
  "00-como-usar-el-curso":
    "Ejecuta el primer sandbox ahora mismo aunque no entiendas el código: ver el resultado refuerza la motivación.",
  "00-setup-entorno":
    "Ejecuta node -v, npm -v y mongod --version antes de continuar. Si alguno falla, el resto del curso no arrancará.",
  "00-librerias-del-proyecto":
    "Abre el package.json de kidotag10 mientras lees. Ver la librería en context real acelera la comprensión.",
  "00-arbol-conocimiento":
    "Guarda este mapa como favorito. Vuelve a él cada vez que empieces un módulo nuevo para orientarte.",
  // Backend Express
  "01-nodejs-npm":
    "Crea un package.json desde cero con npm init -y y agrega un script 'dev' que corra tu archivo con nodemon.",
  "01-api-rest":
    "Abre las DevTools (F12 → Network) y observa los verbos y status codes de peticiones reales mientras navegas.",
  "01-express-basico":
    "Modifica el puerto en app.js y agrega una ruta GET /saludo que devuelva tu nombre. Guarda y prueba en el navegador.",
  "01-middlewares":
    "Agrega un console.log en un middleware propio y observa el orden de ejecución con varias rutas.",
  "01-dotenv-config":
    "Nunca comitees el .env: verifica que esté en .gitignore antes de hacer cualquier push.",
  "01-arquitectura-mvc":
    "Traza en papel el flujo de una petición POST /asistencias desde el cliente hasta Mongoose y de vuelta.",
  "01-respuestas-errores":
    "Prueba tu endpoint con un body inválido y verifica que el error handler devuelve el status code correcto.",
  // MongoDB / Mongoose
  "02-mongodb-intro":
    "Abre MongoDB Compass y explora la colección alumnos de kidotag10. Observa cómo difieren los documentos entre sí.",
  "02-conectar-mongoose":
    "Agrega un listener de evento 'error' a la conexión. Desconectar MongoDB mientras corre el servidor y observar el mensaje.",
  "02-schemas-validadores":
    "Intenta guardar un alumno sin el campo 'nombre' requerido y lee el error de validación que devuelve Mongoose.",
  "02-referencias-embebidos":
    "Elige un modelo de kidotag10 con subdocumentos y pregúntate: ¿este dato crece sin límite? Si sí, usa referencia.",
  "02-hooks-pre-save":
    "Añade un console.log dentro del hook pre('save') y comprueba cuándo se ejecuta vs cuándo no (isModified).",
  "02-populate":
    "Usa .populate('tutor', 'nombre email') y observa qué campos extra trae. Luego prueba omitir el segundo argumento.",
  "02-indices-rendimiento":
    "Ejecuta .explain('executionStats') en una consulta con y sin índice para ver la diferencia de documentos escaneados.",
  "02-operadores-avanzados":
    "Combina $in con un rango de fechas en una sola query y mide el tiempo con Date.now() antes y después.",
  // Auth JWT
  "03-passwords-seguros":
    "Pega el hash de un password conocido en jwt.io y observa que no puedes revertirlo. Eso es la garantía del hash.",
  "03-bcrypt":
    "Prueba bcrypt.hash() con rounds 10 y 14. Mide el tiempo con console.time() y decide tu balance seguridad/velocidad.",
  "03-anatomia-jwt":
    "Pega un token real de kidotag10 en jwt.io y lee el payload. Observa el campo exp y conviértelo a fecha con Date.",
  "03-emitir-tokens":
    "Cambia el tiempo de expiración a '10s' y verifica que el token expira rápido al hacer una petición protegida.",
  "03-verificar-token":
    "Envía una petición con un token manipulado (cambia un carácter del payload) y observa el error que devuelve.",
  "03-rbac":
    "Crea una ruta solo para admin e intenta acceder con un token de profesor. Lee el error y el status code.",
  "03-almacenamiento-token":
    "Abre DevTools → Application → localStorage y observa el token guardado. Luego intenta leerlo con document.cookie.",
  // Swagger
  "04-openapi-intro":
    "Escribe a mano el spec YAML de un endpoint simple antes de usar swagger-jsdoc para entender lo que se genera.",
  "04-swagger-jsdoc":
    "Anota un endpoint existente de kidotag10 con JSDoc, genera el spec y valídalo en editor.swagger.io.",
  "04-schemas-seguridad":
    "Agrega el schema AlumnoResponse en components/schemas y reutilízalo en 3 paths distintos.",
  "04-swagger-ui-ejercicio":
    "Documenta el endpoint POST /asistencias incluyendo su request body, response 201 y error 401 con Bearer.",
  // Socket.IO
  "05-websockets-vs-rest":
    "Implementa polling con setInterval cada 2s en un componente React y observa cuántas peticiones genera en la pestaña Network.",
  "05-servidor-socketio":
    "Agrega un log en el evento 'connection' del servidor y conecta desde el navegador para ver el socket.id.",
  "05-eventos-rooms":
    "Une un socket a un room con el id del grupo escolar y emite solo a ese room para aislar las asistencias.",
  "05-cliente-react":
    "Comprueba que el cleanup de useEffect desconecta el socket: agrega console.log en socket.disconnect() y navega fuera.",
  // React Fundamentos
  "06-vite-setup":
    "Modifica el título en index.html y agrega una variable VITE_APP_NAME en .env. Úsala en el componente App.",
  "06-jsx-componentes":
    "Crea un componente TarjetaAlumno que reciba nombre y grado como props y los muestre en una tarjeta.",
  "06-usestate":
    "Implementa un contador de asistencias con useState. Agrega botones +1 y -1 y observa el re-render en React DevTools.",
  "06-useeffect":
    "Crea un efecto que haga fetch a /api/alumnos al montar. Agrega cleanup con AbortController para cancelar si se desmonta.",
  "06-props-composicion":
    "Pasa una función onToggle como prop a TarjetaAlumno para que el padre maneje el estado de asistencia.",
  "06-inputs-controlados":
    "Agrega validación en tiempo real al campo email del login: muestra error si no contiene '@' mientras el usuario escribe.",
  "06-renderizado-listas":
    "Renderiza la lista de alumnos con .map(). Intenta quitar la prop key y observa la advertencia en consola.",
  // React Avanzado
  "07-context-api":
    "Crea un contexto de tema (claro/oscuro) y conéctalo a un botón. Observa que todos los componentes suscritos se actualizan.",
  "07-auth-context":
    "Agrega un console.log en cada cambio de estado de AuthContext para visualizar el flujo completo de login/logout.",
  "07-custom-hooks":
    "Extrae la lógica de fetch de alumnos a un custom hook useAlumnos() y úsalo en dos componentes distintos.",
  "07-react-router":
    "Crea una ruta /alumno/:id y usa useParams() para mostrar el nombre del alumno desde un array estático.",
  "07-rutas-protegidas":
    "Prueba acceder a /dashboard sin token y verifica que Navigate redirige a /login automáticamente.",
  "07-dashboard-pattern":
    "Agrega una sección nueva al dashboard sin React Router y mide si la URL no cambia — ese es el tradeoff de este patrón.",
  // Web API
  "08-fetch-api":
    "Provoca un error de red desconectando el servidor y observa qué bloque catch captura y qué mensaje llega al usuario.",
  "08-abortsignal-timeout":
    "Simula una respuesta lenta con setTimeout en el servidor y verifica que AbortSignal.timeout(3000) cancela la petición.",
  "08-api-config":
    "Agrega un interceptor de log en apiGet() para registrar URL, método y tiempo de respuesta de cada llamada.",
  "08-bearer-token":
    "Usa las DevTools Network para verificar que el header Authorization: Bearer <token> aparece en cada petición protegida.",
  "08-polling-descarga":
    "Verifica que el cleanup del setInterval se ejecuta: agrega console.log('cleanup') y navega fuera del componente.",
  // Estilos UX
  "09-css-variables":
    "Cambia --color-primary en :root y observa cómo toda la UI de kidotag10 se actualiza a la vez.",
  "09-responsive-mobile-first":
    "Abre DevTools → Device Toolbar y prueba tu layout en iPhone SE (375px). Ajusta hasta que sea usable con un dedo.",
  "09-estados-ui":
    "Añade un estado 'vacío' a la lista de asistencias cuando length === 0. El mensaje vacío es tan importante como los datos.",
  // JS/TS Fundamentos
  "11-js-variables-tipos":
    "Crea variables para nombre, edad y presente de un alumno ficticio. Intenta sumar un string y un number y observa el resultado.",
  "11-js-condicionales-bucles":
    "Escribe una función que recorra un array de 5 alumnos e imprima solo los que están presentes.",
  "11-js-funciones":
    "Convierte una función normal a función flecha y verifica que el resultado es idéntico.",
  "11-js-arrays-objetos":
    "Crea un array de 3 alumnos (objetos con nombre y grado) y accede al nombre del segundo sin hardcodear el índice.",
  "11-js-metodos-array":
    "Usa filter() para obtener solo los alumnos presentes y map() para extraer solo sus nombres en un nuevo array.",
  "11-js-asincronia":
    "Convierte una función con .then().catch() a async/await y comprueba que el comportamiento es igual.",
  "11-ts-tipos-basicos":
    "Define una interface Alumno con nombre, grado y nfcUid. Intenta crear un objeto que le falte un campo y lee el error de TS.",
  "11-ts-en-react":
    "Tipa las props del componente TarjetaAlumno con una interface y verifica que el editor autocompleta los props.",
  // Capstone
  "10-flujo-nfc-tiempo-real":
    "Sigue el flujo poniendo un console.log en cada capa: ESP32 → POST → Mongoose → io.emit → React listener.",
  "10-exportar-excel":
    "Descarga el Excel generado y ábrelo en LibreOffice o Excel. Verifica encabezados, fechas y formatos antes de entregar.",
};

// Fallback a nivel de bloque cuando no hay entrada específica para la lección
const BLOQUE_PREVIO_FALLBACK: Record<string, string> = {
  bienvenida: "Ninguno. Este es tu punto de entrada.",
  "js-ts-fundamentos": "Solo ganas de practicar. Ideal para principiantes.",
  "backend-express": "Conocer variables, funciones y objetos en JavaScript.",
  "mongodb-mongoose": "Saber que es una API y como se estructura un backend.",
  "auth-jwt": "Entender rutas, middlewares y modelos basicos.",
  swagger: "Conocer endpoints y flujo general de autenticacion.",
  "react-fundamentos": "Bases de JS y nocion basica de HTML/CSS.",
  "web-api": "React basico y como funciona una API REST.",
  "react-avanzado": "useState, useEffect y props sin dificultad.",
  socketio: "Backend y frontend basico para entender eventos en vivo.",
  "estilos-ux": "React basico y componentes de interfaz.",
  capstone: "Completar los modulos previos para integrar todo.",
};

export function ConceptosClave({ leccion }: Props) {
  const conceptos = leccion.tags
    .map((tag) => ({ tag, texto: GLOSSARY_MAP[tag]?.descripcionCorta }))
    .filter((x): x is { tag: string; texto: string } => Boolean(x.texto))
    .slice(0, 4);

  const previo =
    LESSON_PREVIO[leccion.slug] ??
    BLOQUE_PREVIO_FALLBACK[leccion.bloque.id] ??
    "Revisa las lecciones anteriores del módulo.";

  const tip =
    LESSON_TIP[leccion.slug] ??
    "Entiende primero la idea, luego ejecuta el ejemplo, y al final revisa los detalles técnicos.";

  return (
    <section className="conceptos-clave" aria-label="Conceptos importantes">
      <h3 className="conceptos-clave-title">
        Conceptos importantes de esta leccion
      </h3>
      <p className="conceptos-clave-previo">
        <strong>Antes de empezar:</strong> {previo}
      </p>
      {conceptos.length > 0 ? (
        <ul className="conceptos-clave-list">
          {conceptos.map((c) => (
            <li key={c.tag}>
              <KeywordTooltip term={c.tag} />: {c.texto}
            </li>
          ))}
        </ul>
      ) : (
        <p className="conceptos-clave-vacio">
          Esta leccion se enfoca mas en practica aplicada. Lee el ejemplo y
          luego prueba cambiando valores para entender el comportamiento.
        </p>
      )}
      <p className="conceptos-clave-tip">
        <strong>Acción recomendada:</strong> {tip}
      </p>
    </section>
  );
}
