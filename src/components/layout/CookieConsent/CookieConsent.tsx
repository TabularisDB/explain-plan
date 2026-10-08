import {useEffect, useState} from 'react';
import clsx from 'clsx';
import {ArrowRight, CheckIcon, XIcon} from 'lucide-react';
import {TABULARIS} from '../../../lib/links/links';
import {Button} from '../../ui/Button/Button';
import styles from './CookieConsent.module.scss';

type CookiePrefs = {
    necessary: true;
    measurement: boolean;
};

type MatomoWindow = Window & {
    _paq?: unknown[][];
    __matomoLoaded?: boolean;
};

const STORAGE_KEY = 'tabularis-cookie-consent';
const MATOMO_URL = '//analytics.debbaweb.it/';
const MATOMO_SITE_ID = '6';

function initMatomo(cookieConsent: boolean) {
    const w = window as MatomoWindow;
    const _paq = (w._paq = w._paq || []);

    if (w.__matomoLoaded) {
        if (cookieConsent) {
            _paq.push(['setCookieConsentGiven']);
        } else {
            _paq.push(['forgetCookieConsentGiven']);
            _paq.push(['disableCookies']);
        }
        return;
    }

    w.__matomoLoaded = true;
    _paq.push(cookieConsent ? ['setCookieConsentGiven'] : ['disableCookies']);
    _paq.push(['setTrackerUrl', MATOMO_URL + 'matomo.php']);
    _paq.push(['setSiteId', MATOMO_SITE_ID]);
    _paq.push(['discardHashTag', true]);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);

    const script = document.createElement('script');
    script.async = true;
    script.src = MATOMO_URL + 'matomo.js';
    document.head.appendChild(script);
}

function readPrefs(): CookiePrefs | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as CookiePrefs) : null;
    } catch {
        return null;
    }
}

function writePrefs(prefs: CookiePrefs) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
        return;
    }
}

export function CookieConsent() {
    const [visible, setVisible] = useState(false);
    const [measurement, setMeasurement] = useState(false);
    const [showDetailedView, setShowDetailedView] = useState(false);

    useEffect(() => {
        const prefs = readPrefs();

        if (prefs) {
            setMeasurement(prefs.measurement);
            initMatomo(prefs.measurement);
        } else {
            initMatomo(false);
            setVisible(true);
        }

        function handleManage() {
            const saved = readPrefs();
            setShowDetailedView(saved !== null);
            if (saved) setMeasurement(saved.measurement);
            setVisible(true);
        }

        window.addEventListener('tabularis:manage-cookies', handleManage);
        return () => window.removeEventListener('tabularis:manage-cookies', handleManage);
    }, []);

    function save(measurementValue: boolean) {
        writePrefs({necessary: true, measurement: measurementValue});
        setMeasurement(measurementValue);
        setVisible(false);
        initMatomo(measurementValue);
    }

    if (!visible) return null;

    return (
        <div className={styles.cookieModal} role="dialog" aria-labelledby="cookie-title">
            <h3 id="cookie-title" className={styles.title}>
                {showDetailedView ? 'Customize your preferences' : 'Can we use cookies?'}
            </h3>

            {showDetailedView ? (
                <div className={styles.preferences}>
                    <div className={styles.cookieRow}>
                        <span className={styles.cookieLabel}>Necessary</span>
                        <span
                            className={clsx(styles.cookieToggle, styles.cookieToggleOn, styles.cookieToggleLocked)}
                            title="Necessary cookies are always active"
                        >
                            <span className={styles.cookieToggleThumb} />
                        </span>
                    </div>

                    <div className={styles.cookieRow}>
                        <span className={styles.cookieLabel}>Measurement</span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={measurement}
                            aria-label="Measurement cookies"
                            className={clsx(styles.cookieToggle, measurement && styles.cookieToggleOn)}
                            onClick={() => setMeasurement((value) => !value)}
                        >
                            <span className={styles.cookieToggleThumb} />
                        </button>
                    </div>
                </div>
            ) : (
                <p className={styles.description}>
                    Tabularis uses cookies to improve your experience and for analytics.{' '}
                    <a href={TABULARIS.cookiePolicy} target="_blank" rel="noopener noreferrer">
                        Read our cookie policy
                    </a>{' '}
                    for more details.
                </p>
            )}

            <div className={styles.actions}>
                {showDetailedView ? (
                    <Button className={styles.button} onClick={() => save(measurement)}>
                        Save preferences <CheckIcon size={14} />
                    </Button>
                ) : (
                    <>
                        <Button className={styles.button} onClick={() => save(true)}>
                            Yes <CheckIcon size={14} />
                        </Button>
                        <Button className={styles.button} onClick={() => save(false)}>
                            No <XIcon size={14} />
                        </Button>
                    </>
                )}
            </div>

            {showDetailedView ? (
                <button type="button" className={styles.linkButton} onClick={() => setVisible(false)}>
                    Close <XIcon size={14} />
                </button>
            ) : (
                <button type="button" className={styles.linkButton} onClick={() => setShowDetailedView(true)}>
                    Customize <ArrowRight size={14} />
                </button>
            )}
        </div>
    );
}
