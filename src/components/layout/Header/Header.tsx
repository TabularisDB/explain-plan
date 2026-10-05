import {DownloadIcon, RotateCcwIcon} from 'lucide-react';
import {Link} from 'react-router-dom';
import {TABULARIS} from '../../../lib/links';
import {Button} from '../../ui/Button/Button';
import styles from './Header.module.scss';

interface HeaderProps {
    isHomePage?: boolean;
}

export function Header({isHomePage = true}: HeaderProps) {
    return (
        <header className={styles.header}>
            <Link to="/" className={styles.logo}>
                <img src="/tabularis-logo.svg" alt="" width={24} height={24} />
                <span>Explain Plan</span>
            </Link>
            <nav className={styles.links}>
                {!isHomePage && (
                    <Button href="/" variant="secondary" size="sm" className={styles.button} title="New plan">
                        <RotateCcwIcon size={16} aria-hidden="true" />
                        <span className={styles.buttonLabel}>New plan</span>
                    </Button>
                )}
                <Button href={TABULARIS.site} size="sm" className={styles.button} title="Get Tabularis">
                    <DownloadIcon size={16} aria-hidden="true" />
                    <span className={styles.buttonLabel}>Get Tabularis</span>
                </Button>
            </nav>
        </header>
    );
}
