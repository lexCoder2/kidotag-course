import fs from "fs";

const write = (path, content) => {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(path, content, "utf8");
  console.log("✅", path);
};

const base = "src/lessons";

// ── 10-flujo-nfc-tiempo-real ──────────────────────────────────────────────────
write(
  `${base}/capstone/10-flujo-nfc-tiempo-real.mdx`,
  `# Proyecto capstone: flujo NFC tiempo real

Este es el flujo central de kidotag10: desde que el alumno pasa su tarjeta
NFC hasta que el dashboard del profesor se actualiza en tiempo real.

## Visión general del sistema

\`\`\`
┌─────────────┐   NFC    ┌─────────────┐   HTTP POST  ┌─────────────┐
│  Tarjeta    │ ──────→  │   ESP32     │ ──────────→  │  API REST   │
│  del alumno │          │ Lector NFC  │              │  (Express)  │
└─────────────┘          └─────────────┘              └──────┬──────┘
                                                              │
                                                    MongoDB   │  Socket.IO
                                                    Guarda    │  Emite evento
                                                              ↓
                                                    ┌─────────────────┐
                                                    │  Dashboard Web  │
                                                    │  (React + SIO)  │
                                                    └─────────────────┘
\`\`\`

## El ESP32: leer UID y enviar al servidor

\`\`\`cpp
// esp32/src/main.cpp (simplificado)
#include <PN532_I2C.h>
#include <WiFi.h>
#include <HTTPClient.h>

void registrarAsistencia(String uid) {
  HTTPClient http;
  http.begin("http://192.168.1.100:4000/api/asistencias");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-ESP32-Key", ESP32_API_KEY); // ← clave de dispositivo

  String body = "{\\"uid_nfc\\": \\"" + uid + "\\", \\"escuelaId\\": \\"" + ESCUELA_ID + "\\"}";
  int code = http.POST(body);
  Serial.println("HTTP " + String(code));
  http.end();
}
\`\`\`

## El controlador: guardar y emitir

\`\`\`javascript
// src/controllers/asistencia.controller.js
async function registrarAsistencia(req, res) {
  const { uid_nfc, escuelaId } = req.body;

  // 1. Buscar el alumno por su UID
  const alumno = await Alumno.findOne({ uid_nfc, escuela: escuelaId })
    .populate('grupo', 'nombre');

  if (!alumno) {
    return res.status(404).json({ ok: false, error: 'ALUMNO_NO_REGISTRADO' });
  }

  // 2. Determinar si es entrada o salida
  const ultima = await Asistencia.findOne({ alumno: alumno._id })
    .sort({ fecha: -1 });
  const presente = !ultima || !ultima.presente; // toggle

  // 3. Guardar en MongoDB
  const registro = await Asistencia.create({
    alumno:   alumno._id,
    escuela:  escuelaId,
    presente,
    fecha:    new Date(),
  });

  // 4. Emitir en tiempo real a todos los conectados de esa escuela
  const io = req.app.get('io');
  io.to(\`escuela:\${escuelaId}\`).emit('asistencia:nueva', {
    alumno:   { _id: alumno._id, nombre: alumno.nombre },
    grupo:    alumno.grupo?.nombre,
    presente,
    hora:     registro.fecha.toLocaleTimeString('es-MX'),
  });

  res.status(201).json({ ok: true, data: registro });
}
\`\`\`

## El frontend: recibir y mostrar

\`\`\`jsx
// web/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useAsistenciaRealTime } from '../hooks/useAsistenciaRealTime';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { usuario } = useAuth();
  const { datos: asistenciasHoy } = useFetch('/asistencias/hoy');
  const [recientes, setRecientes] = useState([]);

  // Cuando llegan datos iniciales, cargarlos en recientes
  useEffect(() => {
    if (asistenciasHoy) setRecientes(asistenciasHoy);
  }, [asistenciasHoy]);

  // Escuchar nuevas asistencias en tiempo real
  useAsistenciaRealTime(usuario.escuelaId, (nueva) => {
    setRecientes(prev => [nueva, ...prev.slice(0, 49)]); // max 50
  });

  return (
    <div>
      <h1>Asistencias en tiempo real</h1>
      <ul>
        {recientes.map((a, i) => (
          <li key={i} className={a.presente ? 'presente' : 'ausente'}>
            <strong>{a.alumno.nombre}</strong>
            <span>{a.grupo}</span>
            <span>{a.presente ? '✅ Llegó' : '🔴 Salió'}</span>
            <time>{a.hora}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

<Mermaid titulo="Flujo completo NFC → Dashboard">
{\`sequenceDiagram
  participant NFC as Tarjeta NFC
  participant ESP as ESP32
  participant API as Express API
  participant DB as MongoDB
  participant IO as Socket.IO
  participant WEB as Dashboard React

  NFC->>ESP: UID leído (A1B2C3D4)
  ESP->>API: POST /api/asistencias {uid_nfc, escuelaId}
  API->>DB: Alumno.findOne({uid_nfc})
  DB-->>API: alumno encontrado
  API->>DB: Asistencia.create({...})
  DB-->>API: registro guardado
  API->>IO: io.to("escuela:...").emit("asistencia:nueva", datos)
  IO-->>WEB: evento recibido
  WEB->>WEB: setRecientes([nueva, ...prev])
  Note over WEB: UI actualizada <50ms\`}
</Mermaid>

<Quiz
  preguntas={[
    {
      pregunta: "En el controlador, ¿por qué se usa 'toggle' para determinar si es entrada o salida en lugar de un campo explícito del ESP32?",
      opciones: [
        { texto: "El ESP32 no puede distinguir entre entrada y salida" },
        { texto: "Simplifica el hardware — el mismo lector sirve para entrada y salida. La lógica de determinar qué es cada lectura queda en el servidor, que puede tomar decisiones más inteligentes (hora, secuencia)", correcta: true },
        { texto: "MongoDB no soporta campos booleanos" },
        { texto: "Toggle es más eficiente en memoria" },
      ],
      explicacion: "Con el toggle en el servidor, el ESP32 solo necesita enviar el UID. El servidor determina el contexto: si la última asistencia fue entrada, esta es salida. Además, el servidor podría añadir lógica de horario (ej: entrada solo antes de las 9am).",
    },
  ]}
/>
`,
);

// ── 10-exportar-excel ─────────────────────────────────────────────────────────
write(
  `${base}/capstone/10-exportar-excel.mdx`,
  `# Proyecto capstone: exportar Excel con xlsx

kidotag10 permite exportar reportes de asistencia en formato Excel (.xlsx)
usando la librería \`xlsx\` (SheetJS).

<LibCard
  nombre="xlsx"
  version="0.18.5"
  npm="xlsx"
  categoria="backend"
  docs="https://docs.sheetjs.com/"
  descripcion="Librería para crear, leer y escribir archivos Excel (.xlsx), CSV, ODS y otros formatos. Funciona tanto en Node.js como en el navegador."
  porque="Los directores y profesores de escuelas están acostumbrados a trabajar con Excel para reportes de asistencia. xlsx permite generar archivos .xlsx directamente desde los datos de MongoDB sin herramientas externas."
  usoEjemplo={\`const xlsx = require('xlsx');

// Crear workbook
const wb = xlsx.utils.book_new();

// Crear hoja desde array de objetos
const datos = [
  { Alumno: 'Ana García', Fecha: '15/01/2025', Estado: 'Presente' },
  { Alumno: 'Luis López', Fecha: '15/01/2025', Estado: 'Ausente' },
];
const ws = xlsx.utils.json_to_sheet(datos);
xlsx.utils.book_append_sheet(wb, ws, 'Asistencias');

// Convertir a buffer y enviar
const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
res.send(buffer);\`}
  alternativas={[
    { nombre: "exceljs", porque_no: "Más funcional (estilos, formulas) pero más pesado. xlsx es suficiente para reportes simples de kidotag10." },
    { nombre: "csv-writer", porque_no: "CSV no requiere librería — pero Excel es el formato esperado por las escuelas." },
  ]}
/>

## El controlador de reporte completo

\`\`\`javascript
// src/controllers/asistencia.controller.js
const xlsx = require('xlsx');

async function descargarReporte(req, res) {
  const { grupoId, fechaInicio, fechaFin } = req.query;

  // 1. Obtener datos de MongoDB
  const asistencias = await Asistencia.find({
    escuela: req.usuario.escuelaId,
    ...(grupoId && { grupo: grupoId }),
    fecha: {
      $gte: new Date(fechaInicio),
      $lte: new Date(fechaFin + 'T23:59:59'),
    },
  })
  .populate('alumno', 'nombre grado')
  .sort({ fecha: 1 })
  .lean();

  // 2. Transformar a filas planas para Excel
  const filas = asistencias.map(a => ({
    Alumno:  a.alumno.nombre,
    Grado:   a.alumno.grado,
    Fecha:   a.fecha.toLocaleDateString('es-MX'),
    Hora:    a.fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    Estado:  a.presente ? 'Presente' : 'Ausente',
  }));

  // 3. Crear el Excel
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(filas);

  // Ancho de columnas
  ws['!cols'] = [
    { wch: 30 }, // Alumno
    { wch: 10 }, // Grado
    { wch: 15 }, // Fecha
    { wch: 10 }, // Hora
    { wch: 12 }, // Estado
  ];

  xlsx.utils.book_append_sheet(wb, ws, 'Asistencias');

  // 4. Enviar como descarga
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const nombre = \`asistencias-\${fechaInicio}-\${fechaFin}.xlsx\`;

  res.setHeader('Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', \`attachment; filename="\${nombre}"\`);
  res.send(buffer);
}
\`\`\`

## El frontend: botón de descarga

\`\`\`jsx
function BotonDescargarReporte({ grupoId, fechaInicio, fechaFin }) {
  const { token } = useAuth();
  const [descargando, setDescargando] = useState(false);

  async function descargar() {
    setDescargando(true);
    try {
      const params = new URLSearchParams({ grupoId, fechaInicio, fechaFin });
      const res = await fetch(\`\${API_URL}/asistencias/reporte?\${params}\`, {
        headers: { Authorization: \`Bearer \${token}\` },
      });

      if (!res.ok) throw new Error('Error al generar el reporte');

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = \`reporte-\${fechaInicio}.xlsx\`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDescargando(false);
    }
  }

  return (
    <button onClick={descargar} disabled={descargando}>
      {descargando ? 'Generando...' : '⬇ Descargar Excel'}
    </button>
  );
}
\`\`\`

<Callout variante="tip" titulo="¡Felicidades! Has completado el curso">
  Has aprendido todas las tecnologías de kidotag10:
  Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Socket.IO, Swagger,
  React, Vite, Context API, React Router, CSS Variables y Excel con xlsx.
  Ahora puedes leer y entender todo el código del proyecto.
</Callout>

<Quiz
  preguntas={[
    {
      pregunta: "¿Por qué se usa .lean() en la consulta de Mongoose antes de transformar los datos para Excel?",
      opciones: [
        { texto: "Para que la consulta sea más rápida visualmente" },
        { texto: ".lean() devuelve objetos JavaScript planos en lugar de documentos Mongoose completos — más eficiente en memoria y más rápido para procesar en cantidad (ej: 500 asistencias)", correcta: true },
        { texto: "xlsx solo puede procesar objetos planos, no documentos Mongoose" },
        { texto: "Para evitar el populate de relaciones" },
      ],
      explicacion: "Los documentos Mongoose incluyen getters, setters, métodos de instancia y toda la lógica del Schema — por cada documento. Para transformar 500 filas en un reporte Excel, solo se necesitan los datos. .lean() devuelve un objeto {} limpio, mucho más eficiente.",
    },
  ]}
/>
`,
);

console.log("\n✅ Lecciones capstone escritas.");
