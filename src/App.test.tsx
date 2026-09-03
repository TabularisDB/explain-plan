import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "./i18n";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("renders the input form with engine choices and footer links", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /visualize your explain plan/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "PostgreSQL" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "MySQL / MariaDB" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "SQLite" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "SQL Server" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Tabularis" }),
    ).toHaveAttribute("href", "https://tabularis.dev");
    expect(
      screen.getByRole("link", { name: "Visual EXPLAIN" }),
    ).toHaveAttribute("href", "https://tabularis.dev/solutions/visual-explain");
  });

  it("visualizes a sample plan and shows the promo modal", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "SQLite sample" }));
    await user.click(screen.getByRole("button", { name: /visualize plan/i }));

    // Promo modal appears on first submit…
    const dialog = screen.getByRole("dialog", { name: /tabularis/i });
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByRole("link", { name: /download tabularis/i }),
    ).toHaveAttribute("href", "https://tabularis.dev/download");
    await user.click(
      screen.getByRole("button", { name: /continue in browser/i }),
    );

    // …and the plan is rendered behind it.
    expect(screen.getByText("Graph")).toBeInTheDocument();
    expect(screen.getByText("Raw Output")).toBeInTheDocument();
  });

  it("renders every plan view for a SQL Server runtime sample", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(
      screen.getByRole("button", { name: "SQL Server sample" }),
    );
    expect(screen.getByRole("combobox")).toHaveValue("sqlserver");
    await user.click(screen.getByRole("button", { name: /visualize plan/i }));
    await user.click(
      screen.getByRole("button", { name: /continue in browser/i }),
    );

    expect(container.querySelector(".react-flow")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Diagram" }));
    expect(screen.getByText("Metric")).toBeInTheDocument();
    expect(screen.getByText("Nested Loops")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Table" }));
    expect(screen.getByRole("table")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Stats" }));
    expect(screen.getByText("Time by Operation")).toBeInTheDocument();
  });

  it("shows a readable error for unparseable input", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole("textbox"), "garbage");
    await user.click(screen.getByRole("button", { name: /visualize plan/i }));

    expect(screen.getByText(/could not detect/i)).toBeInTheDocument();
  });

  it("does not show the promo again once opted out", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "SQLite sample" }));
    await user.click(screen.getByRole("button", { name: /visualize plan/i }));
    await user.click(screen.getByRole("checkbox", { name: /don't show/i }));
    await user.click(
      screen.getByRole("button", { name: /continue in browser/i }),
    );

    await user.click(screen.getByRole("button", { name: /new plan/i }));
    await user.click(screen.getByRole("button", { name: "SQLite sample" }));
    await user.click(screen.getByRole("button", { name: /visualize plan/i }));

    expect(
      screen.queryByRole("dialog", { name: /tabularis/i }),
    ).not.toBeInTheDocument();
  });
});
