# Explain Plan

A free online EXPLAIN plan visualizer: paste the EXPLAIN output of
a **PostgreSQL**, **MySQL/MariaDB** or **SQLite** query and explore it as an
interactive graph, diagram, table and statistics view — with automatic
performance findings.

Everything runs in the browser. No query is ever executed and nothing is
uploaded to a server.

Built on [`@tabularis/explain`](https://www.npmjs.com/package/@tabularis/explain),
the engine behind the [Visual EXPLAIN](https://tabularis.dev/solutions/visual-explain)
feature of [Tabularis](https://tabularis.dev), and styled with the same
Tabularis dark theme.

## Supported input formats

| Engine | Formats |
|---|---|
| PostgreSQL | `EXPLAIN (FORMAT JSON)`, plain `EXPLAIN` / `EXPLAIN ANALYZE` text |
| MySQL / MariaDB | `EXPLAIN FORMAT=JSON`, `EXPLAIN ANALYZE` / `ANALYZE FORMAT=TEXT` trees |
| SQLite | `EXPLAIN QUERY PLAN` — the sqlite3 shell tree (`|--` / `` `-- ``) or raw `id\|parent\|…\|detail` rows |

The engine can be selected explicitly or auto-detected from the pasted text.

## Stack

- [Vite](https://vite.dev) + [React 19](https://react.dev) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com) with the Tabularis colour tokens
- [`@tabularis/explain`](https://www.npmjs.com/package/@tabularis/explain) for parsing, analysis and the plan views
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
