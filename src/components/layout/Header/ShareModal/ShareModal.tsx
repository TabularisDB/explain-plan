import {Check, Clock, Copy, Link2, LoaderCircle, Lock, RotateCw, Users, type LucideIcon} from 'lucide-react';
import {useEffect, useState} from 'react';
import {createShortLink} from '../../../../lib/share/share';
import {Button} from '../../../ui/Button/Button';
import {Modal} from '../../../ui/Modal/Modal';
import styles from './ShareModal.module.scss';

type ShareStatus = 'idle' | 'creating' | 'copied' | 'failed';

const FACTS = [
    {
        icon: Lock,
        text: 'The plan is encrypted in your browser before it is sent. The key exists only in the link, so we cannot read it.',
    },
    {icon: Clock, text: 'The link works for 30 days. After that, the encrypted plan is deleted.'},
    {icon: Users, text: 'Anyone with the link can open the plan, without an account.'},
];

const BUTTON_LABEL: Record<ShareStatus, string> = {
    idle: 'Copy link',
    creating: 'Creating link',
    copied: 'Copied',
    failed: 'Try again',
};

const BUTTON_ICON: Record<ShareStatus, LucideIcon> = {
    idle: Copy,
    creating: LoaderCircle,
    copied: Check,
    failed: RotateCw,
};

async function copyToClipboard(link: Promise<string>) {
    if (typeof ClipboardItem === 'undefined') {
        await navigator.clipboard.writeText(await link);
        return;
    }
    const blob = link.then((text) => new Blob([text], {type: 'text/plain'}));
    await navigator.clipboard.write([new ClipboardItem({'text/plain': blob})]);
}

interface ShareModalProps {
    link: string | null;
    onLinkCreated: (link: string) => void;
    onClose: () => void;
}

export function ShareModal({link, onLinkCreated, onClose}: ShareModalProps) {
    const [status, setStatus] = useState<ShareStatus>('idle');

    useEffect(() => {
        if (status !== 'copied') return;
        const timer = setTimeout(() => setStatus('idle'), 2000);
        return () => clearTimeout(timer);
    }, [status]);

    const copyLink = async () => {
        if (status === 'creating') return;
        if (!link) setStatus('creating');

        const pending = link ? Promise.resolve(link) : createShortLink();
        const copied = copyToClipboard(pending).then(
            () => true,
            () => false,
        );
        try {
            const value = await pending;
            if (!link) onLinkCreated(value);
            setStatus((await copied) ? 'copied' : 'failed');
        } catch {
            setStatus('failed');
        }
    };

    const StatusIcon = BUTTON_ICON[status];

    return (
        <Modal title="Share this plan" icon={<Link2 size={20} aria-hidden="true" />} onClose={onClose}>
            <ul className={styles.shareFacts}>
                {FACTS.map(({icon: Icon, text}) => (
                    <li key={text}>
                        <Icon size={14} aria-hidden="true" />
                        {text}
                    </li>
                ))}
            </ul>

            <Button size="sm" onClick={copyLink} aria-disabled={status === 'creating'} className={styles.shareButton}>
                <StatusIcon
                    size={14}
                    className={status === 'creating' ? styles.shareSpinner : undefined}
                    aria-hidden="true"
                />
                <span aria-live="polite">{BUTTON_LABEL[status]}</span>
            </Button>

            {status === 'failed' && (
                <p className={styles.shareError} role="alert">
                    The link could not be copied. Check your connection and try again.
                </p>
            )}
        </Modal>
    );
}
