/**
 * DesafioPanel — stepper vertical de desafíos guiados.
 *
 * Muestra los pasos de un Desafio secuencialmente:
 *   ✓ completado (colapsado, verde)
 *   ► activo (expandido, con editor code hint, verificar, pista)
 *   🔒 bloqueado (colapsado, gris)
 *
 * Persistencia:
 *   - Paso actual: localStorage("kidotag-sandbox-step:<slug>:<id>")
 *   - Código guardado por paso: localStorage("kidotag-sandbox-stepcode:<slug>:<id>:<stepId>")
 *   - kidotag-sandbox-required / progress → unlock "Marcar como completada"
 *
 * Debe montarse dentro de <SandpackProvider>.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSandpack } from "@codesandbox/sandpack-react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  FlaskConical,
  Lightbulb,
  LoaderCircle,
  Lock,
  Play,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { ejecutarVerificacion } from "./runners/CheckDispatcher";
import { useGamificacion } from "@/hooks/useGamificacion";
import type { Desafio } from "@/types/desafios";
import type {
  EstadoVerificacion,
  ResultadoVerificacion,
} from "@/types/verificaciones";

interface Props {
  desafio: Desafio;
  lessonSlug: string;
  sandboxId: string;
}

type CheckEstados = Record<string, ResultadoVerificacion>;

const VACIO: ResultadoVerificacion = { estado: "idle" };

function iconoEstado(estado: EstadoVerificacion) {
  switch (estado) {
    case "pasada":
      return <CheckCircle2 size={13} className="check-ok" aria-hidden="true" />;
    case "fallida":
      return (
        <AlertTriangle size={13} className="check-fail" aria-hidden="true" />
      );
    case "corriendo":
      return (
        <LoaderCircle
          size={13}
          className="check-running anim-spin"
          aria-hidden="true"
        />
      );
    default:
      return null;
  }
}

export function DesafioPanel({ desafio, lessonSlug, sandboxId }: Props) {
  const { sandpack } = useSandpack();
  const { ganarXP, desbloquearInsignia } = useGamificacion();

  const stepKey = `kidotag-sandbox-step:${lessonSlug}:${sandboxId}`;
  const progressKey = `kidotag-sandbox-progress:${lessonSlug}:${sandboxId}`;
  const requiredKey = `kidotag-sandbox-required:${lessonSlug}:${sandboxId}`;

  const [pasoActual, setPasoActual] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(stepKey) ?? "0") || 0;
    } catch {
      return 0;
    }
  });

  const [checkEstados, setCheckEstados] = useState<
    Record<number, CheckEstados>
  >({});
  const [pistasVisibles, setPistasVisibles] = useState<Record<string, boolean>>(
    {},
  );
  const [corriendo, setCorriendo] = useState(false);

  const pasos = desafio.pasos;
  const totalPasos = pasos.length;

  // ─── Persistencia de paso actual ─────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(stepKey, String(pasoActual));
    } catch {
      /* ignore */
    }
  }, [pasoActual, stepKey]);

  // ─── Aplicar código inicial cuando cambia el paso activo ──────────────────
  useEffect(() => {
    const paso = pasos[pasoActual];
    if (!paso?.codigoInicial) return;

    const codeKey = `kidotag-sandbox-stepcode:${lessonSlug}:${sandboxId}:${paso.id}`;
    try {
      const saved = localStorage.getItem(codeKey);
      if (saved) return; // conservar código guardado del estudiante
    } catch {
      /* ignore */
    }

    // Aplicar archivos iniciales del paso
    Object.entries(paso.codigoInicial).forEach(([path, content]) => {
      const code =
        typeof content === "string"
          ? content
          : (content as { code: string }).code;
      sandpack.updateFile(path, code);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pasoActual]);

  // ─── Guardar código del paso activo periódicamente ────────────────────────
  const guardarCodigoPasoActual = useCallback(() => {
    const paso = pasos[pasoActual];
    if (!paso) return;
    const codeKey = `kidotag-sandbox-stepcode:${lessonSlug}:${sandboxId}:${paso.id}`;
    try {
      // Guarda sólo el archivo activo (suficiente para restaurar contexto)
      const code = sandpack.files[sandpack.activeFile]?.code ?? "";
      localStorage.setItem(codeKey, code);
    } catch {
      /* ignore */
    }
  }, [pasoActual, pasos, lessonSlug, sandboxId, sandpack]);

  // ─── Restaurar plantilla del paso ────────────────────────────────────────
  const restaurarPlantilla = useCallback(() => {
    const paso = pasos[pasoActual];
    if (!paso?.codigoInicial) return;
    if (!window.confirm("¿Restaurar el código inicial de este paso?")) return;

    Object.entries(paso.codigoInicial).forEach(([path, content]) => {
      const code =
        typeof content === "string"
          ? content
          : (content as { code: string }).code;
      sandpack.updateFile(path, code);
    });

    // Borrar código guardado para que la restauración persista
    const codeKey = `kidotag-sandbox-stepcode:${lessonSlug}:${sandboxId}:${paso.id}`;
    try {
      localStorage.removeItem(codeKey);
    } catch {
      /* ignore */
    }
  }, [pasoActual, pasos, lessonSlug, sandboxId, sandpack]);

  // ─── Persiste progreso global del sandbox ────────────────────────────────
  const persistirProgreso = useCallback(
    (pasosCompletados: number) => {
      try {
        localStorage.setItem(requiredKey, String(totalPasos));
        localStorage.setItem(progressKey, String(pasosCompletados));
        window.dispatchEvent(new CustomEvent("kidotag-sandbox-progress"));
      } catch {
        /* ignore */
      }
    },
    [requiredKey, progressKey, totalPasos],
  );

  // ─── Pasos completados ───────────────────────────────────────────────────
  const pasosCompletados = useMemo(() => {
    // Un paso está completado si todos sus checks han pasado
    return pasos.map((_paso, idx) => {
      if (idx >= pasoActual) return false;
      const estados = checkEstados[idx];
      if (!estados) return true; // pasos anteriores ya fueron avanzados
      return pasos[idx].verificaciones.every(
        (v) => estados[v.id]?.estado === "pasada",
      );
    });
  }, [pasos, pasoActual, checkEstados]);

  const desafioCompleto = pasoActual >= totalPasos;

  // ─── Verificar paso activo ────────────────────────────────────────────────
  const verificarPaso = useCallback(async () => {
    const paso = pasos[pasoActual];
    if (!paso || corriendo) return;

    guardarCodigoPasoActual();
    setCorriendo(true);

    // Marcar todos como "corriendo"
    const corriendo_: CheckEstados = {};
    paso.verificaciones.forEach((v) => {
      corriendo_[v.id] = { estado: "corriendo" };
    });
    setCheckEstados((prev) => ({ ...prev, [pasoActual]: corriendo_ }));

    // Ejecutar en paralelo
    const results = await Promise.all(
      paso.verificaciones.map(async (v) => ({
        id: v.id,
        r: await ejecutarVerificacion(sandpack.files, v),
      })),
    );

    const nuevos: CheckEstados = {};
    results.forEach(({ id, r }) => {
      nuevos[id] = r;
    });
    setCheckEstados((prev) => ({ ...prev, [pasoActual]: nuevos }));
    setCorriendo(false);

    const todosOk = results.every(({ r }) => r.estado === "pasada");
    if (todosOk) {
      // XP: 10 por check + 50 bonus si es el último paso
      ganarXP(
        10 * paso.verificaciones.length,
        `Paso "${paso.titulo}" completado`,
      );
      const nextPaso = pasoActual + 1;

      if (nextPaso >= totalPasos) {
        // Desafío completo
        ganarXP(50, `Desafío completo: "${desafio.titulo}"`);
        desbloquearInsignia(
          `sandbox-${lessonSlug}-${sandboxId}`,
          `Desafío completado`,
          `Completaste "${desafio.titulo}" con todos los pasos.`,
          "trophy",
        );
        persistirProgreso(totalPasos);
      }

      setPasoActual(nextPaso);
      persistirProgreso(Math.min(nextPaso, totalPasos));
    }
  }, [
    corriendo,
    desafio.titulo,
    desbloquearInsignia,
    ganarXP,
    guardarCodigoPasoActual,
    lessonSlug,
    pasoActual,
    pasos,
    persistirProgreso,
    sandboxId,
    sandpack.files,
    totalPasos,
  ]);

  const togglePista = (key: string) =>
    setPistasVisibles((prev) => ({ ...prev, [key]: !prev[key] }));

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="desafio-panel">
      <div className="desafio-header">
        <h4 className="desafio-titulo">
          <FlaskConical size={15} aria-hidden="true" />
          {desafio.titulo}
        </h4>
        {desafio.intro && <p className="desafio-intro">{desafio.intro}</p>}
        {desafio.objetivo && (
          <p className="desafio-objetivo">
            <strong>Objetivo:</strong> {desafio.objetivo}
          </p>
        )}
        {desafio.conceptosNuevos && desafio.conceptosNuevos.length > 0 && (
          <details className="desafio-conceptos">
            <summary>Conceptos nuevos en este desafío</summary>
            <ul>
              {desafio.conceptosNuevos.map((c) => (
                <li key={c.termino}>
                  <strong>{c.termino}</strong>: {c.explicacion}
                  {c.ejemplo && (
                    <pre className="desafio-concepto-ejemplo">{c.ejemplo}</pre>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <ol className="desafio-pasos-lista">
        {pasos.map((paso, idx) => {
          const esActivo = idx === pasoActual;
          const esCompletado = idx < pasoActual;
          const estaBloqueado = idx > pasoActual;
          const estados = checkEstados[idx] ?? {};
          const todosOk =
            paso.verificaciones.length > 0 &&
            paso.verificaciones.every(
              (v) => estados[v.id]?.estado === "pasada",
            );

          return (
            <li
              key={paso.id}
              className={[
                "desafio-paso",
                esActivo ? "desafio-paso-activo" : "",
                esCompletado ? "desafio-paso-completado" : "",
                estaBloqueado ? "desafio-paso-bloqueado" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Cabecera del paso */}
              <div className="desafio-paso-cabecera">
                <span className="desafio-paso-num" aria-hidden="true">
                  {esCompletado ? (
                    <CheckCircle2 size={15} className="check-ok" />
                  ) : estaBloqueado ? (
                    <Lock size={13} />
                  ) : (
                    <ChevronRight size={15} />
                  )}
                </span>
                <span className="desafio-paso-titulo">
                  Paso {idx + 1}: {paso.titulo}
                </span>
                {esCompletado && (
                  <span className="desafio-paso-badge-ok">✓</span>
                )}
              </div>

              {/* Contenido — sólo visible si activo o completado con toggle */}
              {esActivo && (
                <div className="desafio-paso-body">
                  <p className="desafio-paso-desc">{paso.descripcion}</p>

                  {/* Lista de checks */}
                  {paso.verificaciones.length > 0 && (
                    <ul className="desafio-checks-lista">
                      {paso.verificaciones.map((v) => {
                        const r = estados[v.id] ?? VACIO;
                        return (
                          <li
                            key={v.id}
                            className={`desafio-check-item desafio-check-${r.estado}`}
                          >
                            <span className="desafio-check-icono">
                              {iconoEstado(r.estado)}
                            </span>
                            <span className="desafio-check-titulo">
                              {v.titulo}
                            </span>
                            {r.estado === "fallida" && r.mensaje && (
                              <p className="desafio-check-error">
                                <AlertTriangle size={12} aria-hidden="true" />
                                {r.mensaje}
                              </p>
                            )}
                            {v.pista && r.estado === "fallida" && (
                              <div className="desafio-pista-wrap">
                                <button
                                  type="button"
                                  className="desafio-pista-toggle"
                                  onClick={() => togglePista(`${idx}-${v.id}`)}
                                >
                                  {pistasVisibles[`${idx}-${v.id}`] ? (
                                    <>
                                      <ChevronDown
                                        size={12}
                                        aria-hidden="true"
                                      />
                                      Ocultar pista
                                    </>
                                  ) : (
                                    <>
                                      <Lightbulb size={12} aria-hidden="true" />
                                      Ver pista
                                    </>
                                  )}
                                </button>
                                {pistasVisibles[`${idx}-${v.id}`] && (
                                  <div className="desafio-pista">{v.pista}</div>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* Acciones del paso */}
                  <div className="desafio-paso-acciones">
                    <button
                      type="button"
                      className="desafio-btn-verificar"
                      onClick={verificarPaso}
                      disabled={corriendo}
                    >
                      {corriendo ? (
                        <LoaderCircle
                          size={13}
                          className="anim-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Play size={13} aria-hidden="true" />
                      )}
                      {corriendo ? "Verificando…" : "Verificar paso"}
                    </button>

                    {paso.codigoInicial && (
                      <button
                        type="button"
                        className="desafio-btn-reset"
                        onClick={restaurarPlantilla}
                        title="Volver al código inicial de este paso"
                      >
                        <RotateCcw size={13} aria-hidden="true" />
                        Restaurar plantilla
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Estado final del desafío */}
      {desafioCompleto && (
        <div className="desafio-completo">
          <Trophy size={18} aria-hidden="true" />
          <span>
            ¡Desafío completado!{" "}
            {desafio.retoFinal && `Reto final: ${desafio.retoFinal}`}
          </span>
        </div>
      )}
    </div>
  );
}
