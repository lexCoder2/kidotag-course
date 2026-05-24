import { useState } from "react";
import { fetchMock, ENDPOINTS, type MockRequest } from "@/data/mockApi";
import { SendHorizontal, PlugZap } from "lucide-react";

export function ApiPlayground() {
  const [metodo, setMetodo] = useState<MockRequest["method"]>("GET");
  const [endpoint, setEndpoint] = useState("estado");
  const [bodyText, setBodyText] = useState("");
  const [token, setToken] = useState("");
  const [respuesta, setRespuesta] = useState<{
    status: number;
    body: unknown;
  } | null>(null);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cargarEjemplo = (ep: (typeof ENDPOINTS)[0]) => {
    setMetodo(ep.method);
    setEndpoint(ep.endpoint);
    setBodyText(ep.ejemploBody ? JSON.stringify(ep.ejemploBody, null, 2) : "");
  };

  const enviar = async () => {
    setCargando(true);
    setErrorMsg(null);
    try {
      const body = bodyText.trim()
        ? (JSON.parse(bodyText) as Record<string, unknown>)
        : undefined;
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetchMock({ method: metodo, endpoint, body, headers });
      setRespuesta(res);
      // Auto-capturar token del login
      const d = res.body as Record<string, unknown>;
      if (d?.ok && (d.data as Record<string, unknown>)?.token) {
        setToken((d.data as Record<string, unknown>).token as string);
      }
    } catch (e) {
      setErrorMsg(String(e));
    } finally {
      setCargando(false);
    }
  };

  const statusColor = (s: number) =>
    s < 300
      ? "var(--color-success)"
      : s < 400
        ? "var(--color-warning)"
        : "var(--color-danger)";

  return (
    <div className="apip">
      <div className="apip-header">
        <span className="apip-badge">
          <PlugZap size={14} aria-hidden="true" /> API Playground
        </span>
        <span className="apip-hint">
          Prueba los endpoints de kidotag10 en tiempo real
        </span>
      </div>

      <div className="apip-shortcuts">
        {ENDPOINTS.map((ep, i) => (
          <button
            key={i}
            className="apip-shortcut"
            onClick={() => cargarEjemplo(ep)}
            title={ep.descripcion}
          >
            <span className={`apip-method apip-${ep.method.toLowerCase()}`}>
              {ep.method}
            </span>
            <span>{ep.endpoint}</span>
          </button>
        ))}
      </div>

      <div className="apip-form">
        <div className="apip-row">
          <select
            value={metodo}
            onChange={(e) => setMetodo(e.target.value as MockRequest["method"])}
            className="apip-select"
          >
            {(["GET", "POST", "PUT", "DELETE"] as const).map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <input
            className="apip-input apip-endpoint-input"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="endpoint (ej: alumnos)"
          />
          <button className="apip-send" onClick={enviar} disabled={cargando}>
            {cargando ? "..." : (
              <>
                Enviar <SendHorizontal size={13} aria-hidden="true" />
              </>
            )}
          </button>
        </div>

        <div className="apip-fields">
          <label className="apip-field-label">
            Token JWT (se llena automáticamente al hacer login)
            <input
              className="apip-input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJ..."
            />
          </label>
          <label className="apip-field-label">
            Body (JSON)
            <textarea
              className="apip-textarea"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={4}
              placeholder='{"clave": "valor"}'
            />
          </label>
        </div>
      </div>

      {(respuesta || errorMsg) && (
        <div className="apip-response">
          <div className="apip-response-header">
            {respuesta && (
              <span
                className="apip-status"
                style={{ color: statusColor(respuesta.status) }}
              >
                HTTP {respuesta.status}
              </span>
            )}
            {errorMsg && (
              <span style={{ color: "var(--color-danger)" }}>
                Error: {errorMsg}
              </span>
            )}
          </div>
          <pre className="apip-body">
            {respuesta ? JSON.stringify(respuesta.body, null, 2) : errorMsg}
          </pre>
        </div>
      )}
    </div>
  );
}
