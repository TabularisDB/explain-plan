import { BookOpen, Download, Github } from "lucide-react";
import { TABULARIS } from "../lib/links";
import { ShareLinks } from "./ShareLinks";

const FOOTER_LINKS = [
  {
    href: TABULARIS.visualExplainWiki,
    label: "Visual EXPLAIN guide",
    icon: BookOpen,
  },
  { href: TABULARIS.github, label: "GitHub", icon: Github },
  { href: TABULARIS.download, label: "Download Tabularis", icon: Download },
] as const;

export function Footer() {
  return (
    <footer className="shrink-0 border-t border-default bg-elevated/50 px-6 py-5">
      <div>
        {/* Top: brand + tagline on the left, Tabularis links on the right. */}
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="flex items-center gap-3">
            <img
              src="/tabularis-logo.svg"
              alt=""
              className="h-8 w-8 rounded-lg"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-primary">
                Explain Plan
              </span>
              <span className="text-xs text-muted">
                Free online EXPLAIN plan visualizer — nothing leaves your
                browser.
              </span>
            </div>
          </div>

          <nav
            aria-label="Tabularis links"
            className="flex flex-wrap items-center gap-2"
          >
            {FOOTER_LINKS.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-default px-3 py-1.5 text-xs text-secondary transition-colors hover:border-strong hover:bg-surface-primary/40 hover:text-primary"
              >
                <Icon size={12} />
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Middle: share row, same pattern as the website's "featured on". */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-[11px] uppercase tracking-wider text-muted">
            Share this tool
          </span>
          <nav aria-label="Share links" className="flex items-center gap-2">
            <ShareLinks />
          </nav>
        </div>

        {/* Bottom: powered-by credits + copyright. */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-subtle pt-3 text-xs text-muted">
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
          <span>
            © {new Date().getFullYear()} Tabularis Project — Crafted by{" "}
            <a
              href="https://github.com/debba"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary"
            >
              Debba
            </a>
            .
          </span>
        </div>
      </div>
    </footer>
  );
}
