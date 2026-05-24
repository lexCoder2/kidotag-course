/**
 * init-files.mjs — Escribe todos los archivos generados del curso.
 * Ejecutar desde la raíz del proyecto: node scripts/init-files.mjs
 */
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function write(rel, content) {
  const abs = join(ROOT, rel)
  // Crear directorio si no existe
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, content, 'utf8')
  console.log(`  ✅ ${rel}`)
}

console.log('\n📝 Escribiendo archivos del curso KidoTag...\n')

// ─── App.css ──────────────────────────────────────────────────────────────────
write('src/App.css', `/* Layout global del curso KidoTag */
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.app-sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  height: 100vh;
  overflow-y: auto;
  background: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
  transition: transform var(--transition-normal);
}
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.app-header {
  height: var(--header-height);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  gap: 0.75rem;
  flex-shrink: 0;
}
.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

/* Overlay para móvil */
.app-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 99;
}

@media (max-width: 768px) {
  .app-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
    transform: translateX(-100%);
  }
  .app-sidebar.abierto {
    transform: translateX(0);
  }
  .app-overlay {
    display: block;
  }
  .app-content {
    padding: 1rem;
  }
}
`)

// ─── src/components/ProgressBar.tsx ──────────────────────────────────────────
write('src/components/ProgressBar.tsx', `interface Props {
  completadas: number
  total: number
  mostrarTexto?: boolean
}

export function ProgressBar({ completadas, total, mostrarTexto = true }: Props) {
  const pct = total === 0 ? 0 : Math.round((completadas / total) * 100)

  return (
    <div className="progress-bar-wrap">
      {mostrarTexto && (
        <span className="progress-bar-label">
          {completadas}/{total} lecciones completadas
        </span>
      )}
      <div className="progress-bar-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-bar-fill" style={{ width: \`\${pct}%\` }} />
      </div>
      {mostrarTexto && <span className="progress-bar-pct">{pct}%</span>}
      <style>{\`
        .progress-bar-wrap { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .progress-bar-label { font-size: 0.75rem; color: var(--color-text-muted); flex: 1; min-width: 10ch; }
        .progress-bar-track { flex: 1; min-width: 80px; height: 6px; background: var(--color-border); border-radius: var(--radius-full); overflow: hidden; }
        .progress-bar-fill { height: 100%; background: var(--color-accent); border-radius: var(--radius-full); transition: width 0.4s ease; }
        .progress-bar-pct { font-size: 0.75rem; color: var(--color-text-muted); min-width: 3ch; text-align: right; }
      \`}</style>
    </div>
  )
}
`)

// ─── src/components/Callout.tsx ───────────────────────────────────────────────
write('src/components/Callout.tsx', `import type { ReactNode } from 'react'

type Variante = 'info' | 'tip' | 'warning' | 'danger' | 'kidotag'

interface Props {
  variante?: Variante
  titulo?: string
  children: ReactNode
}

const CONFIG: Record<Variante, { icono: string; clase: string }> = {
  info:    { icono: 'ℹ️', clase: 'callout-info' },
  tip:     { icono: '💡', clase: 'callout-tip' },
  warning: { icono: '⚠️', clase: 'callout-warning' },
  danger:  { icono: '🚨', clase: 'callout-danger' },
  kidotag: { icono: '🔍', clase: 'callout-kidotag' },
}

export function Callout({ variante = 'info', titulo, children }: Props) {
  const { icono, clase } = CONFIG[variante]
  return (
    <aside className={\`callout \${clase}\`}>
      <div className="callout-icon">{icono}</div>
      <div className="callout-body">
        {titulo && <strong className="callout-titulo">{titulo}</strong>}
        <div className="callout-content">{children}</div>
      </div>
      <style>{\`
        .callout{display:flex;gap:.75rem;padding:1rem 1.25rem;border-radius:var(--radius-md);margin:1.25rem 0;border-left:3px solid}
        .callout-info{background:var(--color-info-soft);border-color:var(--color-info)}
        .callout-tip{background:var(--color-tip-soft);border-color:var(--color-tip)}
        .callout-warning{background:var(--color-warning-soft);border-color:var(--color-warning)}
        .callout-danger{background:var(--color-danger-soft);border-color:var(--color-danger)}
        .callout-kidotag{background:var(--color-accent-soft);border-color:var(--color-accent)}
        .callout-icon{font-size:1.1rem;flex-shrink:0;line-height:1.6}
        .callout-body{flex:1;min-width:0}
        .callout-titulo{display:block;font-size:.875rem;margin-bottom:.25rem}
        .callout-content{font-size:.9rem;line-height:1.6}
        .callout-content p{margin:0}
      \`}</style>
    </aside>
  )
}
`)

// ─── src/components/CodeSnippet.tsx ──────────────────────────────────────────
write('src/components/CodeSnippet.tsx', `interface Props {
  code: string
  lenguaje?: string
  archivo?: string
  destacar?: number[]  // líneas a destacar (1-based)
}

export function CodeSnippet({ code, lenguaje = 'javascript', archivo, destacar = [] }: Props) {
  return (
    <div className="code-snippet">
      {archivo && (
        <div className="code-snippet-header">
          <span className="code-snippet-lang">{lenguaje}</span>
          <span className="code-snippet-file">📄 {archivo}</span>
        </div>
      )}
      <pre className={\`hljs language-\${lenguaje}\`}>
        <code dangerouslySetInnerHTML={{ __html: code }} />
      </pre>
      <style>{\`
        .code-snippet{border-radius:var(--radius-md);overflow:hidden;margin:1.25rem 0;border:1px solid var(--color-border)}
        .code-snippet-header{display:flex;justify-content:space-between;align-items:center;padding:.5rem 1rem;background:var(--color-bg-surface-2);border-bottom:1px solid var(--color-border);font-size:.8rem}
        .code-snippet-lang{color:var(--color-accent);font-family:var(--font-mono);font-weight:600}
        .code-snippet-file{color:var(--color-text-muted)}
        .code-snippet pre{margin:0;padding:1rem;overflow-x:auto;background:#1e1e2e}
        .code-snippet code{font-family:var(--font-mono);font-size:.875rem;line-height:1.6}
      \`}</style>
    </div>
  )
}
`)

// ─── src/components/Quiz.tsx ─────────────────────────────────────────────────
write('src/components/Quiz.tsx', `import { useState } from 'react'

interface Opcion {
  texto: string
  correcta?: boolean
}

interface Pregunta {
  pregunta: string
  opciones: Opcion[]
  explicacion?: string
}

interface Props {
  preguntas: Pregunta[]
  onCompletado?: (puntaje: number) => void
}

export function Quiz({ preguntas, onCompletado }: Props) {
  const [respuestas, setRespuestas] = useState<(number | null)[]>(Array(preguntas.length).fill(null))
  const [enviado, setEnviado] = useState(false)

  const elegir = (pIdx: number, oIdx: number) => {
    if (enviado) return
    setRespuestas((prev) => {
      const next = [...prev]
      next[pIdx] = oIdx
      return next
    })
  }

  const enviar = () => {
    if (respuestas.some((r) => r === null)) return
    setEnviado(true)
    const correctas = preguntas.filter((p, i) => p.opciones[respuestas[i]!]?.correcta).length
    const puntaje = Math.round((correctas / preguntas.length) * 100)
    onCompletado?.(puntaje)
  }

  const reiniciar = () => {
    setRespuestas(Array(preguntas.length).fill(null))
    setEnviado(false)
  }

  const correctas = enviado
    ? preguntas.filter((p, i) => p.opciones[respuestas[i]!]?.correcta).length
    : 0

  return (
    <div className="quiz">
      <div className="quiz-header">
        <span className="quiz-badge">🧠 Quiz</span>
        {enviado && (
          <span className={\`quiz-score \${correctas === preguntas.length ? 'perfecto' : ''}\`}>
            {correctas}/{preguntas.length} correctas
          </span>
        )}
      </div>

      <ol className="quiz-list">
        {preguntas.map((p, pIdx) => {
          const resp = respuestas[pIdx]
          const respondida = resp !== null
          const esCorrecta = enviado && p.opciones[resp!]?.correcta

          return (
            <li key={pIdx} className="quiz-pregunta">
              <p className="quiz-texto">{p.pregunta}</p>
              <ul className="quiz-opciones">
                {p.opciones.map((o, oIdx) => {
                  let clase = 'opcion'
                  if (respondida && oIdx === resp) clase += ' seleccionada'
                  if (enviado) {
                    if (o.correcta) clase += ' correcta'
                    else if (oIdx === resp && !o.correcta) clase += ' incorrecta'
                  }
                  return (
                    <li key={oIdx}>
                      <button className={clase} onClick={() => elegir(pIdx, oIdx)} disabled={enviado}>
                        <span className="opcion-letra">{String.fromCharCode(65 + oIdx)}</span>
                        {o.texto}
                      </button>
                    </li>
                  )
                })}
              </ul>
              {enviado && p.explicacion && (
                <div className={\`quiz-explicacion \${esCorrecta ? 'ok' : 'ko'}\`}>
                  {esCorrecta ? '✅' : '❌'} {p.explicacion}
                </div>
              )}
            </li>
          )
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

      <style>{\`
        .quiz{border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:1.5rem;margin:1.5rem 0;background:var(--color-bg-surface)}
        .quiz-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem}
        .quiz-badge{font-size:.9rem;font-weight:600;color:var(--color-accent)}
        .quiz-score{font-size:.9rem;font-weight:600;color:var(--color-success)}
        .quiz-score.perfecto{color:var(--color-success)}
        .quiz-list{list-style:none;padding:0;display:flex;flex-direction:column;gap:1.25rem}
        .quiz-pregunta{}
        .quiz-texto{font-weight:500;margin-bottom:.75rem;line-height:1.5}
        .quiz-opciones{list-style:none;padding:0;display:flex;flex-direction:column;gap:.4rem}
        .opcion{width:100%;text-align:left;padding:.6rem .9rem;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-bg-surface-2);cursor:pointer;display:flex;align-items:center;gap:.75rem;font-size:.9rem;transition:all var(--transition-fast)}
        .opcion:hover:not(:disabled){border-color:var(--color-accent);background:var(--color-accent-soft)}
        .opcion.seleccionada{border-color:var(--color-accent);background:var(--color-accent-soft)}
        .opcion.correcta{border-color:var(--color-success);background:var(--color-success-soft);color:var(--color-success)}
        .opcion.incorrecta{border-color:var(--color-danger);background:var(--color-danger-soft);color:var(--color-danger)}
        .opcion-letra{width:1.4rem;height:1.4rem;border-radius:50%;background:var(--color-border);display:inline-flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;flex-shrink:0}
        .quiz-explicacion{margin-top:.6rem;padding:.6rem .9rem;border-radius:var(--radius-md);font-size:.875rem;line-height:1.5}
        .quiz-explicacion.ok{background:var(--color-success-soft);color:var(--color-success)}
        .quiz-explicacion.ko{background:var(--color-danger-soft);color:var(--color-danger)}
        .quiz-acciones{margin-top:1.25rem}
        .btn-primary{padding:.6rem 1.4rem;background:var(--color-accent);color:#fff;border:none;border-radius:var(--radius-md);cursor:pointer;font-weight:600;font-size:.9rem;transition:opacity var(--transition-fast)}
        .btn-primary:disabled{opacity:.5;cursor:not-allowed}
        .btn-primary:hover:not(:disabled){opacity:.9}
        .btn-secondary{padding:.6rem 1.4rem;background:transparent;color:var(--color-accent);border:1px solid var(--color-accent);border-radius:var(--radius-md);cursor:pointer;font-weight:600;font-size:.9rem}
        .btn-secondary:hover{background:var(--color-accent-soft)}
      \`}</style>
    </div>
  )
}
`)

// ─── src/components/Mermaid.tsx ───────────────────────────────────────────────
write('src/components/Mermaid.tsx', `import { useEffect, useRef, useState } from 'react'

interface Props {
  diagrama: string
  titulo?: string
}

export function Mermaid({ diagrama, titulo }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false
    async function render() {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' })
        const id = 'mermaid-' + Math.random().toString(36).slice(2)
        const { svg } = await mermaid.render(id, diagrama)
        if (!cancelado && ref.current) {
          ref.current.innerHTML = svg
        }
      } catch (e) {
        if (!cancelado) setError(String(e))
      }
    }
    render()
    return () => { cancelado = true }
  }, [diagrama])

  return (
    <figure className="mermaid-wrap">
      {titulo && <figcaption className="mermaid-titulo">{titulo}</figcaption>}
      {error ? (
        <pre className="mermaid-error">{error}</pre>
      ) : (
        <div ref={ref} className="mermaid-svg" />
      )}
      <style>{\`
        .mermaid-wrap{margin:1.5rem 0;background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:1.5rem;text-align:center}
        .mermaid-titulo{font-size:.875rem;color:var(--color-text-muted);margin-bottom:1rem;font-style:italic}
        .mermaid-svg svg{max-width:100%;height:auto}
        .mermaid-error{font-size:.8rem;color:var(--color-danger);text-align:left;white-space:pre-wrap}
      \`}</style>
    </figure>
  )
}
`)

// ─── src/components/CodePlayground.tsx ───────────────────────────────────────
write('src/components/CodePlayground.tsx', `import { Sandpack, type SandpackFiles } from '@codesandbox/sandpack-react'

type Plantilla = 'react' | 'react-ts' | 'vanilla' | 'vanilla-ts' | 'node'

interface Props {
  archivos?: SandpackFiles
  plantilla?: Plantilla
  titulo?: string
  readOnly?: boolean
  mostrarConsola?: boolean
  altura?: number
}

export function CodePlayground({
  archivos,
  plantilla = 'react',
  titulo,
  readOnly = false,
  mostrarConsola = true,
  altura = 420,
}: Props) {
  return (
    <div className="playground-wrap">
      {titulo && <div className="playground-titulo">▶ {titulo}</div>}
      <Sandpack
        template={plantilla}
        files={archivos}
        options={{
          editorHeight: altura,
          showConsole: mostrarConsola,
          showConsoleButton: mostrarConsola,
          readOnly,
          autorun: true,
          showNavigator: false,
          showTabs: true,
        }}
        theme="auto"
      />
      <style>{\`
        .playground-wrap{margin:1.5rem 0;border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--color-border)}
        .playground-titulo{background:var(--color-accent);color:#fff;padding:.5rem 1rem;font-size:.85rem;font-weight:600}
      \`}</style>
    </div>
  )
}
`)

// ─── src/components/ApiPlayground.tsx ────────────────────────────────────────
write('src/components/ApiPlayground.tsx', `import { useState } from 'react'
import { fetchMock, ENDPOINTS, type MockRequest } from '@/data/mockApi'

export function ApiPlayground() {
  const [metodo, setMetodo] = useState<MockRequest['method']>('GET')
  const [endpoint, setEndpoint] = useState('estado')
  const [bodyText, setBodyText] = useState('')
  const [token, setToken] = useState('')
  const [respuesta, setRespuesta] = useState<{ status: number; body: unknown } | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarEjemplo = (ep: typeof ENDPOINTS[0]) => {
    setMetodo(ep.method)
    setEndpoint(ep.endpoint)
    setBodyText(ep.ejemploBody ? JSON.stringify(ep.ejemploBody, null, 2) : '')
  }

  const enviar = async () => {
    setCargando(true)
    setError(null)
    try {
      const body = bodyText.trim() ? JSON.parse(bodyText) : undefined
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = \`Bearer \${token}\`
      const res = await fetchMock({ method: metodo, endpoint, body, headers })
      setRespuesta(res)
      // Si la respuesta contiene un token, guardarlo automáticamente
      const d = res.body as Record<string, unknown>
      if (d?.ok && (d.data as Record<string, unknown>)?.token) {
        setToken((d.data as Record<string, unknown>).token as string)
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setCargando(false)
    }
  }

  const statusColor = (s: number) =>
    s < 300 ? 'var(--color-success)' : s < 400 ? 'var(--color-warning)' : 'var(--color-danger)'

  return (
    <div className="api-playground">
      <div className="apip-header">
        <span className="apip-badge">🔌 API Playground</span>
        <span className="apip-hint">Prueba los endpoints de kidotag10 en tiempo real</span>
      </div>

      {/* Atajos de endpoint */}
      <div className="apip-shortcuts">
        {ENDPOINTS.map((ep, i) => (
          <button key={i} className="apip-shortcut" onClick={() => cargarEjemplo(ep)} title={ep.descripcion}>
            <span className={\`apip-method apip-\${ep.method.toLowerCase()}\`}>{ep.method}</span>
            <span>{ep.endpoint}</span>
          </button>
        ))}
      </div>

      {/* Formulario */}
      <div className="apip-form">
        <div className="apip-row">
          <select value={metodo} onChange={(e) => setMetodo(e.target.value as MockRequest['method'])} className="apip-select">
            {['GET','POST','PUT','DELETE'].map((m) => <option key={m}>{m}</option>)}
          </select>
          <input
            className="apip-input apip-endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="endpoint (ej: alumnos)"
          />
          <button className="apip-send" onClick={enviar} disabled={cargando}>
            {cargando ? '...' : 'Enviar ▶'}
          </button>
        </div>

        <div className="apip-fields">
          <div className="apip-field">
            <label>Token JWT (se llena automáticamente al hacer login)</label>
            <input
              className="apip-input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJ..."
            />
          </div>
          <div className="apip-field">
            <label>Body (JSON)</label>
            <textarea
              className="apip-textarea"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={4}
              placeholder='{"clave": "valor"}'
            />
          </div>
        </div>
      </div>

      {/* Respuesta */}
      {(respuesta || error) && (
        <div className="apip-response">
          <div className="apip-response-header">
            {respuesta && (
              <span className="apip-status" style={{ color: statusColor(respuesta.status) }}>
                HTTP {respuesta.status}
              </span>
            )}
            {error && <span style={{ color: 'var(--color-danger)' }}>Error: {error}</span>}
          </div>
          <pre className="apip-body">
            {respuesta ? JSON.stringify(respuesta.body, null, 2) : error}
          </pre>
        </div>
      )}

      <style>{\`
        .api-playground{border:1px solid var(--color-border);border-radius:var(--radius-lg);margin:1.5rem 0;overflow:hidden;background:var(--color-bg-surface)}
        .apip-header{padding:.75rem 1rem;background:var(--color-accent);display:flex;justify-content:space-between;align-items:center}
        .apip-badge{color:#fff;font-weight:700;font-size:.9rem}
        .apip-hint{color:rgba(255,255,255,.75);font-size:.8rem}
        .apip-shortcuts{display:flex;flex-wrap:wrap;gap:.4rem;padding:.75rem 1rem;background:var(--color-bg-surface-2);border-bottom:1px solid var(--color-border)}
        .apip-shortcut{display:flex;align-items:center;gap:.4rem;padding:.25rem .6rem;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-bg-surface);cursor:pointer;font-size:.75rem;transition:border-color var(--transition-fast)}
        .apip-shortcut:hover{border-color:var(--color-accent)}
        .apip-method{font-weight:700;font-size:.7rem;padding:.1rem .3rem;border-radius:3px}
        .apip-get{color:#16a34a;background:#dcfce7}.apip-post{color:#1d4ed8;background:#dbeafe}.apip-put{color:#92400e;background:#fef3c7}.apip-delete{color:#b91c1c;background:#fee2e2}
        .apip-form{padding:1rem}
        .apip-row{display:flex;gap:.5rem;margin-bottom:.75rem;flex-wrap:wrap}
        .apip-select{padding:.5rem;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-bg-surface);font-size:.875rem;font-weight:700;color:var(--color-accent)}
        .apip-input{padding:.5rem .75rem;border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:.875rem;background:var(--color-bg-surface);width:100%}
        .apip-endpoint{flex:1}
        .apip-send{padding:.5rem 1.25rem;background:var(--color-accent);color:#fff;border:none;border-radius:var(--radius-md);cursor:pointer;font-weight:600;white-space:nowrap;transition:opacity var(--transition-fast)}
        .apip-send:disabled{opacity:.6;cursor:wait}
        .apip-fields{display:flex;flex-direction:column;gap:.75rem}
        .apip-field label{display:block;font-size:.8rem;color:var(--color-text-muted);margin-bottom:.25rem}
        .apip-textarea{width:100%;padding:.5rem .75rem;border:1px solid var(--color-border);border-radius:var(--radius-md);font-family:var(--font-mono);font-size:.8rem;resize:vertical;background:var(--color-bg-surface-2)}
        .apip-response{border-top:1px solid var(--color-border)}
        .apip-response-header{padding:.5rem 1rem;background:var(--color-bg-surface-2);display:flex;align-items:center;gap:1rem}
        .apip-status{font-weight:700;font-family:var(--font-mono);font-size:.9rem}
        .apip-body{margin:0;padding:1rem;background:#1e1e2e;color:#cdd6f4;font-family:var(--font-mono);font-size:.8rem;overflow-x:auto;white-space:pre-wrap;max-height:320px;overflow-y:auto}
      \`}</style>
    </div>
  )
}
`)

// ─── src/components/Sidebar.tsx ───────────────────────────────────────────────
write('src/components/Sidebar.tsx', `import { Link, useLocation } from 'react-router-dom'
import type { Bloque } from '@/data/curriculum'
import type { useProgress } from '@/hooks/useProgress'
import { ProgressBar } from './ProgressBar'

interface Props {
  curriculum: Bloque[]
  progress: ReturnType<typeof useProgress>
  totalLecciones: number
  onCerrar?: () => void
}

export function Sidebar({ curriculum, progress, totalLecciones, onCerrar }: Props) {
  const { pathname } = useLocation()

  return (
    <nav className="sidebar">
      {/* Branding */}
      <div className="sidebar-brand">
        <Link to="/" onClick={onCerrar} className="sidebar-logo">
          <span className="sidebar-logo-icon">🏫</span>
          <div>
            <div className="sidebar-logo-name">KidoTag</div>
            <div className="sidebar-logo-sub">Curso interactivo</div>
          </div>
        </Link>
      </div>

      {/* Progreso global */}
      <div className="sidebar-progress">
        <ProgressBar completadas={progress.totalCompletadas} total={totalLecciones} />
      </div>

      {/* Módulos */}
      <div className="sidebar-modules">
        {curriculum.map((bloque) => {
          const slugs = bloque.lecciones.map((l) => l.slug)
          const completadas = progress.completadasEnBloque(slugs)
          const activo = bloque.lecciones.some((l) => pathname.includes(l.slug))

          return (
            <details key={bloque.id} className="sidebar-bloque" open={activo || bloque.numero === 0}>
              <summary className="sidebar-bloque-titulo">
                <span className="sidebar-bloque-icono">{bloque.icono}</span>
                <span className="sidebar-bloque-nombre">
                  {bloque.numero}. {bloque.titulo}
                </span>
                <span className="sidebar-bloque-count">
                  {completadas}/{bloque.lecciones.length}
                </span>
              </summary>
              <ul className="sidebar-lecciones">
                {bloque.lecciones.map((leccion) => {
                  const completada = progress.estaCompletada(leccion.slug)
                  const esActiva = pathname.includes(leccion.slug)
                  return (
                    <li key={leccion.slug}>
                      <Link
                        to={\`/leccion/\${leccion.slug}\`}
                        className={\`sidebar-leccion \${esActiva ? 'activa' : ''} \${completada ? 'completada' : ''}\`}
                        onClick={onCerrar}
                      >
                        <span className="sidebar-leccion-check">
                          {completada ? '✓' : '○'}
                        </span>
                        <span className="sidebar-leccion-titulo">{leccion.titulo}</span>
                        <span className="sidebar-leccion-duracion">{leccion.duracion}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </details>
          )
        })}
      </div>

      {/* Reset */}
      <div className="sidebar-footer">
        <button
          className="sidebar-reset"
          onClick={() => {
            if (confirm('¿Resetear todo el progreso?')) progress.resetProgreso()
          }}
        >
          Resetear progreso
        </button>
      </div>

      <style>{\`
        .sidebar{display:flex;flex-direction:column;height:100%}
        .sidebar-brand{padding:1rem 1.25rem;border-bottom:1px solid var(--color-border)}
        .sidebar-logo{display:flex;align-items:center;gap:.75rem;text-decoration:none;color:inherit}
        .sidebar-logo:hover{text-decoration:none}
        .sidebar-logo-icon{font-size:1.75rem}
        .sidebar-logo-name{font-weight:700;font-size:.95rem;color:var(--color-text-primary);line-height:1.2}
        .sidebar-logo-sub{font-size:.75rem;color:var(--color-text-muted)}
        .sidebar-progress{padding:.75rem 1.25rem;border-bottom:1px solid var(--color-border)}
        .sidebar-modules{flex:1;overflow-y:auto;padding:.5rem 0}
        .sidebar-bloque{border-bottom:1px solid var(--color-border)}
        .sidebar-bloque-titulo{display:flex;align-items:center;gap:.5rem;padding:.65rem 1rem;cursor:pointer;list-style:none;user-select:none;font-size:.85rem}
        .sidebar-bloque-titulo::-webkit-details-marker{display:none}
        .sidebar-bloque-titulo:hover{background:var(--color-bg-surface-2)}
        .sidebar-bloque-icono{font-size:1rem;flex-shrink:0}
        .sidebar-bloque-nombre{flex:1;font-weight:600;color:var(--color-text-secondary);line-height:1.3}
        .sidebar-bloque-count{font-size:.75rem;color:var(--color-text-muted);white-space:nowrap}
        .sidebar-lecciones{list-style:none;padding:0 0 .25rem 0}
        .sidebar-leccion{display:flex;align-items:center;gap:.5rem;padding:.45rem 1rem .45rem 2rem;text-decoration:none;font-size:.825rem;color:var(--color-text-muted);transition:background var(--transition-fast)}
        .sidebar-leccion:hover{background:var(--color-bg-surface-2);color:var(--color-text-primary);text-decoration:none}
        .sidebar-leccion.activa{background:var(--color-accent-soft);color:var(--color-accent);font-weight:600}
        .sidebar-leccion-check{width:1rem;text-align:center;font-size:.75rem;flex-shrink:0}
        .sidebar-leccion.completada .sidebar-leccion-check{color:var(--color-success)}
        .sidebar-leccion-titulo{flex:1;line-height:1.35}
        .sidebar-leccion-duracion{font-size:.7rem;color:var(--color-text-muted);flex-shrink:0}
        .sidebar-footer{padding:.75rem 1rem;border-top:1px solid var(--color-border)}
        .sidebar-reset{width:100%;padding:.4rem;font-size:.8rem;color:var(--color-text-muted);background:none;border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:pointer;transition:all var(--transition-fast)}
        .sidebar-reset:hover{color:var(--color-danger);border-color:var(--color-danger)}
      \`}</style>
    </nav>
  )
}
`)

// ─── src/components/Header.tsx ────────────────────────────────────────────────
write('src/components/Header.tsx', `import { useNavigate, useLocation } from 'react-router-dom'
import { CURRICULUM } from '@/data/curriculum'

interface Props {
  onToggleSidebar: () => void
  sidebarAbierto: boolean
}

export function Header({ onToggleSidebar, sidebarAbierto }: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Encontrar lección activa para mostrar título
  let titulo = 'Curso KidoTag'
  for (const bloque of CURRICULUM) {
    for (const leccion of bloque.lecciones) {
      if (pathname.includes(leccion.slug)) {
        titulo = leccion.titulo
        break
      }
    }
  }

  return (
    <header className="app-header header-comp">
      <button className="header-menu-btn" onClick={onToggleSidebar} aria-label="Menú">
        {sidebarAbierto ? '✕' : '☰'}
      </button>
      <h1 className="header-titulo">{titulo}</h1>
      <button className="header-home-btn" onClick={() => navigate('/')} title="Inicio">
        🏠
      </button>
      <style>{\`
        .header-comp{justify-content:space-between}
        .header-menu-btn{display:none;background:none;border:none;font-size:1.2rem;cursor:pointer;padding:.25rem;color:var(--color-text-secondary)}
        .header-titulo{font-size:1rem;font-weight:600;color:var(--color-text-primary);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0}
        .header-home-btn{background:none;border:none;font-size:1.1rem;cursor:pointer;padding:.25rem;opacity:.7;transition:opacity var(--transition-fast)}
        .header-home-btn:hover{opacity:1}
        @media(max-width:768px){.header-menu-btn{display:block}}
      \`}</style>
    </header>
  )
}
`)

// ─── src/components/Layout.tsx ────────────────────────────────────────────────
write('src/components/Layout.tsx', `import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import type { Bloque } from '@/data/curriculum'
import type { useProgress } from '@/hooks/useProgress'

interface Props {
  curriculum: Bloque[]
  progress: ReturnType<typeof useProgress>
  totalLecciones: number
}

export function Layout({ curriculum, progress, totalLecciones }: Props) {
  const [sidebarAbierto, setSidebarAbierto] = useState(false)

  return (
    <div className="app-layout">
      {/* Overlay móvil */}
      {sidebarAbierto && (
        <div className="app-overlay" onClick={() => setSidebarAbierto(false)} />
      )}

      {/* Sidebar */}
      <div className={\`app-sidebar \${sidebarAbierto ? 'abierto' : ''}\`}>
        <Sidebar
          curriculum={curriculum}
          progress={progress}
          totalLecciones={totalLecciones}
          onCerrar={() => setSidebarAbierto(false)}
        />
      </div>

      {/* Contenido principal */}
      <div className="app-main">
        <Header
          onToggleSidebar={() => setSidebarAbierto((v) => !v)}
          sidebarAbierto={sidebarAbierto}
        />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
`)

// ─── src/components/LessonRenderer.tsx ───────────────────────────────────────
write('src/components/LessonRenderer.tsx', `import { Suspense, lazy, useEffect } from 'react'
import type { ComponentType } from 'react'
import type { useProgress } from '@/hooks/useProgress'
import type { Leccion, Bloque } from '@/data/curriculum'
import { useLessonNav } from '@/hooks/useLessonNav'
import { ProgressBar } from './ProgressBar'
import { TOTAL_LECCIONES } from '@/data/curriculum'

// Mapa de todos los archivos MDX cargados de forma lazy
// Vite importa dinámicamente archivos con import.meta.glob
const LECCIONES_MDX = import.meta.glob('../lessons/**/*.mdx')

interface Props {
  leccion: Leccion & { bloque: Bloque }
  progress: ReturnType<typeof useProgress>
}

export function LessonRenderer({ leccion, progress }: Props) {
  const { anterior, siguiente, irAnterior, irSiguiente } = useLessonNav(leccion.slug)
  const completada = progress.estaCompletada(leccion.slug)

  // Construir la clave del mapa de MDX
  const mdxKey = \`../lessons/\${leccion.bloque.id}/\${leccion.slug}.mdx\`
  const mdxLoader = LECCIONES_MDX[mdxKey]

  const MdxComponent = mdxLoader
    ? lazy(mdxLoader as () => Promise<{ default: ComponentType }>)
    : null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [leccion.slug])

  return (
    <article className="lesson">
      {/* Meta */}
      <div className="lesson-meta">
        <div className="lesson-breadcrumb">
          <span>{leccion.bloque.icono} {leccion.bloque.titulo}</span>
          <span> / </span>
          <span>{leccion.titulo}</span>
        </div>
        <div className="lesson-tags">
          {leccion.tags.map((t) => (
            <span key={t} className="lesson-tag">{t}</span>
          ))}
        </div>
        <div className="lesson-info">
          <span className={\`lesson-nivel nivel-\${leccion.nivel}\`}>{leccion.nivel}</span>
          <span className="lesson-duracion">⏱ {leccion.duracion}</span>
        </div>
      </div>

      {/* Contenido MDX */}
      <div className="lesson-body">
        {MdxComponent ? (
          <Suspense fallback={<div className="lesson-loading">Cargando lección...</div>}>
            <MdxComponent />
          </Suspense>
        ) : (
          <div className="lesson-no-content">
            <p>📝 Esta lección está en desarrollo.</p>
            <p className="lesson-no-content-slug">Slug: <code>{leccion.slug}</code></p>
            <p>Vuelve pronto o contribuye creando el archivo MDX en:</p>
            <code className="lesson-no-content-path">src/lessons/{leccion.bloque.id}/{leccion.slug}.mdx</code>
          </div>
        )}
      </div>

      {/* Barra de acciones */}
      <div className="lesson-actions">
        <div className="lesson-nav">
          <button className="nav-btn" onClick={irAnterior} disabled={!anterior}>
            ← {anterior ? anterior.titulo : 'Inicio'}
          </button>
          <button
            className={\`completar-btn \${completada ? 'completada' : ''}\`}
            onClick={() => progress.marcarCompletada(leccion.slug)}
          >
            {completada ? '✅ Completada' : '✓ Marcar como completada'}
          </button>
          <button className="nav-btn nav-btn-next" onClick={irSiguiente} disabled={!siguiente}>
            {siguiente ? siguiente.titulo : 'Fin del curso'} →
          </button>
        </div>
        <ProgressBar completadas={progress.totalCompletadas} total={TOTAL_LECCIONES} />
      </div>

      <style>{\`
        .lesson{max-width:820px;margin:0 auto}
        .lesson-meta{margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--color-border)}
        .lesson-breadcrumb{font-size:.85rem;color:var(--color-text-muted);margin-bottom:.5rem}
        .lesson-tags{display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.5rem}
        .lesson-tag{font-size:.7rem;padding:.15rem .5rem;border-radius:var(--radius-full);background:var(--color-accent-soft);color:var(--color-accent);font-family:var(--font-mono)}
        .lesson-info{display:flex;align-items:center;gap:.75rem}
        .lesson-nivel{font-size:.75rem;font-weight:600;padding:.15rem .5rem;border-radius:var(--radius-sm)}
        .nivel-basico{background:var(--color-success-soft);color:var(--color-success)}
        .nivel-intermedio{background:var(--color-warning-soft);color:var(--color-warning)}
        .nivel-avanzado{background:var(--color-danger-soft);color:var(--color-danger)}
        .lesson-duracion{font-size:.8rem;color:var(--color-text-muted)}
        .lesson-body{min-height:300px;margin-bottom:2rem}
        .lesson-body h1,.lesson-body h2,.lesson-body h3{margin:1.5rem 0 .75rem}
        .lesson-body h1{font-size:1.75rem}
        .lesson-body h2{font-size:1.35rem;border-bottom:1px solid var(--color-border);padding-bottom:.4rem}
        .lesson-body h3{font-size:1.1rem}
        .lesson-body p{margin:.75rem 0;line-height:1.75;color:var(--color-text-secondary)}
        .lesson-body ul,.lesson-body ol{padding-left:1.5rem;margin:.75rem 0}
        .lesson-body li{margin:.3rem 0;line-height:1.6}
        .lesson-body code{background:var(--color-bg-surface-2);padding:.15rem .35rem;border-radius:var(--radius-sm);font-family:var(--font-mono);font-size:.875em;color:var(--color-accent)}
        .lesson-body pre code{background:none;padding:0;color:inherit}
        .lesson-body table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.9rem}
        .lesson-body th,.lesson-body td{padding:.6rem .9rem;border:1px solid var(--color-border);text-align:left}
        .lesson-body th{background:var(--color-bg-surface-2);font-weight:600}
        .lesson-body blockquote{border-left:3px solid var(--color-accent);padding:.5rem 1rem;margin:1rem 0;background:var(--color-accent-soft);border-radius:0 var(--radius-md) var(--radius-md) 0}
        .lesson-loading{padding:2rem;text-align:center;color:var(--color-text-muted)}
        .lesson-no-content{padding:2rem;background:var(--color-bg-surface-2);border-radius:var(--radius-lg);border:2px dashed var(--color-border);text-align:center}
        .lesson-no-content p{color:var(--color-text-muted);margin:.5rem 0}
        .lesson-no-content-path{display:block;margin-top:.75rem;font-family:var(--font-mono);font-size:.85rem;color:var(--color-accent)}
        .lesson-actions{border-top:1px solid var(--color-border);padding-top:1.5rem;display:flex;flex-direction:column;gap:1rem}
        .lesson-nav{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap}
        .nav-btn{padding:.55rem 1rem;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-bg-surface);cursor:pointer;font-size:.875rem;color:var(--color-text-secondary);transition:all var(--transition-fast)}
        .nav-btn:hover:not(:disabled){border-color:var(--color-accent);color:var(--color-accent)}
        .nav-btn:disabled{opacity:.4;cursor:not-allowed}
        .nav-btn-next{margin-left:auto}
        .completar-btn{padding:.55rem 1.25rem;background:var(--color-accent);color:#fff;border:none;border-radius:var(--radius-md);cursor:pointer;font-weight:600;font-size:.875rem;transition:opacity var(--transition-fast)}
        .completar-btn:hover{opacity:.9}
        .completar-btn.completada{background:var(--color-success)}
      \`}</style>
    </article>
  )
}
`)

console.log('\n✅ Todos los componentes escritos exitosamente.\n')
`)

write('src/utils/mdxComponents.tsx', `/**
 * Componentes globales disponibles en todos los archivos MDX
 * sin necesidad de importarlos explícitamente.
 */
import { Callout } from '@/components/Callout'
import { Quiz } from '@/components/Quiz'
import { CodePlayground } from '@/components/CodePlayground'
import { Mermaid } from '@/components/Mermaid'
import { ApiPlayground } from '@/components/ApiPlayground'
import type { MDXComponents } from 'mdx/types'

export const mdxComponents: MDXComponents = {
  // Componentes pedagógicos
  Callout,
  Quiz,
  CodePlayground,
  Mermaid,
  ApiPlayground,

  // Personalizar elementos HTML
  pre: (props) => <pre style={{ overflow: 'auto', background: '#1e1e2e', padding: '1rem', borderRadius: '8px' }} {...props} />,
  code: ({ className, children, ...props }) => {
    // Si tiene clase de lenguaje, es un bloque de código (dentro de pre)
    if (className) return <code className={className} {...props}>{children}</code>
    // Si es inline, aplicar estilos de inline code
    return (
      <code
        style={{
          background: 'var(--color-bg-surface-2)',
          padding: '.15rem .35rem',
          borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-mono)',
          fontSize: '.875em',
          color: 'var(--color-accent)',
        }}
        {...props}
      >
        {children}
      </code>
    )
  },
}
`)

write('src/types/mdx.d.ts', `// Declaración para que TypeScript acepte imports de .mdx
declare module '*.mdx' {
  import type { ComponentType } from 'react'
  const MDXComponent: ComponentType
  export default MDXComponent
}
`)

console.log('\\n\\n🎉 Setup completado!\\n')
`)

console.log('\n🎉 Setup completado!\n')
