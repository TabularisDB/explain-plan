import {useTranslation} from 'react-i18next';
import {MousePointerClick} from 'lucide-react';
import {
    formatCost,
    formatRows,
    formatTime,
    type ExplainDiagnostic,
    type ExplainNode,
    type ExplainNodeMetrics,
} from '@tabularis/explain';
import {ExplainDiagnosticList} from '@tabularis/explain/react';

type Entry = [label: string, value: string];

interface NodeDetailsProps {
    node: ExplainNode | null;
    hasAnalyzeData: boolean;
    metrics?: ExplainNodeMetrics | null;
    diagnostics?: ExplainDiagnostic[];
}

export function formatCostRange(node: ExplainNode): string {
    if (node.startup_cost != null && node.total_cost != null) {
        return `${formatCost(node.startup_cost)} - ${formatCost(node.total_cost)}`;
    }
    return node.total_cost != null ? formatCost(node.total_cost) : '-';
}

function entry(label: string, value: string | null | undefined): Entry[] {
    return value == null || value === '' ? [] : [[label, value]];
}

export function NodeDetails({node, hasAnalyzeData, metrics = null, diagnostics = []}: NodeDetailsProps) {
    const {t} = useTranslation();

    if (!node) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 h-full p-6 text-center text-xs text-secondary">
                <MousePointerClick size={18} className="text-muted" aria-hidden="true" />
                {t('editor.visualExplain.selectNode')}
            </div>
        );
    }

    const selfTime =
        metrics?.exclusiveTimeMs != null
            ? metrics.timeShare != null
                ? `${formatTime(metrics.exclusiveTimeMs)} (${Math.round(metrics.timeShare * 100)}%)`
                : formatTime(metrics.exclusiveTimeMs)
            : null;

    const general: Entry[] = [
        ...entry(t('editor.visualExplain.nodeType'), node.node_type),
        ...entry(t('editor.visualExplain.relation'), node.relation),
        ...entry(t('editor.visualExplain.cost'), node.total_cost != null ? formatCostRange(node) : null),
        ...entry(
            t('editor.visualExplain.selfCost'),
            metrics?.exclusiveCost != null ? formatCost(metrics.exclusiveCost) : null,
        ),
        ...entry(t('editor.visualExplain.estRows'), node.plan_rows != null ? formatRows(node.plan_rows) : null),
        ...entry(t('editor.visualExplain.filter'), node.filter),
        ...entry(t('editor.visualExplain.indexCondition'), node.index_condition),
        ...entry(t('editor.visualExplain.joinType'), node.join_type),
        ...entry(t('editor.visualExplain.hashCondition'), node.hash_condition),
    ];

    const analyze: Entry[] = hasAnalyzeData
        ? [
              ...entry(
                  t('editor.visualExplain.actualRows'),
                  node.actual_rows != null ? formatRows(node.actual_rows) : null,
              ),
              ...entry(
                  t('editor.visualExplain.rowsAllLoops'),
                  metrics?.totalRows != null && (node.actual_loops ?? 0) > 1 ? formatRows(metrics.totalRows) : null,
              ),
              ...entry(t('editor.visualExplain.selfTime'), selfTime),
              ...entry(
                  t('editor.visualExplain.totalTime'),
                  metrics?.inclusiveTimeMs != null ? formatTime(metrics.inclusiveTimeMs) : null,
              ),
              ...entry(
                  t('editor.visualExplain.timePerLoop'),
                  node.actual_time_ms != null ? formatTime(node.actual_time_ms) : null,
              ),
              ...entry(t('editor.visualExplain.loops'), node.actual_loops?.toString()),
              ...entry(t('editor.visualExplain.buffersHit'), node.buffers_hit?.toString()),
              ...entry(t('editor.visualExplain.buffersRead'), node.buffers_read?.toString()),
          ]
        : [];

    const extra: Entry[] = Object.entries(node.extra).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
    ]);

    return (
        <div className="text-xs">
            {diagnostics.length > 0 && (
                <div className="border-b border-default">
                    <SectionTitle>{t('editor.visualExplain.diagnostics.title')}</SectionTitle>
                    <ExplainDiagnosticList diagnostics={diagnostics} />
                </div>
            )}
            <DetailSection title={t('editor.visualExplain.general')} entries={general} />
            <DetailSection title={t('editor.visualExplain.analyzeData')} entries={analyze} />
            <DetailSection title={t('editor.visualExplain.extraDetails')} entries={extra} />
        </div>
    );
}

function SectionTitle({children}: {children: string}) {
    return (
        <h3 className="m-0 px-4 py-2 bg-elevated border-b border-default text-[0.65rem] font-medium uppercase tracking-[0.04em] text-secondary">
            {children}
        </h3>
    );
}

function DetailSection({title, entries}: {title: string; entries: Entry[]}) {
    if (entries.length === 0) {
        return null;
    }

    return (
        <section className="border-b border-default last:border-b-0">
            <SectionTitle>{title}</SectionTitle>
            <dl className="m-0 divide-y divide-default">
                {entries.map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-1 px-4 py-2.5">
                        <dt className="text-[0.7rem] text-muted">{label}</dt>
                        <dd className="m-0 font-mono leading-relaxed text-secondary break-words">{value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
