import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GLOSSARY } from "@/data/glossary";
import type { GlossaryEntry } from "@/data/glossary";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_MAP,
  CATEGORY_ORDER,
  RELATED_MAP,
} from "@/data/wikiMeta";

export interface WikiPanelProps {
  /** Pre-select this term on mount; syncs when it changes (e.g. new WikiLink clicked). */
  defaultKey?: string;
  /** Provide a close handler → shows the ✕ button in the header */
  onClose?: () => void;
  /** "modal" inside an overlay dialog, "page" rendered inline as a full page */
  mode?: "modal" | "page";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function catColor(key: string): string {
  return CATEGORY_COLORS[CATEGORY_MAP[key] ?? ""] ?? "#64748b";
}

function catLabel(key: string): string {
  return CATEGORY_LABELS[CATEGORY_MAP[key] ?? ""] ?? "";
}

function hexA(hex: string, alpha: string) {
  return hex + alpha;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WikiPanel({ defaultKey, onClose, mode = "page" }: WikiPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedKey, setSelectedKey] = useState<string | null>(defaultKey ?? null);
  const [history, setHistory] = useState<string[]>(defaultKey ? [defaultKey] : []);
  const [mobileDetail, setMobileDetail] = useState(!!defaultKey);

  const searchRef = useRef<HTMLInputElement>(null);

  // Sync when parent changes the defaultKey (new WikiLink clicked while modal is open)
  useEffect(() => {
    if (defaultKey) {
      setSelectedKey(defaultKey);
      setHistory([defaultKey]);
      setMobileDetail(true);
    }
  }, [defaultKey]);

  // Focus search on mount in modal mode
  useEffect(() => {
    if (mode === "modal") {
      setTimeout(() => searchRef.current?.focus(), 80);
    }
  }, [mode]);

  // ── Category list (ordered) ─────────────────────────────────────────────────
  const categories = useMemo(() => {
    const used = new Set(GLOSSARY.map((e) => CATEGORY_MAP[e.key] ?? "other"));
    return CATEGORY_ORDER.filter((c) => used.has(c));
  }, []);

  // ── Filtered term list ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GLOSSARY.filter((e) => {
      const cat = CATEGORY_MAP[e.key] ?? "other";
      if (selectedCat !== "all" && cat !== selectedCat) return false;
      if (!q) return true;
      return (
        e.titulo.toLowerCase().includes(q) ||
        e.descripcionCorta.toLowerCase().includes(q) ||
        (e.descripcionLarga ?? "").toLowerCase().includes(q)
      );
    });
  }, [search, selectedCat]);

  // ── Selected entry & related ────────────────────────────────────────────────
  const entry = useMemo(
    () => GLOSSARY.find((e) => e.key === selectedKey) ?? null,
    [selectedKey],
  );

  const related = useMemo((): GlossaryEntry[] => {
    if (!selectedKey) return [];
    return (RELATED_MAP[selectedKey] ?? [])
      .map((k) => GLOSSARY.find((e) => e.key === k))
      .filter((e): e is GlossaryEntry => e != null);
  }, [selectedKey]);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const openEntry = useCallback((key: string) => {
    setSelectedKey(key);
    setHistory((prev) => [...prev, key]);
    setMobileDetail(true);
    // Scroll content panel to top
    document.querySelector(".wiki-content")?.scrollTo(0, 0);
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      setSelectedKey(next[next.length - 1]);
      return next;
    });
  }, []);

  const goBackToList = useCallback(() => {
    setMobileDetail(false);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedCat("all");
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  const panelClass = [
    "wiki-panel",
    `wiki-panel-${mode}`,
    mobileDetail ? "wiki-mobile-detail" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={panelClass}>
      {/* ── Left sidebar ──────────────────────────────────────────────────── */}
      <aside className="wiki-sidebar">
        {/* Search */}
        <div className="wiki-search-wrap">
          <svg className="wiki-search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="m13 13 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            ref={searchRef}
            className="wiki-search"
            placeholder="Buscar término…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar en el glosario"
          />
          {search && (
            <button
              className="wiki-search-clear"
              onClick={() => setSearch("")}
              type="button"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="wiki-cats" role="group" aria-label="Filtrar por categoría">
          <button
            className={`wiki-cat-chip${selectedCat === "all" ? " wiki-cat-active wiki-cat-active-neutral" : ""}`}
            onClick={() => setSelectedCat("all")}
            type="button"
          >
            Todo <span className="wiki-cat-count">{GLOSSARY.length}</span>
          </button>
          {categories.map((cat) => {
            const count = GLOSSARY.filter((e) => (CATEGORY_MAP[e.key] ?? "other") === cat).length;
            const color = CATEGORY_COLORS[cat] ?? "#475569";
            const isActive = selectedCat === cat;
            return (
              <button
                key={cat}
                className={`wiki-cat-chip${isActive ? " wiki-cat-active" : ""}`}
                style={
                  isActive
                    ? { background: color, borderColor: color, color: "#fff" }
                    : { "--cat-color": color } as React.CSSProperties
                }
                onClick={() => setSelectedCat(cat)}
                type="button"
              >
                {CATEGORY_LABELS[cat]}
                <span className="wiki-cat-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Count */}
        <div className="wiki-term-count">
          {filtered.length} término{filtered.length !== 1 ? "s" : ""}
        </div>

        {/* Term list */}
        <ul className="wiki-list" role="listbox" aria-label="Lista de términos">
          {filtered.map((e) => {
            const color = catColor(e.key);
            const label = catLabel(e.key);
            return (
              <li key={e.key} role="option" aria-selected={selectedKey === e.key}>
                <button
                  className={`wiki-list-item${selectedKey === e.key ? " wiki-list-item-active" : ""}`}
                  onClick={() => openEntry(e.key)}
                  type="button"
                  title={e.descripcionCorta}
                >
                  <span className="wiki-list-title">{e.titulo}</span>
                  {label && (
                    <span
                      className="wiki-list-cat"
                      style={{
                        color,
                        borderColor: hexA(color, "44"),
                        background: hexA(color, "18"),
                      }}
                    >
                      {label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="wiki-list-empty">
              <span>No se encontraron términos</span>
              <button type="button" onClick={clearFilters} className="wiki-list-reset">
                Limpiar filtros
              </button>
            </li>
          )}
        </ul>
      </aside>

      {/* ── Right content ─────────────────────────────────────────────────── */}
      <div className="wiki-content">
        {/* Mobile: back to list button */}
        <button
          className="wiki-mobile-back"
          type="button"
          onClick={goBackToList}
          aria-label="Volver a la lista"
        >
          ← Volver a la lista
        </button>

        {!entry ? (
          <div className="wiki-empty">
            <div className="wiki-empty-icon">📖</div>
            <p className="wiki-empty-title">Selecciona un término</p>
            <p className="wiki-empty-sub">
              Busca o navega por categorías en el panel izquierdo para ver la explicación completa
            </p>
          </div>
        ) : (
          <article className="wiki-entry" key={entry.key}>
            {/* Category + key */}
            <div className="wiki-entry-meta">
              {catLabel(entry.key) && (
                <span
                  className="wiki-entry-cat"
                  style={{
                    color: catColor(entry.key),
                    borderColor: hexA(catColor(entry.key), "44"),
                    background: hexA(catColor(entry.key), "18"),
                  }}
                >
                  {catLabel(entry.key)}
                </span>
              )}
              <code className="wiki-entry-key">#{entry.key}</code>
            </div>

            {/* Title */}
            <h2 className="wiki-entry-title">{entry.titulo}</h2>
            <p className="wiki-entry-lead">{entry.descripcionCorta}</p>

            <hr className="wiki-divider" />

            {/* Back / history navigation */}
            {history.length > 1 && (
              <div className="wiki-nav-bar">
                <button
                  type="button"
                  className="wiki-back-btn"
                  onClick={goBack}
                >
                  ← {GLOSSARY.find((e) => e.key === history[history.length - 2])?.titulo ?? "Atrás"}
                </button>
                <div className="wiki-breadcrumb">
                  {history.map((k, i) => {
                    const t = GLOSSARY.find((e) => e.key === k)?.titulo ?? k;
                    return (
                      <span key={`${k}-${i}`}>
                        {i > 0 && <span className="wiki-bc-sep">›</span>}
                        {i === history.length - 1 ? (
                          <strong>{t}</strong>
                        ) : (
                          <button
                            type="button"
                            className="wiki-bc-link"
                            onClick={() => {
                              const slice = history.slice(0, i + 1);
                              setHistory(slice);
                              setSelectedKey(slice[slice.length - 1]);
                            }}
                          >
                            {t}
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Explanation */}
            <section className="wiki-section">
              <div className="wiki-section-label">
                <span className="wiki-section-icon">💡</span>
                Explicación
              </div>
              <p>{entry.descripcionLarga}</p>
            </section>

            {/* KidoTag example */}
            {entry.ejemplo && (
              <section className="wiki-section wiki-section-example">
                <div className="wiki-section-label">
                  <span className="wiki-section-icon">🏷️</span>
                  Ejemplo en KidoTag
                </div>
                <p>{entry.ejemplo}</p>
              </section>
            )}

            {/* Related terms */}
            {related.length > 0 && (
              <section className="wiki-section">
                <div className="wiki-section-label">
                  <span className="wiki-section-icon">🔗</span>
                  Términos relacionados
                </div>
                <div className="wiki-related">
                  {related.map((r) => {
                    const color = catColor(r.key);
                    return (
                      <button
                        key={r.key}
                        type="button"
                        className="wiki-related-chip"
                        style={{
                          color,
                          borderColor: hexA(color, "44"),
                          background: hexA(color, "18"),
                        }}
                        onClick={() => openEntry(r.key)}
                        title={r.descripcionCorta}
                      >
                        {r.titulo}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Videos */}
            {entry.videos.length > 0 && (
              <section className="wiki-section">
                <div className="wiki-section-label">
                  <span className="wiki-section-icon">🎬</span>
                  Recursos recomendados
                </div>
                <div className="wiki-videos-list">
                  {entry.videos.map((v) => (
                    <a
                      key={v.url}
                      href={v.url}
                      target="_blank"
                      rel="noreferrer"
                      className="wiki-video-item"
                    >
                      <span className="wiki-video-play" aria-hidden="true">▶</span>
                      <span className="wiki-video-title">{v.titulo}</span>
                      <span className="wiki-video-ext" aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Footer: total terms context */}
            <div className="wiki-entry-footer">
              <span>{GLOSSARY.length} términos en el glosario</span>
              {onClose && (
                <button type="button" className="wiki-entry-close-link" onClick={onClose}>
                  Cerrar wiki
                </button>
              )}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
