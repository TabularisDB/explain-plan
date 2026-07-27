import { describe, expect, it } from "vitest";
import { parsePlan, prettifyJson } from "./parse";
import { SAMPLES } from "../samples";

const sample = (engine: string) =>
  SAMPLES.find((candidate) => candidate.engine === engine)!.text;

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

  it("auto-detects each sample's engine", () => {
    expect(parsePlan(sample("postgres"), "auto").root.node_type).toBe(
      "Hash Join",
    );
    expect(parsePlan(sample("mysql"), "auto").driver).toBe("mysql");
    expect(parsePlan(sample("sqlite"), "auto").driver).toBe("sqlite");
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
