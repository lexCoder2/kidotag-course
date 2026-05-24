import { useState } from "react";
import { Expand } from "lucide-react";
import type { ComponentProps } from "react";

type Props = ComponentProps<"img">;

export function MdxImage({ alt = "Imagen", ...props }: Props) {
  const [abierta, setAbierta] = useState(false);

  if (!props.src) return null;

  return (
    <figure className="mdx-image-wrap">
      <button
        type="button"
        className="mdx-image-btn"
        onClick={() => setAbierta(true)}
        aria-label="Ver imagen en pantalla completa"
      >
        <img {...props} alt={alt} className="mdx-image" loading="lazy" />
        <span className="mdx-image-hint">
          <Expand size={12} aria-hidden="true" /> Ver en pantalla completa
        </span>
      </button>

      {abierta && (
        <div
          className="media-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Imagen en pantalla completa"
          onClick={() => setAbierta(false)}
        >
          <button
            type="button"
            className="media-lightbox-close"
            onClick={() => setAbierta(false)}
          >
            Cerrar
          </button>
          <img
            {...props}
            alt={alt}
            className="media-lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </figure>
  );
}
