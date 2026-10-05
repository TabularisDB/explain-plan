import {formatCost, formatTime, getMaxCost, type ExplainPlan} from '@tabularis/explain';
import {ExplainViewMode} from '@tabularis/explain/react';
import {useTranslation} from 'react-i18next';
import clsx from 'clsx';
import {LucideIcon, Network, BarChart3, TableProperties, PieChart, FileText, Sparkles} from 'lucide-react';

const VIEWS: {mode: ExplainViewMode; icon: LucideIcon; labelKey: string}[] = [
    {mode: 'graph', icon: Network, labelKey: 'editor.visualExplain.graphView'},
    {mode: 'diagram', icon: BarChart3, labelKey: 'editor.visualExplain.diagramView'},
    {mode: 'table', icon: TableProperties, labelKey: 'editor.visualExplain.tableView'},
    {mode: 'stats', icon: PieChart, labelKey: 'editor.visualExplain.statsView'},
    {mode: 'raw', icon: FileText, labelKey: 'editor.visualExplain.rawOutput'},
    {mode: 'ai', icon: Sparkles, labelKey: 'editor.visualExplain.aiAnalysis'},
];

interface SummaryBarProps {
    plan: ExplainPlan;
    viewMode: ExplainViewMode;
    onViewModeChange: (mode: ExplainViewMode) => void;
    aiEnabled?: boolean;
}

export function SummaryBar({plan, viewMode, onViewModeChange, aiEnabled}: SummaryBarProps) {
    const {t: translate} = useTranslation();
    const maxCost = getMaxCost(plan.root);

    const metrics = [
        plan.planning_time_ms != null && {
            label: translate('editor.visualExplain.planningTime'),
            value: formatTime(plan.planning_time_ms),
        },
        plan.execution_time_ms != null && {
            label: translate('editor.visualExplain.executionTime'),
            value: formatTime(plan.execution_time_ms),
        },
        maxCost > 0 && {
            label: translate('editor.visualExplain.totalCost'),
            value: formatCost(maxCost),
        },
    ].filter((metric): metric is {label: string; value: string} => Boolean(metric));

    return (
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 min-w-0">
            <div
                className="flex w-fit max-w-full gap-0.5 p-1 max-md:p-0.5 overflow-x-auto no-scrollbar bg-elevated border-[0.1rem] border-default rounded-full"
                role="tablist"
                aria-label="Plan views"
            >
                {VIEWS.filter(({mode}) => aiEnabled || mode !== 'ai').map(({mode, icon: Icon, labelKey}) => {
                    const active = viewMode === mode;
                    const ai = mode === 'ai';
                    const label = translate(labelKey);

                    return (
                        <button
                            key={mode}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            aria-label={label}
                            title={label}
                            onClick={() => onViewModeChange(mode)}
                            className={clsx(
                                'inline-flex shrink-0 items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[0.8rem] font-medium whitespace-nowrap cursor-pointer transition-colors',
                                'max-md:gap-1 max-md:px-2',
                                'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-primary',
                                !active && 'bg-transparent text-secondary hover:text-primary',
                                active && !ai && 'bg-accent-primary/20 text-accent-primary',
                                active && ai && 'bg-accent-secondary/20 text-accent-secondary',
                            )}
                        >
                            <Icon className="size-3.5" aria-hidden="true" />
                            <span className={clsx(!active && 'max-md:hidden')}>{label}</span>
                        </button>
                    );
                })}
            </div>

            <ul className="flex flex-wrap gap-x-6 gap-y-2 max-md:gap-x-4">
                {metrics.map(({label, value}) => (
                    <li
                        key={label}
                        className="flex items-center gap-1 text-[0.7rem] text-secondary uppercase tracking-[0.04em]"
                    >
                        <strong className="font-mono-theme font-medium text-primary/90">{value}</strong> ({label})
                    </li>
                ))}
            </ul>
        </div>
    );
}
