import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { CURRICULUM } from "@/data/curriculum";
import { AppIcon } from "./AppIcon";

// Flat list of all lessons for searching
const ALL_LESSONS = CURRICULUM.flatMap((bloque) =>
  bloque.lecciones.map((l) => ({
    ...l,
    bloqueTitulo: bloque.titulo,
    bloqueIcono: bloque.icono,
    bloqueId: bloque.id,
  })),
);

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resultados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_LESSONS.filter(
      (l) =>
        l.titulo.toLowerCase().includes(q) ||
        l.descripcion.toLowerCase().includes(q) ||
        l.tags.some((t) => t.includes(q)),
    ).slice(0, 8);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="searchbar" ref={ref}>
      <div className="searchbar-input-wrap">
        <span className="searchbar-icon">
          <Search size={14} aria-hidden="true" />
        </span>
        <input
          ref={inputRef}
          className="searchbar-input"
          type="search"
          placeholder="Buscar lecciones… (/ para enfocar)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (query) setOpen(true);
          }}
          aria-label="Buscar lecciones"
          autoComplete="off"
        />
        {query && (
          <button
            className="searchbar-clear"
            onClick={() => {
              setQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Limpiar búsqueda"
          >
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </div>

      {open && resultados.length > 0 && (
        <ul className="searchbar-results" role="listbox">
          {resultados.map((l) => (
            <li key={l.slug}>
              <Link
                to={`/leccion/${l.slug}`}
                className="searchbar-result"
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
              >
                <span className="searchbar-result-icon">
                  <AppIcon token={l.bloqueIcono} size={13} />
                </span>
                <span className="searchbar-result-info">
                  <span className="searchbar-result-titulo">{l.titulo}</span>
                  <span className="searchbar-result-bloque">
                    {l.bloqueTitulo} · {l.duracion}
                  </span>
                </span>
                <span className="searchbar-result-nivel">{l.nivel}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && resultados.length === 0 && (
        <div className="searchbar-empty">
          No se encontraron lecciones para "{query}"
        </div>
      )}
    </div>
  );
}
