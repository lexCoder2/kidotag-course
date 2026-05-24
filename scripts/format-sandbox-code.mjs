/**
 * format-sandbox-code.mjs
 * Formats JavaScript/JSX/TypeScript code inside template literals
 * within `codigo` and `archivos` props in all MDX lesson files.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import prettier from "prettier";

const LESSONS_DIR = resolve("src/lessons");

function findMdxFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMdxFiles(full));
    } else if (entry.name.endsWith(".mdx")) {
      results.push(full);
    }
  }
  return results;
}

function inferParser(filename) {
  if (!filename) return "babel";
  if (filename.endsWith(".tsx") || filename.endsWith(".ts")) return "babel-ts";
  if (filename.endsWith(".css")) return "css";
  if (filename.endsWith(".html")) return "html";
  return "babel";
}

async function formatCode(code, parser) {
  try {
    const formatted = await prettier.format(code, {
      parser,
      semi: true,
      singleQuote: false,
      trailingComma: "all",
      tabWidth: 2,
      printWidth: 100,
      jsxSingleQuote: false,
    });
    // Remove trailing newline added by Prettier (template literals shouldn't end with \n)
    return formatted.replace(/\n$/, "");
  } catch {
    // If Prettier fails (invalid code), return original
    return code;
  }
}

/**
 * Finds all backtick-delimited template literals in a string,
 * handling escaped backticks (\`) within them.
 * Returns array of { start, end, content } where start/end are indices
 * of the opening and closing backtick.
 */
function findTemplateLiterals(src) {
  const results = [];
  let i = 0;
  while (i < src.length) {
    if (src[i] === "`") {
      const start = i;
      i++;
      let content = "";
      while (i < src.length) {
        if (src[i] === "\\" && src[i + 1] === "`") {
          content += "\\`";
          i += 2;
        } else if (src[i] === "`") {
          results.push({ start, end: i, content });
          i++;
          break;
        } else {
          content += src[i];
          i++;
        }
      }
    } else {
      i++;
    }
  }
  return results;
}

/**
 * Determine if a template literal is a code value in archivos or codigo prop.
 * Returns the filename (for archivos) or null (for codigo/unknown).
 */
function getCodeContext(src, literalStart) {
  // Look behind for context — check up to 200 chars before the backtick
  const lookbehind = src.slice(Math.max(0, literalStart - 200), literalStart);

  // Match: '/App.js': `  or  "/App.tsx": `
  const archivosMatch = lookbehind.match(
    /['"]([\w./\-]+)['"]\s*:\s*(?:\{[^}]*code\s*:\s*)?$/,
  );
  if (archivosMatch) return archivosMatch[1];

  // Match: codigo={`
  if (
    /codigo=\{$/.test(lookbehind.trim()) ||
    lookbehind.trimEnd().endsWith("codigo={")
  ) {
    return "/App.js";
  }

  return null;
}

async function processFile(filePath) {
  const original = readFileSync(filePath, "utf8");
  let result = original;
  let offset = 0; // track position shift as we replace

  const literals = findTemplateLiterals(original);

  for (const { start, end, content } of literals) {
    const filename = getCodeContext(original, start);
    if (!filename) continue;

    // Skip very short snippets (less than 3 lines) — likely not worth formatting
    if (content.split("\n").length < 3) continue;

    // Unescape the backtick content so Prettier can read it
    const unescaped = content.replace(/\\`/g, "`").replace(/\\\$\{/g, "${");

    const parser = inferParser(filename);
    const formatted = await formatCode(unescaped, parser);

    if (formatted === unescaped) continue; // no change

    // Re-escape backticks and template literal expression openers
    const reescaped = formatted.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

    if (reescaped === content) continue; // escaped form also unchanged

    const adjustedStart = start + offset;
    const adjustedEnd = end + offset;

    result =
      result.slice(0, adjustedStart + 1) +
      reescaped +
      result.slice(adjustedEnd);

    offset += reescaped.length - content.length;
  }

  if (result !== original) {
    writeFileSync(filePath, result, "utf8");
    return true;
  }
  return false;
}

async function main() {
  const files = findMdxFiles(LESSONS_DIR);
  console.log(`Found ${files.length} MDX files.`);

  let changed = 0;
  for (const file of files) {
    const wasChanged = await processFile(file);
    if (wasChanged) {
      console.log(
        `  ✓ formatted: ${file.replace(LESSONS_DIR, "").replace(/\\/g, "/")}`,
      );
      changed++;
    }
  }

  console.log(`\nDone. ${changed} file(s) updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
