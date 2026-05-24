import { useEffect, useRef, useState } from "react";
import { Expand } from "lucide-react";

interface Props {
  diagrama: string;
  titulo?: string;
}

export function Mermaid({ diagrama, titulo }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svgMarkup, setSvgMarkup] = useState("");
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    let cancelado = false;
    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
        });
        const id = "mermaid-" + Math.random().toString(36).slice(2);
        const { svg } = await mermaid.render(id, diagrama);
        if (!cancelado && ref.current) {
          ref.current.innerHTML = svg;
          setSvgMarkup(svg);
        }
      } catch (e) {
        if (!cancelado) setError(String(e));
      }
    }
    render();
    return () => {
      cancelado = true;
    };
  }, [diagrama]);

  useEffect(() => {
    if (!abierto || !fullscreenRef.current) return;

    const target = fullscreenRef.current;
    let solicitoFullscreen = false;

    if (target.requestFullscreen) {
      target.requestFullscreen().then(
        () => {
          solicitoFullscreen = true;
        },
        () => {
          // Fallback: keep modal open if Fullscreen API fails.
        },
      );
    }

    function onFullscreenChange() {
      if (solicitoFullscreen && !document.fullscreenElement) {
        setAbierto(false);
      }
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [abierto]);

  async function cerrarVistaCompleta() {
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore fullscreen exit errors.
      }
    }
    setAbierto(false);
  }

  return (
    <figure className="mermaid-wrap">
      {titulo && <figcaption className="mermaid-titulo">{titulo}</figcaption>}
      {error ? (
        <pre className="mermaid-error">{error}</pre>
      ) : (
        <>
          <button
            type="button"
            className="mermaid-fullscreen-btn"
            onClick={() => setAbierto(true)}
          >
            <Expand size={12} aria-hidden="true" /> Ver diagrama en pantalla
            completa
          </button>
          <div ref={ref} className="mermaid-svg" />
        </>
      )}

      {abierto && svgMarkup && (
        <div
          className="media-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Diagrama en pantalla completa"
          onClick={cerrarVistaCompleta}
        >
          <button
            type="button"
            className="media-lightbox-close"
            onClick={cerrarVistaCompleta}
          >
            Cerrar
          </button>
          <div
            ref={fullscreenRef}
            className="media-lightbox-mermaid"
            onClick={(e) => e.stopPropagation()}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        </div>
      )}
    </figure>
  );
}
