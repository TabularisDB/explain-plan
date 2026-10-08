import {Database, Globe, LockOpen, type LucideIcon} from 'lucide-react';
import {useState} from 'react';
import type {Engine, EngineChoice} from '../../../lib/engines/engines';
import {Header} from '../../layout/Header/Header';
import styles from './HomeView.module.scss';
import {PlanForm} from './PlanForm/PlanForm';
import {PlanGuide} from './PlanGuide/PlanGuide';
import {Highlights} from './Highlights/Highlights';
import {Faq} from './Faq/Faq';

interface Badge {
    label: string;
    icon: LucideIcon;
}

const BADGES: Badge[] = [
    {label: 'Multi-engine', icon: Database},
    {label: '100% in-browser', icon: Globe},
    {label: 'Free, no sign-up', icon: LockOpen},
];

interface HomeViewProps {
    onPlan: (raw: string, engine: Engine) => void;
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
            <PlanGuide engine={engine} />
            <Highlights />
            <Faq />
        </div>
    );
}
