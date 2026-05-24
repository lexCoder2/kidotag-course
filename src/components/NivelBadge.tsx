import { useGamificacion } from "@/hooks/useGamificacion";
import { Flame } from "lucide-react";

interface Props {
  compact?: boolean; // compact = chip-only; false = full card
}

const NOMBRES_NIVEL = [
  "Principiante",
  "Aprendiz",
  "Explorador",
  "Desarrollador",
  "Senior Dev",
  "Arquitecto",
  "Maestro",
  "Experto KidoTag",
];

export function NivelBadge({ compact = false }: Props) {
  const { xp, nivel, racha, progresoNivel } = useGamificacion();
  const nombreNivel = NOMBRES_NIVEL[Math.min(nivel, NOMBRES_NIVEL.length - 1)];

  if (compact) {
    return (
      <div
        className="nivel-badge-compact"
        title={`Nivel ${nivel} · ${xp} XP total`}
      >
        <span className="nivel-badge-num">Nv.{nivel}</span>
        <div className="nivel-badge-xp-bar">
          <div
            className="nivel-badge-xp-fill"
            style={{ width: `${progresoNivel.porcentaje}%` }}
          />
        </div>
        {racha > 1 && (
          <span className="nivel-badge-racha" title={`${racha} días seguidos`}>
            <Flame size={12} aria-hidden="true" /> {racha}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="nivel-badge-card">
      <div className="nivel-badge-card-top">
        <div className="nivel-badge-card-nivel">
          <span className="nivel-badge-card-num">Nivel {nivel}</span>
          <span className="nivel-badge-card-nombre">{nombreNivel}</span>
        </div>
        {racha > 1 && (
          <div className="nivel-badge-card-racha" title="Racha de días">
            <Flame size={14} aria-hidden="true" /> <strong>{racha}</strong> días
          </div>
        )}
      </div>
      <div className="nivel-badge-card-xp-wrap">
        <div className="nivel-badge-card-xp-bar">
          <div
            className="nivel-badge-card-xp-fill"
            style={{ width: `${progresoNivel.porcentaje}%` }}
          />
        </div>
        <span className="nivel-badge-card-xp-texto">
          {progresoNivel.actual} / {progresoNivel.requerido} XP para nivel{" "}
          {nivel + 1}
        </span>
      </div>
    </div>
  );
}
