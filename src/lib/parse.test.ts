import { getExplainParser } from "@tabularis/explain";
import { describe, expect, it } from "vitest";
import { parsePlan, prettifyJson, prettifyXml } from "./parse";
import { SAMPLES } from "../samples";
import SQLSERVER_TRIVIAL_SCAN from "../test/fixtures/sqlserver-trivial-scan.xml?raw";

const sample = (engine: string) =>
  SAMPLES.find((candidate) => candidate.engine === engine)!.text;

describe("SQL Server parser registration", () => {
  it("registers SHOWPLAN XML before application parsing starts", () => {
    const parser = getExplainParser("sqlserver-showplan-xml");
    expect(parser).toMatchObject({
      engine: "sqlserver",
      label: "SQL Server SHOWPLAN XML",
    });
    expect(parser?.parse).toBeTypeOf("function");
    expect(parser?.sniff?.(sample("sqlserver"))).toBe(true);
  });
});

describe("parsePlan", () => {
  it("parses the PostgreSQL sample with its engine hint", () => {
    const plan = parsePlan(sample("postgres"), "postgres");
    expect(plan.root.node_type).toBe("Hash Join");
    expect(plan.has_analyze_data).toBe(true);
    expect(plan.planning_time_ms).toBeCloseTo(0.485);
    expect(plan.execution_time_ms).toBeCloseTo(7.481);
    expect(plan.root.children.length).toBeGreaterThan(0);
  });

  it("parses the MySQL sample with its engine hint", () => {
    const plan = parsePlan(sample("mysql"), "mysql");
    expect(plan.driver).toBe("mysql");
    expect(plan.root.children.length).toBeGreaterThan(0);
    const flat = JSON.stringify(plan.root);
    expect(flat).toContain("customers");
    expect(flat).toContain("orders");
  });

  it("parses the SQLite sample with its engine hint", () => {
    const plan = parsePlan(sample("sqlite"), "sqlite");
    expect(plan.driver).toBe("sqlite");
    const details = plan.root.children.map((child) => child.node_type);
    expect(details).toContain("Scan");
    expect(details).toContain("Search");
  });

  it("parses the SQL Server STATISTICS XML sample with its engine hint", () => {
    const plan = parsePlan(sample("sqlserver"), "sqlserver");
    expect(plan.driver).toBe("sqlserver");
    expect(plan.root.node_type).toBe("Table Scan");
    expect(plan.root.relation).toBe("ss034_small");
    expect(plan.root.actual_rows).toBe(2);
    expect(plan.root.actual_time_ms).toBe(0);
    expect(plan.execution_time_ms).toBe(0);
    expect(plan.has_analyze_data).toBe(true);
  });

  it("keeps estimated-only SQL Server plans free of invented timings", () => {
    const plan = parsePlan(SQLSERVER_TRIVIAL_SCAN, "sqlserver");
    expect(plan.root.node_type).toBe("Table Scan");
    expect(plan.root.actual_rows).toBeNull();
    expect(plan.root.actual_time_ms).toBeNull();
    expect(plan.execution_time_ms).toBeNull();
    expect(plan.has_analyze_data).toBe(false);
  });

  it("auto-detects each sample's engine", () => {
    expect(parsePlan(sample("postgres"), "auto").root.node_type).toBe(
      "Hash Join",
    );
    expect(parsePlan(sample("mysql"), "auto").driver).toBe("mysql");
    expect(parsePlan(sample("sqlite"), "auto").driver).toBe("sqlite");
    expect(parsePlan(sample("sqlserver"), "auto").driver).toBe("sqlserver");
  });

  it("parses Postgres EXPLAIN (FORMAT JSON) output", () => {
    const json = JSON.stringify([
      {
        Plan: {
          "Node Type": "Seq Scan",
          "Relation Name": "users",
          "Startup Cost": 0,
          "Total Cost": 155.0,
          "Plan Rows": 10000,
          "Plan Width": 4,
        },
        "Planning Time": 0.1,
      },
    ]);
    const plan = parsePlan(json, "auto");
    expect(plan.root.node_type).toBe("Seq Scan");
    expect(plan.root.relation).toBe("users");
  });

  it("rejects empty input", () => {
    expect(() => parsePlan("   ", "auto")).toThrow(/Paste an EXPLAIN/);
  });

  it("explains what to do when nothing matches", () => {
    expect(() => parsePlan("not a plan at all", "auto")).toThrow(
      /Could not detect/,
    );
  });
});

describe("prettifyJson", () => {
  it("pretty-prints a compact JSON object", () => {
    expect(prettifyJson('{"query_block":{"select_id":1}}')).toBe(
      '{\n  "query_block": {\n    "select_id": 1\n  }\n}',
    );
  });

  it("pretty-prints a compact JSON array", () => {
    expect(prettifyJson('[{"Plan":{"Node Type":"Seq Scan"}}]')).toBe(
      '[\n  {\n    "Plan": {\n      "Node Type": "Seq Scan"\n    }\n  }\n]',
    );
  });

  it("leaves plain-text plans alone", () => {
    expect(prettifyJson("Seq Scan on users  (cost=0.00..155.00)")).toBeNull();
    expect(prettifyJson(sample("sqlite"))).toBeNull();
  });

  it("leaves invalid JSON alone", () => {
    expect(prettifyJson('{"query_block": broken')).toBeNull();
  });

  it("leaves already-formatted JSON alone", () => {
    const formatted = '{\n  "a": 1\n}';
    expect(prettifyJson(formatted)).toBeNull();
  });
});

describe("prettifyXml", () => {
  it("indents nested elements and keeps text-only elements inline", () => {
    expect(
      prettifyXml(
        '<?xml version="1.0"?><A x="1"><B/><C>text</C><D><E y="2"/></D></A>',
      ),
    ).toBe(
      [
        '<?xml version="1.0"?>',
        '<A x="1">',
        "  <B/>",
        "  <C>text</C>",
        "  <D>",
        '    <E y="2"/>',
        "  </D>",
        "</A>",
      ].join("\n"),
    );
  });

  it("formats a single-line SHOWPLAN and keeps it parseable", () => {
    const formatted = prettifyXml(SQLSERVER_TRIVIAL_SCAN);
    expect(formatted).not.toBeNull();
    expect(formatted!.split("\n").length).toBeGreaterThan(10);
    expect(formatted!.replace(/\s/g, "")).toBe(
      SQLSERVER_TRIVIAL_SCAN.replace(/\s/g, ""),
    );
    expect(parsePlan(formatted!, "sqlserver").root.node_type).toBe(
      parsePlan(SQLSERVER_TRIVIAL_SCAN, "sqlserver").root.node_type,
    );
  });

  it("leaves non-XML and unbalanced markup alone", () => {
    expect(prettifyXml("Seq Scan on users  (cost=0.00..155.00)")).toBeNull();
    expect(prettifyXml('{"query_block":{"select_id":1}}')).toBeNull();
    expect(prettifyXml("<A><B></A>")).toBeNull();
    expect(prettifyXml("<A><B>")).toBeNull();
  });

  it("leaves already-formatted XML alone", () => {
    expect(prettifyXml("<A>\n  <B/>\n</A>")).toBeNull();
  });
});
