import { Link, useLocation } from "react-router-dom";
import { BookOpen, Check, Circle, School } from "lucide-react";
import type { Bloque } from "@/data/curriculum";
import type { useProgress } from "@/hooks/useProgress";
import { ProgressBar } from "./ProgressBar";
import { NivelBadge } from "./NivelBadge";
import { AppIcon } from "./AppIcon";

interface Props {
  curriculum: Bloque[];
  progress: ReturnType<typeof useProgress>;
  totalLecciones: number;
  onCerrar?: () => void;
}

export function Sidebar({
  curriculum,
  progress,
  totalLecciones,
  onCerrar,
}: Props) {
  const { pathname } = useLocation();

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <Link to="/" onClick={onCerrar} className="sidebar-logo">
          <span className="sidebar-logo-icon">
            <School size={16} aria-hidden="true" />
          </span>
          <div>
            <div className="sidebar-logo-name">KidoTag</div>
            <div className="sidebar-logo-sub">Curso interactivo</div>
          </div>
        </Link>
      </div>

      <div className="sidebar-progress">
        <NivelBadge compact />
        <ProgressBar
          completadas={progress.totalCompletadas}
          total={totalLecciones}
        />
      </div>

      <div className="sidebar-modules">
        {curriculum.map((bloque) => {
          const slugs = bloque.lecciones.map((l) => l.slug);
          const completadas = progress.completadasEnBloque(slugs);
          const tieneActiva = bloque.lecciones.some((l) =>
            pathname.includes(l.slug),
          );

          return (
            <details
              key={bloque.id}
              className="sidebar-bloque"
              open={tieneActiva || bloque.numero === 0}
            >
              <summary className="sidebar-bloque-titulo">
                <span className="sidebar-bloque-icono">
                  <AppIcon token={bloque.icono} size={13} />
                </span>
                <span className="sidebar-bloque-nombre">
                  {bloque.numero}. {bloque.titulo}
                </span>
                <span className="sidebar-bloque-count">
                  {completadas}/{bloque.lecciones.length}
                </span>
              </summary>
              <ul className="sidebar-lecciones">
                {bloque.lecciones.map((leccion) => {
                  const completada = progress.estaCompletada(leccion.slug);
                  const esActiva = pathname.includes(leccion.slug);
                  return (
                    <li key={leccion.slug}>
                      <Link
                        to={`/leccion/${leccion.slug}`}
                        className={`sidebar-leccion${esActiva ? " activa" : ""}${completada ? " completada" : ""}`}
                        onClick={onCerrar}
                      >
                        <span className="sidebar-leccion-check">
                          {completada ? (
                            <Check size={12} aria-hidden="true" />
                          ) : (
                            <Circle size={12} aria-hidden="true" />
                          )}
                        </span>
                        <span className="sidebar-leccion-titulo">
                          {leccion.titulo}
                        </span>
                        <span className="sidebar-leccion-dur">
                          {leccion.duracion}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <Link
          to="/glosario"
          onClick={onCerrar}
          className="sidebar-glossary-link"
        >
          <BookOpen size={14} aria-hidden="true" /> Abrir glosario
        </Link>
        <Link
          to="/resumen-curso"
          onClick={onCerrar}
          className="sidebar-glossary-link"
        >
          <BookOpen size={14} aria-hidden="true" /> Ver resumen del curso
        </Link>
        <button
          className="sidebar-reset"
          onClick={() => {
            if (window.confirm("¿Resetear todo el progreso del curso?")) {
              progress.resetProgreso();
            }
          }}
        >
          Resetear progreso
        </button>
      </div>
    </nav>
  );
}
