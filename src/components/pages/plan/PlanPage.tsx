import {lazy, Suspense, useEffect, useState} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {loadPlan, type PlanResult} from '../../../lib/share/share';
import {Header} from '../../layout/Header/Header';
import styles from './PlanPage.module.scss';
import {PlanLoading} from './PlanLoading/PlanLoading';
import {SharedPlanError} from './SharedPlanError/SharedPlanError';

const PlanView = lazy(() => import('./PlanView/PlanView').then((module) => ({default: module.PlanView})));

export function PlanPage() {
    const {hash} = useLocation();
    const [result, setResult] = useState<PlanResult | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        let active = true;
        setResult(null);
        loadPlan(hash).then((next) => {
            if (active) setResult(next);
        });
        return () => {
            active = false;
        };
    }, [hash]);

    if (result?.status === 'empty') return <Navigate to="/" replace />;

    return (
        <section className={styles.planPage}>
            <Header isHomePage={false} shareable={!result || result.status === 'ok'} />
            {!result ? (
                <PlanLoading />
            ) : result.status === 'ok' ? (
                <Suspense fallback={<PlanLoading />}>
                    <PlanView plan={result.plan} />
                </Suspense>
            ) : (
                <SharedPlanError reason={result.status} />
            )}
        </section>
    );
}
