import { useState } from "react";
import { SmartCodeBlock } from "./SmartCodeBlock";

type Categoria = "backend" | "frontend" | "devtools" | "database" | "auth";

interface Alternativa {
  nombre: string;
  porque_no: string;
}

export interface LibCardProps {
  nombre: string;
  version: string;
  npm: string;
  descripcion: string;
  porque: string;
  usoEjemplo: string;
  alternativas?: Alternativa[];
  categoria?: Categoria;
  docs?: string;
}

const CAT_CONFIG: Record<
  Categoria,
  { label: string; color: string; bg: string }
> = {
  backend: { label: "Backend", color: "#0ea5e9", bg: "rgba(14,165,233,0.1)" },
  frontend: { label: "Frontend", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  database: {
    label: "Base de datos",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
  },
  auth: {
    label: "Auth / Seguridad",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
  devtools: {
    label: "Dev Tools",
    color: "#64748b",
    bg: "rgba(100,116,139,0.1)",
  },
};

export function LibCard({
  nombre,
  version,
  npm,
  descripcion,
  porque,
  usoEjemplo,
  alternativas,
  categoria = "backend",
  docs,
}: LibCardProps) {
  const [altOpen, setAltOpen] = useState(false);
  const cat = CAT_CONFIG[categoria];

  return (
    <div className="libcard">
      {/* ── Header ── */}
      <div className="libcard-header">
        <div className="libcard-title-row">
          <span className="libcard-name">{nombre}</span>
          <span className="libcard-version">v{version}</span>
          <span
            className="libcard-cat"
            style={{ color: cat.color, background: cat.bg }}
          >
            {cat.label}
          </span>
        </div>
        <div className="libcard-links">
          <a
            href={`https://www.npmjs.com/package/${npm}`}
            target="_blank"
            rel="noopener noreferrer"
            className="libcard-badge libcard-badge-npm"
            title={`Ver ${npm} en npm`}
          >
            npm
          </a>
          {docs && (
            <a
              href={docs}
              target="_blank"
              rel="noopener noreferrer"
              className="libcard-badge libcard-badge-docs"
              title="Documentación oficial"
            >
              docs
            </a>
          )}
        </div>
      </div>

      {/* ── Descripción ── */}
      <p className="libcard-desc">{descripcion}</p>

      {/* ── Por qué ── */}
      <div className="libcard-porque">
        <span className="libcard-section-label">¿Por qué esta librería?</span>
        <p>{porque}</p>
      </div>

      {/* ── Código de uso ── */}
      <div className="libcard-code-wrap">
        <span className="libcard-section-label">Uso en kidotag10</span>
        <SmartCodeBlock>
          <code className="language-js">{usoEjemplo}</code>
        </SmartCodeBlock>
      </div>

      {/* ── Alternativas (expandible) ── */}
      {alternativas && alternativas.length > 0 && (
        <div className="libcard-alt-wrap">
          <button
            className="libcard-alt-toggle"
            onClick={() => setAltOpen((o) => !o)}
            aria-expanded={altOpen}
          >
            <span>
              {altOpen ? "▾" : "▸"} Alternativas consideradas (
              {alternativas.length})
            </span>
          </button>
          {altOpen && (
            <table className="libcard-alt-table">
              <thead>
                <tr>
                  <th>Librería</th>
                  <th>¿Por qué no se eligió?</th>
                </tr>
              </thead>
              <tbody>
                {alternativas.map((a) => (
                  <tr key={a.nombre}>
                    <td>
                      <code>{a.nombre}</code>
                    </td>
                    <td>{a.porque_no}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
