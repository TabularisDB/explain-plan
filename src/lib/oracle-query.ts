/**
 * SQL that turns the latest `EXPLAIN PLAN FOR …` rows in PLAN_TABLE into the
 * `oracle-plan-json` document read by `@tabularis/explain-oracle` (the same
 * payload the Tabularis Oracle plugin captures). Needs Oracle 12.2+ for the
 * SQL/JSON functions; `NULL ON NULL` keeps every column key, which the
 * parser's format sniffer relies on.
 */
export const ORACLE_PLAN_QUERY = `EXPLAIN PLAN FOR SELECT …;

SELECT JSON_OBJECT(
  'version' VALUE 1,
  'statistics' VALUE 'false' FORMAT JSON,
  'plan' VALUE JSON_ARRAYAGG(JSON_OBJECT(
    'id' VALUE id, 'parent_id' VALUE parent_id, 'depth' VALUE depth,
    'position' VALUE position, 'operation' VALUE operation,
    'options' VALUE options, 'object_owner' VALUE object_owner,
    'object_name' VALUE object_name, 'object_alias' VALUE object_alias,
    'object_type' VALUE object_type, 'optimizer' VALUE optimizer,
    'cost' VALUE cost, 'cardinality' VALUE cardinality, 'bytes' VALUE bytes,
    'cpu_cost' VALUE cpu_cost, 'io_cost' VALUE io_cost, 'time' VALUE time,
    'access_predicates' VALUE access_predicates,
    'filter_predicates' VALUE filter_predicates,
    'projection' VALUE projection, 'qblock_name' VALUE qblock_name
    NULL ON NULL RETURNING CLOB)
    ORDER BY id RETURNING CLOB)
  RETURNING CLOB)
FROM plan_table
WHERE plan_id = (SELECT MAX(plan_id) FROM plan_table);`;
