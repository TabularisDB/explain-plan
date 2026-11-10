export const ENGINE_LABELS = {
    postgres: 'PostgreSQL',
    mysql: 'MySQL / MariaDB',
    sqlite: 'SQLite',
    sqlserver: 'SQL Server',
    oracle: 'Oracle',
    db2: 'Db2',
} as const;

export type Engine = keyof typeof ENGINE_LABELS;

export type EngineChoice = Engine | 'auto';

export const ENGINES = Object.keys(ENGINE_LABELS) as Engine[];

export const ENGINE_OPTIONS: Array<{value: EngineChoice; label: string}> = [
    {value: 'auto', label: 'Auto-detect'},
    ...ENGINES.map((value) => ({value, label: ENGINE_LABELS[value]})),
];

export const engineIconPath = (engine: Engine): string =>
    `/img/engines/${engine}.${engine === 'db2' ? 'png' : 'svg'}`;
