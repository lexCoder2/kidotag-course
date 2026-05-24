import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  todasLasLecciones,
  type Leccion,
  type Bloque,
} from "@/data/curriculum";

export function useLessonNav(slug: string) {
  const navigate = useNavigate();
  const todas = useMemo(() => todasLasLecciones(), []);

  const { anterior, siguiente } = useMemo(() => {
    const idx = todas.findIndex((l) => l.slug === slug);
    return {
      anterior: idx > 0 ? todas[idx - 1] : null,
      siguiente: idx >= 0 && idx < todas.length - 1 ? todas[idx + 1] : null,
    };
  }, [todas, slug]);

  const irAnterior = () => {
    if (anterior) navigate(`/leccion/${anterior.slug}`);
  };

  const irSiguiente = () => {
    if (siguiente) navigate(`/leccion/${siguiente.slug}`);
  };

  const irAHome = () => navigate("/");

  return { anterior, siguiente, irAnterior, irSiguiente, irAHome };
}

// Re-exportar tipos para comodidad
export type { Leccion, Bloque };
