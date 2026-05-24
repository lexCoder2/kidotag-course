import type { Bloque, Leccion } from "@/data/curriculum";

interface Props {
  leccion: Leccion & { bloque: Bloque };
}

type BeginnerGuide = {
  objetivo: string;
  aplicacion: string;
  enfoque: string;
};

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
  const pasoSiguiente = getStepByLevel(leccion.nivel);
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
        <li>Siguiente paso recomendado: {pasoSiguiente}</li>
      </ul>

      <div className="beginner-helper-tags" aria-label="Palabras clave">
        {tags.map((tag) => (
          <span key={tag} className="beginner-helper-tag">
            {tag}
          </span>
        ))}
      </div>

      <p className="beginner-helper-note">
        Consejo personalizado: termina una seccion, prueba el snippet y explica
        en voz alta que cambio hiciste y que resultado esperabas.
      </p>
    </section>
  );
}
