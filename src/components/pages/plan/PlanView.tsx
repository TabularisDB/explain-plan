import {computeExplainMetrics, ExplainPlan, getPlanDiagnostics} from '@tabularis/explain';
import {ExplainViewMode} from '@tabularis/explain/react';
import clsx from 'clsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import {useEffect, useMemo, useState} from 'react';
import {Header} from '../../layout/Header/Header';
import styles from './PlanView.module.scss';
import {AiUpsellView} from './sections/AiUpsellView';
import {DiagramView} from './sections/DiagramView';
import {GraphView} from './sections/GraphView';
import {OverviewBar} from './sections/OverviewBar';
import {RawOutputView} from './sections/RawOutputView';
import {StatsView} from './sections/StatsView';
import {SummaryBar} from './sections/SummaryBar';
import {TableView} from './sections/TableView';

interface PlanViewProps {
    plan: ExplainPlan;
}

export function PlanView({plan}: PlanViewProps) {
    const [viewMode, setViewMode] = useState<ExplainViewMode>('graph');
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const metrics = useMemo(() => computeExplainMetrics(plan), [plan]);
    const diagnostics = useMemo(() => getPlanDiagnostics(plan, metrics), [plan, metrics]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <section className={styles.page}>
            <Header isHomePage={false} />
            <div className={clsx('plan-view', styles.planView)}>
                <SummaryBar plan={plan} viewMode={viewMode} onViewModeChange={setViewMode} aiEnabled />
                <OverviewBar plan={plan} metrics={metrics} onSelectNode={setSelectedNodeId} />

                <div className={styles.dynamicView}>
                    {viewMode === 'ai' ? (
                        <AiUpsellView />
                    ) : viewMode === 'raw' && plan.raw_output ? (
                        <RawOutputView plan={plan} />
                    ) : viewMode === 'table' ? (
                        <TableView
                            plan={plan}
                            metrics={metrics}
                            diagnostics={diagnostics}
                            selectedId={selectedNodeId}
                            onSelect={setSelectedNodeId}
                        />
                    ) : viewMode === 'diagram' ? (
                        <DiagramView
                            plan={plan}
                            metrics={metrics}
                            diagnostics={diagnostics}
                            selectedId={selectedNodeId}
                            onSelect={setSelectedNodeId}
                        />
                    ) : viewMode === 'stats' ? (
                        <StatsView plan={plan} metrics={metrics} />
                    ) : (
                        <GraphView
                            plan={plan}
                            metrics={metrics}
                            diagnostics={diagnostics}
                            selectedId={selectedNodeId}
                            onSelect={setSelectedNodeId}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
