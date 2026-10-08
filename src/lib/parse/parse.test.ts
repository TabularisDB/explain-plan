import {getExplainParser} from '@tabularis/explain';
import {describe, expect, it} from 'vitest';
import {SAMPLES} from '../../samples';
import ORACLE_PLAN_TABLE_ESTIMATED from '../../test/fixtures/oracle-plan-table-estimated.json?raw';
import SQLSERVER_TRIVIAL_SCAN from '../../test/fixtures/sqlserver-trivial-scan.xml?raw';
import {detectEngine, parsePlan} from './parse';

const sample = (engine: string) => SAMPLES.find((candidate) => candidate.engine === engine)!.text;

describe('SQL Server parser registration', () => {
    it('registers SHOWPLAN XML before application parsing starts', () => {
        const parser = getExplainParser('sqlserver-showplan-xml');
        expect(parser).toMatchObject({
            engine: 'sqlserver',
            label: 'SQL Server SHOWPLAN XML',
        });
        expect(parser?.parse).toBeTypeOf('function');
        expect(parser?.sniff?.(sample('sqlserver'))).toBe(true);
    });
});

describe('Oracle parser registration', () => {
    it('registers oracle-plan-json before application parsing starts', () => {
        const parser = getExplainParser('oracle-plan-json');
        expect(parser).toMatchObject({engine: 'oracle'});
        expect(parser?.parse).toBeTypeOf('function');
        expect(parser?.sniff?.(sample('oracle'))).toBe(true);
    });
});

describe('parsePlan', () => {
    it('parses the PostgreSQL sample with its engine hint', () => {
        const plan = parsePlan(sample('postgres'), 'postgres');
        expect(plan.root.node_type).toBe('Hash Join');
        expect(plan.has_analyze_data).toBe(true);
        expect(plan.planning_time_ms).toBeCloseTo(0.485);
        expect(plan.execution_time_ms).toBeCloseTo(7.481);
        expect(plan.root.children.length).toBeGreaterThan(0);
    });

    it('parses the MySQL sample with its engine hint', () => {
        const plan = parsePlan(sample('mysql'), 'mysql');
        expect(plan.driver).toBe('mysql');
        expect(plan.root.children.length).toBeGreaterThan(0);
        const flat = JSON.stringify(plan.root);
        expect(flat).toContain('customers');
        expect(flat).toContain('orders');
    });

    it('parses the SQLite sample with its engine hint', () => {
        const plan = parsePlan(sample('sqlite'), 'sqlite');
        expect(plan.driver).toBe('sqlite');
        const details = plan.root.children.map((child) => child.node_type);
        expect(details).toContain('Scan');
        expect(details).toContain('Search');
    });

    it('parses the SQL Server STATISTICS XML sample with its engine hint', () => {
        const plan = parsePlan(sample('sqlserver'), 'sqlserver');
        expect(plan.driver).toBe('sqlserver');
        expect(plan.root.node_type).toBe('Top');
        expect(plan.root.actual_rows).toBe(50);
        expect(plan.root.actual_time_ms).toBe(11);
        expect(plan.execution_time_ms).toBe(11);
        expect(plan.has_analyze_data).toBe(true);

        const walk = (node: typeof plan.root): string[] => [node.node_type, ...node.children.flatMap(walk)];
        expect(walk(plan.root)).toEqual([
            'Top',
            'Sort',
            'Compute Scalar',
            'Hash Match',
            'Nested Loops',
            'Index Seek',
            'Index Seek',
        ]);

        const join = plan.root.children[0].children[0].children[0].children[0];
        expect(join.join_type).toBe('Inner Join');
        const [customers, orders] = join.children;
        expect(customers.relation).toBe('customers');
        expect(orders.relation).toBe('orders');
        expect(orders.actual_loops).toBe(412);
        expect(orders.actual_rows).toBe(2137);
    });

    it('keeps estimated-only SQL Server plans free of invented timings', () => {
        const plan = parsePlan(SQLSERVER_TRIVIAL_SCAN, 'sqlserver');
        expect(plan.root.node_type).toBe('Table Scan');
        expect(plan.root.actual_rows).toBeNull();
        expect(plan.root.actual_time_ms).toBeNull();
        expect(plan.execution_time_ms).toBeNull();
        expect(plan.has_analyze_data).toBe(false);
    });

    it('parses the Oracle analyzed sample with its engine hint', () => {
        const plan = parsePlan(sample('oracle'), 'oracle');
        expect(plan.driver).toBe('oracle');
        expect(plan.root.node_type).toBe('SELECT STATEMENT');
        expect(plan.has_analyze_data).toBe(true);
        expect(plan.execution_time_ms).toBeCloseTo(0.433);

        const walk = (node: typeof plan.root): string[] => [node.node_type, ...node.children.flatMap(walk)];
        expect(walk(plan.root)).toEqual([
            'SELECT STATEMENT',
            'SORT GROUP BY NOSORT',
            'HASH JOIN',
            'HASH JOIN',
            'TABLE ACCESS FULL',
            'TABLE ACCESS FULL',
            'TABLE ACCESS FULL',
        ]);
        const customers = plan.root.children[0].children[0].children[0].children[0];
        expect(customers.relation).toBe('CUSTOMERS');
        expect(customers.filter).toBe(`"C"."REGION"='West'`);
    });

    it('parses the output of the documented PLAN_TABLE query', () => {
        const plan = parsePlan(ORACLE_PLAN_TABLE_ESTIMATED, 'auto');
        expect(plan.driver).toBe('oracle');
        expect(plan.root.node_type).toBe('SELECT STATEMENT');
        expect(plan.root.total_cost).toBe(3);
        expect(plan.has_analyze_data).toBe(false);
        expect(plan.execution_time_ms).toBeNull();
    });

    it("auto-detects each sample's engine", () => {
        expect(parsePlan(sample('postgres'), 'auto').root.node_type).toBe('Hash Join');
        expect(parsePlan(sample('mysql'), 'auto').driver).toBe('mysql');
        expect(parsePlan(sample('sqlite'), 'auto').driver).toBe('sqlite');
        expect(parsePlan(sample('sqlserver'), 'auto').driver).toBe('sqlserver');
        expect(parsePlan(sample('oracle'), 'auto').driver).toBe('oracle');
    });

    it('parses Postgres EXPLAIN (FORMAT JSON) output', () => {
        const json = JSON.stringify([
            {
                Plan: {
                    'Node Type': 'Seq Scan',
                    'Relation Name': 'users',
                    'Startup Cost': 0,
                    'Total Cost': 155.0,
                    'Plan Rows': 10000,
                    'Plan Width': 4,
                },
                'Planning Time': 0.1,
            },
        ]);
        const plan = parsePlan(json, 'auto');
        expect(plan.root.node_type).toBe('Seq Scan');
        expect(plan.root.relation).toBe('users');
    });

    it('rejects empty input', () => {
        expect(() => parsePlan('   ', 'auto')).toThrow(/Paste an EXPLAIN/);
    });

    it('explains what to do when nothing matches', () => {
        expect(() => parsePlan('not a plan at all', 'auto')).toThrow(/Could not detect/);
    });
});

describe('detectEngine', () => {
    it('detects the engine of each sample', () => {
        for (const {engine, text} of SAMPLES) {
            expect(detectEngine(text)).toBe(engine);
        }
    });

    it('returns null for empty or unknown input', () => {
        expect(detectEngine('   ')).toBeNull();
        expect(detectEngine('not a plan at all')).toBeNull();
    });
});
