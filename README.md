# Explain Plan

[![Discord](https://img.shields.io/discord/1502944695808950282?color=5865F2&logo=discord&logoColor=white)](https://discord.com/invite/K2hmhfHRSt)

A free online EXPLAIN plan visualizer: paste the EXPLAIN output of
a **PostgreSQL**, **MySQL/MariaDB**, **SQLite**, **SQL Server** or **Oracle** query and
explore it as an interactive graph, diagram, table and statistics view — with
automatic performance findings.

Everything runs in the browser. No query is ever executed and nothing is
uploaded to a server.

Built on [`@tabularis/explain`](https://www.npmjs.com/package/@tabularis/explain),
the engine behind the [Visual EXPLAIN](https://tabularis.dev/solutions/visual-explain)
feature of [Tabularis](https://tabularis.dev), and styled with the same
Tabularis dark theme.

**Discord** — [Join our Discord server](https://discord.com/invite/K2hmhfHRSt) to talk with the maintainers, share feedback, and get help from the community.

## Supported input formats

| Engine | Formats |
|---|---|
| PostgreSQL | `EXPLAIN (FORMAT JSON)`, plain `EXPLAIN` / `EXPLAIN ANALYZE` text |
| MySQL / MariaDB | `EXPLAIN FORMAT=JSON`, `EXPLAIN ANALYZE` / `ANALYZE FORMAT=TEXT` trees |
| SQLite | `EXPLAIN QUERY PLAN` — the sqlite3 shell tree (`|--` / `` `-- ``) or raw `id\|parent\|…\|detail` rows |
| SQL Server | `SHOWPLAN_XML` estimated plans and `STATISTICS XML` actual plans (`ShowPlanXML` documents) |
| Oracle | `oracle-plan-json`: `PLAN_TABLE` rows as JSON (see below), or the payload captured by the Tabularis Oracle plugin |

The engine can be selected explicitly or auto-detected from the pasted text.
SQL Server's `ShowPlanXML` root element makes its format unambiguous.

### Getting an Oracle plan

Oracle has no JSON `EXPLAIN` output, so the app reads the `PLAN_TABLE` rows as
a JSON document. Run this in SQL*Plus, SQLcl or SQL Developer (Oracle 12.2+;
in SQL*Plus run `SET LONG 1000000` first) and paste the returned value. The
same query is shown in the app when Oracle is selected
([`src/lib/oracle-query.ts`](./src/lib/oracle-query.ts)).

```sql
EXPLAIN PLAN FOR SELECT …;

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
WHERE plan_id = (SELECT MAX(plan_id) FROM plan_table);
```

## Stack

- [Vite](https://vite.dev) + [React 19](https://react.dev) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com) with the Tabularis colour tokens
- [`@tabularis/explain`](https://www.npmjs.com/package/@tabularis/explain) for parsing, analysis and the plan views
- [`@tabularis/explain-sqlserver`](https://www.npmjs.com/package/@tabularis/explain-sqlserver) for SQL Server SHOWPLAN XML
- [`@tabularis/explain-oracle`](https://www.npmjs.com/package/@tabularis/explain-oracle) for Oracle execution plans
- [Vitest](https://vitest.dev) + Testing Library for tests

## Development

```bash
pnpm install
pnpm dev        # local dev server
pnpm test       # run the test suite
pnpm typecheck  # TypeScript only
pnpm build      # typecheck + production build into dist/
pnpm preview    # serve the production build locally
```

## Customizable SEO

All SEO is driven by [`seo.config.json`](./seo.config.json) — title,
description, keywords, canonical URL, Open Graph / Twitter cards, robots,
theme colour and JSON-LD. The tags are injected into `index.html` at build
time by the `seo-inject` plugin in [`vite.config.ts`](./vite.config.ts), so
customizing the SEO never requires touching the HTML or the app code.

`seo.config.json → image` points at `/og.png`; drop a 1200×630 social card
into `public/og.png` (none is committed).

## Deploying to Vercel

The site is a fully static single-page build — Vercel auto-detects Vite with
zero configuration:

```bash
vercel deploy
```

(Framework preset: **Vite**, build command `pnpm build`, output directory `dist`.)
