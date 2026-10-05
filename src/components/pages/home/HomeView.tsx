import type {ExplainPlan} from '@tabularis/explain';
import {Database, GitBranch, ShieldCheck, Zap, type LucideIcon} from 'lucide-react';
import {useState} from 'react';
import {ORACLE_PLAN_QUERY} from '../../../lib/oracle-query';
import type {EngineChoice} from '../../../lib/parse';
import {Header} from '../../layout/Header/Header';
import styles from './HomeView.module.scss';
import {PlanForm} from './PlanForm/PlanForm';

interface Badge {
    label: string;
    icon: LucideIcon;
}

const BADGES: Badge[] = [
    {label: 'Multi-engine', icon: Database},
    {label: '100% in-browser', icon: ShieldCheck},
    {label: 'Free & no sign-up', icon: Zap},
];

const HIGHLIGHTS = [
    {
        icon: ShieldCheck,
        kicker: 'Private by design',
        title: 'Nothing leaves your browser',
        text: 'Plans are parsed locally. No query is executed and nothing is uploaded to any server.',
    },
    {
        icon: GitBranch,
        kicker: 'Four views',
        title: 'Graph, diagram, table & stats',
        text: 'Explore the plan as an interactive graph, a compact diagram, a sortable table and summary statistics.',
    },
    {
        icon: Zap,
        kicker: 'Multi-engine',
        title: 'Postgres, MySQL, SQLite, SQL Server & Oracle',
        text: 'Text, JSON and SHOWPLAN XML formats are auto-detected, including runtime plans with timings.',
    },
] as const;

interface HomeViewProps {
    onPlan: (plan: ExplainPlan) => void;
}

export function HomeView({onPlan}: HomeViewProps) {
    const [engine, setEngine] = useState<EngineChoice>('auto');

    return (
        <div className={styles.page}>
            <div className={styles.bgGrid} aria-hidden="true" />
            <Header />

            <section className={styles.hero} aria-labelledby="hero-title">
                <ul className={styles.badges}>
                    {BADGES.map(({label, icon: Icon}) => (
                        <li key={label} className={styles.badge}>
                            <Icon size={16} strokeWidth={2} aria-hidden="true" />
                            {label}
                        </li>
                    ))}
                </ul>

                <h1 id="hero-title" className={styles.title}>
                    Understand any EXPLAIN plan at a glance
                </h1>

                <p className={styles.description}>
                    Paste your EXPLAIN output and explore it as a graph, a diagram, a table or stats. Everything runs in
                    your browser: nothing is executed or uploaded.
                </p>
            </section>

            <PlanForm engine={engine} onEngineChange={setEngine} onPlan={onPlan} />

            {engine === 'oracle' && (
                <details className={styles.help}>
                    <summary>How to get an Oracle plan</summary>
                    <p>
                        Oracle has no JSON EXPLAIN output, so run this in SQL*Plus, SQLcl or SQL Developer (Oracle
                        12.2+) and paste the single JSON value it returns. In SQL*Plus, run{' '}
                        <code>SET LONG 1000000</code> first so the result is not truncated.
                    </p>
                    <pre>{ORACLE_PLAN_QUERY}</pre>
                </details>
            )}

            <section className={styles.highlights} aria-labelledby="highlights-title">
                <div className={styles.highlightsHeading}>
                    <h2 id="highlights-title" className={styles.highlightsTitle}>
                        Read any query plan like a map
                    </h2>
                    <p className={styles.highlightsDescription}>
                        Stop scrolling through walls of EXPLAIN text. See where the time goes, why the planner chose it
                        and what to fix first.
                    </p>
                </div>

                <ul className={styles.highlightsGrid}>
                    {HIGHLIGHTS.map(({icon: Icon, kicker, title, text}) => (
                        <li key={kicker} className={styles.highlight}>
                            <span className={styles.highlightKicker}>
                                <Icon size={14} aria-hidden="true" />
                                {kicker}
                            </span>
                            <strong className={styles.highlightTitle}>{title}</strong>
                            <p className={styles.highlightText}>{text}</p>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
