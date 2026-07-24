import { Download, Sparkles, Zap, Database } from "lucide-react";
import { TABULARIS } from "../lib/links";
import { VideoPreview } from "./VideoPreview";

/**
 * Rendered in place of the AI analysis tab: the AI plan review is a desktop
 * feature, so pitch the download with the product overview video.
 */
export function AiUpsellView() {
  return (
    <div className="custom-scrollbar h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-lg px-6 py-10">
        <div className="mb-4 flex items-center gap-2.5">
          <img src="/tabularis-logo.svg" alt="" className="h-8 w-8 shrink-0" />
          <h2 className="text-lg font-semibold text-primary">
            AI plan analysis is a Tabularis feature
          </h2>
        </div>

        <p className="mb-4 text-sm text-secondary">
          Download the free Tabularis desktop app to unlock this and more —
          everything this site does, plus what a paste-in tool can't:
        </p>

        <ul className="mb-4 space-y-2 text-sm text-secondary">
          <li className="flex items-start gap-2">
            <Sparkles
              size={14}
              className="mt-0.5 shrink-0 text-accent-secondary"
            />
            AI plan analysis with concrete optimization suggestions
          </li>
          <li className="flex items-start gap-2">
            <Zap size={14} className="mt-0.5 shrink-0 text-accent-warning" />
            One-click visual EXPLAIN and ANALYZE on the query under your cursor
          </li>
          <li className="flex items-start gap-2">
            <Database size={14} className="mt-0.5 shrink-0 text-accent-info" />
            PostgreSQL, MySQL, SQLite and 15+ more databases, with a built-in
            MCP server
          </li>
        </ul>

        <VideoPreview
          src={TABULARIS.videoOverview}
          poster={TABULARIS.videoOverviewPoster}
          label="Watch the Tabularis overview"
        />

        <div className="mt-4 flex items-center justify-center gap-3">
          <a
            href={TABULARIS.download}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Download size={14} />
            Download Tabularis
          </a>
          <a
            href={TABULARIS.site}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-secondary hover:text-primary"
          >
            Learn more →
          </a>
        </div>
      </div>
    </div>
  );
}
