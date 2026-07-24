/** Canonical URL and share copy for this app (mirrors seo.config.json). */
const SHARE_URL = "https://explain.tabularis.dev";
const SHARE_TEXT =
  "Visualize PostgreSQL, MySQL & SQLite EXPLAIN plans as interactive graphs — free, and nothing leaves your browser.";

/** Share-intent URLs for the same social networks used on tabularis.dev. */
export function buildSocialShareUrls() {
  const encodedUrl = encodeURIComponent(SHARE_URL);

  return {
    bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${SHARE_TEXT}\n\n${SHARE_URL}`)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(SHARE_TEXT)}`,
  } as const;
}
