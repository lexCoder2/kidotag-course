import type { ReactNode } from "react";
import { AppIcon } from "./AppIcon";

type Variante = "info" | "tip" | "warning" | "danger" | "kidotag";

interface Props {
  variante?: Variante;
  titulo?: string;
  children: ReactNode;
}

const CONFIG: Record<Variante, { icono: string; clase: string }> = {
  info: { icono: "info", clase: "callout-info" },
  tip: { icono: "tip", clase: "callout-tip" },
  warning: { icono: "warning", clase: "callout-warning" },
  danger: { icono: "warning", clase: "callout-danger" },
  kidotag: { icono: "search", clase: "callout-kidotag" },
};

export function Callout({ variante = "info", titulo, children }: Props) {
  const { icono, clase } = CONFIG[variante];
  return (
    <aside className={`callout ${clase}`}>
      <div className="callout-icon">
        <AppIcon token={icono} size={18} />
      </div>
      <div className="callout-body">
        {titulo && <strong className="callout-titulo">{titulo}</strong>}
        <div className="callout-content">{children}</div>
      </div>
    </aside>
  );
}
