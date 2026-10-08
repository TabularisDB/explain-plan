const SHARE_URL = 'https://explain.tabularis.dev';
const SHARE_TEXT =
    'Visualize PostgreSQL, MySQL, SQLite, SQL Server and Oracle EXPLAIN plans as interactive graphs. Free, plans stay in your browser, and shared links are encrypted.';

export function buildSocialShareUrls() {
    const encodedUrl = encodeURIComponent(SHARE_URL);

    return {
        bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${SHARE_TEXT}\n\n${SHARE_URL}`)}`,
        x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(SHARE_TEXT)}`,
    } as const;
}
