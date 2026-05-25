/**
 * Metadata que enriquece el glosario: categorías, colores y términos relacionados.
 * Separado de glossary.ts para no ensanchar ese archivo.
 */

// ── Categorías ────────────────────────────────────────────────────────────────

export const CATEGORY_ORDER = [
  "js",
  "node",
  "backend",
  "datos",
  "seguridad",
  "react",
  "realtime",
  "hardware",
  "tools",
];

export const CATEGORY_LABELS: Record<string, string> = {
  js:        "JS / TS",
  node:      "Node.js",
  backend:   "Backend",
  datos:     "Datos",
  seguridad: "Seguridad",
  react:     "React",
  realtime:  "Tiempo Real",
  hardware:  "Hardware",
  tools:     "Herramientas",
};

export const CATEGORY_COLORS: Record<string, string> = {
  js:        "#d97706", // amber
  node:      "#16a34a", // green
  backend:   "#2563eb", // blue
  datos:     "#ea580c", // orange
  seguridad: "#dc2626", // red
  react:     "#0891b2", // cyan
  realtime:  "#7c3aed", // violet
  hardware:  "#475569", // slate
  tools:     "#65a30d", // lime
};

export const CATEGORY_MAP: Record<string, string> = {
  // JS / TS fundamentals
  javascript:         "js",
  typescript:         "js",
  html:               "js",
  css:                "js",
  "cliente-servidor": "js",
  hoisting:           "js",
  closure:            "js",
  "event-loop":       "js",
  destructuring:      "js",
  spread:             "js",
  "async-await":      "js",
  promesas:           "js",
  fetch:              "js",
  modulos:            "js",
  json:               "js",
  // Node.js
  nodejs:   "node",
  npm:      "node",
  dotenv:   "node",
  cli:      "node",
  // Backend
  express:     "backend",
  middleware:  "backend",
  cors:        "backend",
  endpoint:    "backend",
  controlador: "backend",
  api:         "backend",
  rest:        "backend",
  http:        "backend",
  mvc:         "backend",
  swagger:     "backend",
  openapi:     "backend",
  // Datos
  mongodb:  "datos",
  mongoose: "datos",
  populate: "datos",
  crud:     "datos",
  schema:   "datos",
  // Seguridad
  jwt:         "seguridad",
  bcrypt:      "seguridad",
  auth:        "seguridad",
  autorizacion:"seguridad",
  seguridad:   "seguridad",
  rbac:        "seguridad",
  rol:         "seguridad",
  // React / Frontend
  react:          "react",
  vite:           "react",
  jsx:            "react",
  componente:     "react",
  props:          "react",
  estado:         "react",
  hooks:          "react",
  useeffect:      "react",
  usestate:       "react",
  "context-api":  "react",
  "react-router": "react",
  reconciliacion: "react",
  localstorage:   "react",
  "css-variables":"react",
  ux:             "react",
  // Tiempo real
  socketio:   "realtime",
  websockets: "realtime",
  // Hardware
  nfc:       "hardware",
  esp32:     "hardware",
  asistencia:"hardware",
  // Herramientas
  git: "tools",
};

// ── Términos relacionados ─────────────────────────────────────────────────────

export const RELATED_MAP: Record<string, string[]> = {
  javascript:         ["typescript", "nodejs", "async-await", "closure", "hoisting", "destructuring"],
  typescript:         ["javascript", "react", "nodejs", "schema"],
  html:               ["css", "jsx"],
  css:                ["css-variables", "ux", "html"],
  "css-variables":    ["css", "ux", "react"],
  "cliente-servidor": ["http", "api", "rest", "express"],
  hoisting:           ["javascript", "closure", "modulos"],
  closure:            ["javascript", "hoisting", "hooks", "useeffect"],
  "event-loop":       ["javascript", "async-await", "promesas", "nodejs"],
  destructuring:      ["javascript", "spread", "props"],
  spread:             ["javascript", "destructuring", "estado"],
  "async-await":      ["promesas", "fetch", "event-loop", "javascript"],
  promesas:           ["async-await", "fetch", "javascript"],
  fetch:              ["http", "api", "async-await", "rest"],
  modulos:            ["javascript", "nodejs", "npm"],
  json:               ["rest", "api", "javascript"],
  nodejs:             ["javascript", "npm", "express", "async-await"],
  npm:                ["nodejs", "vite", "cli"],
  dotenv:             ["nodejs", "express", "seguridad"],
  cli:                ["nodejs", "npm", "git"],
  express:            ["nodejs", "middleware", "cors", "rest", "controlador", "mvc"],
  middleware:         ["express", "cors", "auth", "jwt"],
  cors:               ["express", "http", "rest"],
  endpoint:           ["rest", "http", "express", "controlador"],
  controlador:        ["express", "endpoint", "mvc", "middleware"],
  api:                ["rest", "http", "endpoint", "json", "swagger"],
  rest:               ["http", "api", "endpoint", "json", "express"],
  http:               ["rest", "api", "fetch", "cors"],
  mvc:                ["express", "controlador", "mongodb", "react"],
  swagger:            ["api", "openapi", "rest", "endpoint"],
  openapi:            ["swagger", "api", "rest"],
  mongodb:            ["mongoose", "schema", "crud", "populate"],
  mongoose:           ["mongodb", "schema", "crud", "populate", "nodejs"],
  populate:           ["mongoose", "mongodb", "schema"],
  crud:               ["mongodb", "mongoose", "api", "rest"],
  schema:             ["mongoose", "mongodb", "typescript"],
  jwt:                ["auth", "bcrypt", "middleware", "seguridad", "autorizacion"],
  bcrypt:             ["jwt", "auth", "seguridad"],
  auth:               ["jwt", "bcrypt", "autorizacion", "middleware", "seguridad"],
  autorizacion:       ["auth", "jwt", "rbac", "rol", "middleware"],
  seguridad:          ["auth", "jwt", "cors", "dotenv", "bcrypt"],
  rbac:               ["autorizacion", "rol", "auth", "middleware"],
  rol:                ["rbac", "autorizacion", "auth"],
  react:              ["jsx", "componente", "hooks", "estado", "props", "vite", "typescript"],
  vite:               ["react", "npm", "javascript"],
  jsx:                ["react", "html", "javascript", "componente"],
  componente:         ["react", "jsx", "props", "estado", "hooks"],
  props:              ["react", "componente", "typescript", "destructuring"],
  estado:             ["react", "hooks", "usestate", "componente"],
  hooks:              ["react", "usestate", "useeffect", "estado", "closure"],
  useeffect:          ["hooks", "react", "async-await", "fetch"],
  usestate:           ["hooks", "react", "estado"],
  "context-api":      ["react", "hooks", "estado", "props"],
  "react-router":     ["react", "javascript"],
  reconciliacion:     ["react", "jsx", "componente", "usestate"],
  localstorage:       ["javascript", "auth", "jwt"],
  socketio:           ["websockets", "nodejs", "express", "javascript"],
  websockets:         ["socketio", "http", "javascript"],
  nfc:                ["esp32", "asistencia"],
  esp32:              ["nfc", "asistencia", "http"],
  asistencia:         ["nfc", "esp32", "mongodb"],
  git:                ["cli", "nodejs"],
  ux:                 ["css", "css-variables", "react"],
};
