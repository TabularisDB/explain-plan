import {useMemo} from 'react';
import {FileText} from 'lucide-react';
import clsx from 'clsx';
import {ExplainPlan} from '@tabularis/explain';
import {formatPlan, highlightPlan} from '../../../../lib/highlight';

interface RawOutputProps {
    plan: ExplainPlan;
}

export function RawOutputView({plan}: RawOutputProps) {
    const html = useMemo(() => highlightPlan(formatPlan(plan.raw_output ?? '')), [plan.raw_output]);

    return (
        <section className="block">
            <div className="block-heading">
                <FileText size={15} aria-hidden="true" />
                <h2 className="title">
                    Raw output (<span className="capitalize">{plan.driver}</span>)
                </h2>
            </div>
            <pre
                className={clsx(
                    'plan-editor',
                    'w-full min-w-0 max-w-full overflow-x-auto',
                    'p-4 font-mono-theme text-[0.8rem] leading-[1.6] text-secondary',
                    'border-[0.1rem] border-default rounded-theme-sm',
                )}
                dangerouslySetInnerHTML={{__html: html}}
            />
        </section>
    );
}
