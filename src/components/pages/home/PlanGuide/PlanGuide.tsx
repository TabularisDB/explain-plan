import clsx from 'clsx';
import {Check, Copy, Info, Terminal} from 'lucide-react';
import {useEffect, useState} from 'react';
import {ORACLE_PLAN_QUERY} from '../../../../lib/oracle-query';
import type {EngineChoice} from '../../../../lib/parse';
import styles from './PlanGuide.module.scss';

type GuideEngine = Exclude<EngineChoice, 'auto'>;

interface Guide {
    engine: GuideEngine;
    label: string;
    text: string;
    command: string;
}

const GUIDES: Guide[] = [
    {
        engine: 'postgres',
        label: 'PostgreSQL',
        text: 'ANALYZE runs the query to get real timings, so wrap writes in BEGIN … ROLLBACK. Plain EXPLAIN text works too.',
        command: 'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)\nSELECT …;',
    },
    {
        engine: 'mysql',
        label: 'MySQL / MariaDB',
        text: 'FORMAT=JSON gives the planner estimates. On MySQL 8.0.18+, EXPLAIN ANALYZE runs the query and adds real timings.',
        command: 'EXPLAIN FORMAT=JSON\nSELECT …;',
    },
    {
        engine: 'sqlite',
        label: 'SQLite',
        text: 'Paste the tree printed by the sqlite3 shell as it is, or the raw id|parent|notused|detail rows.',
        command: 'EXPLAIN QUERY PLAN\nSELECT …;',
    },
    {
        engine: 'sqlserver',
        label: 'SQL Server',
        text: 'SHOWPLAN_XML returns the estimated plan without running the query. Use SET STATISTICS XML ON instead to get the actual plan with real row counts.',
        command: 'SET SHOWPLAN_XML ON;\nGO\nSELECT …;\nGO\nSET SHOWPLAN_XML OFF;\nGO',
    },
    {
        engine: 'oracle',
        label: 'Oracle',
        text: 'Oracle has no JSON EXPLAIN, so run this in SQL*Plus, SQLcl or SQL Developer (12.2+). In SQL*Plus, run SET LONG 1000000 first.',
        command: ORACLE_PLAN_QUERY,
    },
];

interface PlanGuideProps {
    engine: EngineChoice;
}

export function PlanGuide({engine}: PlanGuideProps) {
    const [active, setActive] = useState<GuideEngine>('postgres');
    const [copied, setCopied] = useState(false);
    const guide = GUIDES.find((item) => item.engine === active) ?? GUIDES[0];

    useEffect(() => {
        if (engine !== 'auto') setActive(engine);
    }, [engine]);

    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => setCopied(false), 1500);
        return () => clearTimeout(timer);
    }, [copied]);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(guide.command);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    };

    return (
        <section className="home-section" aria-labelledby="guide-title">
            <div className="home-section-header">
                <span className="home-section-eyebrow">
                    <Terminal aria-hidden="true" />
                    Get started
                </span>
                <h2 id="guide-title" className="home-section-title">
                    Not sure how to get your plan? Start here
                </h2>
                <p className="home-section-description">
                    Pick your database, run the command below, then paste the result in the editor above.
                </p>
            </div>

            <div className={styles.block}>
                <div className={styles.tabs} role="tablist" aria-label="Database">
                    {GUIDES.map((item) => (
                        <button
                            key={item.engine}
                            type="button"
                            role="tab"
                            id={`guide-tab-${item.engine}`}
                            aria-selected={item.engine === active}
                            aria-controls="guide-panel"
                            className={clsx(styles.tab, item.engine === active && styles.tabActive)}
                            onClick={() => {
                                setActive(item.engine);
                                setCopied(false);
                            }}
                        >
                            <img src={`/img/engines/${item.engine}.svg`} alt="" />
                            {item.label}
                        </button>
                    ))}
                </div>

                <div id="guide-panel" role="tabpanel" aria-labelledby={`guide-tab-${active}`}>
                    <div className={styles.command}>
                        <pre>{guide.command}</pre>
                        <button
                            type="button"
                            className={clsx(styles.copy, copied && styles.copied)}
                            onClick={copy}
                            aria-label={copied ? 'Copied' : 'Copy command'}
                            title={copied ? 'Copied' : 'Copy'}
                        >
                            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                        </button>
                    </div>
                    <p className={styles.note}>
                        <Info size={14} aria-hidden="true" />
                        {guide.text}
                    </p>
                </div>
            </div>
        </section>
    );
}
