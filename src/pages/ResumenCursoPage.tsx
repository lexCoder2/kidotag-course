import { Link } from "react-router-dom";
import { ArrowRight, BookOpenText, Layers3, TimerReset } from "lucide-react";
import { CURRICULUM, TOTAL_LECCIONES } from "@/data/curriculum";
import { AppIcon } from "@/components/AppIcon";
import type { useProgress } from "@/hooks/useProgress";

interface Props {
  progress: ReturnType<typeof useProgress>;
}

function duracionEnMinutos(raw: string): number {
  const match = raw.match(/(\d+)\s*min/i);
  return match ? Number(match[1]) : 0;
}

function nivelPeso(nivel: "basico" | "intermedio" | "avanzado"): number {
  if (nivel === "basico") return 1;
  if (nivel === "intermedio") return 2;
  return 3;
}

export function ResumenCursoPage({ progress }: Props) {
  const primeraLeccion = CURRICULUM[0]?.lecciones[0];

  const minutosTotales = CURRICULUM.flatMap((b) => b.lecciones).reduce(
    (acc, l) => acc + duracionEnMinutos(l.duracion),
    0,
  );

  const dificultadPromedio =
    CURRICULUM.flatMap((b) => b.lecciones).reduce(
      (acc, l) => acc + nivelPeso(l.nivel),
      0,
    ) / Math.max(1, TOTAL_LECCIONES);

  const dificultadTexto =
    dificultadPromedio < 1.6
      ? "Base"
      : dificultadPromedio < 2.4
        ? "Intermedia"
        : "Avanzada";

  return (
    <section className="course-presentation">
      <header className="course-presentation-hero">
        <span className="course-presentation-kicker">Presentacion condensada</span>
        <h1>Mapa completo del curso KidoTag</h1>
        <p>
          Esta vista resume todo el programa para estudiar en menos tiempo:
          objetivos, modulos, lecciones, esfuerzo estimado y progreso actual.
        </p>

        <div className="course-presentation-metrics">
          <div className="course-presentation-metric">
            <span>Modulos</span>
            <strong>{CURRICULUM.length}</strong>
          </div>
          <div className="course-presentation-metric">
            <span>Lecciones</span>
            <strong>{TOTAL_LECCIONES}</strong>
          </div>
          <div className="course-presentation-metric">
            <span>Tiempo total estimado</span>
            <strong>{minutosTotales} min</strong>
          </div>
          <div className="course-presentation-metric">
            <span>Dificultad media</span>
            <strong>{dificultadTexto}</strong>
          </div>
        </div>

        <div className="course-presentation-cta-row">
          {primeraLeccion && (
            <Link to={`/leccion/${primeraLeccion.slug}`} className="course-presentation-cta">
              Empezar desde el inicio <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
          <Link to="/glosario" className="course-presentation-cta course-presentation-cta-alt">
            Ir al glosario <BookOpenText size={14} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section className="course-presentation-focus">
        <h2>Como estudiar este resumen</h2>
        <ul>
          <li>
            Lee primero la descripcion de cada modulo para entender el objetivo
            principal antes de entrar a las lecciones.
          </li>
          <li>
            Usa los tags frecuentes para recordar los conceptos tecnicos clave.
          </li>
          <li>
            Revisa tu progreso por modulo y decide en cual retomar hoy.
          </li>
        </ul>
      </section>

      <section className="course-presentation-grid" aria-label="Resumen por modulo">
        {CURRICULUM.map((bloque) => {
          const completadas = progress.completadasEnBloque(
            bloque.lecciones.map((l) => l.slug),
          );
          const pct = Math.round((completadas / bloque.lecciones.length) * 100);
          const minutosBloque = bloque.lecciones.reduce(
            (acc, l) => acc + duracionEnMinutos(l.duracion),
            0,
          );

          const tagScore = new Map<string, number>();
          for (const l of bloque.lecciones) {
            for (const t of l.tags) {
              tagScore.set(t, (tagScore.get(t) || 0) + 1);
            }
          }

          const tagsClave = [...tagScore.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tag]) => tag);

          return (
            <article key={bloque.id} className="course-presentation-card">
              <div className="course-presentation-card-head">
                <span className="course-presentation-icon">
                  <AppIcon token={bloque.icono} size={16} />
                </span>
                <div>
                  <p className="course-presentation-module">Modulo {bloque.numero}</p>
                  <h3>{bloque.titulo}</h3>
                </div>
                <span className="course-presentation-pct">{pct}%</span>
              </div>

              <p className="course-presentation-desc">{bloque.descripcion}</p>

              <div className="course-presentation-mini-stats">
                <span>
                  <Layers3 size={13} aria-hidden="true" /> {bloque.lecciones.length} lecciones
                </span>
                <span>
                  <TimerReset size={13} aria-hidden="true" /> {minutosBloque} min
                </span>
              </div>

              <div className="course-presentation-tags">
                {tagsClave.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <ol className="course-presentation-lessons">
                {bloque.lecciones.map((leccion) => (
                  <li key={leccion.slug}>
                    <Link to={`/leccion/${leccion.slug}`}>{leccion.titulo}</Link>
                    <small>{leccion.duracion}</small>
                  </li>
                ))}
              </ol>
            </article>
          );
        })}
      </section>
    </section>
  );
}
