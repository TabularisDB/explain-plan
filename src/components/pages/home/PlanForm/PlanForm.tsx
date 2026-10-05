import type {ExplainPlan} from '@tabularis/explain';
import clsx from 'clsx';
import {AlertCircleIcon, Check, DatabaseIcon, FileCode, Play, TrashIcon, type LucideIcon} from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import {useEffect, useRef, useState, type ClipboardEvent, type FormEvent} from 'react';
import Editor from 'react-simple-code-editor';
import styles from './PlanForm.module.scss';
import {prettifyJson, prettifyXml, EngineChoice, parsePlan, ENGINE_OPTIONS} from '../../../../lib/parse';
import {SAMPLES} from '../../../../samples';
import {Button} from '../../../ui/Button/Button';

const PLACEHOLDER =
    'Paste your EXPLAIN output here…\n\n' +
    'PostgreSQL:  EXPLAIN (ANALYZE, BUFFERS) SELECT …   or   EXPLAIN (FORMAT JSON) SELECT …\n' +
    'MySQL:       EXPLAIN FORMAT=JSON SELECT …   or   EXPLAIN ANALYZE SELECT …\n' +
    'SQLite:      EXPLAIN QUERY PLAN SELECT …\n' +
    'SQL Server:  SHOWPLAN_XML or STATISTICS XML output\n' +
    'Oracle:      PLAN_TABLE rows as JSON — select Oracle for the query';

const SAMPLE_OPTIONS = SAMPLES.map((item) => ({value: item.engine, label: item.label}));

const MENU_MAX_HEIGHT = 16 * 18;

const formatPlan = (text: string) => prettifyJson(text) ?? prettifyXml(text) ?? text;

function highlightPlan(code: string): string {
    if (/^\s*[{[]/.test(code)) return Prism.highlight(code, Prism.languages.json, 'json');
    if (/^\s*</.test(code)) return Prism.highlight(code, Prism.languages.markup, 'markup');
    return code.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

type MenuName = 'engine' | 'sample';

interface Pill {
    name: MenuName;
    icon: LucideIcon;
    label: string;
    heading?: string;
    options: {value: EngineChoice; label: string}[];
    selected?: EngineChoice;
    onSelect: (value: EngineChoice) => void;
}

interface PlanFormProps {
    engine: EngineChoice;
    onEngineChange: (engine: EngineChoice) => void;
    onPlan: (plan: ExplainPlan) => void;
}

export function PlanForm({engine, onEngineChange, onPlan}: PlanFormProps) {
    const [raw, setRaw] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [openMenu, setOpenMenu] = useState<MenuName | null>(null);
    const [openUp, setOpenUp] = useState(false);
    const pillsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!openMenu) return;
        const close = (event: Event) => {
            if (
                event instanceof KeyboardEvent
                    ? event.key === 'Escape'
                    : !pillsRef.current?.contains(event.target as Node)
            ) {
                setOpenMenu(null);
            }
        };
        document.addEventListener('pointerdown', close);
        document.addEventListener('keydown', close);
        return () => {
            document.removeEventListener('pointerdown', close);
            document.removeEventListener('keydown', close);
        };
    }, [openMenu]);

    const toggleMenu = (name: MenuName, trigger: HTMLElement) => {
        if (openMenu === name) return setOpenMenu(null);
        const {top, bottom} = trigger.getBoundingClientRect();
        const spaceBelow = window.innerHeight - bottom;
        setOpenUp(spaceBelow < MENU_MAX_HEIGHT && top > spaceBelow);
        setOpenMenu(name);
    };

    const updateContent = (value: string) => {
        setRaw(value);
        setError(null);
    };

    const loadSample = (value: EngineChoice) => {
        const picked = SAMPLES.find((item) => item.engine === value);
        if (!picked) return;
        updateContent(formatPlan(picked.text));
        onEngineChange(picked.engine);
    };

    const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
        const target = event.target;
        if (!(target instanceof HTMLTextAreaElement)) return;
        event.preventDefault();
        const formatted = formatPlan(event.clipboardData.getData('text'));
        const {selectionStart, selectionEnd, value} = target;
        updateContent(value.slice(0, selectionStart) + formatted + value.slice(selectionEnd));
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        try {
            onPlan(parsePlan(raw, engine));
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    const pills: Pill[] = [
        {
            name: 'engine',
            icon: DatabaseIcon,
            label: ENGINE_OPTIONS.find((option) => option.value === engine)?.label ?? 'Auto-detect',
            heading: 'Database engine',
            options: ENGINE_OPTIONS,
            selected: engine,
            onSelect: onEngineChange,
        },
        {
            name: 'sample',
            icon: FileCode,
            label: 'Load sample',
            options: SAMPLE_OPTIONS,
            onSelect: loadSample,
        },
    ];

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={clsx('plan-editor', styles.editor)}>
                <Editor
                    value={raw}
                    onValueChange={updateContent}
                    onPaste={handlePaste}
                    highlight={highlightPlan}
                    placeholder={PLACEHOLDER}
                    padding={0}
                    spellCheck={false}
                    textareaClassName={styles.textarea}
                />
            </div>

            <footer className={styles.footer}>
                <div ref={pillsRef} className={styles.pills}>
                    {pills.map(({name, icon: Icon, label, heading, options, selected, onSelect}) => (
                        <div key={name} className={styles.pillWrapper}>
                            <button
                                type="button"
                                className={clsx(styles.pill, openMenu === name && styles.pillActive)}
                                aria-expanded={openMenu === name}
                                onClick={(event) => toggleMenu(name, event.currentTarget)}
                            >
                                <Icon size={15} aria-hidden="true" />
                                {label}
                            </button>

                            {openMenu === name && (
                                <div className={clsx(styles.menu, openUp && styles.menuUp)}>
                                    {heading && <span className={styles.menuHeading}>{heading}</span>}
                                    {options.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            className={clsx(
                                                styles.menuItem,
                                                option.value === selected && styles.menuItemSelected,
                                            )}
                                            onClick={() => {
                                                onSelect(option.value);
                                                setOpenMenu(null);
                                            }}
                                        >
                                            {option.label}
                                            {option.value === selected && <Check size={14} aria-hidden="true" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles.actions}>
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        aria-label="Clear"
                        disabled={!raw && !error}
                        onClick={() => updateContent('')}
                    >
                        <TrashIcon size={16} aria-hidden="true" />
                    </Button>
                    <Button type="submit" size="sm">
                        <Play size={16} aria-hidden="true" />
                        Visualize plan
                    </Button>
                </div>
            </footer>

            {error && (
                <p className={styles.error} role="alert">
                    <AlertCircleIcon size={16} />
                    {error}
                </p>
            )}
        </form>
    );
}
