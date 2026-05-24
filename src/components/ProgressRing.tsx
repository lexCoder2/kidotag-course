interface Props {
  valor: number; // 0–100
  color?: string; // CSS color value
  size?: number; // px, default 48
  trazo?: number; // stroke width, default 4
  etiqueta?: string; // center text override (default = valor%)
  className?: string;
}

export function ProgressRing({
  valor,
  color = "var(--color-accent)",
  size = 48,
  trazo = 4,
  etiqueta,
  className,
}: Props) {
  const radio = (size - trazo) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const offset =
    circunferencia - (Math.min(100, Math.max(0, valor)) / 100) * circunferencia;

  return (
    <svg
      className={`progress-ring${className ? ` ${className}` : ""}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`Progreso: ${valor}%`}
    >
      {/* Track */}
      <circle
        className="progress-ring-track"
        cx={size / 2}
        cy={size / 2}
        r={radio}
        fill="none"
        strokeWidth={trazo}
      />
      {/* Fill */}
      <circle
        className="progress-ring-fill"
        cx={size / 2}
        cy={size / 2}
        r={radio}
        fill="none"
        stroke={color}
        strokeWidth={trazo}
        strokeDasharray={circunferencia}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transformOrigin: "center",
          transform: "rotate(-90deg)",
          transition: "stroke-dashoffset 0.5s ease",
        }}
      />
      <text
        className="progress-ring-text"
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.22}
        fill={color}
      >
        {etiqueta ?? `${Math.round(valor)}%`}
      </text>
    </svg>
  );
}
