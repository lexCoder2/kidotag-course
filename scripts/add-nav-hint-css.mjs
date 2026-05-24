import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = join(ROOT, "src", "index.css");

const newCss = `
/* ── Keyboard nav hint ────────────────────────────────────── */
.lesson-nav-hint {
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 6px;
  letter-spacing: 0.02em;
}
`;

const current = fs.readFileSync(cssPath, "utf8");
if (!current.includes(".lesson-nav-hint")) {
  fs.writeFileSync(cssPath, current.trimEnd() + "\n" + newCss, "utf8");
  console.log("✅ lesson-nav-hint CSS añadido");
} else {
  console.log("ℹ️  Ya existe .lesson-nav-hint");
}
