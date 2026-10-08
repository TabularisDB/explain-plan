import {useTranslation} from 'react-i18next';
import clsx from 'clsx';
import {
    AlertTriangle,
    CircleSlash,
    DatabaseZap,
    Filter,
    Flame,
    HardDrive,
    Info,
    Layers,
    Repeat,
    ScanSearch,
    TrendingDown,
    TrendingUp,
    Users,
    type LucideIcon,
} from 'lucide-react';
import type {ExplainDiagnostic, ExplainDiagnosticKind, ExplainDiagnosticSeverity} from '@tabularis/explain';

const KIND_ICONS: Record<ExplainDiagnosticKind, LucideIcon> = {
    hotspot: Flame,
    'over-estimate': TrendingUp,
    'under-estimate': TrendingDown,
    'disk-sort': HardDrive,
    'filter-loss': Filter,
    'large-seq-scan': ScanSearch,
    'heap-fetches': Layers,
    'workers-underused': Users,
    'high-loops': Repeat,
    'cache-miss': DatabaseZap,
    'never-executed': CircleSlash,
};

const SEVERITY: Record<ExplainDiagnosticSeverity, {icon: LucideIcon; chip: string; text: string}> = {
    critical: {
        icon: AlertTriangle,
        chip: 'border-accent-error/40 bg-accent-error/10 text-error-text',
        text: 'text-accent-error',
    },
    warning: {
        icon: AlertTriangle,
        chip: 'border-accent-warning/40 bg-accent-warning/10 text-warning-text',
        text: 'text-accent-warning',
    },
    info: {
        icon: Info,
        chip: 'border-default bg-surface-secondary text-secondary',
        text: 'text-secondary',
    },
};

interface DiagnosticChipsProps {
    diagnostics: ExplainDiagnostic[];
    iconsOnly?: boolean;
    className?: string;
}

export function DiagnosticChips({diagnostics, iconsOnly = false, className}: DiagnosticChipsProps) {
    const {t} = useTranslation();

    if (diagnostics.length === 0) {
        return null;
    }

    return (
        <div className={clsx('flex flex-wrap items-center gap-1', className)}>
            {diagnostics.map((diagnostic) => {
                const Icon = KIND_ICONS[diagnostic.kind];
                const label = t(diagnostic.labelKey);

                return (
                    <span
                        key={diagnostic.kind}
                        title={`${label}${diagnostic.value ? ` (${diagnostic.value})` : ''}: ${t(diagnostic.descriptionKey)}`}
                        className={clsx(
                            'inline-flex items-center gap-1 px-1.5 py-0.5 border rounded-full text-[0.65rem] leading-none',
                            SEVERITY[diagnostic.severity].chip,
                        )}
                    >
                        <Icon size={10} className="shrink-0" aria-hidden="true" />
                        {!iconsOnly && <span className="font-medium">{label}</span>}
                        {diagnostic.value && <span className="font-mono opacity-90">{diagnostic.value}</span>}
                    </span>
                );
            })}
        </div>
    );
}

export function DiagnosticList({diagnostics}: {diagnostics: ExplainDiagnostic[]}) {
    const {t} = useTranslation();

    if (diagnostics.length === 0) {
        return null;
    }

    return (
        <ul className="m-0 p-0 list-none divide-y divide-default">
            {diagnostics.map((diagnostic) => {
                const {icon: Icon, text} = SEVERITY[diagnostic.severity];

                return (
                    <li key={diagnostic.kind} className="flex gap-2 px-4 py-2.5">
                        <Icon size={13} className={clsx('mt-0.5 shrink-0', text)} aria-hidden="true" />
                        <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                                <span className={clsx('text-[0.7rem] font-semibold', text)}>
                                    {t(diagnostic.labelKey)}
                                </span>
                                {diagnostic.value && (
                                    <span className="font-mono text-[0.7rem] text-secondary">{diagnostic.value}</span>
                                )}
                            </div>
                            <p className="m-0 text-[0.7rem] leading-relaxed text-muted">
                                {t(diagnostic.descriptionKey)}
                            </p>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
