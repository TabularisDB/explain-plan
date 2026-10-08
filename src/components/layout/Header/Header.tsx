import {Check, DownloadIcon, Link2, LoaderCircle, RotateCcwIcon, TriangleAlert} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {TABULARIS} from '../../../lib/links';
import {createShortLink} from '../../../lib/share';
import {Button} from '../../ui/Button/Button';
import styles from './Header.module.scss';

type ShareStatus = 'idle' | 'sharing' | 'copied' | 'failed';

const STATUS_LABEL: Record<ShareStatus, string> = {
    idle: 'Share',
    sharing: 'Sharing',
    copied: 'Copied',
    failed: 'Share failed',
};

const STATUS_ICON = {
    idle: Link2,
    sharing: LoaderCircle,
    copied: Check,
    failed: TriangleAlert,
};

async function copyToClipboard(link: Promise<string>) {
    if (typeof ClipboardItem === 'undefined') {
        await navigator.clipboard.writeText(await link);
        return;
    }
    const blob = link.then((text) => new Blob([text], {type: 'text/plain'}));
    await navigator.clipboard.write([new ClipboardItem({'text/plain': blob})]);
}

interface HeaderProps {
    isHomePage?: boolean;
    shareable?: boolean;
}

export function Header({isHomePage = true, shareable = false}: HeaderProps) {
    const {hash} = useLocation();
    const [status, setStatus] = useState<ShareStatus>('idle');
    const shortLink = useRef<Promise<string> | null>(null);

    useEffect(() => {
        if (status !== 'copied' && status !== 'failed') return;
        const timer = setTimeout(() => setStatus('idle'), 2000);
        return () => clearTimeout(timer);
    }, [status]);

    const share = async () => {
        if (status === 'sharing') return;
        setStatus('sharing');
        shortLink.current ??= (
            hash.startsWith('#s=') ? Promise.resolve(window.location.href) : createShortLink()
        ).catch((error: unknown) => {
            shortLink.current = null;
            throw error;
        });
        try {
            await copyToClipboard(shortLink.current);
            setStatus('copied');
        } catch {
            setStatus('failed');
        }
    };

    const StatusIcon = STATUS_ICON[status];

    return (
        <header className={styles.header}>
            <Link to="/" className={styles.logo}>
                <img src="/tabularis-logo.svg" alt="" width={24} height={24} />
                <span>Explain Plan</span>
            </Link>
            <nav className={styles.links}>
                {!isHomePage && shareable && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className={styles.button}
                        title="Copy a link to this plan"
                        onClick={share}
                    >
                        <StatusIcon
                            size={16}
                            className={status === 'sharing' ? styles.buttonSpinner : undefined}
                            aria-hidden="true"
                        />
                        <span className={styles.buttonLabel} aria-live="polite">
                            {STATUS_LABEL[status]}
                        </span>
                    </Button>
                )}
                {!isHomePage && (
                    <Button href="/" variant="secondary" size="sm" className={styles.button} title="New plan">
                        <RotateCcwIcon size={16} aria-hidden="true" />
                        <span className={styles.buttonLabel}>New plan</span>
                    </Button>
                )}
                <Button href={TABULARIS.download} size="sm" className={styles.button} title="Get Tabularis">
                    <DownloadIcon size={16} aria-hidden="true" />
                    <span className={styles.buttonLabel}>Get Tabularis</span>
                </Button>
            </nav>
        </header>
    );
}
