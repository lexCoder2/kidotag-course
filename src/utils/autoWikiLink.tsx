/**
 * Automatically wraps known glossary terms in <WikiLink> inside MDX content.
 * Applied at render time by overriding `p`, `li`, `td`, and `th` in the
 * MDX component map — covers every lesson in the app without touching MDX files.
 */
import React, { type ReactNode } from "react";
import { GLOSSARY } from "@/data/glossary";
import { WikiLink } from "@/components/WikiLink";

// ── Term registry ─────────────────────────────────────────────────────────────

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Strip trailing parenthetical and take first option before " / " */
function toPhrase(titulo: string): string {
  let p = titulo.replace(/\s*\([^)]*\)\s*$/, "").trim();
  p = p.split(" / ")[0].trim();
  return p;
}

interface Term {
  key: string;
  phrase: string;
}

// Sort longest-first so "Node.js" is tried before "Node", "async/await" before "async", etc.
const TERMS: Term[] = GLOSSARY.map(({ key, titulo }) => ({
  key,
  phrase: toPhrase(titulo),
}))
  .filter((t) => t.phrase.length >= 3)
  .sort((a, b) => b.phrase.length - a.phrase.length);

/** Map lowercased phrase → glossary key */
const PHRASE_TO_KEY = new Map<string, string>(
  TERMS.map((t) => [t.phrase.toLowerCase(), t.key]),
);

/**
 * Each alternative uses negative look-behind / look-ahead to avoid matching
 * inside longer identifiers (e.g. "Vite" should not match inside "invite").
 */
const COMBINED_SRC =
  "(?<![a-zA-Z0-9_])(?:" +
  TERMS.map((t) => escapeRegex(t.phrase)).join("|") +
  ")(?![a-zA-Z0-9_])";

// ── Text splitter ─────────────────────────────────────────────────────────────

function splitText(text: string, baseKey: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = new RegExp(COMBINED_SRC, "gi");
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = PHRASE_TO_KEY.get(m[0].toLowerCase());
    if (key) {
      out.push(
        <WikiLink key={`${baseKey}-${m.index}`} term={key}>
          {m[0]}
        </WikiLink>,
      );
    } else {
      out.push(m[0]);
    }
    last = m.index + m[0].length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

// ── React tree walker ─────────────────────────────────────────────────────────

/** Tags whose content must not be auto-linked */
const SKIP_TAGS = new Set(["code", "pre", "a", "button"]);

function walk(node: ReactNode, path = "0"): ReactNode {
  if (node == null || typeof node === "boolean") return node;
  if (typeof node === "number") return node;

  if (typeof node === "string") {
    const parts = splitText(node, path);
    return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
  }

  if (Array.isArray(node)) {
    return node.map((child, i) => walk(child, `${path}.${i}`));
  }

  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: ReactNode }>;
    // Do not recurse into code, links, buttons, or already-explicit WikiLinks
    if (typeof el.type === "string" && SKIP_TAGS.has(el.type)) return el;
    if (el.type === WikiLink) return el;

    const processed = walk(el.props.children, `${path}.c`);
    if (processed === el.props.children) return el;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return React.cloneElement(el as React.ReactElement<any>, {
      children: processed,
    });
  }

  return node;
}

// ── Wrapped MDX block elements ────────────────────────────────────────────────

export function AutoP({
  children,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p {...rest}>{walk(children as ReactNode)}</p>;
}

export function AutoLi({
  children,
  ...rest
}: React.HTMLAttributes<HTMLLIElement>) {
  return <li {...rest}>{walk(children as ReactNode)}</li>;
}

export function AutoTd({
  children,
  ...rest
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...rest}>{walk(children as ReactNode)}</td>;
}

export function AutoTh({
  children,
  ...rest
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...rest}>{walk(children as ReactNode)}</th>;
}
