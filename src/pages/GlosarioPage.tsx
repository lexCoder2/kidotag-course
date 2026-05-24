import { useMemo, useState } from "react";
import { GLOSSARY } from "@/data/glossary";

export function GlosarioPage() {
  const [q, setQ] = useState("");

  const filtrado = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return GLOSSARY;
    return GLOSSARY.filter(
      (item) =>
        item.titulo.toLowerCase().includes(query) ||
        item.descripcionCorta.toLowerCase().includes(query) ||
        item.descripcionLarga.toLowerCase().includes(query),
    );
  }, [q]);

  return (
    <section className="glosario-page">
      <header className="glosario-header">
        <h1>Glosario técnico del curso</h1>
        <p>
          Aquí puedes consultar términos clave con explicación corta,
          explicación profunda, ejemplo y recursos en YouTube.
        </p>
        <input
          className="glosario-search"
          placeholder="Buscar término..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </header>

      <div className="glosario-grid">
        {filtrado.map((item) => (
          <article key={item.key} id={item.key} className="glosario-card">
            <h2>{item.titulo}</h2>
            <p className="glosario-short">{item.descripcionCorta}</p>
            <p>{item.descripcionLarga}</p>
            <p>
              <strong>Ejemplo:</strong> {item.ejemplo}
            </p>
            <div className="glosario-videos">
              <strong>Videos recomendados:</strong>
              <ul>
                {item.videos.map((v) => (
                  <li key={v.url}>
                    <a href={v.url} target="_blank" rel="noreferrer">
                      {v.titulo}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
