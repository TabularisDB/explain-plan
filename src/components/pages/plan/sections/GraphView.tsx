import {useTranslation} from 'react-i18next';
import clsx from 'clsx';
import {Network} from 'lucide-react';
import {findExplainNode, type ExplainDiagnostic, type ExplainMetrics, type ExplainPlan} from '@tabularis/explain';
import {Graph} from './Graph';
import {NodeDetails} from './NodeDetails';

interface GraphViewProps {
    plan: ExplainPlan;
    metrics: ExplainMetrics;
    diagnostics: Map<string, ExplainDiagnostic[]>;
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function GraphView({plan, metrics, diagnostics, selectedId, onSelect}: GraphViewProps) {
    const {t} = useTranslation();
    const selectedNode = findExplainNode(plan.root, selectedId);

    return (
        <section className="section">
            <div className="section-heading">
                <Network size={15} aria-hidden="true" />
                <h2 className="title">{t('editor.visualExplain.graphView')}</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 h-[500px]">
                <div className="h-[400px] lg:h-full flex-1 min-w-0 overflow-hidden border-[0.1rem] border-default rounded-sm">
                    <Graph
                        plan={plan}
                        metrics={metrics}
                        diagnostics={diagnostics}
                        selectedNodeId={selectedId}
                        onSelectNode={onSelect}
                    />
                </div>

                <aside
                    className={clsx(
                        'lg:w-[320px] shrink-0 max-h-[400px] lg:max-h-none lg:h-full overflow-y-auto border-[0.1rem] border-default rounded-sm',
                        !selectedNode && 'max-lg:hidden',
                    )}
                >
                    <NodeDetails
                        node={selectedNode}
                        hasAnalyzeData={plan.has_analyze_data}
                        metrics={selectedNode ? (metrics.byId.get(selectedNode.id) ?? null) : null}
                        diagnostics={selectedNode ? (diagnostics.get(selectedNode.id) ?? []) : []}
                    />
                </aside>
            </div>
        </section>
    );
}
