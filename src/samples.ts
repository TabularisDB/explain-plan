import type { EngineChoice } from "./lib/parse";

export interface SamplePlan {
  engine: Exclude<EngineChoice, "auto">;
  label: string;
  text: string;
}

const POSTGRES_SAMPLE = `                                                        QUERY PLAN
---------------------------------------------------------------------------------------------------------------------------
 Hash Join  (cost=230.47..713.98 rows=101 width=488) (actual time=3.049..7.328 rows=100 loops=1)
   Hash Cond: (t.tenthous = s.tenthous)
   Buffers: shared hit=345
   ->  Seq Scan on tenk1 t  (cost=0.00..445.00 rows=10000 width=244) (actual time=0.012..2.501 rows=10000 loops=1)
         Buffers: shared hit=245
   ->  Hash  (cost=229.20..229.20 rows=101 width=244) (actual time=2.985..2.986 rows=100 loops=1)
         Buckets: 1024  Batches: 1  Memory Usage: 35kB
         ->  Bitmap Heap Scan on onek s  (cost=5.07..229.20 rows=101 width=244) (actual time=0.100..2.930 rows=100 loops=1)
               Recheck Cond: (unique1 < 100)
               Heap Blocks: exact=90
               ->  Bitmap Index Scan on onek_unique1  (cost=0.00..5.04 rows=101 width=0) (actual time=0.043..0.043 rows=100 loops=1)
                     Index Cond: (unique1 < 100)
 Planning Time: 0.485 ms
 Execution Time: 7.481 ms
(14 rows)`;

const MYSQL_SAMPLE = JSON.stringify(
  {
    query_block: {
      select_id: 1,
      cost_info: { query_cost: "846.55" },
      ordering_operation: {
        using_filesort: true,
        nested_loop: [
          {
            table: {
              table_name: "customers",
              access_type: "ALL",
              rows_examined_per_scan: 4079,
              rows_produced_per_join: 407,
              filtered: "10.00",
              cost_info: {
                read_cost: "391.86",
                eval_cost: "40.79",
                prefix_cost: "432.65",
                data_read_per_join: "127K",
              },
              used_columns: ["id", "name", "country"],
              attached_condition: "(`shop`.`customers`.`country` = 'IT')",
            },
          },
          {
            table: {
              table_name: "orders",
              access_type: "ref",
              possible_keys: ["idx_orders_customer"],
              key: "idx_orders_customer",
              used_key_parts: ["customer_id"],
              key_length: "4",
              ref: ["shop.customers.id"],
              rows_examined_per_scan: 12,
              rows_produced_per_join: 4895,
              filtered: "100.00",
              cost_info: {
                read_cost: "489.55",
                eval_cost: "48.95",
                prefix_cost: "846.55",
                data_read_per_join: "1M",
              },
              used_columns: ["id", "customer_id", "total", "created_at"],
            },
          },
        ],
      },
    },
  },
  null,
  2,
);

const SQLITE_SAMPLE = `QUERY PLAN
|--SCAN customers
|--SEARCH orders USING INDEX idx_orders_customer (customer_id=?)
\`--USE TEMP B-TREE FOR ORDER BY`;

export const SAMPLES: SamplePlan[] = [
  { engine: "postgres", label: "PostgreSQL sample", text: POSTGRES_SAMPLE },
  { engine: "mysql", label: "MySQL sample", text: MYSQL_SAMPLE },
  { engine: "sqlite", label: "SQLite sample", text: SQLITE_SAMPLE },
];
