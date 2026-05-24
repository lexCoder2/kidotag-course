import type { PreguntaQuiz } from "@/components/Quiz";

const QUIZ_PREFIX = "kidotag-lesson-quiz:";
const READ_PREFIX = "kidotag-lesson-read:";

function quizKey(slug: string): string {
  return `${QUIZ_PREFIX}${slug}`;
}

function readKey(slug: string): string {
  return `${READ_PREFIX}${slug}`;
}

export function guardarQuizLeccion(slug: string, preguntas: PreguntaQuiz[]) {
  try {
    const existentes = cargarQuizLeccion(slug);
    const merged = [...existentes];

    for (const p of preguntas) {
      if (!merged.some((m) => m.pregunta === p.pregunta)) {
        merged.push(p);
      }
    }

    localStorage.setItem(quizKey(slug), JSON.stringify(merged));
  } catch {
    // localStorage can fail in private mode
  }
}

export function cargarQuizLeccion(slug: string): PreguntaQuiz[] {
  try {
    const raw = localStorage.getItem(quizKey(slug));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PreguntaQuiz[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function marcarLeccionLeida(slug: string) {
  try {
    localStorage.setItem(readKey(slug), "1");
  } catch {
    // localStorage can fail in private mode
  }
}

export function estaLeccionLeida(slug: string): boolean {
  try {
    return localStorage.getItem(readKey(slug)) === "1";
  } catch {
    return false;
  }
}
