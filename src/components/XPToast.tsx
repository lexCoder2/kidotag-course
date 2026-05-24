import { useEffect, useRef, useState } from "react";
import { PartyPopper, Zap } from "lucide-react";
import type { XPGanadaDetalle } from "@/hooks/useGamificacion";

interface Toast {
  id: number;
  cantidad: number;
  razon: string;
  nivelNuevo?: number;
  saliendo: boolean;
}

let _id = 0;

export function XPToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    function onXP(e: Event) {
      const detail = (e as CustomEvent<XPGanadaDetalle>).detail;
      const id = ++_id;
      const toast: Toast = {
        id,
        cantidad: detail.cantidad,
        razon: detail.razon,
        nivelNuevo: detail.nivelNuevo,
        saliendo: false,
      };

      setToasts((prev) => [...prev.slice(-2), toast]);

      const t = setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, saliendo: true } : t)),
        );
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
          timeouts.current.delete(id);
        }, 350);
      }, 3000);

      timeouts.current.set(id, t);
    }

    window.addEventListener("kidotag-xp-ganada", onXP);
    return () => window.removeEventListener("kidotag-xp-ganada", onXP);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="xp-toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`xp-toast${t.saliendo ? " xp-toast-saliendo" : ""}`}
        >
          <span className="xp-toast-icono">
            <Zap size={14} aria-hidden="true" />
          </span>
          <div className="xp-toast-body">
            <span className="xp-toast-cantidad">+{t.cantidad} XP</span>
            <span className="xp-toast-razon">{t.razon}</span>
            {t.nivelNuevo !== undefined && (
              <span className="xp-toast-nivel-up">
                <PartyPopper size={14} aria-hidden="true" /> ¡Subiste al nivel {t.nivelNuevo}!
              </span>
            )}
          </div>
          <button
            type="button"
            className="xp-toast-cerrar"
            onClick={() =>
              setToasts((prev) =>
                prev.map((tt) =>
                  tt.id === t.id ? { ...tt, saliendo: true } : tt,
                ),
              )
            }
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
