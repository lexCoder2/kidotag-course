import {
  SandpackProvider,
  type SandpackFiles,
} from "@codesandbox/sandpack-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CircleArrowRight, CircleCheck, FlaskConical } from "lucide-react";
import { MonacoSandpackEditor } from "./MonacoSandpackEditor";
import type { Verificacion } from "@/types/verificaciones";
import type { Desafio } from "@/types/desafios";

type Plantilla = "react" | "react-ts" | "vanilla" | "vanilla-ts" | "node";

function isLikelyReactCode(code: string): boolean {
  if (!code) return false;
  return (
    /from\s+["']react["']/.test(code) ||
    /\buseState\b|\buseEffect\b|\buseMemo\b|\buseCallback\b/.test(code) ||
    /<\/?[A-Za-z][^>]*>/.test(code) ||
    /React\./.test(code)
  );
}

function isLikelyTypeScriptCode(code: string): boolean {
  if (!code) return false;
  return (
    /\binterface\b|\btype\b|\benum\b/.test(code) ||
    /:\s*[A-Z][A-Za-z0-9_<>,\[\]\s|&?]*/.test(code) ||
    /\bas\s+const\b|\bas\s+[A-Za-z_$][\w$<>,\[\]\s|&?]*/.test(code)
  );
}

function inferPlantilla(
  plantilla: Plantilla | undefined,
  codigo: string | undefined,
  archivos: SandpackFiles | undefined,
  files: SandpackFiles | undefined,
): Plantilla {
  if (plantilla) return plantilla;

  const allFiles = { ...(archivos || {}), ...(files || {}) };
  const fileNames = Object.keys(allFiles);
  const joinedCode = [
    codigo || "",
    ...Object.values(allFiles)
      .map((file) => (typeof file === "string" ? file : file.code || ""))
      .filter(Boolean),
  ].join("\n");

  const hasTsFiles = fileNames.some((name) => /\.tsx?$/.test(name));
  const hasReactFiles =
    fileNames.some((name) => /App\.(t|j)sx?$/.test(name)) ||
    fileNames.some((name) => /\.jsx$|\.tsx$/.test(name));

  if (hasReactFiles || isLikelyReactCode(joinedCode)) {
    return hasTsFiles || isLikelyTypeScriptCode(joinedCode)
      ? "react-ts"
      : "react";
  }

  return hasTsFiles || isLikelyTypeScriptCode(joinedCode)
    ? "vanilla-ts"
    : "vanilla";
}

interface Props {
  archivos?: SandpackFiles;
  files?: SandpackFiles;
  codigo?: string;
  entryFile?: string;
  plantilla?: Plantilla;
  titulo?: string;
  readOnly?: boolean;
  mostrarConsola?: boolean;
  altura?: number;
  objetivo?: string;
  pasosIncrementales?: string[];
  retoFinal?: string;
  forceExpanded?: boolean;
  soloConsola?: boolean;
  verificaciones?: Verificacion[];
  desafio?: Desafio;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function buildSandboxId(
  titulo: string,
  entryFile: string,
  pasoCount: number,
): string {
  return slugify(`${titulo}-${entryFile}-${pasoCount}`) || "sandbox";
}

export function CodePlayground({
  archivos,
  files,
  codigo,
  entryFile,
  plantilla,
  titulo,
  readOnly = false,
  mostrarConsola = true,
  altura: _altura = 420,
  objetivo,
  pasosIncrementales,
  retoFinal,
  forceExpanded = false,
  soloConsola = false,
  verificaciones,
  desafio,
}: Props) {
  const { slug: lessonSlug } = useParams<{ slug: string }>();
  const [esMobile, setEsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => setEsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const plantillaResuelta = useMemo(
    () => inferPlantilla(plantilla, codigo, archivos, files),
    [plantilla, codigo, archivos, files],
  );

  const archivoPrincipal =
    plantillaResuelta === "react-ts"
      ? "/App.tsx"
      : plantillaResuelta === "vanilla"
        ? "/index.js"
        : plantillaResuelta === "vanilla-ts"
          ? "/index.ts"
          : "/App.js";

  const archivosResueltos = useMemo<SandpackFiles | undefined>(() => {
    if (archivos) return archivos;
    if (files) return files;
    if (codigo) return { [archivoPrincipal]: codigo };
    return undefined;
  }, [archivos, files, codigo, archivoPrincipal]);

  const pasos =
    pasosIncrementales && pasosIncrementales.length > 0
      ? pasosIncrementales
      : [
          "Ejecuta el ejemplo y observa el resultado actual.",
          "Cambia un valor clave y valida el nuevo comportamiento.",
          "Extrae una parte en una función/componente reutilizable.",
          "Agrega una validación o manejo de error simple.",
        ];

  const sandboxId = useMemo(
    () =>
      buildSandboxId(
        titulo || "sandbox",
        entryFile || archivoPrincipal,
        desafio
          ? desafio.pasos.length
          : verificaciones
            ? verificaciones.length
            : pasos.length,
      ),
    [
      archivoPrincipal,
      desafio,
      entryFile,
      pasos.length,
      titulo,
      verificaciones,
    ],
  );

  const sandboxRoute = lessonSlug ? `/sandbox/${lessonSlug}/${sandboxId}` : "/";

  const configKey = lessonSlug
    ? `kidotag-sandbox-config:${lessonSlug}:${sandboxId}`
    : "";
  const requiredKey = lessonSlug
    ? `kidotag-sandbox-required:${lessonSlug}:${sandboxId}`
    : "";
  const progressKey = lessonSlug
    ? `kidotag-sandbox-progress:${lessonSlug}:${sandboxId}`
    : "";

  const [completados, setCompletados] = useState<boolean[]>(() => {
    if (!lessonSlug || !progressKey) return new Array(pasos.length).fill(false);
    try {
      const raw = localStorage.getItem(progressKey);
      const done = raw ? Number(raw) : 0;
      return new Array(pasos.length).fill(false).map((_, idx) => idx < done);
    } catch {
      return new Array(pasos.length).fill(false);
    }
  });

  useEffect(() => {
    // AutoCheckPanel/DesafioPanel manage progress when verificaciones/desafio is present
    if (verificaciones || desafio) return;
    if (!lessonSlug || !requiredKey || !progressKey) return;
    const total = pasos.length;
    const done = completados.filter(Boolean).length;

    try {
      localStorage.setItem(requiredKey, String(total));
      localStorage.setItem(progressKey, String(done));
      window.dispatchEvent(new CustomEvent("kidotag-sandbox-progress"));
    } catch {
      // localStorage puede fallar en modo privado.
    }
  }, [
    completados,
    lessonSlug,
    pasos.length,
    progressKey,
    requiredKey,
    verificaciones,
  ]);

  useEffect(() => {
    if (!lessonSlug || !configKey) return;
    const payload = {
      archivos,
      files,
      codigo,
      entryFile,
      plantilla,
      titulo,
      readOnly,
      mostrarConsola,
      soloConsola,
      objetivo,
      pasosIncrementales,
      retoFinal,
      verificaciones,
      desafio,
      forceExpanded: true,
    };

    try {
      sessionStorage.setItem(configKey, JSON.stringify(payload));
    } catch {
      // sessionStorage puede no estar disponible.
    }
  }, [
    archivos,
    codigo,
    configKey,
    desafio,
    entryFile,
    files,
    lessonSlug,
    mostrarConsola,
    objetivo,
    pasosIncrementales,
    plantilla,
    readOnly,
    retoFinal,
    titulo,
    verificaciones,
  ]);

  const totalHechos = completados.filter(Boolean).length;
  const progreso = Math.round((totalHechos / pasos.length) * 100);

  function togglePaso(idx: number) {
    setCompletados((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  }

  function resetPasos() {
    setCompletados(new Array(pasos.length).fill(false));
  }

  if (esMobile) {
    return (
      <div className="playground-wrap playground-mobile-skip">
        {titulo && <div className="playground-titulo">{titulo}</div>}
        <div className="playground-mobile-skip-body">
          <p>
            Este sandbox se omite en dispositivos moviles para mantener una
            experiencia de lectura fluida.
          </p>
          <p>
            Abre la leccion en tablet horizontal o desktop para resolver la
            practica completa.
          </p>
        </div>
      </div>
    );
  }

  if (!forceExpanded) {
    const totalChecks = desafio
      ? desafio.pasos.length
      : verificaciones
        ? verificaciones.length
        : pasos.length;
    const checksHechos =
      desafio || verificaciones
        ? (() => {
            try {
              return Number(localStorage.getItem(progressKey) || 0);
            } catch {
              return 0;
            }
          })()
        : totalHechos;
    const completo = totalChecks > 0 && checksHechos >= totalChecks;

    return (
      <div className="playground-wrap playground-launcher">
        {titulo && <div className="playground-titulo">{titulo}</div>}
        <div className="playground-launcher-body">
          <div className="playground-launcher-head">
            <span className="playground-launcher-kicker">
              <FlaskConical size={14} aria-hidden="true" />{" "}
              {desafio ? "Desafío guiado" : "Sandbox guiado"}
            </span>
            <span
              className={`playground-launcher-state${completo ? " done" : ""}`}
            >
              {completo ? (
                <>
                  <CircleCheck size={13} aria-hidden="true" /> Completo
                </>
              ) : (
                "En progreso"
              )}
            </span>
          </div>

          <p>
            Abre este laboratorio en una vista enfocada para resolver los
            ejercicios paso a paso.
          </p>

          <div className="playground-launcher-progress-card">
            <div className="playground-launcher-progress-label">
              Checks completados
            </div>
            <div className="playground-launcher-progress-values">
              <strong>{checksHechos}</strong>
              <span>/ {totalChecks}</span>
            </div>
            <div className="playground-launcher-progress-track">
              <div
                className="playground-launcher-progress-fill"
                style={{
                  width: `${Math.max(0, Math.min(100, Math.round((checksHechos / Math.max(totalChecks, 1)) * 100)))}%`,
                }}
              />
            </div>
          </div>

          <Link className="playground-open-btn" to={sandboxRoute}>
            Abrir sandbox <CircleArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="playground-wrap playground-monaco-wrap">
      <SandpackProvider
        template={plantillaResuelta}
        files={archivosResueltos}
        options={{
          autorun: true,
          autoReload: false,
          activeFile: entryFile || archivoPrincipal,
          initMode: "immediate",
          bundlerURL: "https://sandpack-bundler.codesandbox.io",
        }}
        theme="auto"
      >
        <MonacoSandpackEditor
          readOnly={readOnly}
          soloConsola={soloConsola}
          mostrarConsola={mostrarConsola}
          verificaciones={verificaciones}
          desafio={desafio}
          plantilla={plantillaResuelta}
          mainFile={entryFile || archivoPrincipal}
          lessonSlug={lessonSlug || ""}
          sandboxId={sandboxId}
          requiredKey={requiredKey}
          progressKey={progressKey}
          titulo={titulo}
          objetivo={objetivo}
          pasosIncrementales={pasosIncrementales}
          retoFinal={retoFinal}
          completados={completados}
          onTogglePaso={togglePaso}
          onResetPasos={resetPasos}
        />
      </SandpackProvider>
    </div>
  );
}
