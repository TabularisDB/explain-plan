import { useState, type FormEvent } from "react";
import { AlertCircle, Play } from "lucide-react";
import type { ExplainPlan } from "@tabularis/explain";
import { ENGINE_OPTIONS, parsePlan, type EngineChoice } from "../lib/parse";
import { SAMPLES } from "../samples";

interface PlanInputProps {
  onPlan: (plan: ExplainPlan) => void;
}

export function PlanInput({ onPlan }: PlanInputProps) {
  const [engine, setEngine] = useState<EngineChoice>("auto");
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    try {
      onPlan(parsePlan(raw, engine));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">
          Visualize your EXPLAIN plan
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-secondary">
          Paste the EXPLAIN output of a PostgreSQL, MySQL/MariaDB or SQLite
          query and explore it as an interactive graph, diagram, table and
          statistics. Everything runs in your browser — no query is executed
          and nothing is uploaded.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-secondary">
            Database engine
            <select
              value={engine}
              onChange={(event) => setEngine(event.target.value as EngineChoice)}
              className="rounded-lg border border-default bg-input px-3 py-1.5 text-sm text-primary focus:border-focus focus:outline-none"
            >
              {ENGINE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-2 text-xs text-muted">
            Try a sample:
            {SAMPLES.map((sample) => (
              <button
                key={sample.engine}
                type="button"
                onClick={() => {
                  setRaw(sample.text);
                  setEngine(sample.engine);
                  setError(null);
                }}
                className="rounded border border-default px-2 py-1 text-xs text-secondary transition-colors hover:border-strong hover:text-primary"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          spellCheck={false}
          placeholder={
            "Paste your EXPLAIN output here…\n\n" +
            "PostgreSQL:  EXPLAIN (ANALYZE, BUFFERS) SELECT …   or   EXPLAIN (FORMAT JSON) SELECT …\n" +
            "MySQL:       EXPLAIN FORMAT=JSON SELECT …   or   EXPLAIN ANALYZE SELECT …\n" +
            "SQLite:      EXPLAIN QUERY PLAN SELECT …"
          }
          className="h-72 w-full resize-y rounded-lg border border-default bg-input p-4 font-mono-theme text-xs text-primary placeholder:text-muted focus:border-focus focus:outline-none"
        />

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Play size={16} />
          Visualize plan
        </button>
      </form>
    </div>
  );
}
