import { useCallback, useMemo, useState } from "react";
import { useSandpack } from "@codesandbox/sandpack-react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  CircleX,
  FlaskConical,
  Lightbulb,
  LoaderCircle,
  Play,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { ejecutarPatronCheck } from "./runners/PatternCheckRunner";
import { useGamificacion } from "@/hooks/useGamificacion";
import type {
  EstadoVerificacion,
  ResultadoVerificacion,
  Verificacion,
} from "@/types/verificaciones";

interface Props {
  verificaciones: Verificacion[];
  lessonSlug: string;
  sandboxId: string;
  requiredKey: string;
  progressKey: string;
  titulo?: string;
  objetivo?: string;
}

type EstadoMap = Record<string, ResultadoVerificacion>;

const estadoVacio = (): ResultadoVerificacion => ({ estado: "idle" });

function iconoEstado(estado: EstadoVerificacion) {
  switch (estado) {
    case "pasada":
      return <CheckCircle2 size={14} aria-hidden="true" />;
    case "fallida":
      return <CircleX size={14} aria-hidden="true" />;
    case "corriendo":
      return <LoaderCircle size={14} aria-hidden="true" />;
    default:
      return <Circle size={14} aria-hidden="true" />;
  }
}

export function AutoCheckPanel({
  verificaciones,
  lessonSlug,
  sandboxId,
  requiredKey,
  progressKey,
  titulo,
  objetivo,
}: Props) {
  const { sandpack } = useSandpack();
  const { ganarXP, desbloquearInsignia } = useGamificacion();

  const [estados, setEstados] = useState<EstadoMap>(() => {
    const inicial: EstadoMap = {};
    verificaciones.forEach((v) => {
      inicial[v.id] = estadoVacio();
    });
    return inicial;
  });

  const [pistasVisibles, setPistasVisibles] = useState<Record<string, boolean>>(
    {},
  );

  const totalPasadas = useMemo(
    () =>
      verificaciones.filter((v) => estados[v.id]?.estado === "pasada").length,
    [estados, verificaciones],
  );
  const total = verificaciones.length;
  const progreso = total > 0 ? Math.round((totalPasadas / total) * 100) : 0;
  const todasPasadas = total > 0 && totalPasadas === total;

  // Persistir progreso (compat con LessonRenderer)
  const persistir = useCallback(
    (pasadas: number) => {
      try {
        localStorage.setItem(requiredKey, String(total));
        localStorage.setItem(progressKey, String(pasadas));
        window.dispatchEvent(new CustomEvent("kidotag-sandbox-progress"));
      } catch {
        // ignorar
      }
    },
    [progressKey, requiredKey, total],
  );

  const ejecutarUno = useCallback(
    (v: Verificacion): ResultadoVerificacion => {
      if (v.tipo === "jest") {
        // El runner Jest aún no está disponible; mostrar mensaje claro.
        return {
          estado: "fallida",
          mensaje:
            "Los tests Jest todavía no se ejecutan en este sandbox. (TODO)",
        };
      }
      return ejecutarPatronCheck(sandpack.files, v);
    },
    [sandpack.files],
  );

  const verificarTodo = useCallback(() => {
    const nuevos: EstadoMap = {};
    verificaciones.forEach((v) => {
      nuevos[v.id] = { estado: "corriendo" };
    });
    setEstados(nuevos);

    // Pequeño retraso visual para que se vea el "corriendo"
    setTimeout(() => {
      const resultados: EstadoMap = {};
      let pasadasAhora = 0;
      verificaciones.forEach((v) => {
        const r = ejecutarUno(v);
        resultados[v.id] = r;
        if (r.estado === "pasada") pasadasAhora += 1;
      });
      setEstados(resultados);

      // XP por checks recién pasados (10 XP por cada uno que pase, +50 bonus si pasa todo)
      const antes = totalPasadas;
      const nuevosOk = Math.max(0, pasadasAhora - antes);
      if (nuevosOk > 0) {
        ganarXP(
          10 * nuevosOk,
          `${nuevosOk} verificación(es) en "${titulo || sandboxId}"`,
        );
      }
      if (pasadasAhora === total && total > 0 && antes < total) {
        ganarXP(50, `Sandbox completo: "${titulo || sandboxId}"`);
        desbloquearInsignia(
          `sandbox-${lessonSlug}-${sandboxId}`,
          `Sandbox completado`,
          `Completaste "${titulo || sandboxId}" con todas las verificaciones.`,
          "trophy",
        );
      }

      persistir(pasadasAhora);
    }, 220);
  }, [
    desbloquearInsignia,
    ejecutarUno,
    ganarXP,
    lessonSlug,
    persistir,
    sandboxId,
    titulo,
    total,
    totalPasadas,
    verificaciones,
  ]);

  const verificarUno = useCallback(
    (v: Verificacion) => {
      setEstados((prev) => ({ ...prev, [v.id]: { estado: "corriendo" } }));
      setTimeout(() => {
        const r = ejecutarUno(v);
        setEstados((prev) => {
          const next = { ...prev, [v.id]: r };
          const pasadas = verificaciones.filter(
            (vv) => next[vv.id]?.estado === "pasada",
          ).length;

          // XP sólo si este check acaba de pasar (no estaba pasado antes)
          const estabaPasado = prev[v.id]?.estado === "pasada";
          if (r.estado === "pasada" && !estabaPasado) {
            ganarXP(10, `Verificación: ${v.titulo}`);
            if (pasadas === total) {
              ganarXP(50, `Sandbox completo: "${titulo || sandboxId}"`);
              desbloquearInsignia(
                `sandbox-${lessonSlug}-${sandboxId}`,
                `Sandbox completado`,
                `Completaste "${titulo || sandboxId}" con todas las verificaciones.`,
                "trophy",
              );
            }
          }

          persistir(pasadas);
          return next;
        });
      }, 180);
    },
    [
      desbloquearInsignia,
      ejecutarUno,
      ganarXP,
      lessonSlug,
      persistir,
      sandboxId,
      titulo,
      total,
      verificaciones,
    ],
  );

  const reset = useCallback(() => {
    const vacio: EstadoMap = {};
    verificaciones.forEach((v) => {
      vacio[v.id] = estadoVacio();
    });
    setEstados(vacio);
    persistir(0);
  }, [persistir, verificaciones]);

  const togglePista = (id: string) =>
    setPistasVisibles((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div
      className={`autocheck-panel${todasPasadas ? " autocheck-panel-completo" : ""}`}
    >
      <div className="autocheck-header">
        <h4>
          <FlaskConical size={15} aria-hidden="true" /> Verificaciones automáticas
          {todasPasadas && (
            <span className="autocheck-completo-badge">
              <CheckCircle2 size={13} aria-hidden="true" /> Completo
            </span>
          )}
        </h4>
        <div className="autocheck-header-actions">
          <button
            type="button"
            className="autocheck-btn-primario"
            onClick={verificarTodo}
          >
            <Play size={13} aria-hidden="true" /> Verificar todo
          </button>
          <button type="button" className="autocheck-btn-reset" onClick={reset}>
            <RotateCcw size={13} aria-hidden="true" /> Reiniciar
          </button>
        </div>
      </div>

      {objetivo && (
        <p className="autocheck-objetivo">
          <strong>Objetivo:</strong> {objetivo}
        </p>
      )}

      <div
        className="autocheck-progreso-wrap"
        aria-label="Progreso del sandbox"
      >
        <div className="autocheck-progreso-track">
          <div
            className={`autocheck-progreso-fill${todasPasadas ? " autocheck-progreso-fill-ok" : ""}`}
            style={{ width: `${progreso}%` }}
          />
        </div>
        <span className="autocheck-progreso-texto">
          {totalPasadas}/{total} ({progreso}%)
        </span>
      </div>

      <ul className="autocheck-lista">
        {verificaciones.map((v) => {
          const r = estados[v.id] || estadoVacio();
          return (
            <li
              key={v.id}
              className={`autocheck-item autocheck-item-${r.estado}`}
            >
              <div className="autocheck-item-cabecera">
                <span
                  className="autocheck-item-icono"
                  aria-label={r.estado}
                  title={r.estado}
                >
                  {iconoEstado(r.estado)}
                </span>
                <span className="autocheck-item-titulo">{v.titulo}</span>
                <button
                  type="button"
                  className="autocheck-item-correr"
                  onClick={() => verificarUno(v)}
                  disabled={r.estado === "corriendo"}
                >
                  {r.estado === "corriendo" ? "..." : "Verificar"}
                </button>
              </div>
              {v.descripcion && (
                <p className="autocheck-item-descripcion">{v.descripcion}</p>
              )}
              {r.estado === "fallida" && r.mensaje && (
                <p className="autocheck-item-error">
                  <AlertTriangle size={13} aria-hidden="true" /> {r.mensaje}
                </p>
              )}
              {v.pista && r.estado === "fallida" && (
                <div className="autocheck-pista-wrap">
                  <button
                    type="button"
                    className="autocheck-pista-toggle"
                    onClick={() => togglePista(v.id)}
                  >
                    {pistasVisibles[v.id] ? (
                      "Ocultar pista"
                    ) : (
                      <>
                        <Lightbulb size={13} aria-hidden="true" /> Ver pista
                      </>
                    )}
                  </button>
                  {pistasVisibles[v.id] && (
                    <div className="autocheck-pista">{v.pista}</div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
