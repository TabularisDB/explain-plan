import {TABULARIS} from '../../../lib/links/links';
import {ShareLinks} from '../../ui/ShareLinks/ShareLinks';
import styles from './Footer.module.scss';

const FOOTER_COLUMNS = [
    {
        title: 'Explain Plan',
        links: [
            {label: 'Documentation', href: TABULARIS.visualExplainWiki},
            {label: 'Discover the package', href: TABULARIS.npmPackage},
        ],
    },
    {
        title: 'Tabularis',
        links: [
            {label: 'Visit Website', href: TABULARIS.site},
            {label: 'Download', href: TABULARIS.download},
            {label: 'GitHub', href: TABULARIS.github},
        ],
    },
];

export function Footer() {
    return (
        <footer className={styles.footerWrapper}>
            <div className={styles.footerContent}>
                <div className={styles.footerBrand}>
                    <a href="/" className={styles.brand}>
                        <img src="/tabularis-logo.svg" alt="" width={32} height={32} />
                        <span>Explain Plan</span>
                    </a>
                    <span className={styles.footerBrandTagline}>
                        Free online EXPLAIN plan visualizer. Nothing leaves your browser.
                    </span>
                    <p className={styles.poweredBy}>
                        Powered by{' '}
                        <a href={TABULARIS.npmPackage} target="_blank" rel="noopener noreferrer">
                            @tabularis/explain
                        </a>
                        , the engine behind the{' '}
                        <a href={TABULARIS.visualExplain} target="_blank" rel="noopener noreferrer">
                            Visual EXPLAIN
                        </a>{' '}
                        feature of{' '}
                        <a href={TABULARIS.site} target="_blank" rel="noopener noreferrer">
                            Tabularis
                        </a>
                        .
                    </p>
                    <nav className={styles.footerSocial} aria-label="Share links">
                        <ShareLinks linkClassName={styles.socialLink} />
                    </nav>
                </div>

                <div className={styles.footerColumns}>
                    {FOOTER_COLUMNS.map((column) => (
                        <div key={column.title} className={styles.footerColumn}>
                            <span className={styles.columnTitle}>{column.title}</span>
                            {column.links.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.footerLink}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.footerBottom}>
                <p className={styles.footerCopyrights}>
                    &copy; {new Date().getFullYear()} Tabularis Project. Crafted by{' '}
                    <a href="https://github.com/debba" target="_blank" rel="noopener noreferrer">
                        Debba
                    </a>
                    . Site built by{' '}
                    <a href="https://github.com/wajrock" target="_blank" rel="noopener noreferrer">
                        Thibaud Wajrock
                    </a>
                    .
                </p>
                <p className={styles.footerLinksBottom}>
                    <a href={TABULARIS.cookiePolicy} target="_blank" rel="noopener noreferrer">
                        Cookie Policy
                    </a>
                    <button
                        type="button"
                        className={styles.manageCookiesButton}
                        onClick={() => window.dispatchEvent(new Event('tabularis:manage-cookies'))}
                    >
                        Cookies Preferences
                    </button>
                </p>
            </div>
        </footer>
    );
}
