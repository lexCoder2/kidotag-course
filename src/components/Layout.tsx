import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { Bloque } from "@/data/curriculum";
import type { useProgress } from "@/hooks/useProgress";

interface Props {
  curriculum: Bloque[];
  progress: ReturnType<typeof useProgress>;
  totalLecciones: number;
}

export function Layout({ curriculum, progress, totalLecciones }: Props) {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const location = useLocation();
  const isSandboxRoute = location.pathname.startsWith("/sandbox/");

  return (
    <div className={`app-layout${isSandboxRoute ? " sandbox-mode" : ""}`}>
      {sidebarAbierto && (
        <div className="app-overlay" onClick={() => setSidebarAbierto(false)} />
      )}

      <div className={`app-sidebar${sidebarAbierto ? " abierto" : ""}`}>
        <Sidebar
          curriculum={curriculum}
          progress={progress}
          totalLecciones={totalLecciones}
          onCerrar={() => setSidebarAbierto(false)}
        />
      </div>

      <div className="app-main">
        <Header
          onToggleSidebar={() => setSidebarAbierto((v) => !v)}
          sidebarAbierto={sidebarAbierto}
        />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
