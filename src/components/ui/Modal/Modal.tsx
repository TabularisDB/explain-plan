import {X} from 'lucide-react';
import {useEffect, useId, useRef, type KeyboardEvent, type ReactNode} from 'react';
import styles from './Modal.module.scss';

const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])';

interface ModalProps {
    title: string;
    icon?: ReactNode;
    footer?: ReactNode;
    onClose: () => void;
    children: ReactNode;
}

export function Modal({title, icon, footer, onClose, children}: ModalProps) {
    const titleId = useId();
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        modalRef.current?.focus();
        return () => {
            if (previous?.isConnected) previous.focus();
        };
    }, []);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const modal = modalRef.current;
        if (!modal || !modal.contains(event.target as Node) || modal.querySelector('[aria-expanded="true"]')) return;

        if (event.key === 'Escape') {
            event.stopPropagation();
            onClose();
            return;
        }
        if (event.key !== 'Tab') return;

        const items = [...modal.querySelectorAll<HTMLElement>(FOCUSABLE)];
        if (items.length === 0) return;
        event.preventDefault();
        const index = items.indexOf(document.activeElement as HTMLElement);
        const next = event.shiftKey ? (index <= 0 ? items.length - 1 : index - 1) : (index + 1) % items.length;
        items[next].focus();
    };

    return (
        <div
            className={styles.modalBackdrop}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={styles.modal}
                onKeyDown={handleKeyDown}
            >
                <header className={styles.modalHeader}>
                    <div className={styles.modalHeading}>
                        {icon}
                        <h2 id={titleId} className={styles.modalTitle}>
                            {title}
                        </h2>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close" className={styles.modalClose}>
                        <X size={16} aria-hidden="true" />
                    </button>
                </header>

                <div className={styles.modalBody}>{children}</div>

                {footer && <footer className={styles.modalFooter}>{footer}</footer>}
            </div>
        </div>
    );
}
