import { useEffect } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CodePlayground } from "@/components/CodePlayground";
import type { Verificacion } from "@/types/verificaciones";

interface SandboxConfig {
  archivos?: Record<string, string | { code: string }>;
  files?: Record<string, string | { code: string }>;
  codigo?: string;
  entryFile?: string;
  plantilla?: "react" | "react-ts" | "vanilla" | "vanilla-ts" | "node";
  titulo?: string;
  readOnly?: boolean;
  mostrarConsola?: boolean;
  soloConsola?: boolean;
  altura?: number;
  objetivo?: string;
  pasosIncrementales?: string[];
  retoFinal?: string;
  verificaciones?: Verificacion[];
}

export function SandboxPage() {
  const { slug, sandboxId } = useParams<{ slug: string; sandboxId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    sessionStorage.setItem("kidotag-sandbox-open", "1");
  }, []);

  if (!slug || !sandboxId) {
    return <Navigate to="/" replace />;
  }

  const configKey = `kidotag-sandbox-config:${slug}:${sandboxId}`;
  const raw = sessionStorage.getItem(configKey);

  if (!raw) {
    return (
      <section className="sandbox-page-empty">
        <h2>Sandbox no disponible</h2>
        <p>
          No se encontro la configuracion de este sandbox. Vuelve a la leccion y
          abrelo desde el boton.
        </p>
        <Link className="sandbox-page-back" to={`/leccion/${slug}`}>
          Volver a la leccion
        </Link>
      </section>
    );
  }

  let config: SandboxConfig | null = null;
  try {
    config = JSON.parse(raw) as SandboxConfig;
  } catch {
    config = null;
  }

  if (!config) {
    return <Navigate to={`/leccion/${slug}`} replace />;
  }

  return (
    <section className="sandbox-page">
      <div className="sandbox-page-header">
        <button
          type="button"
          className="sandbox-back-btn"
          onClick={() => navigate(-1)}
          title="Volver a la lección"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver
        </button>
        <h1 className="sandbox-page-title">{config.titulo || "Sandbox"}</h1>
        <Link className="sandbox-page-lesson-link" to={`/leccion/${slug}`}>
          Ver lección
        </Link>
      </div>

      <CodePlayground
        {...config}
        titulo={undefined}
        forceExpanded
        altura={Math.max(config.altura || 420, 560)}
      />
    </section>
  );
}
