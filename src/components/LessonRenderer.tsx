import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { ArrowLeft, ArrowRight, BookOpenText, CheckCircle2, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import type { useProgress } from "@/hooks/useProgress";
import type { Leccion, Bloque } from "@/data/curriculum";
import { useLessonNav } from "@/hooks/useLessonNav";
import { ProgressBar } from "./ProgressBar";
import { TOTAL_LECCIONES } from "@/data/curriculum";
import { BeginnerHelper } from "./BeginnerHelper";
import { ConceptosClave } from "./ConceptosClave";
import { KeywordTooltip } from "./KeywordTooltip";
import { useGamificacion } from "@/hooks/useGamificacion";
import { AppIcon } from "./AppIcon";
import { estaLeccionLeida, marcarLeccionLeida } from "@/utils/lessonQuiz";

// Mapa dinámico de todos los archivos MDX del curso
const LECCIONES_MDX = import.meta.glob("../lessons/**/*.mdx");

interface Props {
  leccion: Leccion & { bloque: Bloque };
  progress: ReturnType<typeof useProgress>;
}

export function LessonRenderer({ leccion, progress }: Props) {
  const { anterior, siguiente, irAnterior, irSiguiente } = useLessonNav(
    leccion.slug,
  );
  const completada = progress.estaCompletada(leccion.slug);
  const { desbloquearInsignia } = useGamificacion();

  const [checksResueltos, setChecksResueltos] = useState(true);
  const [leccionLeida, setLeccionLeida] = useState(() =>
    estaLeccionLeida(leccion.slug),
  );

  const evaluarChecks = useMemo(
    () => () => {
      const requiredPrefix = `kidotag-sandbox-required:${leccion.slug}:`;
      const progressPrefix = `kidotag-sandbox-progress:${leccion.slug}:`;

      const requiredKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith(requiredPrefix)) {
          requiredKeys.push(key);
        }
      }

      if (requiredKeys.length === 0) {
        setChecksResueltos(true);
        return;
      }

      const solvedAll = requiredKeys.every((requiredKey) => {
        const sandboxId = requiredKey.slice(requiredPrefix.length);
        const requiredRaw = localStorage.getItem(requiredKey);
        const progressRaw = localStorage.getItem(
          `${progressPrefix}${sandboxId}`,
        );
        const required = requiredRaw ? Number(requiredRaw) : 0;
        const done = progressRaw ? Number(progressRaw) : 0;
        return required > 0 && done >= required;
      });

      setChecksResueltos(solvedAll);
    },
    [leccion.slug],
  );

  const mdxKey = `../lessons/${leccion.bloque.id}/${leccion.slug}.mdx`;
  const mdxLoader = LECCIONES_MDX[mdxKey];
  const MdxComponent = mdxLoader
    ? lazy(mdxLoader as () => Promise<{ default: ComponentType }>)
    : null;

  useEffect(() => {
    setLeccionLeida(estaLeccionLeida(leccion.slug));

    if (sessionStorage.getItem("kidotag-sandbox-open")) {
      sessionStorage.removeItem("kidotag-sandbox-open");
      return;
    }
    window.scrollTo(0, 0);
  }, [leccion.slug]);

  useEffect(() => {
    function marcarSiLlegoAlFinal() {
      if (leccionLeida) return;
      const scrollTop = window.scrollY;
      const viewport = window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrollTop + viewport >= total * 0.88) {
        marcarLeccionLeida(leccion.slug);
        setLeccionLeida(true);
      }
    }

    marcarSiLlegoAlFinal();
    window.addEventListener("scroll", marcarSiLlegoAlFinal, { passive: true });
    return () => window.removeEventListener("scroll", marcarSiLlegoAlFinal);
  }, [leccion.slug, leccionLeida]);

  useEffect(() => {
    evaluarChecks();

    const onProgress = () => evaluarChecks();
    window.addEventListener("kidotag-sandbox-progress", onProgress);
    window.addEventListener("storage", onProgress);
    return () => {
      window.removeEventListener("kidotag-sandbox-progress", onProgress);
      window.removeEventListener("storage", onProgress);
    };
  }, [evaluarChecks]);

  // Keyboard navigation: ArrowLeft previous, ArrowRight next
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft" && anterior) irAnterior();
      if (e.key === "ArrowRight" && siguiente) irSiguiente();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [anterior, siguiente, irAnterior, irSiguiente]);

  return (
    <article className="lesson">
      <div className="lesson-meta">
        <div className="lesson-breadcrumb">
          <AppIcon token={leccion.bloque.icono} size={14} /> {leccion.bloque.titulo} / {leccion.titulo}
        </div>
        <div className="lesson-tags">
          {leccion.tags.map((t) => (
            <KeywordTooltip key={t} term={t} className="lesson-tag" />
          ))}
        </div>
        <div className="lesson-info">
          <span className={`lesson-nivel nivel-${leccion.nivel}`}>
            {leccion.nivel}
          </span>
          <span className="lesson-duracion">
            <Clock3 size={13} aria-hidden="true" /> {leccion.duracion}
          </span>
        </div>
      </div>

      <div className="lesson-body">
        <BeginnerHelper leccion={leccion} />
        <ConceptosClave leccion={leccion} />
        {MdxComponent ? (
          <Suspense
            fallback={<div className="lesson-loading">Cargando lección...</div>}
          >
            <MdxComponent />
          </Suspense>
        ) : (
          <div className="lesson-placeholder">
            <p>
              <BookOpenText size={14} aria-hidden="true" /> Esta lección está en desarrollo.
            </p>
            <p>Crea el archivo para activarla:</p>
            <code className="lesson-placeholder-path">
              src/lessons/{leccion.bloque.id}/{leccion.slug}.mdx
            </code>
          </div>
        )}
      </div>

      <div className="lesson-actions">
        <div className="lesson-nav">
          <button
            className="nav-btn"
            onClick={irAnterior}
            disabled={!anterior}
            title="tecla flecha izquierda"
          >
            <ArrowLeft size={14} aria-hidden="true" /> {anterior ? anterior.titulo : "Inicio"}
          </button>
          <button
            className={`completar-btn${completada ? " completada" : ""}`}
            onClick={() => {
              progress.marcarCompletada(leccion.slug);
              // Check if the whole module is now complete
              const slugsEnBloque = leccion.bloque.lecciones.map((l) => l.slug);
              const todasCompletas = slugsEnBloque.every(
                (s) => s === leccion.slug || progress.estaCompletada(s),
              );
              if (todasCompletas) {
                desbloquearInsignia(
                  `modulo-${leccion.bloque.id}`,
                  `Módulo ${leccion.bloque.numero} completado: ${leccion.bloque.titulo}`,
                  `Completaste todas las lecciones del módulo ${leccion.bloque.titulo}.`,
                  leccion.bloque.icono,
                );
              }
            }}
            disabled={!checksResueltos && !completada}
          >
            {completada
              ? "Completada"
              : checksResueltos
                ? "Marcar como completada"
                : "Resuelve los checks del sandbox"}
            {completada && <CheckCircle2 size={14} aria-hidden="true" />}
          </button>

          <Link
            to={`/leccion/${leccion.slug}/quiz`}
            className={`nav-btn nav-btn-quiz${checksResueltos && leccionLeida ? "" : " nav-btn-quiz-disabled"}`}
            onClick={(e) => {
              if (!checksResueltos || !leccionLeida) e.preventDefault();
            }}
            title={
              checksResueltos && leccionLeida
                ? "Abrir quiz"
                : "Debes leer la lección y resolver el sandbox para desbloquear el quiz"
            }
            aria-disabled={!checksResueltos || !leccionLeida}
          >
            Ir al quiz
          </Link>

          <button
            className="nav-btn nav-btn-next"
            onClick={irSiguiente}
            disabled={!siguiente}
            title="tecla flecha derecha"
          >
            {siguiente ? siguiente.titulo : "Fin del curso"} <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
        <div className="lesson-nav-hint">
          Tip: usa las flechas izquierda y derecha para navegar entre lecciones.
          El quiz se desbloquea al leer toda la lección y completar el sandbox.
        </div>
        <ProgressBar
          completadas={progress.totalCompletadas}
          total={TOTAL_LECCIONES}
        />
      </div>
    </article>
  );
}
