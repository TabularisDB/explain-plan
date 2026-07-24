import type { SqliteEqpRow } from "@tabularis/explain";

/**
 * Turn pasted SQLite `EXPLAIN QUERY PLAN` output into the `(id, parent,
 * detail)` rows that `@tabularis/explain` consumes. Two shapes are accepted:
 *
 * The tree the sqlite3 shell prints by default (or with `.eqp on`):
 *
 *     QUERY PLAN
 *     |--SCAN customers
 *     `--SEARCH orders USING INDEX idx_orders_customer (customer_id=?)
 *
 * And raw pipe-separated rows, either `id|parent|notused|detail` (the
 * classic four-column form) or `id|parent|detail`:
 *
 *     3|0|0|SCAN customers
 *     8|0|0|SEARCH orders USING INDEX idx_orders_customer (customer_id=?)
 */
export function parseSqliteEqpText(raw: string): SqliteEqpRow[] {
  const lines = raw
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== "")
    .filter((line) => line.trim().toUpperCase() !== "QUERY PLAN");

  if (lines.length === 0) {
    throw new Error("SQLite EXPLAIN QUERY PLAN output is empty");
  }

  if (lines.every((line) => PIPE_ROW.test(line))) {
    return lines.map(parsePipeRow);
  }
  if (lines.every((line) => TREE_LINE.test(line))) {
    return parseTreeLines(lines);
  }
  throw new Error(
    "Unrecognised SQLite EXPLAIN QUERY PLAN output: expected the sqlite3 " +
      "shell tree (lines starting with |-- or `--) or id|parent|…|detail rows",
  );
}

const PIPE_ROW = /^\s*\d+\|\d+\|(?:\d+\|)?\S.*$/;

function parsePipeRow(line: string): SqliteEqpRow {
  const match = /^\s*(\d+)\|(\d+)\|(?:\d+\|)?(.*)$/.exec(line);
  if (match === null) {
    throw new Error(`Malformed SQLite EQP row: ${line}`);
  }
  return {
    id: Number(match[1]),
    parent: Number(match[2]),
    detail: match[3].trim(),
  };
}

// Depth is encoded in three-character prefix chunks: "|  " or "   " for
// pass-through levels, then "|--" or "`--" in front of the detail itself.
const TREE_LINE = /^(?:\|  |   )*(?:\|--|`--)(.+)$/;

function parseTreeLines(lines: string[]): SqliteEqpRow[] {
  const rows: SqliteEqpRow[] = [];
  // Node id at each depth, so a child at depth d hangs off idAtDepth[d - 1].
  const idAtDepth: number[] = [];
  let nextId = 1;

  for (const line of lines) {
    const match = TREE_LINE.exec(line);
    if (match === null) {
      throw new Error(`Malformed SQLite EQP tree line: ${line}`);
    }
    const markerStart = line.length - match[1].length - 3;
    const depth = markerStart / 3;
    const id = nextId++;
    idAtDepth[depth] = id;
    rows.push({
      id,
      parent: depth === 0 ? 0 : idAtDepth[depth - 1],
      detail: match[1].trim(),
    });
  }

  return rows;
}
