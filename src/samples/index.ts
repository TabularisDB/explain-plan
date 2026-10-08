import type {Engine} from '../lib/engines/engines';
import MYSQL_SAMPLE from './mysql-filesort-join.json?raw';
import ORACLE_SAMPLE from './oracle-hash-join-analyzed.json?raw';
import POSTGRES_SAMPLE from './postgres-hash-join.txt?raw';
import SQLITE_SAMPLE from './sqlite-temp-btree.txt?raw';
import SQLSERVER_SAMPLE from './sqlserver-statistics.xml?raw';

export interface SamplePlan {
    engine: Engine;
    label: string;
    text: string;
}

export const SAMPLES: SamplePlan[] = [
    {engine: 'postgres', label: 'PostgreSQL sample', text: POSTGRES_SAMPLE.trimEnd()},
    {engine: 'mysql', label: 'MySQL sample', text: MYSQL_SAMPLE.trim()},
    {engine: 'sqlite', label: 'SQLite sample', text: SQLITE_SAMPLE.trim()},
    {engine: 'sqlserver', label: 'SQL Server sample', text: SQLSERVER_SAMPLE.trim()},
    {engine: 'oracle', label: 'Oracle sample', text: ORACLE_SAMPLE.trim()},
];