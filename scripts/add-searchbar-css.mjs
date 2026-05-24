import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = join(ROOT, "src", "index.css");

const searchbarCss = `
/* ── SearchBar ────────────────────────────────────────────── */
.searchbar {
  position: relative;
  width: 100%;
  max-width: 520px;
  margin: 24px auto 0;
}
.searchbar-input-wrap {
  display: flex;
  align-items: center;
  background: var(--color-bg-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 0 16px;
  gap: 8px;
  transition: border-color var(--transition-fast);
}
.searchbar-input-wrap:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-soft);
}
.searchbar-icon { font-size: 1rem; color: var(--color-text-muted); }
.searchbar-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 10px 0;
  font-size: 0.95rem;
  background: transparent;
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}
.searchbar-input::placeholder { color: var(--color-text-muted); }
.searchbar-input::-webkit-search-cancel-button { display: none; }
.searchbar-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  padding: 4px;
  border-radius: 50%;
  line-height: 1;
}
.searchbar-clear:hover { color: var(--color-text-primary); }
.searchbar-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0; right: 0;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  list-style: none;
  padding: 6px;
  z-index: 200;
  max-height: 360px;
  overflow-y: auto;
}
.searchbar-result {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text-primary);
  transition: background var(--transition-fast);
}
.searchbar-result:hover {
  background: var(--color-accent-soft);
  text-decoration: none;
}
.searchbar-result-icon { font-size: 1.2rem; flex-shrink: 0; }
.searchbar-result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.searchbar-result-titulo {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.searchbar-result-bloque {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}
.searchbar-result-nivel {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: 600;
  flex-shrink: 0;
  text-transform: capitalize;
}
.searchbar-empty {
  position: absolute;
  top: calc(100% + 8px);
  left: 0; right: 0;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 14px 16px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  z-index: 200;
}
`;

const current = fs.readFileSync(cssPath, "utf8");
// Only add if not already present
if (!current.includes(".searchbar {")) {
  fs.writeFileSync(cssPath, current.trimEnd() + "\n" + searchbarCss, "utf8");
  console.log("✅ SearchBar CSS añadido a index.css");
} else {
  console.log("ℹ️  SearchBar CSS ya estaba en index.css");
}
