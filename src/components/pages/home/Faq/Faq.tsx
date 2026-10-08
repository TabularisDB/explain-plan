import {CircleHelp, Plus} from 'lucide-react';
import type {ReactNode} from 'react';
import {TABULARIS} from '../../../../lib/links/links';
import styles from './Faq.module.scss';

interface Question {
    question: string;
    answer: ReactNode;
}

const QUESTIONS: Question[] = [
    {
        question: 'Is my query or data sent anywhere?',
        answer: (
            <>
                No. The plan is parsed in your browser and stays there while you work on it. Only if you click Share is
                it sent, and it is encrypted in your browser first. The key exists only in the link, so we cannot read
                shared plans. They are deleted after 30 days.
            </>
        ),
    },
    {
        question: 'How is it different from other plan viewers?',
        answer: (
            <>
                Most online viewers store your plan on their server in readable form to give you a link, and the ones
                that stay in your browser only read PostgreSQL. Here the plan stays in your browser until you share it,
                a shared plan is encrypted so that only people with the link can read it, and five engines are
                supported.
            </>
        ),
    },
    {
        question: 'Why isn’t my plan recognized?',
        answer: (
            <>
                Most of the time the output was cut or copied with its table borders. Copy the raw value, not the result
                grid of your client. In psql, run your query with <code>psql -XqAt</code> to get clean output. In
                SQL*Plus, run <code>SET LONG 1000000</code> first. You can also pick the engine by hand instead of
                relying on auto-detection.
            </>
        ),
    },
    {
        question: 'How do I share a plan with my team?',
        answer: (
            <>
                Once the plan is displayed, click Share at the top of the page, then Copy link. Anyone who opens the
                link sees the same views, without an account. The link stays available for 30 days.
            </>
        ),
    },
    {
        question: 'What is the difference between EXPLAIN and EXPLAIN ANALYZE?',
        answer: (
            <>
                EXPLAIN shows the plan the database intends to use, with estimated costs and row counts. EXPLAIN ANALYZE
                actually runs the query and adds what really happened: real timings and real row counts. On queries that
                change data, run it inside a transaction and roll it back.
            </>
        ),
    },
    {
        question: 'Why are my row estimates off?',
        answer: (
            <>
                The planner guesses row counts from table statistics. When they are outdated, or when columns depend on
                each other, the guess can be far off and lead to a bad plan. Refreshing the statistics (ANALYZE in
                PostgreSQL, ANALYZE TABLE in MySQL) is often the first fix.
            </>
        ),
    },
    {
        question: 'Can I use this inside my database client?',
        answer: (
            <>
                Yes. This is the{' '}
                <a href={TABULARIS.visualExplain} target="_blank" rel="noopener noreferrer">
                    Visual EXPLAIN
                </a>{' '}
                feature of Tabularis, a free and open-source database client. In the app, you get the plan straight from
                your query, without copy and paste.{' '}
                <a href={TABULARIS.download} target="_blank" rel="noopener noreferrer">
                    Download Tabularis
                </a>
                .
            </>
        ),
    },
];

export function Faq() {
    return (
        <section className="home-section" aria-labelledby="faq-title">
            <div className="home-section-header">
                <span className="home-section-eyebrow">
                    <CircleHelp aria-hidden="true" />
                    FAQ
                </span>
                <h2 id="faq-title" className="home-section-title">
                    Good to know before you paste your plan
                </h2>
                <p className="home-section-description">
                    Privacy, plans that are not recognized, sharing with your team, and a few EXPLAIN basics.
                </p>
            </div>

            <div className={styles.list}>
                {QUESTIONS.map(({question, answer}) => (
                    <details key={question} className={styles.item}>
                        <summary className={styles.question}>
                            {question}
                            <Plus size={16} className={styles.icon} aria-hidden="true" />
                        </summary>
                        <p className={styles.answer}>{answer}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}
