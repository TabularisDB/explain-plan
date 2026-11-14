// Reports @tabularis/* dependencies that are behind their latest npm release.
//
// Dependabot is supposed to bump these within a day of a release. This check
// catches the cases where it silently stops doing so (for example when its
// open-PR limit is reached). It only flags a package once the newer release has
// been out for longer than GRACE_HOURS, so a normal Dependabot cycle never
// trips it.
//
// Usage: node .github/scripts/check-tabularis-drift.mjs [report.md]
// Writes `stale=true|false` to $GITHUB_OUTPUT when it is set.

import {appendFileSync, readFileSync, writeFileSync} from 'node:fs';

const GRACE_HOURS = Number(process.env.GRACE_HOURS ?? 48);
const reportPath = process.argv[2] ?? 'drift-report.md';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const pinned = Object.entries({...pkg.dependencies, ...pkg.devDependencies}).filter(([name]) =>
    name.startsWith('@tabularis/'),
);

const rows = [];
for (const [name, current] of pinned) {
    const res = await fetch(`https://registry.npmjs.org/${name.replace('/', '%2F')}`);
    if (!res.ok) throw new Error(`${name}: registry returned ${res.status}`);
    const meta = await res.json();
    const latest = meta['dist-tags']?.latest;
    const publishedAt = new Date(meta.time?.[latest]);
    const currentAt = new Date(meta.time?.[current]);
    // Compare publish dates instead of semver strings: no dependency needed, and
    // a pinned prerelease newer than `latest` is not reported as behind.
    const behind = latest !== current && publishedAt > currentAt;
    const ageHours = (Date.now() - publishedAt.getTime()) / 36e5;
    rows.push({name, current, latest, publishedAt, stale: behind && ageHours > GRACE_HOURS});
}

const stale = rows.filter((r) => r.stale);
const table = [
    '| Package | Site | Latest on npm | Released |',
    '|---|---|---|---|',
    ...rows.map(
        (r) =>
            `| \`${r.name}\` | ${r.current} | ${r.stale ? `**${r.latest}**` : r.latest} | ${r.publishedAt.toISOString().slice(0, 10)} |`,
    ),
].join('\n');

const report = `The site uses \`@tabularis/*\` versions that have been behind their latest npm release for more than ${GRACE_HOURS} hours, so explain.tabularis.dev does not have the latest parser fixes.

${table}

Dependabot should have opened a \`tabularis-explain\` group PR. Check the **Dependabot Updates** runs under Actions (an open-PR limit or a failing update job are the usual causes), or bump them by hand:

\`\`\`sh
pnpm add -E ${stale.map((r) => `${r.name}@${r.latest}`).join(' ')}
\`\`\`

_This issue is opened and closed by the \`dependency-drift\` workflow._
`;

console.log(table);
writeFileSync(reportPath, report);
if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `stale=${stale.length > 0}\n`);
}
console.log(stale.length > 0 ? `\n${stale.length} package(s) behind.` : '\nAll @tabularis/* packages are current.');
