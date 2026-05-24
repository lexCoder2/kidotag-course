import { Navigate, Link, useParams } from "react-router-dom";
import { Lock, CircleCheck, CircleX, CircleArrowLeft } from "lucide-react";
import { buscarLeccion } from "@/data/curriculum";
import { Quiz } from "@/components/Quiz";
import type { useProgress } from "@/hooks/useProgress";
import { cargarQuizLeccion, estaLeccionLeida } from "@/utils/lessonQuiz";

interface Props {
  progress: ReturnType<typeof useProgress>;
}

function checksSandboxResueltos(slug: string): boolean {
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
    const done = Number(localStorage.getItem(`${progressPrefix}${sandboxId}`) || 0);
    return required > 0 && done >= required;
  });
}

export function LessonQuizPage({ progress }: Props) {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) return <Navigate to="/" replace />;

  const resultado = buscarLeccion(slug);
  if (!resultado) return <Navigate to="/" replace />;

  const leccionLeida = estaLeccionLeida(slug);
  const sandboxOk = checksSandboxResueltos(slug);
  const preguntas = cargarQuizLeccion(slug);
  const desbloqueado = leccionLeida && sandboxOk;

  return (
    <section className="lesson-quiz-page">
      <div className="lesson-quiz-header">
        <Link to={`/leccion/${slug}`} className="lesson-quiz-back">
          <CircleArrowLeft size={14} aria-hidden="true" /> Volver a la lección
        </Link>
        <h1>Quiz: {resultado.titulo}</h1>
      </div>

      {!desbloqueado && (
        <div className="lesson-quiz-lock">
          <div className="lesson-quiz-lock-title">
            <Lock size={16} aria-hidden="true" /> Quiz bloqueado
          </div>
          <p>Para habilitar el quiz, completa estos pasos:</p>
          <ul>
            <li className={leccionLeida ? "ok" : "ko"}>
              {leccionLeida ? (
                <CircleCheck size={14} aria-hidden="true" />
              ) : (
                <CircleX size={14} aria-hidden="true" />
              )}
              Leer la lección completa (scroll hasta el final).
            </li>
            <li className={sandboxOk ? "ok" : "ko"}>
              {sandboxOk ? (
                <CircleCheck size={14} aria-hidden="true" />
              ) : (
                <CircleX size={14} aria-hidden="true" />
              )}
              Resolver los ejercicios/checks del sandbox.
            </li>
          </ul>
        </div>
      )}

      {desbloqueado && preguntas.length === 0 && (
        <div className="lesson-quiz-lock">
          <div className="lesson-quiz-lock-title">
            <Lock size={16} aria-hidden="true" /> Quiz no disponible todavía
          </div>
          <p>
            Abre la lección y desplázate hasta la sección del quiz para cargarlo,
            luego vuelve aquí.
          </p>
        </div>
      )}

      {desbloqueado && preguntas.length > 0 && (
        <Quiz
          preguntas={preguntas}
          onCompletado={(score) => progress.guardarQuizScore(slug, score)}
        />
      )}
    </section>
  );
}
