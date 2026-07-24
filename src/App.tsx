import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { ExplainPlan } from "@tabularis/explain";
import { PlanInput } from "./components/PlanInput";
import { PlanView } from "./components/PlanView";
import { Footer } from "./components/Footer";
import { CookieConsent } from "./components/CookieConsent";
import {
  TabularisPromoModal,
  isPromoDismissed,
} from "./components/TabularisPromoModal";
import { TABULARIS } from "./lib/links";

export default function App() {
  const [plan, setPlan] = useState<ExplainPlan | null>(null);
  const [showPromo, setShowPromo] = useState(false);

  const handlePlan = (parsed: ExplainPlan) => {
    setPlan(parsed);
    if (!isPromoDismissed()) setShowPromo(true);
  };

  return (
    <div className="flex min-h-full flex-col bg-base">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-default bg-elevated/50 px-6">
        <a href="/" className="flex items-center gap-2">
          <img src="/tabularis-logo.svg" alt="Tabularis" className="h-6 w-6" />
          <span className="text-sm font-bold text-primary">Explain Plan</span>
        </a>
        <div className="flex items-center gap-3">
          {plan && (
            <button
              type="button"
              onClick={() => setPlan(null)}
              className="flex items-center gap-1.5 rounded-lg border border-default px-3 py-1.5 text-xs text-secondary transition-colors hover:border-strong hover:text-primary"
            >
              <RotateCcw size={12} />
              New plan
            </button>
          )}
          <a
            href={TABULARIS.site}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted hover:text-primary"
          >
            by Tabularis
          </a>
        </div>
      </header>

      <main className="flex-1">
        {plan ? (
          // The graph needs a definite height: fill the viewport below the
          // header, with the footer flowing after it instead of staying fixed.
          <div className="h-[calc(100dvh-3.5rem)] min-h-[420px]">
            <PlanView plan={plan} />
          </div>
        ) : (
          <PlanInput onPlan={handlePlan} />
        )}
      </main>

      <Footer />

      {showPromo && <TabularisPromoModal onClose={() => setShowPromo(false)} />}

      <CookieConsent />
    </div>
  );
}
