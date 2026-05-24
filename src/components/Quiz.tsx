import { useState } from "react";
import { Brain, CheckCircle2, CircleX } from "lucide-react";

interface Opcion {
  texto: string;
  correcta?: boolean;
}

export interface PreguntaQuiz {
  pregunta: string;
  opciones: Opcion[];
  explicacion?: string;
}

interface Props {
  preguntas: PreguntaQuiz[];
  onCompletado?: (puntaje: number) => void;
}

export function Quiz({ preguntas, onCompletado }: Props) {
  const [respuestas, setRespuestas] = useState<(number | null)[]>(
    Array(preguntas.length).fill(null),
  );
  const [enviado, setEnviado] = useState(false);

  const elegir = (pIdx: number, oIdx: number) => {
    if (enviado) return;
    setRespuestas((prev) => {
      const next = [...prev];
      next[pIdx] = oIdx;
      return next;
    });
  };

  const enviar = () => {
    if (respuestas.some((r) => r === null)) return;
    setEnviado(true);
    const correctas = preguntas.filter(
      (p, i) => p.opciones[respuestas[i]!]?.correcta,
    ).length;
    onCompletado?.(Math.round((correctas / preguntas.length) * 100));
  };

  const reiniciar = () => {
    setRespuestas(Array(preguntas.length).fill(null));
    setEnviado(false);
  };

  const correctas = enviado
    ? preguntas.filter((p, i) => p.opciones[respuestas[i]!]?.correcta).length
    : 0;

  return (
    <div className="quiz">
      <div className="quiz-header">
        <span className="quiz-badge">
          <Brain size={14} aria-hidden="true" /> Quiz
        </span>
        {enviado && (
          <span
            className={`quiz-score${correctas === preguntas.length ? " perfecto" : ""}`}
          >
            {correctas}/{preguntas.length} correctas
          </span>
        )}
      </div>

      <ol className="quiz-list">
        {preguntas.map((p, pIdx) => {
          const resp = respuestas[pIdx];
          const esCorrecta = enviado && p.opciones[resp!]?.correcta;
          return (
            <li key={pIdx} className="quiz-pregunta">
              <p className="quiz-texto">{p.pregunta}</p>
              <ul className="quiz-opciones">
                {p.opciones.map((o, oIdx) => {
                  let cls = "opcion";
                  if (resp === oIdx) cls += " seleccionada";
                  if (enviado && o.correcta) cls += " correcta";
                  if (enviado && oIdx === resp && !o.correcta)
                    cls += " incorrecta";
                  return (
                    <li key={oIdx}>
                      <button
                        className={cls}
                        onClick={() => elegir(pIdx, oIdx)}
                        disabled={enviado}
                      >
                        <span className="opcion-letra">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        {o.texto}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {enviado && p.explicacion && (
                <div className={`quiz-explicacion ${esCorrecta ? "ok" : "ko"}`}>
                  {esCorrecta ? (
                    <CheckCircle2 size={13} aria-hidden="true" />
                  ) : (
                    <CircleX size={13} aria-hidden="true" />
                  )}{" "}
                  {p.explicacion}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="quiz-acciones">
        {!enviado ? (
          <button
            className="btn-primary"
            onClick={enviar}
            disabled={respuestas.some((r) => r === null)}
          >
            Verificar respuestas
          </button>
        ) : (
          <button className="btn-secondary" onClick={reiniciar}>
            Intentar de nuevo
          </button>
        )}
      </div>
    </div>
  );
}
