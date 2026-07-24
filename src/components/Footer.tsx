import { TABULARIS } from "../lib/links";

export function Footer() {
  return (
    <footer className="shrink-0 border-t border-default bg-elevated/50 px-6 py-3">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>
          Powered by{" "}
          <a
            href={TABULARIS.npmPackage}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            @tabularis/explain
          </a>
          , the engine behind the{" "}
          <a
            href={TABULARIS.visualExplain}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            Visual EXPLAIN
          </a>{" "}
          feature of{" "}
          <a
            href={TABULARIS.site}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            Tabularis
          </a>
          .
        </span>
        <span className="flex items-center gap-3">
          <a
            href={TABULARIS.visualExplainWiki}
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary"
          >
            Visual EXPLAIN guide
          </a>
          <a
            href={TABULARIS.github}
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary"
          >
            GitHub
          </a>
          <a
            href={TABULARIS.download}
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary"
          >
            Download Tabularis
          </a>
        </span>
      </div>
    </footer>
  );
}
