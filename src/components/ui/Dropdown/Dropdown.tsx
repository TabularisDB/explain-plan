import clsx from 'clsx';
import {Check} from 'lucide-react';
import {useEffect, useRef, useState, type ReactNode} from 'react';
import styles from './Dropdown.module.scss';

const MENU_MAX_HEIGHT = 16 * 18;

export interface DropdownOption<T extends string> {
    value: T;
    label: string;
}

interface DropdownProps<T extends string> {
    icon: ReactNode;
    label: string;
    heading?: string;
    options: DropdownOption<T>[];
    selected?: T;
    onSelect: (value: T) => void;
    renderOptionIcon?: (value: T) => ReactNode;
    triggerClassName?: string;
}

export function Dropdown<T extends string>({
    icon,
    label,
    heading,
    options,
    selected,
    onSelect,
    renderOptionIcon,
    triggerClassName,
}: DropdownProps<T>) {
    const [open, setOpen] = useState(false);
    const [openUp, setOpenUp] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const close = (event: Event) => {
            if (
                event instanceof KeyboardEvent
                    ? event.key === 'Escape'
                    : !wrapperRef.current?.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('pointerdown', close);
        document.addEventListener('keydown', close);
        return () => {
            document.removeEventListener('pointerdown', close);
            document.removeEventListener('keydown', close);
        };
    }, [open]);

    const toggle = (trigger: HTMLElement) => {
        if (open) return setOpen(false);
        const {top, bottom} = trigger.getBoundingClientRect();
        const spaceBelow = window.innerHeight - bottom;
        setOpenUp(spaceBelow < MENU_MAX_HEIGHT && top > spaceBelow);
        setOpen(true);
    };

    return (
        <div ref={wrapperRef} className={styles.dropdown}>
            <button
                type="button"
                className={clsx(styles.dropdownTrigger, triggerClassName)}
                aria-expanded={open}
                onClick={(event) => toggle(event.currentTarget)}
            >
                {icon}
                {label}
            </button>

            {open && (
                <div className={clsx(styles.dropdownMenu, openUp && styles.dropdownMenuUp)}>
                    {heading && <span className={styles.dropdownHeading}>{heading}</span>}
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={clsx(
                                styles.dropdownItem,
                                option.value === selected && styles.dropdownItemSelected,
                            )}
                            onClick={() => {
                                onSelect(option.value);
                                setOpen(false);
                            }}
                        >
                            <span className={styles.dropdownItemLabel}>
                                {renderOptionIcon?.(option.value)}
                                {option.label}
                            </span>
                            {option.value === selected && <Check size={14} aria-hidden="true" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
