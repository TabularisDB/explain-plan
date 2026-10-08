import {Flame, Link2, ListChecks, ScanSearch, TrendingUp, type LucideIcon} from 'lucide-react';
import styles from './Highlights.module.scss';

interface Highlight {
    icon: LucideIcon;
    kicker: string;
    title: string;
    text: string;
}

const HIGHLIGHTS: Highlight[] = [
    {
        icon: Flame,
        kicker: 'Hotspots',
        title: 'See where the time goes',
        text: 'Each node is colored by its share of the total time or cost, so the slow parts stand out at once.',
    },
    {
        icon: TrendingUp,
        kicker: 'Estimates',
        title: 'Catch bad row estimates',
        text: 'Compare what the planner expected with what really happened, and spot the nodes where it got it wrong.',
    },
    {
        icon: ListChecks,
        kicker: 'Findings',
        title: 'Know what to fix first',
        text: 'Disk sorts, large sequential scans, filtered-out rows and cache misses are flagged on each node.',
    },
    {
        icon: Link2,
        kicker: 'Sharing',
        title: 'Share a plan with a short link',
        text: 'The plan is encrypted in your browser before it is stored, and the key exists only in the link, so we cannot read it. Links work for 30 days.',
    },
];

export function Highlights() {
    return (
        <section className="home-section" aria-labelledby="highlights-title">
            <div className="home-section-header">
                <span className="home-section-eyebrow">
                    <ScanSearch aria-hidden="true" />
                    Highlights
                </span>
                <h2 id="highlights-title" className="home-section-title">
                    Read a plan faster, then share it
                </h2>
                <p className="home-section-description">
                    Slow nodes, bad estimates and common issues are highlighted on the graph, and an encrypted short
                    link lets your team see the same thing.
                </p>
            </div>

            <ul className={styles.grid}>
                {HIGHLIGHTS.map(({icon: Icon, kicker, title, text}) => (
                    <li key={kicker} className={styles.item}>
                        <Icon size={18} aria-hidden="true" className={styles.icon} />

                        <span className={styles.kicker}>{kicker}</span>
                        <h3 className={styles.title}>{title}</h3>
                        <p className={styles.text}>{text}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
