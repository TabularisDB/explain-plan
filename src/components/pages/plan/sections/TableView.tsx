import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import clsx from 'clsx';
import {ChevronRight, TableProperties} from 'lucide-react';
import {
    findExplainNode,
    formatRatio,
    formatRows,
    formatTime,
    getRowEstimateRatio,
    type ExplainDiagnostic,
    type ExplainMetrics,
    type ExplainNode,
    type ExplainPlan,
} from '@tabularis/explain';
import {DiagnosticChips} from './DiagnosticChips';
import {NodeDetails, formatCostRange} from './NodeDetails';

interface TableViewProps {
    plan: ExplainPlan;
    metrics: ExplainMetrics;
    diagnostics: Map<string, ExplainDiagnostic[]>;
    selectedId: string | null;
    onSelect: (id: string) => void;
}

interface Column {
    key: string;
    label: string;
    align?: 'left' | 'right';
}

const TH =
    'px-3 py-2 whitespace-nowrap text-[0.65rem] font-medium uppercase tracking-[0.04em] text-secondary shadow-[inset_0_-1px_0_var(--color-border)]';
const TD = 'px-3 py-2 whitespace-nowrap';
const NUMBER = 'px-3 py-2 whitespace-nowrap text-right font-mono text-secondary';

function collectIds(root: ExplainNode): Set<string> {
    const ids = new Set<string>();
    const walk = (node: ExplainNode) => {
        ids.add(node.id);
        node.children.forEach(walk);
    };
    walk(root);
    return ids;
}

export function TableView({plan, metrics, diagnostics, selectedId, onSelect}: TableViewProps) {
    const {t} = useTranslation();
    const [expandedIds, setExpandedIds] = useState(() => collectIds(plan.root));

    useEffect(() => {
        setExpandedIds(collectIds(plan.root));
    }, [plan]);

    const toggle = useCallback((id: string) => {
        setExpandedIds((previous) => {
            const next = new Set(previous);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const selectedNode = findExplainNode(plan.root, selectedId);

    const columns = [
        {key: 'index', label: '#'},
        {key: 'type', label: t('editor.visualExplain.nodeType')},
        {key: 'relation', label: t('editor.visualExplain.relation')},
        {key: 'cost', label: t('editor.visualExplain.cost'), align: 'right'},
        {key: 'rows', label: t('editor.visualExplain.estRows'), align: 'right'},
        plan.has_analyze_data && {key: 'actual', label: t('editor.visualExplain.actualRows'), align: 'right'},
        {key: 'time', label: t('editor.visualExplain.selfTime'), align: 'right'},
        {key: 'gap', label: t('editor.visualExplain.largestEstimateGap'), align: 'right'},
        {key: 'filter', label: t('editor.visualExplain.filter')},
    ].filter((column): column is Column => Boolean(column));

    return (
        <section className="section min-h-0 flex-1">
            <div className="section-heading">
                <TableProperties size={15} aria-hidden="true" />
                <h2 className="title">{t('editor.visualExplain.tableView')}</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
                <div className="flex-1 min-w-0 min-h-0 overflow-auto border-[0.1rem] border-default rounded-sm">
                    <table className="w-full text-xs">
                        <thead className="sticky top-0 z-10 bg-elevated">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className={clsx(TH, column.align === 'right' ? 'text-right' : 'text-left')}
                                    >
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <TreeRows
                                node={plan.root}
                                depth={0}
                                expandedIds={expandedIds}
                                selectedId={selectedId}
                                onToggle={toggle}
                                onSelect={onSelect}
                                hasAnalyzeData={plan.has_analyze_data}
                                metrics={metrics}
                                diagnostics={diagnostics}
                            />
                        </tbody>
                    </table>
                </div>

                <aside className="lg:w-[320px] shrink-0 max-h-[45vh] lg:max-h-none overflow-y-auto border-[0.1rem] border-default rounded-sm">
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

interface TreeRowsProps {
    node: ExplainNode;
    depth: number;
    expandedIds: Set<string>;
    selectedId: string | null;
    onToggle: (id: string) => void;
    onSelect: (id: string) => void;
    hasAnalyzeData: boolean;
    metrics: ExplainMetrics;
    diagnostics: Map<string, ExplainDiagnostic[]>;
}

function TreeRows(props: TreeRowsProps) {
    const {node, depth, expandedIds, selectedId, onToggle, onSelect, hasAnalyzeData, metrics, diagnostics} = props;
    const {t} = useTranslation();

    const expanded = expandedIds.has(node.id);
    const selected = selectedId === node.id;
    const nodeMetrics = metrics.byId.get(node.id);
    const nodeDiagnostics = diagnostics.get(node.id) ?? [];

    const ratio = getRowEstimateRatio(node);
    const ratioWarning = ratio != null && (ratio >= 4 || ratio <= 0.25);

    return (
        <>
            <tr
                className={clsx(
                    'border-b border-default cursor-pointer transition-colors',
                    selected ? 'bg-accent-primary/10' : 'hover:bg-surface-hover',
                )}
                aria-selected={selected}
                onClick={() => onSelect(node.id)}
            >
                <td className={clsx(TD, 'font-mono text-[0.65rem] text-muted')}>
                    {nodeMetrics ? `#${nodeMetrics.index}` : ''}
                </td>
                <td className={TD}>
                    <div className="flex items-center gap-1" style={{paddingLeft: depth * 20}}>
                        {node.children.length > 0 ? (
                            <button
                                type="button"
                                className="p-0.5 text-muted hover:text-primary cursor-pointer"
                                aria-expanded={expanded}
                                aria-label={expanded ? t('common.collapse') : t('common.expand')}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onToggle(node.id);
                                }}
                            >
                                <ChevronRight
                                    size={12}
                                    className={clsx('transition-transform', expanded && 'rotate-90')}
                                />
                            </button>
                        ) : (
                            <span className="w-4" />
                        )}
                        <span className={clsx('font-medium', selected ? 'text-accent-primary' : 'text-primary')}>
                            {node.node_type}
                        </span>
                        {nodeDiagnostics.length > 0 && <DiagnosticChips diagnostics={nodeDiagnostics} iconsOnly />}
                    </div>
                </td>
                <td className={clsx(TD, 'font-mono text-secondary')}>{node.relation ?? ''}</td>
                <td className={NUMBER}>{formatCostRange(node)}</td>
                <td className={NUMBER}>{node.plan_rows != null ? formatRows(node.plan_rows) : '-'}</td>
                {hasAnalyzeData && (
                    <td className={NUMBER}>{node.actual_rows != null ? formatRows(node.actual_rows) : '-'}</td>
                )}
                <td className={NUMBER}>
                    {hasAnalyzeData && nodeMetrics?.exclusiveTimeMs != null
                        ? formatTime(nodeMetrics.exclusiveTimeMs)
                        : '-'}
                </td>
                <td className={clsx(NUMBER, ratioWarning && 'text-accent-warning')}>
                    {ratio != null ? formatRatio(ratio >= 1 ? ratio : 1 / ratio) : '-'}
                </td>
                <td className={clsx(TD, 'max-w-[200px] truncate text-muted')}>{node.filter ?? ''}</td>
            </tr>

            {expanded &&
                node.children.map((child) => <TreeRows key={child.id} {...props} node={child} depth={depth + 1} />)}
        </>
    );
}
