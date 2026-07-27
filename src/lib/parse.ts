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
 * Parse a pasted EXPLAIN payload for the chosen engine. With `"auto"` the
 * engines are tried in order of how distinctive their formats are —
 * Postgres (JSON array / `cost=` text), SQLite (`|--` tree or `id|parent|…`
 * rows), then MySQL, whose text parser is the most permissive.
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

  for (const candidate of ["postgres", "sqlite", "mysql"] as const) {
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
