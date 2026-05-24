import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Home } from "@/pages/Home";
import { LeccionPage } from "@/pages/LeccionPage";
import { LessonQuizPage } from "@/pages/LessonQuizPage";
import { ResumenCursoPage } from "@/pages/ResumenCursoPage";
import { GlosarioPage } from "@/pages/GlosarioPage";
import { SandboxPage } from "@/pages/SandboxPage";
import { useProgress } from "@/hooks/useProgress";
import { CURRICULUM, TOTAL_LECCIONES } from "@/data/curriculum";
import { XPToast } from "@/components/XPToast";
import { BadgeUnlock } from "@/components/BadgeUnlock";

export default function App() {
  const progress = useProgress();
  return (
    <BrowserRouter>
      <XPToast />
      <BadgeUnlock />
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              progress={progress}
              totalLecciones={TOTAL_LECCIONES}
              curriculum={CURRICULUM}
            />
          }
        >
          <Route index element={<Home progress={progress} />} />
          <Route
            path="leccion/:slug"
            element={<LeccionPage progress={progress} />}
          />
          <Route
            path="leccion/:slug/quiz"
            element={<LessonQuizPage progress={progress} />}
          />
          <Route
            path="resumen-curso"
            element={<ResumenCursoPage progress={progress} />}
          />
          <Route path="sandbox/:slug/:sandboxId" element={<SandboxPage />} />
          <Route path="glosario" element={<GlosarioPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
