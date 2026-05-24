import { useParams, Navigate } from "react-router-dom";
import { buscarLeccion } from "@/data/curriculum";
import { LessonRenderer } from "@/components/LessonRenderer";
import type { useProgress } from "@/hooks/useProgress";

interface Props {
  progress: ReturnType<typeof useProgress>;
}

export function LeccionPage({ progress }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const resultado = slug ? buscarLeccion(slug) : undefined;

  if (!resultado) {
    return <Navigate to="/" replace />;
  }

  return <LessonRenderer leccion={resultado} progress={progress} />;
}
