/**
 * mock-express.ts — micro-clon de Express para el runner NodeApi.
 *
 * Implementa la superficie usada en kidotag10/api/src:
 *   - app.use(path?, ...handlers)
 *   - app.get/post/put/delete/patch(path, ...handlers)
 *   - express.Router() con la misma API
 *   - req: { method, url, path, params, query, body, headers, usuario }
 *   - res: { status(n), json(obj), send(str), end() }  → captura en MockResponse
 *   - middleware chain: next() avanza, next(err) salta a error handlers (err,req,res,next)
 *   - app.dispatchRequest(method, url, body?, headers?) → Promise<MockResponse>
 */

export interface MockRequest {
  method: string;
  url: string;
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  headers: Record<string, string>;
  usuario?: unknown; // añadido por middleware de auth
}

export interface MockResponse {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
}

type Handler = (
  req: MockRequest,
  res: ResBuilder,
  next: NextFn,
) => void | Promise<void>;
type ErrorHandler = (
  err: unknown,
  req: MockRequest,
  res: ResBuilder,
  next: NextFn,
) => void | Promise<void>;
type NextFn = (err?: unknown) => void;

interface Route {
  method: string | null; // null = all (use)
  pathPattern: string | RegExp | null; // null = all
  handlers: Handler[];
  errorHandlers: ErrorHandler[];
  isRouter?: boolean;
  prefix?: string;
  router?: MockRouter;
}

class ResBuilder {
  statusCode = 200;
  _body: unknown = undefined;
  _headers: Record<string, string> = {};
  _sent = false;

  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  json(obj: unknown): void {
    if (!this._sent) {
      this._body = obj;
      this._headers["content-type"] = "application/json";
      this._sent = true;
    }
  }

  send(data: unknown): void {
    if (!this._sent) {
      this._body = data;
      this._sent = true;
    }
  }

  end(): void {
    if (!this._sent) {
      this._sent = true;
    }
  }

  setHeader(key: string, value: string): this {
    this._headers[key.toLowerCase()] = value;
    return this;
  }

  toResult(): MockResponse {
    return {
      statusCode: this.statusCode,
      body: this._body,
      headers: this._headers,
    };
  }
}

// Parsea path con parámetros (ej. "/api/v1/alumnos/:id") a RegExp
function compilePathPattern(pattern: string): {
  regex: RegExp;
  keys: string[];
} {
  const keys: string[] = [];
  const regexStr = pattern
    .replace(/\//g, "\\/")
    .replace(/:(\w+)/g, (_m: string, key: string) => {
      keys.push(key);
      return "([^\\/]+)";
    });
  return { regex: new RegExp(`^${regexStr}(?:\\/.*)?$`), keys };
}

function parseQuery(url: string): {
  path: string;
  query: Record<string, string>;
} {
  const idx = url.indexOf("?");
  if (idx === -1) return { path: url, query: {} };
  const path = url.slice(0, idx);
  const query: Record<string, string> = {};
  const qStr = url.slice(idx + 1);
  qStr.split("&").forEach((pair) => {
    const [k, v] = pair.split("=");
    if (k) query[decodeURIComponent(k)] = decodeURIComponent(v ?? "");
  });
  return { path, query };
}

export class MockRouter {
  protected _routes: Route[] = [];

  use(
    pathOrHandler: string | Handler | ErrorHandler,
    ...rest: (Handler | ErrorHandler | MockRouter)[]
  ): this {
    const allArgs = [pathOrHandler, ...rest];
    let prefix: string | null = null;
    let handlers: (Handler | ErrorHandler | MockRouter)[];

    if (typeof allArgs[0] === "string") {
      prefix = allArgs[0] as string;
      handlers = allArgs.slice(1) as (Handler | ErrorHandler | MockRouter)[];
    } else {
      handlers = allArgs as (Handler | ErrorHandler | MockRouter)[];
    }

    for (const h of handlers) {
      if (h instanceof MockRouter) {
        this._routes.push({
          method: null,
          pathPattern: null,
          handlers: [],
          errorHandlers: [],
          isRouter: true,
          prefix: prefix ?? "",
          router: h,
        });
      } else if (typeof h === "function" && h.length === 4) {
        this._routes.push({
          method: null,
          pathPattern: prefix,
          handlers: [],
          errorHandlers: [h as ErrorHandler],
        });
      } else {
        this._routes.push({
          method: null,
          pathPattern: prefix,
          handlers: [h as Handler],
          errorHandlers: [],
        });
      }
    }
    return this;
  }

  _addRoute(method: string, path: string, handlers: Handler[]): this {
    this._routes.push({
      method: method.toUpperCase(),
      pathPattern: path,
      handlers,
      errorHandlers: [],
    });
    return this;
  }

  get(path: string, ...handlers: Handler[]): this {
    return this._addRoute("GET", path, handlers);
  }
  post(path: string, ...handlers: Handler[]): this {
    return this._addRoute("POST", path, handlers);
  }
  put(path: string, ...handlers: Handler[]): this {
    return this._addRoute("PUT", path, handlers);
  }
  delete(path: string, ...handlers: Handler[]): this {
    return this._addRoute("DELETE", path, handlers);
  }
  patch(path: string, ...handlers: Handler[]): this {
    return this._addRoute("PATCH", path, handlers);
  }

  async dispatch(
    method: string,
    urlPath: string,
    body: unknown,
    headers: Record<string, string>,
    res: ResBuilder,
  ): Promise<boolean> {
    const upper = method.toUpperCase();
    const { path: reqPath, query } = parseQuery(urlPath);

    for (const route of this._routes) {
      // Sub-router
      if (route.isRouter && route.router) {
        const prefix = route.prefix ?? "";
        if (!reqPath.startsWith(prefix)) continue;
        const subPath = reqPath.slice(prefix.length) || "/";
        const handled = await route.router.dispatch(
          upper,
          subPath +
            (urlPath.includes("?") ? urlPath.slice(urlPath.indexOf("?")) : ""),
          body,
          headers,
          res,
        );
        if (handled) return true;
        continue;
      }

      // Method guard
      if (route.method && route.method !== upper) continue;

      // Path match
      let params: Record<string, string> = {};
      if (route.pathPattern !== null) {
        const pattern = route.pathPattern as string;
        if (pattern === "*" || pattern === "") {
          // match all
        } else {
          const { regex, keys } = compilePathPattern(pattern);
          const m = regex.exec(reqPath);
          if (!m) continue;
          keys.forEach((k, i) => {
            params[k] = m[i + 1];
          });
        }
      }

      const req: MockRequest = {
        method: upper,
        url: urlPath,
        path: reqPath,
        params,
        query,
        body,
        headers,
      };

      // Run handler chain
      const allHandlers = [...route.handlers];
      let idx = 0;
      let routeError: unknown = undefined;

      await new Promise<void>((resolve) => {
        const next: NextFn = (err?: unknown) => {
          if (err !== undefined) {
            routeError = err;
            resolve();
            return;
          }
          if (idx >= allHandlers.length) {
            resolve();
            return;
          }
          const h = allHandlers[idx++];
          try {
            const result = h(req, res, next);
            if (result instanceof Promise) {
              result
                .then(() => {
                  if (res._sent) resolve();
                })
                .catch((e) => {
                  routeError = e;
                  resolve();
                });
            } else {
              // Sync handler — if it sent a response without calling next(), resolve
              if (res._sent) resolve();
            }
          } catch (e) {
            routeError = e;
            resolve();
          }
        };
        next();
      });

      if (routeError) {
        // Run error handlers
        for (const eh of route.errorHandlers) {
          await new Promise<void>((resolve) => {
            const next: NextFn = () => resolve();
            try {
              const r = eh(routeError, req, res, next);
              if (r instanceof Promise) r.catch(() => resolve());
            } catch {
              resolve();
            }
          });
        }
      }

      if (res._sent) return true;
    }

    // Run global error handlers if error was propagated
    return false;
  }
}

export class MockApp extends MockRouter {
  listen(_port?: number, _cb?: () => void): this {
    return this;
  }

  async dispatchRequest(
    method: string,
    url: string,
    body: unknown = {},
    headers: Record<string, string> = {},
  ): Promise<MockResponse> {
    const res = new ResBuilder();
    const handled = await this.dispatch(method, url, body, headers, res);
    if (!handled && !res._sent) {
      res
        .status(404)
        .json({
          ok: false,
          error: {
            codigo: "NOT_FOUND",
            mensaje: `${method} ${url} no encontrado`,
          },
        });
    }
    return res.toResult();
  }
}

// ─── Objeto que require("express") retorna ──────────────────────────────────

function createApp(): MockApp {
  return new MockApp();
}
createApp.Router = () => new MockRouter();
createApp.json = () => (req: MockRequest, _res: ResBuilder, next: NextFn) => {
  void req;
  next();
};
createApp.urlencoded =
  () => (_req: MockRequest, _res: ResBuilder, next: NextFn) =>
    next();
createApp.static =
  (_path: string) => (_req: MockRequest, _res: ResBuilder, next: NextFn) =>
    next();

export const mockExpressModule = createApp;
export default createApp;
