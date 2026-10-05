import {useMemo, type ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import clsx from 'clsx';
import {KeyRound, Layers, PieChart, Table2, type LucideIcon} from 'lucide-react';
import {formatRows, formatTime, getExplainPlanStats, type ExplainMetrics, type ExplainPlan} from '@tabularis/explain';

interface StatsViewProps {
    plan: ExplainPlan;
    metrics: ExplainMetrics;
}

interface Column {
    key: string;
    label: string;
    align?: 'left' | 'right';
}

const CELL = 'px-3 py-2 max-md:px-2';
const NUMBER = clsx(CELL, 'text-right font-mono-theme text-secondary whitespace-nowrap');
const ROW = 'border-b border-default last:border-0 hover:bg-surface-hover transition-colors';

export function StatsView({plan, metrics}: StatsViewProps) {
    const {t} = useTranslation();
    const stats = useMemo(() => getExplainPlanStats(plan, metrics), [plan, metrics]);

    const tiles = [
        {label: t('editor.visualExplain.stats.nodeCount'), value: String(stats.nodeCount)},
        {label: t('editor.visualExplain.stats.maxDepth'), value: String(stats.maxDepth)},
        stats.totalExclusiveTimeMs != null && {
            label: t('editor.visualExplain.stats.totalSelfTime'),
            value: formatTime(stats.totalExclusiveTimeMs),
        },
        stats.neverExecutedCount > 0 && {
            label: t('editor.visualExplain.stats.neverExecutedNodes'),
            value: String(stats.neverExecutedCount),
        },
    ].filter((tile): tile is {label: string; value: string} => Boolean(tile));

    return (
        <section className="block min-h-0 min-w-0">
            <div className="block-heading">
                <PieChart size={15} aria-hidden="true" />
                <h2 className="title">{t('editor.visualExplain.statsView')}</h2>
            </div>

            <div className="flex flex-col gap-4 min-h-0 min-w-0 overflow-y-auto text-xs">
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2 m-0 p-0 list-none">
                    {tiles.map(({label, value}) => (
                        <li
                            key={label}
                            className="flex flex-col gap-1 min-w-0 p-3 bg-elevated border-[0.1rem] border-default rounded-theme-sm"
                        >
                            <span className="text-[0.65rem] uppercase tracking-[0.04em] text-secondary">{label}</span>
                            <span className="font-mono-theme text-base font-semibold text-primary truncate">
                                {value}
                            </span>
                        </li>
                    ))}
                </ul>

                <StatsSection icon={Layers} title={t('editor.visualExplain.stats.byNodeType')}>
                    <table className="w-full">
                        <HeaderRow
                            columns={[
                                {key: 'type', label: t('editor.visualExplain.nodeType')},
                                {key: 'count', label: t('editor.visualExplain.stats.count'), align: 'right'},
                                {key: 'time', label: t('editor.visualExplain.selfTime'), align: 'right'},
                                {key: 'share', label: t('editor.visualExplain.stats.share')},
                            ]}
                        />
                        <tbody>
                            {stats.nodeTypes.map((entry) => (
                                <tr key={entry.nodeType} className={ROW}>
                                    <td className={clsx(CELL, 'text-primary whitespace-nowrap')}>{entry.nodeType}</td>
                                    <td className={NUMBER}>{entry.count}</td>
                                    <td className={NUMBER}>
                                        {entry.exclusiveTimeMs != null ? formatTime(entry.exclusiveTimeMs) : '-'}
                                    </td>
                                    <td className={clsx(CELL, 'w-1/3 min-w-[120px]')}>
                                        <ShareBar share={entry.timeShare} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </StatsSection>

                {stats.relations.length > 0 && (
                    <StatsSection icon={Table2} title={t('editor.visualExplain.stats.byRelation')}>
                        <table className="w-full">
                            <HeaderRow
                                columns={[
                                    {key: 'relation', label: t('editor.visualExplain.relation')},
                                    {key: 'accesses', label: t('editor.visualExplain.stats.accesses'), align: 'right'},
                                    {key: 'ops', label: t('editor.visualExplain.stats.operations')},
                                    {key: 'rows', label: t('editor.visualExplain.actualRows'), align: 'right'},
                                    {key: 'time', label: t('editor.visualExplain.selfTime'), align: 'right'},
                                ]}
                            />
                            <tbody>
                                {stats.relations.map((entry) => (
                                    <tr key={entry.relation} className={ROW}>
                                        <td className={clsx(CELL, 'font-mono-theme text-primary whitespace-nowrap')}>
                                            {entry.relation}
                                        </td>
                                        <td className={NUMBER}>{entry.accessCount}</td>
                                        <td className={clsx(CELL, 'min-w-[140px] text-muted')}>
                                            {entry.nodeTypes.join(', ')}
                                        </td>
                                        <td className={NUMBER}>
                                            {entry.totalRows != null ? formatRows(entry.totalRows) : '-'}
                                        </td>
                                        <td className={NUMBER}>
                                            {entry.exclusiveTimeMs != null ? formatTime(entry.exclusiveTimeMs) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </StatsSection>
                )}

                {stats.indexes.length > 0 && (
                    <StatsSection icon={KeyRound} title={t('editor.visualExplain.stats.byIndex')}>
                        <table className="w-full">
                            <HeaderRow
                                columns={[
                                    {key: 'index', label: t('editor.visualExplain.stats.indexName')},
                                    {key: 'relation', label: t('editor.visualExplain.relation')},
                                    {key: 'scans', label: t('editor.visualExplain.stats.scans'), align: 'right'},
                                    {key: 'time', label: t('editor.visualExplain.selfTime'), align: 'right'},
                                ]}
                            />
                            <tbody>
                                {stats.indexes.map((entry) => (
                                    <tr key={entry.indexName} className={ROW}>
                                        <td className={clsx(CELL, 'font-mono-theme text-primary whitespace-nowrap')}>
                                            {entry.indexName}
                                        </td>
                                        <td className={clsx(CELL, 'font-mono-theme text-secondary whitespace-nowrap')}>
                                            {entry.relation ?? '-'}
                                        </td>
                                        <td className={NUMBER}>{entry.scanCount}</td>
                                        <td className={NUMBER}>
                                            {entry.exclusiveTimeMs != null ? formatTime(entry.exclusiveTimeMs) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </StatsSection>
                )}
            </div>
        </section>
    );
}

function StatsSection({icon: Icon, title, children}: {icon: LucideIcon; title: string; children: ReactNode}) {
    return (
        <div className="flex flex-col gap-2 min-w-0">
            <h3 className="flex items-center gap-1.5 m-0 px-1 text-[0.7rem] font-semibold uppercase tracking-[0.04em] text-secondary">
                <Icon size={14} className="shrink-0" aria-hidden="true" />
                {title}
            </h3>
            <div className="min-w-0 max-w-full overflow-x-auto border-[0.1rem] border-default rounded-theme-sm">
                {children}
            </div>
        </div>
    );
}

function HeaderRow({columns}: {columns: Column[]}) {
    return (
        <thead className="bg-elevated">
            <tr className="border-b border-default">
                {columns.map((column) => (
                    <th
                        key={column.key}
                        className={clsx(
                            CELL,
                            'whitespace-nowrap text-[0.65rem] font-medium uppercase tracking-[0.04em] text-secondary',
                            column.align === 'right' ? 'text-right' : 'text-left',
                        )}
                    >
                        {column.label}
                    </th>
                ))}
            </tr>
        </thead>
    );
}

function ShareBar({share}: {share: number | null}) {
    if (share == null) {
        return <span className="text-muted">-</span>;
    }

    const percent = Math.min(100, share * 100);

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 min-w-10 overflow-hidden rounded-full bg-surface-tertiary">
                <div className="h-full rounded-full bg-accent-primary" style={{width: `${percent}%`}} />
            </div>
            <span className="w-9 shrink-0 text-right font-mono-theme text-[0.7rem] text-secondary">
                {Math.round(percent)}%
            </span>
        </div>
    );
}
