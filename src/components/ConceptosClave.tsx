import type { Bloque, Leccion } from "@/data/curriculum";
import { GLOSSARY_MAP } from "@/data/glossary";
import { KeywordTooltip } from "./KeywordTooltip";

interface Props {
  leccion: Leccion & { bloque: Bloque };
}

const BLOQUE_PREVIO: Record<string, string> = {
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

  return (
    <section className="conceptos-clave" aria-label="Conceptos importantes">
      <h3 className="conceptos-clave-title">
        Conceptos importantes de esta leccion
      </h3>
      <p className="conceptos-clave-previo">
        <strong>Antes de empezar:</strong> {BLOQUE_PREVIO[leccion.bloque.id]}
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
        Ruta recomendada: entiende primero la idea, luego ejecuta el ejemplo, y
        al final revisa detalles tecnicos.
      </p>
    </section>
  );
}
