import { useState, type FormEvent } from "react";
import { AlertCircle, GitBranch, Play, ShieldCheck, Zap } from "lucide-react";
import type { ExplainPlan } from "@tabularis/explain";
import { ENGINE_OPTIONS, parsePlan, type EngineChoice } from "../lib/parse";
import { TABULARIS } from "../lib/links";
import { ShareLinks } from "./ShareLinks";
import { SAMPLES } from "../samples";

const SWIFT_COUNT = 14;

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    kicker: "Private by design",
    title: "Nothing leaves your browser",
    text: "Plans are parsed locally. No query is executed and nothing is uploaded to any server.",
  },
  {
    icon: GitBranch,
    kicker: "Four views",
    title: "Graph, diagram, table & stats",
    text: "Explore the plan as an interactive graph, a compact diagram, a sortable table and summary statistics.",
  },
  {
    icon: Zap,
    kicker: "Multi-engine",
    title: "Postgres, MySQL & SQLite",
    text: "Text and JSON EXPLAIN formats are auto-detected, including ANALYZE output with timings and buffers.",
  },
] as const;

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
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <section className="hero-shell">
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-visual-grid">
            <div className="hero-aurora hero-aurora--one" />
            <div className="hero-aurora hero-aurora--two" />
            <div className="hero-aurora hero-aurora--three" />
            {Array.from({ length: SWIFT_COUNT }).map((_, index) => (
              <span
                key={index}
                className={`hero-swift hero-swift--${index + 1}`}
              />
            ))}
            <div className="hero-scanline" />
          </div>
        </div>

        <div className="relative z-10 px-6 py-10 sm:px-10">
          <div className="mb-8 text-center">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-md border border-default bg-surface-primary/60 px-2.5 py-1 text-xs text-secondary">
                PostgreSQL · MySQL · SQLite
              </span>
              <span className="rounded-md border border-success-border bg-success-bg px-2.5 py-1 text-xs text-success-text">
                100% in-browser
              </span>
              <span className="rounded-md border border-default bg-surface-primary/60 px-2.5 py-1 text-xs text-secondary">
                Free & no sign-up
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Visualize your{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                EXPLAIN plan
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-secondary">
              Paste the EXPLAIN output of a PostgreSQL, MySQL/MariaDB or SQLite
              query and explore it as an interactive graph, diagram, table and
              statistics. Everything runs in your browser — no query is
              executed and nothing is uploaded.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-secondary">
                Database engine
                <select
                  value={engine}
                  onChange={(event) =>
                    setEngine(event.target.value as EngineChoice)
                  }
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
                    className="rounded border border-default bg-surface-primary/40 px-2 py-1 text-xs text-secondary transition-colors hover:border-strong hover:text-primary"
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
              className="h-72 w-full resize-y rounded-lg border border-default bg-input/80 p-4 font-mono-theme text-xs text-primary shadow-inner backdrop-blur-sm placeholder:text-muted focus:border-focus focus:outline-none"
            />

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:opacity-90 hover:shadow-blue-500/30"
              >
                <Play size={16} />
                Visualize plan
              </button>
              <a
                href={TABULARIS.site}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-white/10 transition-opacity hover:opacity-90"
              >
                <img
                  src="/tabularis-logo.svg"
                  alt=""
                  className="h-4 w-4 rounded"
                />
                Discover Tabularis
              </a>
            </div>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-xs text-muted">Share this tool</span>
            <ShareLinks />
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {HIGHLIGHTS.map(({ icon: Icon, kicker, title, text }) => (
          <div
            key={kicker}
            className="flex flex-col rounded-xl border border-default bg-elevated/60 p-4 transition-colors hover:border-strong"
          >
            <span className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-accent">
              <Icon size={13} />
              {kicker}
            </span>
            <strong className="mb-1 text-sm text-primary">{title}</strong>
            <span className="text-xs leading-relaxed text-muted">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
