import {
    formatCost,
    formatRatio,
    formatTime,
    getExplainDriverLegend,
    getExplainPlanSummary,
    type ExplainMetrics,
    type ExplainPlan,
} from '@tabularis/explain';
import clsx from 'clsx';
import {
    AlertTriangle,
    BookOpenText,
    ChevronDown,
    Clock3,
    Database,
    Layers2,
    ScanSearch,
    TargetIcon,
    type LucideIcon,
} from 'lucide-react';
import {useId, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

type Tone = 'blue' | 'amber' | 'red' | 'purple';

const TONES: Record<Tone, {card: string; label: string}> = {
    blue: {
        card: 'border-accent-info/30 bg-accent-info/8 hover:bg-accent-info/14 focus-visible:border-accent-info',
        label: 'text-accent-info',
    },
    amber: {
        card: 'border-accent-warning/30 bg-accent-warning/8 hover:bg-accent-warning/14 focus-visible:border-accent-warning',
        label: 'text-accent-warning',
    },
    red: {
        card: 'border-accent-error/30 bg-accent-error/8 hover:bg-accent-error/14 focus-visible:border-accent-error',
        label: 'text-accent-error',
    },
    purple: {
        card: 'border-accent-secondary/30 bg-accent-secondary/8 hover:bg-accent-secondary/14 focus-visible:border-accent-secondary',
        label: 'text-accent-secondary',
    },
};

interface Finding {
    key: string;
    label: string;
    value: string;
    description: string;
    nodeId: string;
    icon: LucideIcon;
    tone: Tone;
}

interface OverviewProps {
    plan: ExplainPlan;
    metrics: ExplainMetrics;
    onSelectNode: (nodeId: string) => void;
}

function formatNodeLabel(nodeType: string, relation: string | null): string {
    return relation ? `${nodeType} · ${relation}` : nodeType;
}

export function OverviewBar({plan, metrics, onSelectNode}: OverviewProps) {
    const {t} = useTranslation();
    const panelId = useId();
    const [expanded, setExpanded] = useState(true);
    const summary = useMemo(() => getExplainPlanSummary(plan, metrics), [plan, metrics]);
    const legend = useMemo(() => getExplainDriverLegend(plan), [plan]);

    const findings: Finding[] = [];

    if (summary.highestCostNode) {
        findings.push({
            key: 'highest-cost',
            label: t('editor.visualExplain.highestSelfCost'),
            value: formatCost(summary.highestCostNode.value),
            description: formatNodeLabel(summary.highestCostNode.nodeType, summary.highestCostNode.relation),
            nodeId: summary.highestCostNode.nodeId,
            icon: Layers2,
            tone: 'blue',
        });
    }

    if (summary.slowestNode) {
        findings.push({
            key: 'slowest-step',
            label: t('editor.visualExplain.slowestSelfStep'),
            value: formatTime(summary.slowestNode.value),
            description: formatNodeLabel(summary.slowestNode.nodeType, summary.slowestNode.relation),
            nodeId: summary.slowestNode.nodeId,
            icon: Clock3,
            tone: 'amber',
        });
    }

    if (summary.largestRowMismatchNode?.ratio != null) {
        findings.push({
            key: 'estimate-gap',
            label: t('editor.visualExplain.largestEstimateGap'),
            value: formatRatio(summary.largestRowMismatchNode.value),
            description: t(
                summary.largestRowMismatchNode.ratio >= 1
                    ? 'editor.visualExplain.overEstimate'
                    : 'editor.visualExplain.underEstimate',
            ),
            nodeId: summary.largestRowMismatchNode.nodeId,
            icon: AlertTriangle,
            tone: 'red',
        });
    }

    if (summary.sequentialScans > 0) {
        findings.push({
            key: 'sequential-scans',
            label: t('editor.visualExplain.sequentialScans'),
            value: String(summary.sequentialScans),
            description: t('editor.visualExplain.scanOperations'),
            nodeId: summary.highestCostNode?.nodeId ?? plan.root.id,
            icon: ScanSearch,
            tone: 'amber',
        });
    }

    if (summary.tempOperations > 0) {
        findings.push({
            key: 'temp-operations',
            label: t('editor.visualExplain.tempOperations'),
            value: String(summary.tempOperations),
            description: t('editor.visualExplain.sortOrTempOperations'),
            nodeId: summary.slowestNode?.nodeId ?? plan.root.id,
            icon: Database,
            tone: 'purple',
        });
    }

    return (
        <section className="section">
            <div className="section-heading">
                <TargetIcon size={15} aria-hidden="true" />
                <h2 className="title">{t('editor.visualExplain.overview')}</h2>
                <span className="text-[0.7rem] uppercase text-secondary">
                    {findings.length} {t('editor.visualExplain.topIssues').toLowerCase()}
                    {legend.length > 0 && ` - ${legend.length} ${t('editor.visualExplain.driverNotes').toLowerCase()}`}
                </span>
                <button
                    type="button"
                    className="ml-auto inline-flex items-center justify-center p-1 text-secondary hover:text-primary cursor-pointer focus-visible:outline-[0.1rem] focus-visible:outline-accent-primary focus-visible:outline-offset-2"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    aria-label={
                        expanded ? t('editor.visualExplain.hideOverview') : t('editor.visualExplain.showOverview')
                    }
                    onClick={() => setExpanded((value) => !value)}
                >
                    <ChevronDown size={16} className={clsx('transition-transform', !expanded && '-rotate-90')} />
                </button>
            </div>

            {expanded && (
                <div id={panelId} className="flex flex-col gap-2">
                    {findings.length === 0 ? (
                        <p className="m-0 text-[0.8rem] text-secondary">{t('editor.visualExplain.noIssues')}</p>
                    ) : (
                        <ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-2 m-0 p-0 list-none">
                            {findings.map(({key, label, value, description, nodeId, icon: Icon, tone}) => (
                                <li key={key}>
                                    <button
                                        type="button"
                                        className={clsx(
                                            'flex flex-col gap-1 w-full h-full p-3 text-left text-primary',
                                            'border-[0.1rem] rounded-sm cursor-pointer transition-colors outline-none',
                                            TONES[tone].card,
                                        )}
                                        onClick={() => onSelectNode(nodeId)}
                                    >
                                        <span
                                            className={clsx(
                                                'flex items-center gap-1.5 text-[0.65rem] font-medium uppercase tracking-[0.04em]',
                                                TONES[tone].label,
                                            )}
                                        >
                                            <Icon size={14} aria-hidden="true" />
                                            {label}
                                        </span>
                                        <span className="text-base text-primary font-semibold">{value}</span>
                                        <span className="text-xs text-secondary">{description}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {legend.length > 0 && (
                        <div className="flex flex-col gap-1 p-3 border-[0.1rem] border-[gray]/30 bg-[gray]/8 rounded-sm">
                            <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.04em] text-secondary">
                                <BookOpenText size={14} aria-hidden="true" />
                                {t('editor.visualExplain.driverNotes')}
                            </span>
                            <ul className="flex flex-wrap gap-x-8 gap-y-2 m-0 pl-4 list-disc text-[0.8rem] leading-normal text-secondary marker:text-accent-primary">
                                {legend.map((entry) => (
                                    <li key={entry}>{t(entry)}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
