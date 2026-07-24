import { useEffect, useState } from "react";
import { Download, Sparkles, X, Zap, Database } from "lucide-react";
import { TABULARIS } from "../lib/links";
import { VideoPreview } from "./VideoPreview";

const DISMISS_KEY = "tabularis-promo-dismissed";

export function isPromoDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

interface TabularisPromoModalProps {
  onClose: () => void;
}

/**
 * Shown once per submit (until the visitor opts out): this site only reads
 * pasted plans, while the Tabularis desktop app runs EXPLAIN directly from
 * the SQL editor with AI analysis on top.
 */
export function TabularisPromoModal({ onClose }: TabularisPromoModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const close = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(DISMISS_KEY, "1");
      } catch {
        // Private mode — the modal will simply show again next time.
      }
    }
    onClose();
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Get more from your query plans with Tabularis"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-default bg-elevated shadow-2xl"
      >
        <div className="flex items-start justify-between px-5 pt-5">
          <div className="flex items-center gap-2.5">
            <img
              src="/tabularis-logo.svg"
              alt=""
              className="h-8 w-8 shrink-0"
            />
            <h2 className="text-lg font-semibold text-primary">
              Want to skip the copy-paste?
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded p-1 text-muted transition-colors hover:bg-surface-hover hover:text-primary"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <p className="text-sm text-secondary">
            Tabularis is a free desktop SQL workspace that runs{" "}
            <span className="font-medium text-primary">EXPLAIN directly from the editor</span>{" "}
            — no copying plans around — and adds what a paste-in tool can't:
          </p>

          <ul className="space-y-2 text-sm text-secondary">
            <li className="flex items-start gap-2">
              <Zap size={14} className="mt-0.5 shrink-0 text-accent-warning" />
              One-click visual EXPLAIN and ANALYZE on the query under your cursor
            </li>
            <li className="flex items-start gap-2">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-accent-secondary" />
              AI plan analysis with concrete optimization suggestions
            </li>
            <li className="flex items-start gap-2">
              <Database size={14} className="mt-0.5 shrink-0 text-accent-info" />
              PostgreSQL, MySQL, SQLite and 15+ more databases, with a built-in MCP server
            </li>
          </ul>

          <VideoPreview
            src={TABULARIS.video}
            poster={TABULARIS.videoPoster}
            label="Watch the Tabularis Visual EXPLAIN demo"
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-default bg-base/50 px-5 py-4">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(event) => setDontShowAgain(event.target.checked)}
              className="accent-[var(--accent-primary)]"
            />
            Don't show this again
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={close}
              className="rounded-lg px-3 py-1.5 text-sm text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
            >
              Continue in browser
            </button>
            <a
              href={TABULARIS.download}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-accent-primary px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Download size={14} />
              Download Tabularis
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
