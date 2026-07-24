import { describe, expect, it } from "vitest";
import { parseSqliteEqpText } from "./sqlite-text";

describe("parseSqliteEqpText", () => {
  it("parses the sqlite3 shell tree format", () => {
    const rows = parseSqliteEqpText(
      [
        "QUERY PLAN",
        "|--SCAN customers",
        "|--SEARCH orders USING INDEX idx_orders_customer (customer_id=?)",
        "`--USE TEMP B-TREE FOR ORDER BY",
      ].join("\n"),
    );

    expect(rows).toEqual([
      { id: 1, parent: 0, detail: "SCAN customers" },
      {
        id: 2,
        parent: 0,
        detail: "SEARCH orders USING INDEX idx_orders_customer (customer_id=?)",
      },
      { id: 3, parent: 0, detail: "USE TEMP B-TREE FOR ORDER BY" },
    ]);
  });

  it("nests children by tree indentation", () => {
    const rows = parseSqliteEqpText(
      [
        "QUERY PLAN",
        "|--MATERIALIZE recent_orders",
        "|  `--SCAN orders",
        "`--SCAN recent_orders",
      ].join("\n"),
    );

    expect(rows).toEqual([
      { id: 1, parent: 0, detail: "MATERIALIZE recent_orders" },
      { id: 2, parent: 1, detail: "SCAN orders" },
      { id: 3, parent: 0, detail: "SCAN recent_orders" },
    ]);
  });

  it("parses four-column id|parent|notused|detail rows", () => {
    const rows = parseSqliteEqpText(
      ["3|0|0|SCAN customers", "8|3|0|SEARCH orders USING INDEX idx (id=?)"].join(
        "\n",
      ),
    );

    expect(rows).toEqual([
      { id: 3, parent: 0, detail: "SCAN customers" },
      { id: 8, parent: 3, detail: "SEARCH orders USING INDEX idx (id=?)" },
    ]);
  });

  it("parses three-column id|parent|detail rows", () => {
    expect(parseSqliteEqpText("2|0|SCAN t1")).toEqual([
      { id: 2, parent: 0, detail: "SCAN t1" },
    ]);
  });

  it("rejects output that matches neither format", () => {
    expect(() => parseSqliteEqpText("Seq Scan on foo")).toThrow(
      /Unrecognised SQLite/,
    );
  });

  it("rejects empty input", () => {
    expect(() => parseSqliteEqpText("QUERY PLAN\n")).toThrow(/empty/);
  });
});
