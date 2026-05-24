import {
  isValidElement,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

interface Props extends HTMLAttributes<HTMLPreElement> {
  children?: ReactNode;
}

type TokenType =
  | "plain"
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "function"
  | "symbol";

type LineToken = {
  text: string;
  type: TokenType;
};

const SUPPORTED_LANGUAGES = new Set([
  "js",
  "jsx",
  "ts",
  "tsx",
  "javascript",
  "typescript",
  "json",
  "bash",
  "shell",
  "sh",
]);

const KEYWORD_PATTERN =
  /\b(await|async|break|case|catch|class|const|continue|default|delete|do|else|enum|export|extends|false|finally|for|from|function|if|implements|import|in|instanceof|interface|let|new|null|private|protected|public|return|static|super|switch|this|throw|true|try|type|typeof|var|void|while|with|yield)\b/g;

const STRING_PATTERN = /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g;

const NUMBER_PATTERN = /\b\d+(?:\.\d+)?\b/g;

const COMMENT_PATTERN = /\/\/.*$/g;

const FUNCTION_PATTERN = /\b([A-Za-z_$][\w$]*)\s*(?=\()/g;

const SYMBOL_PATTERN =
  /=>|===|!==|==|!=|<=|>=|&&|\|\||[{}()[\].,;:+\-*/%<>!=]/g;

const IDENTIFIER_PATTERN = /\b[A-Za-z_$][\w$]*\b/g;

const RESERVED_WORDS = new Set([
  "await",
  "async",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "null",
  "private",
  "protected",
  "public",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "type",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
  "console",
  "Math",
  "JSON",
  "Object",
  "Array",
  "String",
  "Number",
  "Boolean",
  "Date",
  "Promise",
  "setTimeout",
  "setInterval",
  "clearTimeout",
  "clearInterval",
  "log",
]);

function shouldHighlight(language: string): boolean {
  return SUPPORTED_LANGUAGES.has(language.toLowerCase());
}

function addMatches(
  text: string,
  pattern: RegExp,
  type: Exclude<TokenType, "plain">,
  mask: Array<TokenType | null>,
) {
  pattern.lastIndex = 0;
  let match = pattern.exec(text);
  while (match) {
    const start = match.index;
    const value = match[0] || "";
    const end = start + value.length;
    if (value && mask.slice(start, end).every((slot) => slot === null)) {
      for (let i = start; i < end; i += 1) mask[i] = type;
    }
    match = pattern.exec(text);
  }
}

function tokenizeLine(line: string, language: string): LineToken[] {
  if (!line) return [{ text: " ", type: "plain" }];
  if (!shouldHighlight(language)) return [{ text: line, type: "plain" }];

  const mask: Array<TokenType | null> = Array.from(
    { length: line.length },
    () => null,
  );

  addMatches(line, COMMENT_PATTERN, "comment", mask);
  addMatches(line, STRING_PATTERN, "string", mask);
  addMatches(line, KEYWORD_PATTERN, "keyword", mask);
  addMatches(line, NUMBER_PATTERN, "number", mask);
  addMatches(line, FUNCTION_PATTERN, "function", mask);
  addMatches(line, SYMBOL_PATTERN, "symbol", mask);

  const tokens: LineToken[] = [];
  let currentType: TokenType = mask[0] || "plain";
  let currentText = line[0] || "";

  for (let i = 1; i < line.length; i += 1) {
    const nextType: TokenType = mask[i] || "plain";
    if (nextType === currentType) {
      currentText += line[i];
    } else {
      tokens.push({ text: currentText, type: currentType });
      currentType = nextType;
      currentText = line[i];
    }
  }

  tokens.push({ text: currentText, type: currentType });
  return tokens;
}

function normalizeValue(rawValue: string): string {
  const cleaned = rawValue.trim().replace(/;\s*$/, "");
  if (!cleaned) return "(vacio)";
  return cleaned;
}

function stripStringsAndComments(line: string): string {
  const noComments = line.replace(/\/\/.*$/, "");
  return noComments.replace(STRING_PATTERN, (match) =>
    " ".repeat(match.length),
  );
}

function extractVariablesFromLine(line: string): string[] {
  const cleaned = stripStringsAndComments(line);
  const result: string[] = [];
  const seen = new Set<string>();

  IDENTIFIER_PATTERN.lastIndex = 0;
  let match = IDENTIFIER_PATTERN.exec(cleaned);
  while (match) {
    const name = match[0];
    const index = match.index;
    const prevChar = cleaned[index - 1] || "";

    if (!RESERVED_WORDS.has(name) && prevChar !== "." && !seen.has(name)) {
      seen.add(name);
      result.push(name);
    }

    match = IDENTIFIER_PATTERN.exec(cleaned);
  }

  return result;
}

function getVariableContext(
  lines: string[],
  activeLine: number,
): Map<string, string> {
  const context = new Map<string, string>();
  const upto = Math.min(lines.length, activeLine);

  for (let i = 0; i < upto; i += 1) {
    const rawLine = lines[i].trim();
    if (!rawLine || rawLine.startsWith("//")) continue;

    const declarationMatch = rawLine.match(
      /^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(.+)$/,
    );

    if (declarationMatch) {
      const [, name, value] = declarationMatch;
      context.set(name, normalizeValue(value));
      continue;
    }

    const assignMatch = rawLine.match(/^([A-Za-z_$][\w$]*)\s*=\s*(.+)$/);
    if (assignMatch) {
      const [, name, value] = assignMatch;
      context.set(name, normalizeValue(value));
    }
  }

  return context;
}

function nodeToText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map((n) => nodeToText(n)).join("");
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return nodeToText(node.props?.children);
  }
  return "";
}

function toCodeText(children: ReactNode): string | null {
  if (!isValidElement<{ children?: ReactNode }>(children)) return null;
  const raw = children.props?.children;
  const text = nodeToText(raw);
  return text || null;
}

function detectLanguage(children: ReactNode): string {
  if (!isValidElement<{ className?: string }>(children)) return "text";
  const cls = String(children.props?.className || "");
  const match = cls.match(/language-([a-z0-9-]+)/i);
  return match ? match[1] : "text";
}

function isShellLanguage(language: string): boolean {
  const lang = language.toLowerCase();
  return lang === "bash" || lang === "sh" || lang === "shell" || lang === "zsh";
}

function isJavaScriptLanguage(language: string): boolean {
  const lang = language.toLowerCase();
  return lang === "js" || lang === "javascript";
}

function isSafeIdentifier(name: string): boolean {
  return /^[A-Za-z_$][\w$]*$/.test(name);
}

function escapeForTemplateLiteral(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
}

function executeJavaScriptValues(
  lines: string[],
  activeLine: number,
  variables: string[],
): { values: Map<string, string>; runtimeError: string | null } {
  const values = new Map<string, string>();
  const safeVariables = variables.filter(isSafeIdentifier);
  if (safeVariables.length === 0) {
    return { values, runtimeError: null };
  }

  const snippet = lines.slice(0, activeLine).join("\n");
  const reads = safeVariables
    .map(
      (name) =>
        `__result[${JSON.stringify(name)}] = (typeof ${name} === \"undefined\") ? \"(sin definir)\" : __format(${name});`,
    )
    .join("\n");

  const runtimeSource = `
    "use strict";
    const __result = {};
    const __console = { log() {}, warn() {}, error() {}, info() {} };
    const console = __console;
    const __format = (value) => {
      if (value === null) return "null";
      if (typeof value === "undefined") return "undefined";
      if (typeof value === "string") return JSON.stringify(value);
      if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
        return String(value);
      }
      if (typeof value === "function") {
        return "[Function " + (value.name || "anonima") + "]";
      }
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    };
    let __runtimeError = null;
    try {
      ${escapeForTemplateLiteral(snippet)}
      ${reads}
    } catch (error) {
      __runtimeError = error instanceof Error ? error.message : String(error);
    }
    return { result: __result, runtimeError: __runtimeError };
  `;

  try {
    const fn = new Function(runtimeSource);
    const output = fn() as {
      result?: Record<string, string>;
      runtimeError?: string | null;
    };

    const entries = Object.entries(output.result || {});
    for (const [name, value] of entries) {
      values.set(name, value);
    }

    return { values, runtimeError: output.runtimeError || null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { values, runtimeError: message };
  }
}

export function SmartCodeBlock({ children, ...rest }: Props) {
  const code = toCodeText(children);
  const language = detectLanguage(children);
  const isShellSnippet = isShellLanguage(language);
  const isJavaScriptSnippet = isJavaScriptLanguage(language);
  const [activeLine, setActiveLine] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => {
    if (!code) return [];
    return code.replace(/\n$/, "").split("\n");
  }, [code]);

  useEffect(() => {
    if (!animating || lines.length === 0) return;
    const id = window.setInterval(() => {
      setActiveLine((prev) => {
        if (prev >= lines.length) {
          setAnimating(false);
          return 1;
        }
        return prev + 1;
      });
    }, 750);
    return () => window.clearInterval(id);
  }, [animating, lines.length]);

  useEffect(() => {
    if (isShellSnippet && animating) {
      setAnimating(false);
    }
  }, [isShellSnippet, animating]);

  async function onCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1300);
    } catch {
      setCopied(false);
    }
  }

  if (!code || lines.length === 0) {
    return <pre {...rest}>{children}</pre>;
  }

  const safeActive = Math.min(Math.max(activeLine, 1), lines.length);
  const activeLineText = lines[safeActive - 1] || "";
  const { variableRows, runtimeError } = useMemo(() => {
    if (isShellSnippet) {
      return { variableRows: [], runtimeError: null as string | null };
    }
    const variablesInLine = extractVariablesFromLine(activeLineText);

    if (variablesInLine.length === 0) {
      return { variableRows: [], runtimeError: null as string | null };
    }

    if (isJavaScriptSnippet) {
      const { values, runtimeError } = executeJavaScriptValues(
        lines,
        safeActive,
        variablesInLine,
      );

      return {
        variableRows: variablesInLine.map((name) => ({
          name,
          value: values.get(name) || "(sin valor tras ejecutar)",
        })),
        runtimeError,
      };
    }

    const variableContext = getVariableContext(lines, safeActive);
    return {
      variableRows: variablesInLine.map((name) => ({
        name,
        value: variableContext.get(name) || "(sin valor previo)",
      })),
      runtimeError: null as string | null,
    };
  }, [activeLineText, isJavaScriptSnippet, isShellSnippet, lines, safeActive]);

  return (
    <div className="smart-code-wrap">
      <div className="smart-code-toolbar">
        <span className="smart-code-lang">{language}</span>
        <div className="smart-code-actions">
          <button className="smart-code-btn" type="button" onClick={onCopy}>
            {copied ? "Copiado" : "Copiar"}
          </button>
          {!isShellSnippet && (
            <button
              className="smart-code-btn"
              type="button"
              onClick={() => setAnimating((v) => !v)}
            >
              {animating ? "Pausar" : "Animar flujo"}
            </button>
          )}
        </div>
      </div>

      <pre className="smart-code-pre" {...rest}>
        <code>
          {lines.map((line, idx) => {
            const number = idx + 1;
            const isActive = number === safeActive;
            return (
              <div
                key={number}
                className={`smart-code-line${isActive ? " is-active" : ""}`}
                onMouseEnter={() => setActiveLine(number)}
              >
                <span className="smart-code-line-number">{number}</span>
                <span className="smart-code-line-text">
                  {tokenizeLine(line, language).map((token, tokenIndex) => (
                    <span
                      key={`${number}-${tokenIndex}`}
                      className={`smart-code-token smart-code-token-${token.type}`}
                    >
                      {token.text}
                    </span>
                  ))}
                </span>
              </div>
            );
          })}
        </code>
      </pre>

      {!isShellSnippet && (
        <div className="smart-code-flow" aria-live="polite">
          {runtimeError && (
            <div className="smart-code-flow-item current smart-code-flow-empty">
              <span>Error al ejecutar</span>
              <code>{runtimeError}</code>
            </div>
          )}
          {variableRows.length === 0 ? (
            <div className="smart-code-flow-item current smart-code-flow-empty">
              <span>Variables en esta linea</span>
              <code>No se detectaron variables.</code>
            </div>
          ) : (
            variableRows.map((row) => (
              <div className="smart-code-flow-item current" key={row.name}>
                <span className="smart-code-var-name">{row.name}</span>
                <code className="smart-code-var-value">{row.value}</code>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
