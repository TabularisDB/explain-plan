import {ArrowRight, Database, Download, Sparkles, StarsIcon, Zap, type LucideIcon} from 'lucide-react';
import {VideoPreview} from '../../../ui/VideoPreview/VideoPreview';
import {TABULARIS} from '../../../../lib/links';
import {Button} from '../../../ui/Button/Button';

const FEATURES: {icon: LucideIcon; color: string; text: string}[] = [
    {
        icon: Sparkles,
        color: 'text-accent-secondary',
        text: 'AI plan analysis with concrete optimization suggestions',
    },
    {
        icon: Zap,
        color: 'text-accent-warning',
        text: 'One-click visual EXPLAIN and ANALYZE on the query under your cursor',
    },
    {
        icon: Database,
        color: 'text-accent-info',
        text: 'PostgreSQL, MySQL, SQLite and 15+ more databases, with a built-in MCP server',
    },
];

export function AiUpsellView() {
    return (
        <div className="section">
            <div className="section-heading">
                <StarsIcon size={15} aria-hidden="true" />
                <h2 className="title">AI Analysis</h2>
            </div>

            <div className="grid items-center justify-center gap-12 p-4 border-[0.1rem] border-default rounded-sm min-[1100px]:grid-cols-[minmax(0,35rem)_minmax(0,30rem)]">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2.5">
                        <img src="/tabularis-logo.svg" alt="" width={32} height={32} className="shrink-0" />
                        <h3 className="font-(family-name:--font-display) text-lg leading-[1.25] font-semibold text-primary">
                            AI plan analysis is a Tabularis feature
                        </h3>
                    </div>

                    <p className="m-0 text-sm leading-[1.6] text-secondary">
                        Download the free Tabularis desktop app to unlock this and more — everything this site does,
                        plus what a paste-in tool can't:
                    </p>

                    <ul className="flex flex-col gap-2 m-0 p-0 list-none text-sm text-secondary">
                        {FEATURES.map(({icon: Icon, color, text}) => (
                            <li key={text} className="flex items-start gap-2.5">
                                <Icon size={14} className={`shrink-0 mt-[0.2rem] ${color}`} aria-hidden="true" />
                                {text}
                            </li>
                        ))}
                    </ul>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Button href={TABULARIS.download} size="sm">
                            <Download size={14} />
                            Download Tabularis
                        </Button>
                        <Button href={TABULARIS.site} size="sm" variant="secondary">
                            Learn more
                            <ArrowRight size={14} />
                        </Button>
                    </div>
                </div>

                <VideoPreview
                    src={TABULARIS.videoOverview}
                    poster={TABULARIS.videoOverviewPoster}
                    label="Watch the Tabularis overview"
                />
            </div>
        </div>
    );
}
