import {DatabaseIcon} from 'lucide-react';
import styles from './EngineIcon.module.scss';
import {EngineChoice} from '../../../lib/parse';

interface EngineIconProps {
    engine: EngineChoice;
    size?: number;
}

export function EngineIcon({engine, size = 15}: EngineIconProps) {
    if (engine === 'auto') return <DatabaseIcon size={size} aria-hidden="true" />;
    return <img src={`/img/engines/${engine}.svg`} alt="" width={size} height={size} className={styles.engineIcon} />;
}
