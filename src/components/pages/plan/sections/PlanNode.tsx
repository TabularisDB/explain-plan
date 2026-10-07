import {memo} from 'react';
import {Handle, Position, type Node, type NodeProps} from '@xyflow/react';
import {useTranslation} from 'react-i18next';
import clsx from 'clsx';
import {formatCost, formatRatio, formatRows, formatTime, getRowEstimateRatio} from '@tabularis/explain';
import type {ExplainPlanNodeData} from '@tabularis/explain/flow';
import {DiagnosticChips} from './DiagnosticChips';

export type PlanNodeType = Node<ExplainPlanNodeData, 'explainPlan'>;

const HEAT = {
    high: {border: 'border-l-accent-error', header: 'bg-accent-error/10'},
    medium: {border: 'border-l-accent-warning', header: 'bg-accent-warning/10'},
    low: {border: 'border-l-accent-primary', header: 'bg-accent-primary/5'},
    none: {border: 'border-l-default', header: ''},
};

function getHeat(value: number, max: number) {
    if (max <= 0 || value <= 0) return HEAT.none;
    const ratio = value / max;
    if (ratio >= 0.66) return HEAT.high;
    if (ratio >= 0.33) return HEAT.medium;
    return HEAT.low;
}

function Row({label, children, strong}: {label: string; children: React.ReactNode; strong?: boolean}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">{label}</dt>
            <dd className={clsx('m-0 font-mono', strong ? 'font-semibold text-primary' : 'text-secondary')}>
                {children}
            </dd>
        </div>
    );
}

export const PlanNode = memo(({data}: NodeProps<PlanNodeType>) => {
    const {t} = useTranslation();
    const {node, metrics, maxExclusiveCost, maxExclusiveTimeMs, diagnostics, hasAnalyzeData, isSelected} = data;

    const heat =
        hasAnalyzeData && maxExclusiveTimeMs > 0
            ? getHeat(metrics?.exclusiveTimeMs ?? 0, maxExclusiveTimeMs)
            : getHeat(metrics?.exclusiveCost ?? 0, maxExclusiveCost);

    const ratio = getRowEstimateRatio(node);
    const mismatch =
        ratio != null && (ratio >= 4 || ratio <= 0.25) ? formatRatio(ratio >= 1 ? ratio : 1 / ratio) : null;

    return (
        <div
            className={clsx(
                'min-w-[260px] max-w-[300px] overflow-hidden text-xs bg-elevated rounded-sm shadow-xl transition-shadow',
                'border border-strong border-l-4',
                heat.border,
                isSelected && 'ring-2 ring-accent-primary',
            )}
        >
            <div className={clsx('flex flex-col gap-0.5 px-3 py-2 border-b border-default', heat.header)}>
                <div className="flex items-center gap-2">
                    {metrics && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-surface-tertiary font-mono text-[0.65rem] text-secondary">
                            #{metrics.index}
                        </span>
                    )}
                    <span
                        className={clsx('text-sm font-semibold', isSelected ? 'text-accent-primary' : 'text-primary')}
                    >
                        {node.node_type}
                    </span>
                </div>
                {node.relation && <span className="font-mono text-muted">{node.relation}</span>}
            </div>

            <dl className="flex flex-col gap-1 m-0 px-3 py-2">
                <Row label={t('editor.visualExplain.estRows')}>
                    {node.plan_rows != null ? formatRows(node.plan_rows) : '-'}
                </Row>
                {metrics?.exclusiveCost != null && (
                    <Row label={t('editor.visualExplain.selfCost')}>{formatCost(metrics.exclusiveCost)}</Row>
                )}
                {mismatch && (
                    <Row label={t('editor.visualExplain.largestEstimateGap')}>
                        <span className="font-semibold text-accent-warning">{mismatch}</span>
                    </Row>
                )}
                {hasAnalyzeData && node.actual_rows != null && (
                    <Row label={t('editor.visualExplain.actualRows')} strong>
                        {formatRows(node.actual_rows)}
                    </Row>
                )}
                {hasAnalyzeData && metrics?.exclusiveTimeMs != null && (
                    <Row label={t('editor.visualExplain.selfTime')} strong>
                        {formatTime(metrics.exclusiveTimeMs)}
                        {metrics.timeShare != null && (
                            <span className="ml-1 font-normal text-muted">
                                ({Math.round(metrics.timeShare * 100)}%)
                            </span>
                        )}
                    </Row>
                )}
                {hasAnalyzeData && metrics?.inclusiveTimeMs != null && (
                    <Row label={t('editor.visualExplain.totalTime')}>{formatTime(metrics.inclusiveTimeMs)}</Row>
                )}
                {hasAnalyzeData && (node.actual_loops ?? 0) > 1 && (
                    <Row label={t('editor.visualExplain.loops')}>{node.actual_loops}</Row>
                )}
            </dl>

            {(diagnostics.length > 0 || node.filter || node.index_condition) && (
                <div className="flex flex-col gap-1 px-3 py-2 border-t border-default">
                    <DiagnosticChips diagnostics={diagnostics} />
                    {node.filter && (
                        <span className="truncate font-mono text-[0.65rem] text-muted">
                            {t('editor.visualExplain.filter')}: {node.filter}
                        </span>
                    )}
                    {node.index_condition && (
                        <span className="truncate font-mono text-[0.65rem] text-muted">
                            {t('editor.visualExplain.indexCondition')}: {node.index_condition}
                        </span>
                    )}
                </div>
            )}

            <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-accent-primary !border-0" />
            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-accent-primary !border-0" />
        </div>
    );
});
