# Pre-release EXPLAIN packages

The site declares the release versions of `@tabularis/explain` and
`@tabularis/explain-sqlserver` in `package.json`. The matching npm releases are
not public yet, so `pnpm-workspace.yaml` temporarily resolves those exact
versions to the committed package tarballs in this directory. This keeps CI
and preview deployments reproducible without changing application imports.
Remove the overrides and these files after both versions are published.

The tarballs were produced with `pnpm build` followed by `pnpm pack` from:

| Package | Source commit | SHA-256 |
| --- | --- | --- |
| `@tabularis/explain@0.2.0` | `TabularisDB/tabularis@ba0463d3b861ec8fad110126c67e3fc12bac9839` | `952f9799397422ed7de4379ca9e465c31e32a5837144807ac44f977f0f5c0a0a` |
| `@tabularis/explain-sqlserver@1.0.0-beta.1` | `TabularisDB/tabularis-sqlserver-plugin@e56e5e21d942e97e2d9f1c50658fd968e5e2cda7` | `6d467e93b87921cd3195cc7dfcb26d62979d471ff010375824416e42c26baee9` |
