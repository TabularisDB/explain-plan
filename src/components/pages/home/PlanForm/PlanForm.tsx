import clsx from 'clsx';
import {AlertCircleIcon, FileCode, FileUp, Play, TrashIcon, Upload} from 'lucide-react';
import {
    useEffect,
    useState,
    type ClipboardEvent,
    type DragEvent,
    type FormEvent,
    type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {useDropzone} from 'react-dropzone';
import Editor from 'react-simple-code-editor';
import {formatPlan, highlightPlan} from '../../../../lib/format/format';
import {ENGINE_OPTIONS, type EngineChoice} from '../../../../lib/engines/engines';
import {detectEngine, parsePlan} from '../../../../lib/parse/parse';
import {
    MAX_PLAN_FILE_SIZE,
    PLAN_FILE_ACCEPT,
    planFileErrorMessage,
    readPlanFile,
} from '../../../../lib/plan-file/plan-file';
import {SAMPLES} from '../../../../samples';
import {Button} from '../../../ui/Button/Button';
import {Dropdown} from '../../../ui/Dropdown/Dropdown';
import {EngineIcon} from '../../../ui/EngineIcon/EngineIcon';
import styles from './PlanForm.module.scss';

const PLACEHOLDER = 'Paste your EXPLAIN output here, drop a file, or load a sample…';

const DETECT_DELAY = 300;

const engineLabel = (value: EngineChoice) =>
    ENGINE_OPTIONS.find((option) => option.value === value)?.label ?? 'Auto-detect';

const SAMPLE_OPTIONS = SAMPLES.map((item) => ({value: item.engine, label: item.label}));

interface PlanFormProps {
    engine: EngineChoice;
    onEngineChange: (engine: EngineChoice) => void;
    onPlan: (raw: string, engine: EngineChoice) => void;
}

const letTextDragThrough = (event: DragEvent<HTMLElement>) => {
    if (!event.dataTransfer.types.includes('Files')) event.stopPropagation();
};

export function PlanForm({engine, onEngineChange, onPlan}: PlanFormProps) {
    const [raw, setRaw] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [detected, setDetected] = useState<EngineChoice | null>(null);

    useEffect(() => {
        if (engine !== 'auto') return;
        const timer = setTimeout(() => setDetected(detectEngine(raw)), DETECT_DELAY);
        return () => clearTimeout(timer);
    }, [raw, engine]);

    const shownEngine = engine === 'auto' && detected ? detected : engine;
    const engineButtonLabel = engine === 'auto' && detected ? `Auto · ${engineLabel(detected)}` : engineLabel(engine);

    const updateContent = (value: string) => {
        setRaw(value);
        setError(null);
    };

    const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
        accept: PLAN_FILE_ACCEPT,
        maxSize: MAX_PLAN_FILE_SIZE,
        multiple: false,
        noClick: true,
        noKeyboard: true,
        getErrorMessage: planFileErrorMessage,
        onDropAccepted: async ([file]) => {
            try {
                updateContent(formatPlan(await readPlanFile(file)));
            } catch {
                setError('This file could not be read.');
            }
        },
        onDropRejected: ([rejection]) => {
            setError(rejection?.errors[0]?.message ?? 'This file could not be loaded.');
        },
    });

    const loadSample = (value: EngineChoice) => {
        const picked = SAMPLES.find((item) => item.engine === value);
        if (!picked) return;
        updateContent(formatPlan(picked.text));
        onEngineChange(picked.engine);
    };

    const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
        const target = event.target;
        if (!(target instanceof HTMLTextAreaElement) || event.clipboardData.files.length > 0) return;
        event.preventDefault();
        const formatted = formatPlan(event.clipboardData.getData('text'));
        const {selectionStart, selectionEnd, value} = target;
        updateContent(value.slice(0, selectionStart) + formatted + value.slice(selectionEnd));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            parsePlan(raw, engine);
            onPlan(raw, engine);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLFormElement>) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            event.currentTarget.requestSubmit();
        }
    };

    return (
        <div
            {...getRootProps({
                onDragOver: letTextDragThrough,
                onDrop: letTextDragThrough,
                className: clsx(styles.form, isDragActive && styles.dragging),
            })}
        >
            <input {...getInputProps()} />

            {isDragActive && (
                <div className={styles.dropOverlay} aria-hidden="true">
                    <FileUp size={22} />
                    Drop your EXPLAIN file
                </div>
            )}

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className={styles.formContent}>
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
                    <div className={styles.tools}>
                        <Dropdown
                            icon={<EngineIcon engine={shownEngine} />}
                            label={engineButtonLabel}
                            heading="Database engine"
                            options={ENGINE_OPTIONS}
                            selected={engine}
                            onSelect={onEngineChange}
                            renderOptionIcon={(value) => <EngineIcon engine={value} size={14} />}
                            triggerClassName={styles.toolButton}
                        />
                        <Dropdown
                            icon={<FileCode size={15} aria-hidden="true" />}
                            label="Load sample"
                            options={SAMPLE_OPTIONS}
                            onSelect={loadSample}
                            renderOptionIcon={(value) => <EngineIcon engine={value} size={14} />}
                            triggerClassName={styles.toolButton}
                        />
                    </div>

                    <div className={styles.actions}>
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            aria-label="Clear"
                            title="Clear"
                            disabled={!raw && !error}
                            onClick={() => updateContent('')}
                        >
                            <TrashIcon size={16} aria-hidden="true" />
                        </Button>
                        <Button
                            type="button"
                            onClick={open}
                            size="sm"
                            variant="secondary"
                            aria-label="Upload a file"
                            title="Upload a file"
                        >
                            <Upload size={16} aria-hidden="true" />
                        </Button>
                        <Button type="submit" size="sm" aria-keyshortcuts="Control+Enter Meta+Enter">
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
        </div>
    );
}
