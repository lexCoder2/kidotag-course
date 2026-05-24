import fs from "fs";

const write = (path, content) => {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(path, content, "utf8");
  console.log("✅", path);
};

const base = "src/lessons";

// ── 05-websockets-vs-rest ─────────────────────────────────────────────────────
write(
  `${base}/socketio/05-websockets-vs-rest.mdx`,
  `# WebSockets vs REST: ¿cuándo usar cada uno?

HTTP/REST es perfecto para la mayoría de las operaciones de kidotag10. Pero
cuando el ESP32 registra una asistencia, necesitamos que el dashboard del
profesor se actualice al instante — sin que el cliente tenga que preguntar.

## El problema del polling

\`\`\`javascript
// ❌ Polling: el cliente pregunta cada N segundos
setInterval(async () => {
  const res = await fetch('/api/asistencias/hoy');
  const { data } = await res.json();
  actualizarDashboard(data);
}, 3000); // pregunta cada 3 segundos

// Problemas:
// • 3 segundos de retraso mínimo
// • Peticiones innecesarias cuando no hay cambios
// • Carga en el servidor proporcional al número de usuarios
\`\`\`

## WebSockets: conexión persistente bidireccional

\`\`\`
REST:      Cliente → Servidor → Respuesta (conexión cerrada)
           Cliente → Servidor → Respuesta (nueva conexión)
           Cliente → Servidor → Respuesta (nueva conexión)

WebSocket: Cliente ←──────────────────────→ Servidor
                    (conexión persistente)
                    Servidor puede enviar datos cuando quiera
\`\`\`

## Comparativa

| Criterio | REST / HTTP | WebSocket |
|----------|-------------|-----------|
| Conexión | Nueva por petición | Persistente |
| Dirección | Cliente → Servidor | Bidireccional |
| Latencia | ~50-200ms | ~5-20ms |
| Uso de recursos | Bajo (sin datos) | Conexión mantenida |
| Caso de uso | CRUD, auth, archivos | Tiempo real, notificaciones |
| kidotag10 usa | API principal | Asistencias en vivo |

## ¿Cuándo usa kidotag10 cada uno?

\`\`\`
REST/HTTP:
  POST /api/auth/login        — autenticación
  GET  /api/alumnos           — listar alumnos
  POST /api/alumnos           — crear alumno
  GET  /api/asistencias/reporte — descargar Excel

Socket.IO:
  evento: "asistencia:nueva"  — ESP32 registra llegada/salida
  evento: "anuncio:nuevo"     — director publica anuncio
  evento: "estado:alumno"     — cambio de estado en tiempo real
\`\`\`

<Mermaid titulo="Arquitectura tiempo real de kidotag10">
{\`flowchart LR
  ESP32[ESP32\\nLector NFC] -->|HTTP POST /api/asistencias| API
  API -->|io.emit asistencia:nueva| WS[Socket.IO Server]
  WS -->|evento en tiempo real| D1[Dashboard Profesor A]
  WS -->|evento en tiempo real| D2[Dashboard Profesor B]
  D1 -.->|WS conectado| WS
  D2 -.->|WS conectado| WS\`}
</Mermaid>

<LibCard
  nombre="socket.io"
  version="4.7.2"
  npm="socket.io"
  categoria="backend"
  docs="https://socket.io/docs/v4/"
  descripcion="Librería de comunicación bidireccional en tiempo real. Usa WebSockets como transporte principal con fallback automático a HTTP long-polling."
  porque="Socket.IO añade sobre WebSocket nativo: reconexión automática, soporte de rooms (una sala por escuela), nombres de eventos descriptivos, y fallback para entornos donde WebSocket está bloqueado."
  usoEjemplo={\`// src/index.js de kidotag10
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL }
});

io.on('connection', (socket) => {
  const { escuelaId } = socket.handshake.query;
  socket.join(\\\`escuela:\\\${escuelaId}\\\`); // room por escuela
});

// En asistencia.controller.js:
io.to(\\\`escuela:\\\${id}\\\`).emit('asistencia:nueva', registro);\`}
  alternativas={[
    { nombre: "ws (WebSocket nativo)", porque_no: "Sin rooms, sin reconexión automática, sin fallback HTTP. socket.io envuelve todos esos casos." },
    { nombre: "Server-Sent Events", porque_no: "Solo servidor → cliente. El ESP32 también envía datos al servidor." },
  ]}
/>

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué kidotag10 NO usa polling para actualizar el dashboard de asistencias?",
      opciones: [
        { texto: "Porque Node.js no soporta setInterval" },
        { texto: "Porque el polling consume recursos innecesarios y tiene latencia fija — con 50 profesores conectados y polling cada 3s = 1,000 peticiones/minuto aunque no haya cambios", correcta: true },
        { texto: "Porque Express no puede manejar múltiples peticiones" },
        { texto: "Porque fetch no está disponible en React" },
      ],
      explicacion: "El polling escala linealmente con el número de usuarios. Socket.IO solo transmite datos cuando hay cambios reales, reduciendo la carga del servidor y la latencia.",
    },
  ]}
/>
`,
);

// ── 05-servidor-socketio ──────────────────────────────────────────────────────
write(
  `${base}/socketio/05-servidor-socketio.mdx`,
  `# Servidor Socket.IO en kidotag10

Veamos cómo se configura e integra Socket.IO en la API de kidotag10.

## Integración con Express

Socket.IO no se monta como middleware de Express directamente — se adjunta al
**servidor HTTP** subyacente:

\`\`\`javascript
// src/index.js
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app'); // Express app

// Crear servidor HTTP a partir de Express
const server = http.createServer(app);

// Crear servidor Socket.IO adjunto al HTTP
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

// Escuchar en el mismo puerto que Express
server.listen(PORT);
\`\`\`

<Callout variante="info" titulo="¿Por qué http.createServer y no app.listen?">
  \`app.listen()\` internamente crea un servidor HTTP y llama a \`server.listen()\`.
  Cuando usamos Socket.IO, necesitamos acceso al servidor HTTP para adjuntar el
  WebSocket — por eso creamos el server manualmente con \`http.createServer(app)\`.
</Callout>

## Sistema de rooms (salas)

kidotag10 usa una **room por escuela** para que los eventos solo lleguen a
los usuarios de esa escuela:

\`\`\`javascript
// src/index.js
io.on('connection', (socket) => {
  const { escuelaId } = socket.handshake.query;

  if (escuelaId) {
    socket.join(\`escuela:\${escuelaId}\`);
    console.log(\`Socket \${socket.id} unido a escuela:\${escuelaId}\`);
  }

  socket.on('disconnect', () => {
    console.log(\`Socket \${socket.id} desconectado\`);
    // Socket.IO limpia los rooms automáticamente al desconectar
  });
});
\`\`\`

## Emitir eventos desde los controladores

El objeto \`io\` necesita ser accesible desde los controladores. kidotag10 lo
pasa via \`req.app.get('io')\`:

\`\`\`javascript
// src/index.js — guardar io en la app de Express
app.set('io', io);

// src/controllers/asistencia.controller.js — usar io
async function registrarAsistencia(req, res) {
  const registro = await Asistencia.create({ ...req.body });

  // Notificar en tiempo real a todos los de esa escuela
  const io = req.app.get('io');
  io.to(\`escuela:\${registro.escuela}\`).emit('asistencia:nueva', {
    alumno:   registro.alumno,
    presente: registro.presente,
    hora:     registro.fecha,
  });

  res.status(201).json({ ok: true, data: registro });
}
\`\`\`

## Flujo completo: ESP32 → servidor → dashboard

\`\`\`
1. Alumno pasa tarjeta NFC en el ESP32
2. ESP32: POST /api/asistencias { uid_nfc, escuelaId }
3. Controlador: guarda registro en MongoDB
4. Controlador: io.to("escuela:64ab1...").emit("asistencia:nueva", datos)
5. Todos los profesores conectados a esa escuela reciben el evento
6. React actualiza el dashboard en tiempo real
\`\`\`

<Mermaid titulo="Eventos Socket.IO en kidotag10">
{\`sequenceDiagram
  participant ESP as ESP32
  participant API as Express API
  participant IO as Socket.IO Server
  participant P1 as Profesor A (conectado)
  participant P2 as Profesor B (conectado)

  Note over P1,P2: Ambos en room "escuela:64ab1..."
  ESP->>API: POST /api/asistencias { uid_nfc }
  API->>API: Guarda en MongoDB
  API->>IO: io.to("escuela:64ab1...").emit("asistencia:nueva", datos)
  IO-->>P1: evento "asistencia:nueva"
  IO-->>P2: evento "asistencia:nueva"\`}
</Mermaid>

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué kidotag10 usa rooms de Socket.IO en lugar de emitir a todos los clientes conectados?",
      opciones: [
        { texto: "Porque Socket.IO no permite emitir a todos" },
        { texto: "Para que los eventos de asistencia solo lleguen a los usuarios de la escuela correcta, no a todas las escuelas del sistema", correcta: true },
        { texto: "Para mejorar el rendimiento del servidor" },
        { texto: "Porque el ESP32 no puede conectarse a Socket.IO directamente" },
      ],
      explicacion: "kidotag10 puede ser multi-escuela. Sin rooms, un evento de la Escuela A llegaría a los profesores de la Escuela B — un problema de privacidad y ruido.",
    },
  ]}
/>
`,
);

// ── 05-cliente-react ──────────────────────────────────────────────────────────
write(
  `${base}/socketio/05-cliente-react.mdx`,
  `# Socket.IO en React: el cliente

En el frontend, socket.io-client se conecta al servidor y escucha eventos.
En kidotag10, esto se gestiona con un custom hook.

<LibCard
  nombre="socket.io-client"
  version="4.7.2"
  npm="socket.io-client"
  categoria="frontend"
  docs="https://socket.io/docs/v4/client-api/"
  descripcion="Cliente JavaScript de Socket.IO. Se conecta al servidor y permite emitir y escuchar eventos en tiempo real."
  porque="Es el par del socket.io del backend. Gestiona la reconexión automática, la autenticación y el protocolo de handshake de forma transparente."
  usoEjemplo={\`// web/src/hooks/useAsistenciaRealTime.js
import { io } from 'socket.io-client';
import { useEffect } from 'react';

export function useAsistenciaRealTime(escuelaId, onNueva) {
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
      query: { escuelaId }
    });
    socket.on('asistencia:nueva', onNueva);
    return () => socket.disconnect(); // cleanup
  }, [escuelaId]);
}\`}
  alternativas={[
    { nombre: "WebSocket nativo", porque_no: "Sin reconexión automática ni rooms. socket.io-client añade toda esa lógica." },
    { nombre: "EventSource (SSE)", porque_no: "Solo servidor → cliente. No permite emitir desde el cliente." },
  ]}
/>

## El hook useAsistenciaRealTime

\`\`\`javascript
// web/src/hooks/useAsistenciaRealTime.js
import { useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useAsistenciaRealTime(escuelaId, onNueva) {
  useEffect(() => {
    if (!escuelaId) return; // no conectar sin escuelaId

    const socket = io(import.meta.env.VITE_API_URL, {
      query: { escuelaId },    // ← se pasa al servidor en el handshake
      transports: ['websocket'], // ← forzar WebSocket (sin polling)
    });

    socket.on('connect', () => {
      console.log('✅ Socket conectado:', socket.id);
    });

    socket.on('asistencia:nueva', (data) => {
      onNueva(data); // ← el componente maneja el update de estado
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket desconectado:', reason);
    });

    // Cleanup: desconectar al desmontar el componente
    return () => {
      socket.disconnect();
    };
  }, [escuelaId]); // re-conectar si cambia la escuela
}
\`\`\`

## Uso en el componente Dashboard

\`\`\`jsx
// web/src/pages/Dashboard.jsx
import { useState } from 'react';
import { useAsistenciaRealTime } from '../hooks/useAsistenciaRealTime';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { usuario } = useAuth();
  const [asistencias, setAsistencias] = useState([]);

  // Escuchar asistencias en tiempo real
  useAsistenciaRealTime(
    usuario.escuelaId,
    (nueva) => {
      // Añadir al principio de la lista al llegar
      setAsistencias(prev => [nueva, ...prev]);
    }
  );

  return (
    <div>
      <h1>Asistencias de hoy</h1>
      {asistencias.map((a, i) => (
        <div key={i}>
          <strong>{a.alumno.nombre}</strong> — {a.presente ? '✅ Llegó' : '🔴 Salió'}
        </div>
      ))}
    </div>
  );
}
\`\`\`

<Callout variante="warning" titulo="Siempre desconectar en el cleanup de useEffect">
  Si no llamas a \`socket.disconnect()\` en el return del useEffect, cada vez que
  el componente se monte creará una nueva conexión WebSocket sin cerrar la anterior.
  Esto provoca fugas de memoria y duplicación de eventos.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Qué pasa si el componente Dashboard se desmonta (el profesor navega a otra página) y no hay cleanup en el useEffect?",
      opciones: [
        { texto: "Nada — el socket se cierra automáticamente" },
        { texto: "La conexión WebSocket queda abierta y los eventos siguen llegando (memory leak), además de una nueva conexión al volver", correcta: true },
        { texto: "Socket.IO detecta el componente desmontado y cierra la conexión" },
        { texto: "El servidor cierra la conexión después de 30 segundos" },
      ],
      explicacion: "React no sabe que hay una conexión WebSocket — solo gestiona el árbol de componentes. El cleanup (return de useEffect) es la única manera de cerrar recursos externos al desmontar.",
    },
  ]}
/>
`,
);

// ── 05-eventos-rooms ──────────────────────────────────────────────────────────
write(
  `${base}/socketio/05-eventos-rooms.mdx`,
  `# Eventos y rooms en Socket.IO

Los dos conceptos fundamentales de Socket.IO son los **eventos** (mensajes con
nombre) y los **rooms** (grupos de conexiones).

## Eventos: emitir y escuchar

\`\`\`javascript
// ── SERVIDOR ──────────────────────────────
// Emitir a un cliente específico
socket.emit('mensaje', { texto: 'Hola' });

// Emitir a todos excepto al emisor
socket.broadcast.emit('nuevo-usuario', { nombre: 'Ana' });

// Emitir a todos los conectados
io.emit('anuncio', { texto: 'Reunión a las 3pm' });

// Emitir a un room
io.to('escuela:64ab1...').emit('asistencia:nueva', datos);

// ── CLIENTE ───────────────────────────────
// Escuchar evento
socket.on('asistencia:nueva', (datos) => {
  console.log('Nueva asistencia:', datos);
});

// Emitir al servidor
socket.emit('marcar-salida', { alumnoId: '...' });
\`\`\`

## Rooms (salas)

\`\`\`javascript
// Unirse a un room
socket.join('escuela:64ab1...');    // al conectar
socket.join('grupo:5to-A');         // por grupo

// Salir de un room
socket.leave('grupo:5to-A');

// Emitir a todos en un room
io.to('escuela:64ab1...').emit('evento', datos);

// Emitir a todos en el room excepto el emisor
socket.to('escuela:64ab1...').emit('evento', datos);

// Verificar miembros de un room
const members = await io.in('escuela:64ab1...').fetchSockets();
console.log(\`\${members.length} sockets en la sala\`);
\`\`\`

## Los eventos de kidotag10

\`\`\`javascript
// Eventos emitidos por el servidor (escuchar en React):
'asistencia:nueva'   // { alumno, presente, hora, grupo }
'anuncio:nuevo'      // { titulo, contenido, autor }
'estado:actualizado' // { alumnoId, estado, hora }

// Eventos emitidos por el cliente (escuchar en Node.js):
// (kidotag10 usa principalmente server-to-client)
\`\`\`

## Nomenclatura de eventos: namespace:accion

\`\`\`javascript
// ✅ Buena nomenclatura — clara y predecible
'asistencia:nueva'
'asistencia:actualizada'
'anuncio:creado'
'usuario:conectado'

// ❌ Evitar — ambiguo o inconsistente
'data'
'update'
'asistenciaEvent'
\`\`\`

<Mermaid titulo="Rooms en kidotag10">
{\`graph TB
  IO[Socket.IO Server]
  IO --> R1["Room: escuela:64ab1...\\n(Escuela A)"]
  IO --> R2["Room: escuela:64ab2...\\n(Escuela B)"]
  R1 --> P1[Profesor Ana]
  R1 --> P2[Profesor Luis]
  R1 --> D1[Director Escuela A]
  R2 --> P3[Profesor María]
  R2 --> D2[Director Escuela B]

  style R1 fill:#0ea5e9,color:#fff
  style R2 fill:#10b981,color:#fff\`}
</Mermaid>

<Callout variante="tip" titulo="Socket.IO escala horizontalmente con Redis Adapter">
  Si kidotag10 creciera y necesitara múltiples instancias de la API (load
  balancing), los rooms dejarían de funcionar entre instancias. La solución es
  el \`@socket.io/redis-adapter\` que sincroniza los rooms entre servidores.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Cuál es la diferencia entre io.emit() y io.to('sala').emit() en Socket.IO?",
      opciones: [
        { texto: "No hay diferencia práctica" },
        { texto: "io.emit() envía a todos los clientes conectados; io.to('sala').emit() solo a los clientes en esa sala específica", correcta: true },
        { texto: "io.to() es más rápido que io.emit()" },
        { texto: "io.emit() solo funciona en el servidor, io.to() solo en el cliente" },
      ],
      explicacion: "io.emit() es una broadcast global — todos los conectados reciben el mensaje. io.to('sala') es un broadcast filtrado — solo los sockets en ese room lo reciben. Fundamental para la privacidad multi-escuela de kidotag10.",
    },
  ]}
/>
`,
);

console.log("\n✅ Lecciones socket.io escritas.");
