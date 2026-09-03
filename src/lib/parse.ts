import {
  parseExplainFor,
  parseSqliteEqpRows,
  type ExplainEngine,
  type ExplainPlan,
} from "@tabularis/explain";
import { parseSqliteEqpText } from "./sqlite-text";

export type EngineChoice = ExplainEngine | "auto";

export const ENGINE_OPTIONS: Array<{ value: EngineChoice; label: string }> = [
  { value: "auto", label: "Auto-detect" },
  { value: "postgres", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL / MariaDB" },
  { value: "sqlite", label: "SQLite" },
  { value: "sqlserver", label: "SQL Server" },
];

/**
 * Pretty-print pasted text when it is a JSON document (Postgres FORMAT JSON
 * array or MySQL FORMAT=JSON object). Returns null for plain-text plans,
 * invalid JSON, or JSON that is already formatted this way, so the caller
 * can leave the paste untouched.
 */
export function prettifyJson(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return null;
  }
  try {
    const formatted = JSON.stringify(JSON.parse(trimmed), null, 2);
    return formatted === trimmed ? null : formatted;
  } catch {
    return null;
  }
}

/**
 * Pretty-print pasted text when it is an XML document (SQL Server SHOWPLAN
 * output is emitted on a single line). Elements are indented two spaces per
 * level; text-only elements stay on one line. Returns null for non-XML text,
 * unbalanced markup, or XML that is already formatted this way.
 */
export function prettifyXml(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("<")) {
    return null;
  }

  const tokens = trimmed.match(
    /<!\[CDATA\[[\s\S]*?\]\]>|<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<![^>]*>|<[^>]+>|[^<]+/g,
  );
  if (!tokens) {
    return null;
  }

  const lines: string[] = [];
  const stack: string[] = [];
  let depth = 0;
  const indent = () => "  ".repeat(depth);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (!token.startsWith("<")) {
      const content = token.trim();
      if (content !== "") {
        lines.push(indent() + content);
      }
      continue;
    }

    if (token.startsWith("</")) {
      const name = token.slice(2, -1).trim();
      if (stack.pop() !== name) {
        return null;
      }
      depth--;
      lines.push(indent() + token);
      continue;
    }

    const isElement = !/^<[!?]/.test(token);
    const selfClosing = token.endsWith("/>");
    if (!isElement || selfClosing) {
      lines.push(indent() + token);
      continue;
    }

    const name = token.slice(1, -1).trim().split(/\s/, 1)[0];
    const textNext = tokens[i + 1];
    const closeNext = tokens[i + 2];
    if (
      textNext !== undefined &&
      !textNext.startsWith("<") &&
      closeNext === `</${name}>`
    ) {
      // <Name>text</Name> — keep text-only elements on a single line.
      lines.push(indent() + token + textNext.trim() + closeNext);
      i += 2;
      continue;
    }

    lines.push(indent() + token);
    stack.push(name);
    depth++;
  }

  if (stack.length > 0) {
    return null;
  }

  const formatted = lines.join("\n");
  return formatted === trimmed ? null : formatted;
}

/**
 * Parse a pasted EXPLAIN payload for the chosen engine. With `"auto"` the
 * engines are tried in order of how distinctive their formats are — SQL
 * Server (`ShowPlanXML`), Postgres (JSON array / `cost=` text), SQLite (`|--`
 * tree or `id|parent|…` rows), then MySQL, whose text parser is the most
 * permissive.
 */
export function parsePlan(raw: string, engine: EngineChoice): ExplainPlan {
  const trimmed = raw.trim();
  if (trimmed === "") {
    throw new Error("Paste an EXPLAIN output first.");
  }

  if (engine === "sqlite") {
    return parseSqliteEqpRows(parseSqliteEqpText(trimmed));
  }
  if (engine !== "auto") {
    return parseExplainFor(trimmed, engine);
  }

  for (const candidate of [
    "sqlserver",
    "postgres",
    "sqlite",
    "mysql",
  ] as const) {
    // The MySQL text parser accepts almost any text, so when sniffing only
    // hand it input that plausibly is an EXPLAIN ANALYZE tree ("-> " lines)
    // or a FORMAT=JSON document.
    if (
      candidate === "mysql" &&
      !trimmed.startsWith("{") &&
      !/^\s*->/m.test(trimmed)
    ) {
      continue;
    }
    try {
      return parsePlan(trimmed, candidate);
    } catch {
      // Not this engine's format — try the next one.
    }
  }
  throw new Error(
    "Could not detect the plan format. Select the database engine explicitly " +
      "and check that the text is unmodified EXPLAIN output.",
  );
}
