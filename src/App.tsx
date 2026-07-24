import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { ExplainPlan } from "@tabularis/explain";
import { PlanInput } from "./components/PlanInput";
import { PlanView } from "./components/PlanView";
import { Footer } from "./components/Footer";
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
    <div className="flex h-full min-h-0 flex-col bg-base">
      <header className="flex shrink-0 items-center justify-between border-b border-default bg-elevated/50 px-6 py-3">
        <a href="/" className="flex items-center gap-2">
          <img src="/tabularis-logo.svg" alt="Tabularis" className="h-6 w-6" />
          <span className="text-sm font-bold text-primary">Explain Plan</span>
          <span className="rounded bg-surface-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary">
            Postgres · MySQL · SQLite
          </span>
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

      <main className="min-h-0 flex-1 overflow-y-auto">
        {plan ? <PlanView plan={plan} /> : <PlanInput onPlan={handlePlan} />}
      </main>

      <Footer />

      {showPromo && <TabularisPromoModal onClose={() => setShowPromo(false)} />}
    </div>
  );
}
