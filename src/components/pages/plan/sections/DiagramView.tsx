import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import clsx from 'clsx';
import {BarChart3} from 'lucide-react';
import {
    findExplainNode,
    flattenExplainNodes,
    formatCost,
    formatRows,
    formatTime,
    getAvailableMetricKinds,
    getDefaultMetricKind,
    getMetricMax,
    getMetricValue,
    type ExplainDiagnostic,
    type ExplainMetricKind,
    type ExplainMetrics,
    type ExplainNode,
    type ExplainPlan,
} from '@tabularis/explain';
import {DiagnosticChips} from './DiagnosticChips';
import {NodeDetails} from './NodeDetails';

interface DiagramViewProps {
    plan: ExplainPlan;
    metrics: ExplainMetrics;
    diagnostics: Map<string, ExplainDiagnostic[]>;
    selectedId: string | null;
    onSelect: (id: string) => void;
}

const METRIC_LABEL_KEYS: Record<ExplainMetricKind, string> = {
    time: 'editor.visualExplain.selfTime',
    rows: 'editor.visualExplain.actualRows',
    cost: 'editor.visualExplain.selfCost',
    buffers: 'editor.visualExplain.buffers',
};

function formatMetricValue(value: number, kind: ExplainMetricKind): string {
    if (kind === 'time') return formatTime(value);
    if (kind === 'cost') return formatCost(value);
    return formatRows(value);
}

function heatClass(ratio: number): string {
    if (ratio >= 0.66) return 'bg-accent-error';
    if (ratio >= 0.33) return 'bg-accent-warning';
    return 'bg-accent-primary';
}

export function DiagramView({plan, metrics, diagnostics, selectedId, onSelect}: DiagramViewProps) {
    const {t} = useTranslation();
    const availableKinds = useMemo(() => getAvailableMetricKinds(metrics), [metrics]);
    const defaultKind = useMemo(() => getDefaultMetricKind(metrics), [metrics]);
    const [requestedKind, setRequestedKind] = useState<ExplainMetricKind | null>(null);

    const metricKind = requestedKind != null && availableKinds.includes(requestedKind) ? requestedKind : defaultKind;

    const rows = useMemo(() => {
        const nodesById = new Map<string, ExplainNode>(flattenExplainNodes(plan.root).map((node) => [node.id, node]));
        return metrics.order.flatMap((nodeMetrics) => {
            const node = nodesById.get(nodeMetrics.nodeId);
            return node ? [{node, metrics: nodeMetrics}] : [];
        });
    }, [plan, metrics]);

    const max = metricKind != null ? getMetricMax(metrics, metricKind) : 0;
    const selectedNode = findExplainNode(plan.root, selectedId);

    return (
        <section className="block min-h-0 flex-1">
            <div className="block-heading">
                <BarChart3 size={15} aria-hidden="true" />
                <h2 className="title">{t('editor.visualExplain.diagramView')}</h2>

                {availableKinds.length > 0 && (
                    <div
                        className="ml-auto flex gap-0.5 p-0.5 bg-elevated border-[0.1rem] border-default rounded-full"
                        role="radiogroup"
                        aria-label={t('editor.visualExplain.metric')}
                    >
                        {availableKinds.map((kind) => (
                            <button
                                key={kind}
                                type="button"
                                role="radio"
                                aria-checked={metricKind === kind}
                                onClick={() => setRequestedKind(kind)}
                                className={clsx(
                                    'px-2.5 py-0.5 rounded-full text-[0.7rem] font-medium cursor-pointer transition-colors',
                                    'focus-visible:outline-2 focus-visible:outline-accent-primary',
                                    metricKind === kind
                                        ? 'bg-accent-primary/20 text-accent-primary'
                                        : 'text-secondary hover:text-primary',
                                )}
                            >
                                {t(METRIC_LABEL_KEYS[kind])}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
                <div className="flex-1 min-w-0 min-h-0 overflow-auto border-[0.1rem] border-default rounded-theme-sm">
                    {rows.length === 0 || metricKind == null ? (
                        <p className="m-0 p-4 text-xs text-secondary">{t('editor.visualExplain.noMetricData')}</p>
                    ) : (
                        <table className="w-full text-xs">
                            <tbody>
                                {rows.map(({node, metrics: nodeMetrics}) => {
                                    const value = getMetricValue(nodeMetrics, metricKind);
                                    const ratio = value != null && max > 0 ? value / max : 0;
                                    const width = Math.min(100, Math.max(ratio * 100, value ? 1 : 0));
                                    const nodeDiagnostics = diagnostics.get(node.id) ?? [];
                                    const selected = selectedId === node.id;

                                    return (
                                        <tr
                                            key={node.id}
                                            aria-selected={selected}
                                            onClick={() => onSelect(node.id)}
                                            className={clsx(
                                                'border-b border-default last:border-0 cursor-pointer transition-colors',
                                                selected ? 'bg-accent-primary/10' : 'hover:bg-surface-hover',
                                            )}
                                        >
                                            <td className="w-10 px-3 py-2 align-top font-mono-theme text-[0.65rem] text-muted">
                                                #{nodeMetrics.index}
                                            </td>
                                            <td className="px-1 py-2 align-top">
                                                <div
                                                    className="flex flex-col gap-0.5 min-w-0"
                                                    style={{paddingLeft: nodeMetrics.depth * 12}}
                                                >
                                                    <span
                                                        className={clsx(
                                                            'truncate font-medium',
                                                            selected ? 'text-accent-primary' : 'text-primary',
                                                        )}
                                                    >
                                                        {node.node_type}
                                                    </span>
                                                    {node.relation && (
                                                        <span className="truncate font-mono-theme text-[0.7rem] text-muted">
                                                            {node.relation}
                                                        </span>
                                                    )}
                                                    <DiagnosticChips
                                                        diagnostics={nodeDiagnostics}
                                                        iconsOnly
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </td>
                                            <td className="w-1/2 px-3 py-2 align-middle">
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-tertiary">
                                                    <div
                                                        className={clsx(
                                                            'h-full rounded-full transition-all',
                                                            heatClass(ratio),
                                                        )}
                                                        style={{width: `${width}%`}}
                                                    />
                                                </div>
                                            </td>
                                            <td className="w-24 px-3 py-2 align-middle text-right whitespace-nowrap font-mono-theme text-secondary">
                                                {value != null ? formatMetricValue(value, metricKind) : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <aside className="lg:w-[320px] shrink-0 max-h-[45vh] lg:max-h-none overflow-y-auto border-[0.1rem] border-default rounded-theme-sm">
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
