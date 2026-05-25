import { WikiPanel } from "@/components/WikiPanel";
import { GLOSSARY } from "@/data/glossary";

export function GlosarioPage() {
  return (
    <section className="glosario-page">
      <header className="glosario-header">
        <h1>Glosario técnico del curso</h1>
        <p>
          {GLOSSARY.length} términos con explicación completa, ejemplos del proyecto
          KidoTag y recursos de video. Usa la búsqueda o filtra por categoría.
        </p>
      </header>
      <WikiPanel mode="page" />
    </section>
  );
}
