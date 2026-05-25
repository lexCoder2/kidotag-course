import { useEffect, useRef, useState } from "react";
import { Expand } from "lucide-react";

interface PanZoom {
  x: number;
  y: number;
  scale: number;
}

function PanZoomWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const defaultPz = useRef<PanZoom>({ x: 0, y: 0, scale: 1 });
  const [pz, setPzState] = useState<PanZoom>({ x: 0, y: 0, scale: 1 });
  const pzRef = useRef<PanZoom>({ x: 0, y: 0, scale: 1 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  function setPz(fn: (t: PanZoom) => PanZoom) {
    const next = fn(pzRef.current);
    pzRef.current = next;
    setPzState(next);
  }

  // Center content once, on first load (when inner goes from 0 to non-zero size)
  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;
    let done = false;
    const ro = new ResizeObserver(() => {
      if (done) return;
      const iw = inner.offsetWidth;
      const ih = inner.offsetHeight;
      if (iw === 0 || ih === 0) return;
      done = true;
      const centered: PanZoom = {
        x: Math.max(0, (container.clientWidth - iw) / 2),
        y: Math.max(0, (container.clientHeight - ih) / 2),
        scale: 1,
      };
      defaultPz.current = centered;
      pzRef.current = centered;
      setPzState(centered);
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = el!.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 0.9;
      setPz((t) => {
        const newScale = Math.min(Math.max(t.scale * factor, 0.15), 8);
        const ratio = newScale / t.scale;
        return {
          scale: newScale,
          x: cx - ratio * (cx - t.x),
          y: cy - ratio * (cy - t.y),
        };
      });
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPz((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
  }

  function onPointerUp() {
    dragging.current = false;
  }

  function reset() {
    const d = { ...defaultPz.current };
    pzRef.current = d;
    setPzState(d);
  }

  return (
    <div
      ref={containerRef}
      className="panzoom-container"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        ref={innerRef}
        className="panzoom-inner"
        style={{
          transform: `translate(${pz.x}px,${pz.y}px) scale(${pz.scale})`,
          transformOrigin: "0 0",
        }}
      >
        {children}
      </div>
      {(pz.scale !== defaultPz.current.scale ||
        pz.x !== defaultPz.current.x ||
        pz.y !== defaultPz.current.y) && (
        <button type="button" className="panzoom-reset" onClick={reset}>
          ↺ Restablecer vista
        </button>
      )}
      <span className="panzoom-hint">
        Rueda para zoom · arrastra para mover
      </span>
    </div>
  );
}

interface Props {
  diagrama: string;
  titulo?: string;
}

export function Mermaid({ diagrama, titulo }: Props) {
  const ref = useRef<HTMLDivElement>(null);
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
    if (!abierto) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [abierto]);

  function cerrarVistaCompleta() {
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
          <PanZoomWrapper>
            <div ref={ref} className="mermaid-svg" />
          </PanZoomWrapper>
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
            className="media-lightbox-mermaid"
            onClick={(e) => e.stopPropagation()}
          >
            <PanZoomWrapper>
              <div dangerouslySetInnerHTML={{ __html: svgMarkup }} />
            </PanZoomWrapper>
          </div>
        </div>
      )}
    </figure>
  );
}
