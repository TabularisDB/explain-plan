import {DownloadIcon, Link2, RotateCcwIcon} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {TABULARIS} from '../../../lib/links/links';
import {Button} from '../../ui/Button/Button';
import styles from './Header.module.scss';
import {ShareModal} from './ShareModal/ShareModal';

interface HeaderProps {
    isHomePage?: boolean;
    shareable?: boolean;
}

export function Header({isHomePage = true, shareable = false}: HeaderProps) {
    const {hash} = useLocation();
    const [shareOpen, setShareOpen] = useState(false);
    const [shareLink, setShareLink] = useState<string | null>(null);

    useEffect(() => {
        setShareLink(hash.startsWith('#s=') ? `${window.location.origin}/plan${hash}` : null);
    }, [hash]);

    return (
        <header className={styles.header}>
            <Link to="/" className={styles.logo}>
                <img src="/tabularis-logo.svg" alt="" width={32} height={32} />
                <span>Explain Plan</span>
            </Link>
            <nav className={styles.links}>
                {!isHomePage && shareable && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className={styles.button}
                        title="Share this plan"
                        aria-haspopup="dialog"
                        onClick={() => setShareOpen(true)}
                    >
                        <Link2 size={16} aria-hidden="true" />
                        <span className={styles.buttonLabel}>Share</span>
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

            {shareOpen && (
                <ShareModal link={shareLink} onLinkCreated={setShareLink} onClose={() => setShareOpen(false)} />
            )}
        </header>
    );
}
