import {Database, Download, Sparkles, Zap, type LucideIcon} from 'lucide-react';
import {useState} from 'react';
import {TABULARIS} from '../../../lib/links/links';
import {Button} from '../Button/Button';
import {Modal} from '../Modal/Modal';
import {VideoPreview} from '../VideoPreview/VideoPreview';
import styles from './TabularisPromoModal.module.scss';

const DISMISS_KEY = 'tabularis-promo-dismissed';

const FEATURES: {icon: LucideIcon; color: string; text: string}[] = [
    {
        icon: Zap,
        color: 'var(--color-accent-amber)',
        text: 'One-click visual EXPLAIN and ANALYZE on the query under your cursor',
    },
    {
        icon: Sparkles,
        color: 'var(--color-accent-purple)',
        text: 'AI plan analysis with concrete optimization suggestions',
    },
    {
        icon: Database,
        color: 'var(--color-accent-blue)',
        text: 'PostgreSQL, MySQL, SQLite and 15+ more databases, with a built-in MCP server',
    },
];

export function isPromoDismissed(): boolean {
    try {
        return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
        return false;
    }
}

interface TabularisPromoModalProps {
    onClose: () => void;
}

export function TabularisPromoModal({onClose}: TabularisPromoModalProps) {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const close = () => {
        if (dontShowAgain) {
            try {
                localStorage.setItem(DISMISS_KEY, '1');
            } catch {}
        }
        onClose();
    };

    return (
        <Modal
            title="Want to skip the copy-paste?"
            icon={<img src="/tabularis-logo.svg" alt="" width={24} height={24} />}
            onClose={close}
            footer={
                <>
                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(event) => setDontShowAgain(event.target.checked)}
                        />
                        Don't show this again
                    </label>
                    <div className={styles.actions}>
                        <Button size="sm" variant="secondary" onClick={close} className={styles.button}>
                            Continue in browser
                        </Button>
                        <Button size="sm" href={TABULARIS.download} className={styles.button}>
                            <Download size={14} />
                            Download Tabularis
                        </Button>
                    </div>
                </>
            }
        >
            <p className={styles.text}>
                Tabularis is a free desktop SQL workspace that runs <strong>EXPLAIN directly from the editor</strong>,
                no copying plans around, and adds what a paste-in tool can't:
            </p>

            <ul className={styles.features}>
                {FEATURES.map(({icon: Icon, color, text}) => (
                    <li key={text}>
                        <Icon size={14} style={{color}} aria-hidden="true" />
                        {text}
                    </li>
                ))}
            </ul>

            <VideoPreview
                src={TABULARIS.video}
                poster={TABULARIS.videoPoster}
                label="Watch the Tabularis Visual EXPLAIN demo"
            />
        </Modal>
    );
}
