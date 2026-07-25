import { useMemo, useState } from "react";
import type { ExplainPlan } from "@tabularis/explain";
import {
  computeExplainMetrics,
  findExplainNode,
  getPlanDiagnostics,
} from "@tabularis/explain";
import {
  ExplainDiagramView,
  ExplainGraph,
  ExplainNodeDetails,
  ExplainOverviewBar,
  ExplainStatsView,
  ExplainSummaryBar,
  ExplainTableView,
  type ExplainViewMode,
} from "@tabularis/explain/react";

import { AiUpsellView } from "./AiUpsellView";

interface PlanViewProps {
  plan: ExplainPlan;
}

/**
 * The Tabularis desktop `VisualExplainView` composition, minus the host-only
 * pieces: the raw tab renders in a plain <pre> instead of Monaco, and the AI
 * analysis tab (a desktop feature) is disabled.
 */
export function PlanView({ plan }: PlanViewProps) {
  const [viewMode, setViewMode] = useState<ExplainViewMode>("graph");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const metrics = useMemo(() => computeExplainMetrics(plan), [plan]);
  const diagnostics = useMemo(
    () => getPlanDiagnostics(plan, metrics),
    [plan, metrics],
  );
  const selectedNode = useMemo(
    () => findExplainNode(plan.root, selectedNodeId),
    [plan, selectedNodeId],
  );

  return (
    // `plan-view` scopes the mobile CSS overrides in index.css that restack
    // the prebuilt @tabularis/explain desktop layouts on small screens.
    <div className="plan-view flex h-full min-h-0 flex-col">
      <ExplainSummaryBar
        plan={plan}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        aiEnabled
      />
      <ExplainOverviewBar
        plan={plan}
        metrics={metrics}
        onSelectNode={setSelectedNodeId}
      />

      <div className="min-h-0 flex-1 overflow-hidden">
        {viewMode === "ai" ? (
          <AiUpsellView />
        ) : viewMode === "raw" && plan.raw_output ? (
          <pre className="custom-scrollbar h-full overflow-auto p-4 font-mono-theme text-xs leading-relaxed text-secondary">
            {plan.raw_output}
          </pre>
        ) : viewMode === "table" ? (
          <ExplainTableView
            plan={plan}
            metrics={metrics}
            diagnostics={diagnostics}
            selectedId={selectedNodeId}
            onSelect={setSelectedNodeId}
          />
        ) : viewMode === "diagram" ? (
          <ExplainDiagramView
            plan={plan}
            metrics={metrics}
            diagnostics={diagnostics}
            selectedId={selectedNodeId}
            onSelect={setSelectedNodeId}
          />
        ) : viewMode === "stats" ? (
          <ExplainStatsView plan={plan} metrics={metrics} />
        ) : (
          <div className="flex h-full flex-col md:flex-row">
            <div className="min-h-0 min-w-0 flex-1 border-default md:border-r">
              <ExplainGraph
                plan={plan}
                metrics={metrics}
                diagnostics={diagnostics}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            </div>
            {/* On phones the details panel only appears once a node is
                tapped, as a bottom sheet under the graph. */}
            <div
              className={`w-[320px] shrink-0 overflow-y-auto bg-base/50 ${
                selectedNode ? "" : "max-md:hidden"
              }`}
            >
              <ExplainNodeDetails
                node={selectedNode}
                hasAnalyzeData={plan.has_analyze_data}
                metrics={
                  selectedNode ? metrics.byId.get(selectedNode.id) ?? null : null
                }
                diagnostics={
                  selectedNode ? diagnostics.get(selectedNode.id) ?? [] : []
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
