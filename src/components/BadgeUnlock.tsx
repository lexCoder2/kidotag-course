import { useCallback, useEffect, useState } from "react";
import type { InsigniaNuevaDetalle, Insignia } from "@/hooks/useGamificacion";
import { AppIcon } from "./AppIcon";

export function BadgeUnlock() {
  const [insignia, setInsignia] = useState<Insignia | null>(null);
  const [saliendo, setSaliendo] = useState(false);

  const cerrar = useCallback(() => {
    setSaliendo(true);
    setTimeout(() => {
      setInsignia(null);
      setSaliendo(false);
    }, 400);
  }, []);

  useEffect(() => {
    function onInsignia(e: Event) {
      const detail = (e as CustomEvent<InsigniaNuevaDetalle>).detail;
      setInsignia(detail.insignia);
      setSaliendo(false);
      // Auto-cerrar después de 6s
      const t = setTimeout(() => cerrar(), 6000);
      return () => clearTimeout(t);
    }
    window.addEventListener("kidotag-insignia-nueva", onInsignia);
    return () =>
      window.removeEventListener("kidotag-insignia-nueva", onInsignia);
  }, [cerrar]);

  if (!insignia) return null;

  return (
    <div
      className={`badge-overlay${saliendo ? " badge-overlay-saliendo" : ""}`}
      onClick={cerrar}
    >
      <div
        className={`badge-modal${saliendo ? " badge-modal-saliendo" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="badge-confetti" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className={`badge-confetti-piece badge-confetti-${i % 6}`}
            />
          ))}
        </div>
        <div className="badge-icono">
          <AppIcon token={insignia.icono} size={34} />
        </div>
        <div className="badge-encabezado">¡Insignia desbloqueada!</div>
        <div className="badge-titulo">{insignia.titulo}</div>
        <p className="badge-desc">{insignia.descripcion}</p>
        <button type="button" className="badge-cerrar-btn" onClick={cerrar}>
          ¡Genial!
        </button>
      </div>
    </div>
  );
}
