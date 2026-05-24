import { Link } from "react-router-dom";
import { GLOSSARY_MAP } from "@/data/glossary";

interface Props {
  term: string;
  className?: string;
}

export function KeywordTooltip({ term, className }: Props) {
  const key = term.toLowerCase();
  const entry = GLOSSARY_MAP[key];

  if (!entry) {
    return <span className={className}>{term}</span>;
  }

  return (
    <span className={`kw-tooltip ${className || ""}`.trim()}>
      <span className="kw-chip">{entry.titulo}</span>
      <span role="tooltip" className="kw-popover">
        <strong>{entry.titulo}</strong>
        <p>{entry.descripcionCorta}</p>
        <div className="kw-links">
          <Link to={`/glosario#${entry.key}`}>Ver glosario</Link>
          {entry.videos[0] && (
            <a href={entry.videos[0].url} target="_blank" rel="noreferrer">
              Video en YouTube
            </a>
          )}
        </div>
      </span>
    </span>
  );
}
