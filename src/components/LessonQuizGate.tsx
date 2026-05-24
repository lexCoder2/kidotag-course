import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CircleArrowRight,
  FlaskConical,
  CircleCheck,
  CircleX,
  Lock,
} from "lucide-react";
import type { PreguntaQuiz } from "@/components/Quiz";
import { guardarQuizLeccion } from "@/utils/lessonQuiz";
import { estaLeccionLeida } from "@/utils/lessonQuiz";

interface Props {
  preguntas: PreguntaQuiz[];
}

export function LessonQuizGate({ preguntas }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const [leccionLeida, setLeccionLeida] = useState(false);
  const [sandboxListo, setSandboxListo] = useState(false);

  const verificarSandbox = useMemo(
    () => () => {
      if (!slug) return false;
      const requiredPrefix = `kidotag-sandbox-required:${slug}:`;
      const progressPrefix = `kidotag-sandbox-progress:${slug}:`;

      const requiredKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith(requiredPrefix)) {
          requiredKeys.push(key);
        }
      }

      if (requiredKeys.length === 0) return true;

      return requiredKeys.every((requiredKey) => {
        const sandboxId = requiredKey.slice(requiredPrefix.length);
        const required = Number(localStorage.getItem(requiredKey) || 0);
        const done = Number(
          localStorage.getItem(`${progressPrefix}${sandboxId}`) || 0,
        );
        return required > 0 && done >= required;
      });
    },
    [slug],
  );

  const desbloqueado = leccionLeida && sandboxListo;

  useEffect(() => {
    if (!slug || !preguntas?.length) return;
    guardarQuizLeccion(slug, preguntas);
  }, [preguntas, slug]);

  useEffect(() => {
    if (!slug) return;
    const safeSlug = slug;

    function evaluarEstado() {
      setLeccionLeida(estaLeccionLeida(safeSlug));
      setSandboxListo(verificarSandbox());
    }

    evaluarEstado();
    window.addEventListener("scroll", evaluarEstado, { passive: true });
    window.addEventListener("kidotag-sandbox-progress", evaluarEstado);
    window.addEventListener("storage", evaluarEstado);
    return () => {
      window.removeEventListener("scroll", evaluarEstado);
      window.removeEventListener("kidotag-sandbox-progress", evaluarEstado);
      window.removeEventListener("storage", evaluarEstado);
    };
  }, [slug, verificarSandbox]);

  if (!slug) return null;

  return (
    <div className="quiz-gate">
      <div className="quiz-gate-head">
        <span className="quiz-gate-kicker">Evaluacion final</span>
        <div className="quiz-gate-status" aria-live="polite">
          {desbloqueado ? (
            <>
              <CircleCheck size={14} aria-hidden="true" /> Desbloqueado
            </>
          ) : (
            <>
              <Lock size={14} aria-hidden="true" /> Bloqueado
            </>
          )}
        </div>
      </div>

      <div className="quiz-gate-title-row">
        <FlaskConical size={16} aria-hidden="true" />
        <strong>Quiz de esta leccion</strong>
      </div>

      <p>
        Responde el quiz en una pagina dedicada para mantener foco y medir tu
        comprension real del tema.
      </p>

      <ul className="quiz-gate-checks">
        <li className={leccionLeida ? "ok" : "ko"}>
          {leccionLeida ? (
            <CircleCheck size={14} aria-hidden="true" />
          ) : (
            <CircleX size={14} aria-hidden="true" />
          )}
          Leccion leida
        </li>
        <li className={sandboxListo ? "ok" : "ko"}>
          {sandboxListo ? (
            <CircleCheck size={14} aria-hidden="true" />
          ) : (
            <CircleX size={14} aria-hidden="true" />
          )}
          Checks del sandbox completados
        </li>
      </ul>

      <Link
        to={`/leccion/${slug}/quiz`}
        className={`quiz-gate-btn${desbloqueado ? "" : " quiz-gate-btn-disabled"}`}
        onClick={(e) => {
          if (!desbloqueado) e.preventDefault();
        }}
        aria-disabled={!desbloqueado}
      >
        {desbloqueado ? "Comenzar quiz" : "Completa los requisitos"}
        <CircleArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}
