import {DatabaseIcon} from 'lucide-react';
import styles from './EngineIcon.module.scss';
import {engineIconPath, type EngineChoice} from '../../../lib/engines/engines';

interface EngineIconProps {
    engine: EngineChoice;
    size?: number;
}

export function EngineIcon({engine, size = 15}: EngineIconProps) {
    if (engine === 'auto') return <DatabaseIcon size={size} aria-hidden="true" />;
    return <img src={engineIconPath(engine)} alt="" width={size} height={size} className={styles.engineIcon} />;
}
