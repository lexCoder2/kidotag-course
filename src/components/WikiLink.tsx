import type { ReactNode } from "react";
import { GLOSSARY_MAP } from "@/data/glossary";

interface Props {
  term: string;
  children?: ReactNode;
}

export function WikiLink({ term, children }: Props) {
  const key = term.toLowerCase();
  const entry = GLOSSARY_MAP[key];

  function open() {
    window.dispatchEvent(
      new CustomEvent("kidotag-wiki-open", { detail: { key } }),
    );
  }

  if (!entry) {
    return <span className="wiki-link-missing">{children ?? term}</span>;
  }

  return (
    <button
      type="button"
      className="wiki-link"
      onClick={open}
      title={entry.descripcionCorta}
    >
      {children ?? entry.titulo}
    </button>
  );
}
