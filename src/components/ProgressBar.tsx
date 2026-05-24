interface Props {
  completadas: number;
  total: number;
  mostrarTexto?: boolean;
}

export function ProgressBar({
  completadas,
  total,
  mostrarTexto = true,
}: Props) {
  const pct = total === 0 ? 0 : Math.round((completadas / total) * 100);
  return (
    <div className="pb-wrap">
      {mostrarTexto && (
        <span className="pb-label">
          {completadas}/{total} lecciones
        </span>
      )}
      <div
        className="pb-track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="pb-fill" style={{ width: `${pct}%` }} />
      </div>
      {mostrarTexto && <span className="pb-pct">{pct}%</span>}
    </div>
  );
}
