import { useState, useEffect, useCallback } from "react";

// ──────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────
export interface ProgresoLeccion {
  completada: boolean;
  quizScore?: number; // 0-100
  completadaEn?: string; // ISO date
}

export interface ProgresoStore {
  lecciones: Record<string, ProgresoLeccion>;
  version: number;
}

const STORAGE_KEY = "kidotag-curso-progreso";
const VERSION = 1;

function estadoInicial(): ProgresoStore {
  return { lecciones: {}, version: VERSION };
}

function cargarDesdeStorage(): ProgresoStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return estadoInicial();
    const parsed = JSON.parse(raw) as ProgresoStore;
    if (parsed.version !== VERSION) return estadoInicial();
    return parsed;
  } catch {
    return estadoInicial();
  }
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────
export function useProgress() {
  const [store, setStore] = useState<ProgresoStore>(cargarDesdeStorage);

  // Persistir en localStorage cada vez que cambia el store
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // localStorage puede estar lleno o deshabilitado
    }
  }, [store]);

  /** Marcar una lección como completada */
  const marcarCompletada = useCallback((slug: string, quizScore?: number) => {
    setStore((prev) => ({
      ...prev,
      lecciones: {
        ...prev.lecciones,
        [slug]: {
          completada: true,
          quizScore,
          completadaEn: new Date().toISOString(),
        },
      },
    }));
  }, []);

  /** Guardar puntaje del quiz sin marcar como completada */
  const guardarQuizScore = useCallback((slug: string, score: number) => {
    setStore((prev) => ({
      ...prev,
      lecciones: {
        ...prev.lecciones,
        [slug]: {
          ...prev.lecciones[slug],
          quizScore: score,
        },
      },
    }));
  }, []);

  /** ¿Está completada una lección? */
  const estaCompletada = useCallback(
    (slug: string): boolean => !!store.lecciones[slug]?.completada,
    [store],
  );

  /** Cantidad de lecciones completadas en un array de slugs */
  const completadasEnBloque = useCallback(
    (slugs: string[]): number =>
      slugs.filter((s) => store.lecciones[s]?.completada).length,
    [store],
  );

  /** Total de lecciones completadas */
  const totalCompletadas = Object.values(store.lecciones).filter(
    (l) => l.completada,
  ).length;

  /** Resetear todo el progreso */
  const resetProgreso = useCallback(() => {
    setStore(estadoInicial());
  }, []);

  return {
    store,
    marcarCompletada,
    guardarQuizScore,
    estaCompletada,
    completadasEnBloque,
    totalCompletadas,
    resetProgreso,
  };
}
