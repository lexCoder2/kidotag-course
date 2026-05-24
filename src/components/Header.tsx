import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, House, Menu, X } from "lucide-react";
import { CURRICULUM } from "@/data/curriculum";

interface Props {
  onToggleSidebar: () => void;
  sidebarAbierto: boolean;
}

export function Header({ onToggleSidebar, sidebarAbierto }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  let titulo = "Curso KidoTag";
  if (pathname === "/resumen-curso") {
    titulo = "Presentacion del curso";
  }
  outer: for (const bloque of CURRICULUM) {
    for (const leccion of bloque.lecciones) {
      if (pathname.includes(leccion.slug)) {
        titulo = leccion.titulo;
        break outer;
      }
    }
  }

  return (
    <header className="app-header">
      <button
        className="header-menu-btn"
        onClick={onToggleSidebar}
        aria-label={sidebarAbierto ? "Cerrar menú" : "Abrir menú"}
      >
        {sidebarAbierto ? (
          <X size={16} aria-hidden="true" />
        ) : (
          <Menu size={16} aria-hidden="true" />
        )}
      </button>
      <h1 className="header-titulo">{titulo}</h1>
      <button
        className="header-home-btn"
        onClick={() => navigate("/glosario")}
        title="Glosario"
      >
        <BookOpen size={15} aria-hidden="true" />
      </button>
      <button
        className="header-home-btn"
        onClick={() => navigate("/")}
        title="Inicio"
      >
        <House size={15} aria-hidden="true" />
      </button>
    </header>
  );
}
