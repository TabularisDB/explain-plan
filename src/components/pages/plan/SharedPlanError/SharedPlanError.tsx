import {Link2Off, RotateCcwIcon} from 'lucide-react';
import {Button} from '../../../ui/Button/Button';
import styles from './SharedPlanError.module.scss';

const MESSAGES = {
    invalid: {
        title: 'This link is incomplete or damaged',
        text: 'Part of it may have been lost when it was copied. Ask the person who shared it to send it again.',
    },
    missing: {
        title: 'This shared plan has expired or does not exist',
        text: 'Shared links expire 30 days after they were last opened. Ask the person who shared it for a new link.',
    },
    failed: {
        title: 'This shared plan could not be loaded',
        text: 'Check your connection, then reload the page.',
    },
};

interface SharedPlanErrorProps {
    reason: keyof typeof MESSAGES;
}

export function SharedPlanError({reason}: SharedPlanErrorProps) {
    const {title, text} = MESSAGES[reason];

    return (
        <div className={styles.sharedPlanError}>
            <Link2Off size={44} className={styles.sharedPlanErrorIcon} aria-hidden="true" />
            <h1 className={styles.sharedPlanErrorTitle}>{title}</h1>
            <p className={styles.sharedPlanErrorText}>{text}</p>
            <Button href="/" size="sm">
                <RotateCcwIcon size={16} aria-hidden="true" />
                New plan
            </Button>
        </div>
    );
}
