import {Check, Copy, DownloadIcon, RotateCcwIcon} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {TABULARIS} from '../../../lib/links';
import {Button} from '../../ui/Button/Button';
import styles from './Header.module.scss';

interface HeaderProps {
    isHomePage?: boolean;
}

export function Header({isHomePage = true}: HeaderProps) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => setCopied(false), 1500);
        return () => clearTimeout(timer);
    }, [copied]);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    };

    return (
        <header className={styles.header}>
            <Link to="/" className={styles.logo}>
                <img src="/tabularis-logo.svg" alt="" width={24} height={24} />
                <span>Explain Plan</span>
            </Link>
            <nav className={styles.links}>
                {!isHomePage && (
                    <>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className={styles.button}
                            title="Copy a link to this plan"
                            onClick={copyLink}
                        >
                            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                            <span className={styles.buttonLabel} aria-live="polite">
                                {copied ? 'Copied' : 'Copy link'}
                            </span>
                        </Button>
                        <Button href="/" variant="secondary" size="sm" className={styles.button} title="New plan">
                            <RotateCcwIcon size={16} aria-hidden="true" />
                            <span className={styles.buttonLabel}>New plan</span>
                        </Button>
                    </>
                )}
                <Button href={TABULARIS.download} size="sm" className={styles.button} title="Get Tabularis">
                    <DownloadIcon size={16} aria-hidden="true" />
                    <span className={styles.buttonLabel}>Get Tabularis</span>
                </Button>
            </nav>
        </header>
    );
}
