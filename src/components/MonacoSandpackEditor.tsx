import Editor from "@monaco-editor/react";
import {
  useSandpack,
  SandpackPreview,
  useSandpackConsole,
} from "@codesandbox/sandpack-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import {
  Braces,
  Eye,
  FileCode2,
  FileJson2,
  FileText,
  FileType2,
  Lock,
  Play,
  RotateCcw,
  Target,
  TerminalSquare,
  Trophy,
  ListChecks,
  Palette,
} from "lucide-react";
import { AutoCheckPanel } from "./AutoCheckPanel";
import { DesafioPanel } from "./DesafioPanel";
import type { Verificacion } from "@/types/verificaciones";
import type { Desafio } from "@/types/desafios";

// ── Helpers ────────────────────────────────────────────────────────────────
function getLanguage(filename: string): string {
  if (/\.tsx$/.test(filename)) return "typescriptreact";
  if (/\.ts$/.test(filename)) return "typescript";
  if (/\.jsx$/.test(filename)) return "javascriptreact";
  if (/\.js$/.test(filename)) return "javascript";
  if (/\.css$/.test(filename)) return "css";
  if (/\.json$/.test(filename)) return "json";
  if (/\.html?$/.test(filename)) return "html";
  if (/\.md(x)?$/.test(filename)) return "markdown";
  return "javascript";
}

function basename(path: string): string {
  return path.replace(/^.*\//, "");
}

const THEMES = [
  { label: "VS Dark", value: "vs-dark" },
  { label: "VS Light", value: "vs" },
  { label: "High Contrast Dark", value: "hc-black" },
  { label: "High Contrast Light", value: "hc-light" },
];

// ── Filtered Console ─────────────────────────────────────────────────────────
const HIDDEN_WARNINGS = ["Unknown preset"];

// Simple JSON-aware syntax highlighter for console output
const TOKEN_RE =
  /("(?:[^"\\]|\\.)*"(?=\s*:))|("(?:[^"\\]|\\.)*")|(\btrue\b|\bfalse\b|\bnull\b|\bundefined\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],:])/g;

const TOK: Record<string, string> = {
  key: "#9cdcfe", // object key → light blue
  str: "#ce9178", // string value → muted orange
  kw: "#569cd6", // true/false/null/undefined → blue
  num: "#b5cea8", // number → light green
  punct: "#858585", // {  }  [  ]  ,  : → gray
};

function highlightText(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  TOKEN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const color = m[1]
      ? TOK.key
      : m[2]
        ? TOK.str
        : m[3]
          ? TOK.kw
          : m[4]
            ? TOK.num
            : TOK.punct;
    nodes.push(
      <span key={k++} style={{ color }}>
        {m[0]}
      </span>,
    );
    last = TOKEN_RE.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length === 1 ? (nodes[0] as React.ReactNode) : <>{nodes}</>;
}

function FilteredConsole({ style }: { style?: React.CSSProperties }) {
  const { sandpack } = useSandpack();
  const { logs, reset } = useSandpackConsole({
    maxMessageCount: 300,
    resetOnPreviewRestart: true,
  });

  const filtered = logs.filter((log) => {
    if (log.method === "warn") {
      const text = log.data
        .map((d) => (typeof d === "string" ? d : JSON.stringify(d)))
        .join(" ");
      if (HIDDEN_WARNINGS.some((f) => text.includes(f))) return false;
    }
    return true;
  });

  const isLoading =
    logs.length === 0 &&
    sandpack.status !== "idle" &&
    sandpack.status !== "done" &&
    sandpack.status !== "running";

  const methodColor: Record<string, string> = {
    log: "#b5cea8", // default printed text → light green
    error: "#ef5350",
    warn: "#e6a817",
    info: "#4fc3f7",
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily:
          '"Noto Sans Mono", "Cascadia Code", "Cascadia Mono", Consolas, Menlo, "Courier New", monospace',
        fontSize: "12px",
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{ textAlign: "right", padding: "2px 6px", flexShrink: 0 }}>
        <button
          type="button"
          onClick={reset}
          style={{
            fontSize: "10px",
            padding: "1px 8px",
            cursor: "pointer",
            background: "transparent",
            border: "1px solid currentColor",
            borderRadius: "3px",
            opacity: 0.5,
          }}
        >
          Clear
        </button>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 4px",
          position: "relative",
        }}
      >
        {isLoading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 4px",
              color: "#6a9955",
              opacity: 0.75,
            }}
          >
            <span className="console-spinner" />
            <span>Iniciando sandbox…</span>
          </div>
        )}
        {filtered.map((log) => {
          const text = log.data
            .map((d) =>
              typeof d === "string" ? d : JSON.stringify(d, null, 2),
            )
            .join(" ");
          return (
            <div
              key={log.id}
              style={{
                padding: "1px 4px",
                lineHeight: 1.4,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: methodColor[log.method] ?? "inherit",
                borderLeft:
                  log.method === "error"
                    ? "2px solid #ef5350"
                    : log.method === "warn"
                      ? "2px solid #e6a817"
                      : "none",
              }}
            >
              {log.method === "log" || log.method === "info"
                ? highlightText(text)
                : text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Preference persistence ──────────────────────────────────────────────────
const PREFS_KEY = "kidotag-editor-prefs";

interface EditorPrefs {
  theme: string;
  fontSize: number;
  autoReload: boolean;
  showConsole: boolean;
}

function loadPrefs(): Partial<EditorPrefs> {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as Partial<EditorPrefs>) : {};
  } catch {
    return {};
  }
}

function savePrefs(prefs: EditorPrefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage unavailable in private mode
  }
}

const DEFAULT_PASOS = [
  "Ejecuta el ejemplo y observa el resultado.",
  "Cambia un valor clave y valida el nuevo comportamiento.",
  "Extrae una parte en una función/componente reutilizable.",
  "Agrega una validación o manejo de error simple.",
];

// ── Props ─────────────────────────────────────────────────────────────────
interface Props {
  readOnly?: boolean;
  soloConsola?: boolean;
  mostrarConsola?: boolean;
  verificaciones?: Verificacion[];
  desafio?: Desafio;
  plantilla?: string;
  mainFile?: string;
  lessonSlug?: string;
  sandboxId?: string;
  requiredKey?: string;
  progressKey?: string;
  titulo?: string;
  objetivo?: string;
  pasosIncrementales?: string[];
  retoFinal?: string;
  completados?: boolean[];
  onTogglePaso?: (idx: number) => void;
  onResetPasos?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────
export function MonacoSandpackEditor({
  readOnly = false,
  soloConsola = false,
  mostrarConsola = true,
  verificaciones,
  desafio,
  plantilla,
  mainFile,
  lessonSlug,
  sandboxId,
  requiredKey,
  progressKey,
  titulo,
  objetivo,
  pasosIncrementales,
  retoFinal,
  completados = [],
  onTogglePaso,
  onResetPasos,
}: Props) {
  const { sandpack } = useSandpack();

  const savedPrefs = loadPrefs();
  const [monacoTheme, setMonacoTheme] = useState(savedPrefs.theme ?? "vs-dark");
  const [fontSize, setFontSize] = useState(savedPrefs.fontSize ?? 14);
  const [autoReload, setAutoReload] = useState(savedPrefs.autoReload ?? true);
  const isNode = plantilla === "node";

  // Always focus the entry file on mount
  useEffect(() => {
    if (mainFile) sandpack.setActiveFile(mainFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prefer console for node sandboxes (no web preview available)
  const [showConsole, setShowConsole] = useState(
    savedPrefs.showConsole ?? (mostrarConsola || soloConsola || isNode),
  );

  // Persist preferences whenever they change
  useEffect(() => {
    savePrefs({ theme: monacoTheme, fontSize, autoReload, showConsole });
  }, [monacoTheme, fontSize, autoReload, showConsole]);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const activeFile = sandpack.activeFile;
  const files = sandpack.files;
  const currentCode = files[activeFile]?.code ?? "";

  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (value === undefined || readOnly || files[activeFile]?.readOnly)
        return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        sandpack.updateFile(activeFile, value);
        if (autoReload) sandpack.runSandpack();
      }, 700);
    },
    [activeFile, autoReload, files, readOnly, sandpack],
  );

  const runNow = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    sandpack.runSandpack();
  }, [sandpack]);

  const resetAll = useCallback(() => {
    if (window.confirm("¿Restaurar el código original?")) {
      sandpack.resetAllFiles();
    }
  }, [sandpack]);

  // sandpack.visibleFiles already excludes hidden:true and _-prefixed files
  const visibleTabs = sandpack.visibleFiles;

  // Checklist
  const pasos = pasosIncrementales?.length ? pasosIncrementales : DEFAULT_PASOS;
  const totalHechos = completados.filter(Boolean).length;
  const progreso = Math.round((totalHechos / pasos.length) * 100);

  const isDark = monacoTheme === "vs-dark" || monacoTheme === "hc-black";

  return (
    <div className={`msbox${isDark ? " msbox-dark" : " msbox-light"}`}>
      {/* ── Toolbar ── */}
      <div className="msbox-toolbar">
        {/* File tabs */}
        <div className="msbox-tabs" role="tablist" aria-label="Archivos">
          {visibleTabs.map((path) => (
            <button
              key={path}
              type="button"
              role="tab"
              aria-selected={activeFile === path}
              className={`msbox-tab${activeFile === path ? " msbox-tab-active" : ""}${files[path]?.readOnly ? " msbox-tab-readonly" : ""}`}
              onClick={() => sandpack.setActiveFile(path)}
              title={path}
            >
              <span className="msbox-tab-icon">{getFileIcon(path)}</span>
              <span className="msbox-tab-name">{basename(path)}</span>
              {files[path]?.readOnly && (
                <span className="msbox-tab-lock" aria-label="solo lectura">
                  <Lock size={12} aria-hidden="true" />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="msbox-controls">
          <label
            className="msbox-control-toggle"
            title="Recargar automáticamente al editar"
          >
            <input
              type="checkbox"
              checked={autoReload}
              onChange={(e) => setAutoReload(e.target.checked)}
            />
            <span>Auto</span>
          </label>

          <button
            type="button"
            className="msbox-btn msbox-btn-run"
            onClick={runNow}
            title="Ejecutar (Ctrl+Enter)"
          >
            <Play size={14} aria-hidden="true" />
            Ejecutar
          </button>

          <button
            type="button"
            className="msbox-btn msbox-btn-ghost"
            onClick={resetAll}
            title="Restaurar código original"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Reset
          </button>

          <button
            type="button"
            className={`msbox-btn msbox-btn-ghost msbox-btn-console${showConsole ? " msbox-btn-active" : ""}`}
            onClick={() => setShowConsole((v) => !v)}
            title="Mostrar / ocultar consola"
          >
            <TerminalSquare size={14} aria-hidden="true" />
            Consola
          </button>

          <select
            className="msbox-theme-select"
            value={monacoTheme}
            onChange={(e) => setMonacoTheme(e.target.value)}
            aria-label="Tema del editor"
          >
            {THEMES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <div className="msbox-fontsize" aria-label="Tamaño de fuente">
            <button
              type="button"
              className="msbox-fontsize-btn"
              onClick={() => setFontSize((f) => Math.max(10, f - 1))}
              aria-label="Reducir fuente"
            >
              A-
            </button>
            <span className="msbox-fontsize-val">{fontSize}</span>
            <button
              type="button"
              className="msbox-fontsize-btn"
              onClick={() => setFontSize((f) => Math.min(28, f + 1))}
              aria-label="Aumentar fuente"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* ── Main panels ── */}
      <div className="msbox-body">
        <PanelGroup orientation="horizontal" className="msbox-panel-group">
          {/* Left — Monaco editor */}
          <Panel defaultSize={58} minSize={25} id="editor-panel">
            <div className="msbox-editor-wrap">
              <Editor
                height="100%"
                language={getLanguage(activeFile)}
                value={currentCode}
                theme={monacoTheme}
                onChange={handleCodeChange}
                loading={
                  <div className="msbox-editor-loading">Cargando editor…</div>
                }
                options={{
                  fontSize,
                  fontFamily:
                    '"Cascadia Code", "Fira Code", "JetBrains Mono", monospace',
                  fontLigatures: true,
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: {
                    other: true,
                    comments: false,
                    strings: true,
                  },
                  tabSize: 2,
                  insertSpaces: true,
                  formatOnPaste: true,
                  bracketPairColorization: { enabled: true },
                  guides: { bracketPairs: true, indentation: true },
                  readOnly: readOnly || !!files[activeFile]?.readOnly,
                  renderLineHighlight: "gutter",
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  smoothScrolling: true,
                  folding: true,
                  padding: { top: 10, bottom: 10 },
                  scrollbar: {
                    verticalScrollbarSize: 6,
                    horizontalScrollbarSize: 6,
                  },
                  overviewRulerLanes: 0,
                }}
              />
            </div>
          </Panel>

          <PanelResizeHandle className="msbox-handle-v">
            <div className="msbox-handle-v-inner" />
          </PanelResizeHandle>

          {/* Right — Preview + Console */}
          <Panel defaultSize={42} minSize={20} id="right-panel">
            <PanelGroup orientation="vertical" className="msbox-right-group">
              {/* Preview panel: always mounted so the bundler iframe exists and
                  SandpackConsole can receive output. Hidden for soloConsola/node. */}
              <Panel
                defaultSize={soloConsola || isNode ? 0 : showConsole ? 62 : 100}
                minSize={soloConsola || isNode ? 0 : 20}
                id="preview-panel"
                style={soloConsola || isNode ? { display: "none" } : undefined}
              >
                <div className="msbox-panel-chrome">
                  <div className="msbox-panel-header">
                    <span className="msbox-panel-label">
                      <Eye size={13} aria-hidden="true" />
                      Vista previa
                    </span>
                    <span
                      className={`msbox-status msbox-status-${sandpack.status}`}
                    >
                      {sandpack.status === "running"
                        ? "ejecutando…"
                        : sandpack.status === "idle"
                          ? "listo"
                          : sandpack.status}
                    </span>
                  </div>
                  <SandpackPreview
                    showNavigator={false}
                    showRefreshButton
                    style={{ height: "calc(100% - 33px)", width: "100%" }}
                  />
                </div>
              </Panel>

              {/* Resize handle: only when both preview and console are visible */}
              {!soloConsola && !isNode && showConsole && (
                <PanelResizeHandle className="msbox-handle-h">
                  <div className="msbox-handle-h-inner" />
                </PanelResizeHandle>
              )}

              {/* Console panel */}
              {(showConsole || soloConsola || isNode) && (
                <Panel
                  defaultSize={soloConsola || isNode ? 100 : 38}
                  minSize={15}
                  id="console-panel"
                >
                  <div className="msbox-panel-chrome msbox-console-chrome">
                    <div className="msbox-panel-header msbox-console-header">
                      <span className="msbox-panel-label">
                        <TerminalSquare size={13} aria-hidden="true" />
                        Consola
                      </span>
                    </div>
                    <FilteredConsole style={{ height: "calc(100% - 33px)" }} />
                  </div>
                </Panel>
              )}
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      {/* ── Bottom: DesafioPanel, AutoCheck, or manual checklist ── */}
      <div className="msbox-bottom">
        {desafio ? (
          <DesafioPanel
            desafio={desafio}
            lessonSlug={lessonSlug ?? ""}
            sandboxId={sandboxId ?? ""}
          />
        ) : verificaciones && verificaciones.length > 0 ? (
          <AutoCheckPanel
            verificaciones={verificaciones}
            lessonSlug={lessonSlug ?? ""}
            sandboxId={sandboxId ?? ""}
            requiredKey={requiredKey ?? ""}
            progressKey={progressKey ?? ""}
            titulo={titulo}
            objetivo={objetivo}
          />
        ) : (
          <div className="msbox-checklist">
            <div className="msbox-checklist-header">
              <span className="msbox-checklist-title">
                <ListChecks size={14} aria-hidden="true" />
                {titulo || "Proyecto incremental"}
              </span>
              <div className="msbox-checklist-bar-wrap">
                <div className="msbox-checklist-bar">
                  <div
                    className="msbox-checklist-bar-fill"
                    style={{ width: `${progreso}%` }}
                  />
                </div>
                <span className="msbox-checklist-bar-text">
                  {totalHechos}/{pasos.length}
                </span>
              </div>
              <button
                type="button"
                className="msbox-btn msbox-btn-ghost msbox-btn-sm"
                onClick={onResetPasos}
                title="Reiniciar pasos"
              >
                <RotateCcw size={13} aria-hidden="true" />
              </button>
            </div>

            {objetivo && (
              <p className="msbox-checklist-objetivo">
                <strong>
                  <Target size={14} aria-hidden="true" /> Objetivo:
                </strong>{" "}
                {objetivo}
              </p>
            )}

            <ol className="msbox-checklist-steps">
              {pasos.map((paso, idx) => (
                <li
                  key={idx}
                  className={`msbox-step${completados[idx] ? " msbox-step-done" : ""}`}
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={completados[idx] ?? false}
                      onChange={() => onTogglePaso?.(idx)}
                    />
                    <span>{paso}</span>
                  </label>
                </li>
              ))}
            </ol>

            {retoFinal && (
              <p className="msbox-checklist-reto">
                <strong>
                  <Trophy size={14} aria-hidden="true" /> Reto final:
                </strong>{" "}
                {retoFinal}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getFileIcon(path: string) {
  if (/\.tsx?$/.test(path)) return <FileType2 size={13} aria-hidden="true" />;
  if (/\.jsx?$/.test(path)) return <FileCode2 size={13} aria-hidden="true" />;
  if (/\.css$/.test(path)) return <Palette size={13} aria-hidden="true" />;
  if (/\.json$/.test(path)) return <FileJson2 size={13} aria-hidden="true" />;
  if (/\.html?$/.test(path)) return <Braces size={13} aria-hidden="true" />;
  return <FileText size={13} aria-hidden="true" />;
}
