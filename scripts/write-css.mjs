import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const indexCss = `/* Curso KidoTag — Variables globales de diseño */
:root {
  --color-bg-canvas:     #f1f5f9;
  --color-bg-surface:    #ffffff;
  --color-bg-surface-2:  #f8fafc;
  --color-border:        #e2e8f0;
  --color-border-strong: #cbd5e1;
  --color-text-primary:  #0f172a;
  --color-text-secondary:#334155;
  --color-text-muted:    #64748b;
  --color-text-inverse:  #ffffff;
  --color-accent:        #274c77;
  --color-accent-light:  #3b6fa0;
  --color-accent-soft:   rgba(39, 76, 119, 0.08);
  --color-success:       #15803d;
  --color-success-soft:  rgba(21, 128, 61, 0.10);
  --color-warning:       #92400e;
  --color-warning-soft:  rgba(146, 64, 14, 0.10);
  --color-danger:        #b91c1c;
  --color-danger-soft:   rgba(185, 28, 28, 0.10);
  --color-info:          #0369a1;
  --color-info-soft:     rgba(3, 105, 161, 0.10);
  --color-tip:           #6d28d9;
  --color-tip-soft:      rgba(109, 40, 217, 0.10);
  --sidebar-width:       260px;
  --header-height:       56px;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px;
  --radius-xl: 16px; --radius-full: 9999px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,.07), 0 2px 4px -2px rgba(0,0,0,.05);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,.08), 0 4px 6px -4px rgba(0,0,0,.05);
  --transition-fast: 0.15s ease; --transition-normal: 0.22s ease;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-sans);
  background: var(--color-bg-canvas);
  color: var(--color-text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
#root { min-height: 100vh; display: flex; flex-direction: column; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-border-strong); border-radius: 3px; }
a { color: var(--color-accent); text-decoration: none; }
a:hover { text-decoration: underline; }
code, pre { font-family: var(--font-mono); }
h1,h2,h3,h4,h5,h6 { line-height: 1.3; font-weight: 600; }
`;

writeFileSync(join(ROOT, "src", "index.css"), indexCss);
console.log("✅ src/index.css escrito");
