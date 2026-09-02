import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import "../i18n";
import SQLSERVER_TRIVIAL_SCAN from "../test/fixtures/sqlserver-trivial-scan.xml?raw";
import { parsePlan } from "../lib/parse";
import { PlanView } from "./PlanView";

describe("PlanView SQL Server plans", () => {
  afterEach(cleanup);

  it("renders an estimated-only plan without timing empty states", async () => {
    const user = userEvent.setup();
    const plan = parsePlan(SQLSERVER_TRIVIAL_SCAN, "sqlserver");
    render(<PlanView plan={plan} />);

    expect(screen.queryByText("Execution:")).not.toBeInTheDocument();
    expect(screen.queryByText("Planning:")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Diagram" }));
    expect(screen.getByText("Metric")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Self Cost" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("No metric data available")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Stats" }));
    expect(screen.getByText("Time by Operation")).toBeInTheDocument();
    expect(screen.getAllByText("Table Scan")).not.toHaveLength(0);
  });
});
