import { Link } from "react-router-dom";
import {
  ArrowRight,
  School,
  Flame,
  Clock3,
  Trophy,
  Target,
  CheckCheck,
  Layers3,
} from "lucide-react";
import { CURRICULUM, TOTAL_LECCIONES } from "@/data/curriculum";
import { ProgressBar } from "@/components/ProgressBar";
import { SearchBar } from "@/components/SearchBar";
import { NivelBadge } from "@/components/NivelBadge";
import { AppIcon } from "@/components/AppIcon";
import { useGamificacion } from "@/hooks/useGamificacion";
import type { useProgress } from "@/hooks/useProgress";

interface Props {
  progress: ReturnType<typeof useProgress>;
}

function minutosDesdeDuracion(raw: string): number {
  const match = raw.match(/(\d+)\s*min/i);
  return match ? Number(match[1]) : 0;
}

export function Home({ progress }: Props) {
  const primeraLeccion = CURRICULUM[0]?.lecciones[0];
  const rutaBasica = CURRICULUM.slice(0, 4);
  const rutaIntermedia = CURRICULUM.slice(4, 9);
  const rutaAvanzada = CURRICULUM.slice(9);
  const { xp, nivel, insignias, racha, progresoNivel } = useGamificacion();

  const leccionesPlanas = CURRICULUM.flatMap((bloque) =>
    bloque.lecciones.map((leccion) => ({ ...leccion, bloque })),
  );

  const siguienteLeccion =
    leccionesPlanas.find((l) => !progress.estaCompletada(l.slug)) ||
    primeraLeccion;

  const minutosTotales = leccionesPlanas.reduce(
    (acc, l) => acc + minutosDesdeDuracion(l.duracion),
    0,
  );

  const minutosCompletados = leccionesPlanas
    .filter((l) => progress.estaCompletada(l.slug))
    .reduce((acc, l) => acc + minutosDesdeDuracion(l.duracion), 0);

  const minutosRestantes = Math.max(0, minutosTotales - minutosCompletados);
  const porcentajeCurso = Math.round(
    (progress.totalCompletadas / Math.max(TOTAL_LECCIONES, 1)) * 100,
  );

  const modulosCompletos = CURRICULUM.filter((bloque) => {
    const completadas = progress.completadasEnBloque(
      bloque.lecciones.map((l) => l.slug),
    );
    return completadas === bloque.lecciones.length;
  }).length;

  const quizScores = Object.values(progress.store.lecciones)
    .map((l) => l.quizScore)
    .filter((s): s is number => typeof s === "number");
  const promedioQuiz =
    quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : null;

  return (
    <div className="home">
      <section className="home-dashboard">
        <header className="home-dashboard-hero">
          <div className="home-dashboard-hero-left">
            <div className="home-hero-icon">
              <School size={28} aria-hidden="true" />
            </div>
            <div>
              <h1 className="home-titulo">Curso KidoTag</h1>
              <p className="home-subtitulo">
                Aprende backend, frontend y arquitectura real en una sola ruta.
                Esta vista te muestra exactamente en que estado vas y que
                estudiar despues.
              </p>
            </div>
          </div>

          <div className="home-dashboard-hero-right">
            <div className="home-dashboard-hero-kpi">
              <span>Progreso total</span>
              <strong>{porcentajeCurso}%</strong>
            </div>
            <ProgressBar
              completadas={progress.totalCompletadas}
              total={TOTAL_LECCIONES}
            />
            <div className="home-dashboard-cta-row">
              {siguienteLeccion && (
                <Link to={`/leccion/${siguienteLeccion.slug}`} className="home-cta">
                  Continuar con {siguienteLeccion.titulo}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              )}
              <Link to="/resumen-curso" className="home-cta home-cta-secondary">
                Presentacion condensada <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </header>

        <SearchBar />

        <section className="home-kpi-grid" aria-label="Indicadores de progreso">
          <article className="home-kpi-card">
            <span className="home-kpi-label">
              <CheckCheck size={14} aria-hidden="true" /> Lecciones completadas
            </span>
            <strong className="home-kpi-value">
              {progress.totalCompletadas}/{TOTAL_LECCIONES}
            </strong>
            <small>{TOTAL_LECCIONES - progress.totalCompletadas} por terminar</small>
          </article>

          <article className="home-kpi-card">
            <span className="home-kpi-label">
              <Clock3 size={14} aria-hidden="true" /> Tiempo estimado restante
            </span>
            <strong className="home-kpi-value">{minutosRestantes} min</strong>
            <small>{minutosCompletados} min ya estudiados</small>
          </article>

          <article className="home-kpi-card">
            <span className="home-kpi-label">
              <Layers3 size={14} aria-hidden="true" /> Modulos dominados
            </span>
            <strong className="home-kpi-value">
              {modulosCompletos}/{CURRICULUM.length}
            </strong>
            <small>avance por bloques reales del curso</small>
          </article>

          <article className="home-kpi-card">
            <span className="home-kpi-label">
              <Target size={14} aria-hidden="true" /> Promedio en quizzes
            </span>
            <strong className="home-kpi-value">
              {promedioQuiz === null ? "--" : `${promedioQuiz}%`}
            </strong>
            <small>
              {promedioQuiz === null
                ? "Aun sin quizzes registrados"
                : `${quizScores.length} quiz${quizScores.length > 1 ? "zes" : ""} evaluados`}
            </small>
          </article>
        </section>

        <section className="home-momentum-grid" aria-label="Momentum de estudio">
          <article className="home-momentum-card">
            <h2>Estado de nivel</h2>
            <div className="home-momentum-level-row">
              <NivelBadge compact />
              <div className="home-momentum-level-stats">
                <span>Nivel {nivel}</span>
                <strong>{xp} XP</strong>
                <small>
                  {progresoNivel.actual}/{progresoNivel.requerido} XP para el
                  siguiente nivel
                </small>
              </div>
            </div>
            <div className="home-momentum-level-track">
              <div
                className="home-momentum-level-fill"
                style={{ width: `${progresoNivel.porcentaje}%` }}
              />
            </div>
          </article>

          <article className="home-momentum-card">
            <h2>Racha e insignias</h2>
            <p className="home-momentum-inline">
              <Flame size={14} aria-hidden="true" />
              {racha > 1 ? `${racha} dias seguidos` : "Activa tu racha hoy"}
            </p>
            <p className="home-momentum-inline">
              <Trophy size={14} aria-hidden="true" />
              {insignias.length} insignias desbloqueadas
            </p>
            {insignias.length > 0 && (
              <div className="home-insignias">
                {insignias.slice(0, 6).map((ins) => (
                  <div
                    key={ins.id}
                    className="home-insignia-chip"
                    title={`${ins.titulo}: ${ins.descripcion}`}
                  >
                    <span>
                      <AppIcon token={ins.icono} size={13} />
                    </span>
                    <span className="home-insignia-chip-titulo">{ins.titulo}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      </section>

      <section className="home-modulos">
        <div className="ruta-card">
          <h2 className="ruta-title">Ruta recomendada (de facil a avanzado)</h2>
          <div className="ruta-grid">
            <div className="ruta-col">
              <h3>Fase 1 · Base</h3>
              <ul>
                {rutaBasica.map((b) => (
                  <li key={b.id}>
                    <AppIcon token={b.icono} size={13} /> {b.titulo}
                  </li>
                ))}
              </ul>
            </div>
            <div className="ruta-col">
              <h3>Fase 2 · Construccion</h3>
              <ul>
                {rutaIntermedia.map((b) => (
                  <li key={b.id}>
                    <AppIcon token={b.icono} size={13} /> {b.titulo}
                  </li>
                ))}
              </ul>
            </div>
            <div className="ruta-col">
              <h3>Fase 3 · Dominio</h3>
              <ul>
                {rutaAvanzada.map((b) => (
                  <li key={b.id}>
                    <AppIcon token={b.icono} size={13} /> {b.titulo}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <h2 className="home-modulos-titulo">Contenido del curso</h2>
        <div className="home-grid">
          {CURRICULUM.map((bloque) => {
            const slugs = bloque.lecciones.map((l) => l.slug);
            const completadas = progress.completadasEnBloque(slugs);
            const pct = Math.round(
              (completadas / bloque.lecciones.length) * 100,
            );
            const primeraL = bloque.lecciones[0];

            return (
              <div key={bloque.id} className="modulo-card">
                <div className="modulo-card-header">
                  <span className="modulo-icono">
                    <AppIcon token={bloque.icono} size={16} />
                  </span>
                  <div>
                    <div className="modulo-num">Módulo {bloque.numero}</div>
                    <div className="modulo-titulo">{bloque.titulo}</div>
                  </div>
                  <span className="modulo-pct">{pct}%</span>
                </div>
                <p className="modulo-desc">{bloque.descripcion}</p>
                <div className="modulo-progress">
                  <div
                    className="modulo-progress-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="modulo-footer">
                  <span className="modulo-lecciones-count">
                    {bloque.lecciones.length} lecciones · {completadas}{" "}
                    completadas
                  </span>
                  <Link to={`/leccion/${primeraL.slug}`} className="modulo-ir">
                    {completadas > 0 ? "Continuar" : "Empezar"} <ArrowRight size={13} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
