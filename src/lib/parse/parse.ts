import '@tabularis/explain-db2';
import '@tabularis/explain-oracle';
import '@tabularis/explain-sqlserver';
import {parseExplainFor, parseSqliteEqpRows, type ExplainPlan} from '@tabularis/explain';
import {ENGINES, type Engine, type EngineChoice} from '../engines/engines';
import {parseSqliteEqpText} from './sqlite-text';

const AUTO_ORDER: Engine[] = ['sqlserver', 'db2', 'oracle', 'postgres', 'sqlite', 'mysql'];

const looksLikeMysql = (text: string) => text.startsWith('{') || /^\s*->/m.test(text);

// Since @tabularis/explain 0.3.0 parsing is async: registered parsers may run
// in a sandboxed iframe, so every entry point returns a Promise.
async function sniffPlan(trimmed: string): Promise<{engine: Engine; plan: ExplainPlan} | null> {
    for (const engine of AUTO_ORDER) {
        if (engine === 'mysql' && !looksLikeMysql(trimmed)) continue;
        try {
            return {engine, plan: await parsePlan(trimmed, engine)};
        } catch {
            continue;
        }
    }
    return null;
}

export async function detectEngine(raw: string): Promise<Engine | null> {
    const trimmed = raw.trim();
    return trimmed ? ((await sniffPlan(trimmed))?.engine ?? null) : null;
}

export async function parsePlan(raw: string, engine: EngineChoice): Promise<ExplainPlan> {
    const trimmed = raw.trim();
    if (trimmed === '') {
        throw new Error('Paste an EXPLAIN output first.');
    }

    if (engine === 'sqlite') return parseSqliteEqpRows(parseSqliteEqpText(trimmed));
    if (engine !== 'auto') return parseExplainFor(trimmed, engine);

    const sniffed = await sniffPlan(trimmed);
    if (sniffed) return sniffed.plan;
    throw new Error(
        'Could not detect the plan format. Select the database engine explicitly ' +
            'and check that the text is unmodified EXPLAIN output.',
    );
}

export const isEngine = (value: string): value is Engine => (ENGINES as string[]).includes(value);
