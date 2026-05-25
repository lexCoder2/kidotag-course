import { useCallback, useEffect, useState } from "react";
import { WikiPanel } from "@/components/WikiPanel";

export function WikiModal() {
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [saliendo, setSaliendo] = useState(false);

  const cerrar = useCallback(() => {
    setSaliendo(true);
    setTimeout(() => {
      setCurrentKey(null);
      setSaliendo(false);
    }, 260);
  }, []);

  useEffect(() => {
    function onOpen(e: Event) {
      const { key } = (e as CustomEvent<{ key: string }>).detail;
      setCurrentKey(key);
      setSaliendo(false);
    }
    window.addEventListener("kidotag-wiki-open", onOpen);
    return () => window.removeEventListener("kidotag-wiki-open", onOpen);
  }, []);

  useEffect(() => {
    if (!currentKey) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") cerrar();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [currentKey, cerrar]);

  if (!currentKey) return null;

  return (
    <div
      className={`wiki-overlay${saliendo ? " wiki-overlay-saliendo" : ""}`}
      onClick={cerrar}
      role="dialog"
      aria-modal="true"
      aria-label="Wiki KidoTag"
    >
      <div
        className={`wiki-dialog${saliendo ? " wiki-dialog-saliendo" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="wiki-dialog-header">
          <div className="wiki-dialog-brand">
            <span aria-hidden="true">📚</span>
            Wiki KidoTag
          </div>
          <button
            type="button"
            className="wiki-dialog-close"
            onClick={cerrar}
            aria-label="Cerrar wiki"
          >
            ✕
          </button>
        </header>
        <WikiPanel defaultKey={currentKey} onClose={cerrar} mode="modal" />
      </div>
    </div>
  );
}
