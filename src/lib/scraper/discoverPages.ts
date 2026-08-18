import * as cheerio from 'cheerio';

type PathPattern = { pattern: RegExp; weight: number };

// Higher weight = stronger signal. Scores combine when multiple patterns match.
const RELEVANT_PATH_PATTERNS: PathPattern[] = [
  { pattern: /\babout\b/i, weight: 3 },
  { pattern: /\bteam\b/i, weight: 3 },
  { pattern: /\bservices?\b/i, weight: 3 },
  { pattern: /\bstaff\b/i, weight: 2 },
  { pattern: /\bleadership\b/i, weight: 2 },
  { pattern: /\bofferings?\b/i, weight: 2 },
  { pattern: /\bproducts?\b/i, weight: 2 },
  { pattern: /\bpricing\b/i, weight: 2 },
  { pattern: /\bcontact\b/i, weight: 2 },
  { pattern: /\btestimonials?\b/i, weight: 2 },
  { pattern: /\breviews?\b/i, weight: 2 },
  { pattern: /\bour-?story\b|\bhistory\b|\bmission\b/i, weight: 2 },
  { pattern: /\bcertifications?\b|\bawards?\b|\baccredit/i, weight: 2 },
  { pattern: /\bfaq\b/i, weight: 1 },
  { pattern: /\blocations?\b|\bservice-?areas?\b/i, weight: 1 },
];

const EXCLUDED_HREF_PATTERNS: RegExp[] = [
  /\.(pdf|jpe?g|png|gif|svg|webp|zip|css|js|ico)(\?|$)/i,
  /\b(privacy|terms|login|signin|sign-in|cart|checkout)\b/i,
  /^mailto:|^tel:/i,
];

export function discoverInternalPages(
  homepageHtml: string,
  baseUrl: string,
  maxPages: number = 8
): string[] {
  const $ = cheerio.load(homepageHtml);
  const base = new URL(baseUrl);
  const scoreByUrl = new Map<string, number>();

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href || EXCLUDED_HREF_PATTERNS.some((pattern) => pattern.test(href))) {
      return;
    }

    let resolved: URL;
    try {
      resolved = new URL(href, base);
    } catch {
      return;
    }

    // same domain only, skip the homepage itself
    if (resolved.hostname !== base.hostname) return;
    if (resolved.pathname === base.pathname) return;

    const score = RELEVANT_PATH_PATTERNS.reduce(
      (total, { pattern, weight }) =>
        pattern.test(resolved.pathname) ? total + weight : total,
      0
    );
    if (score === 0) return;

    // drop query string/fragment so duplicate links to the same page don't double count
    const key = resolved.origin + resolved.pathname;
    scoreByUrl.set(key, Math.max(scoreByUrl.get(key) ?? 0, score));
  });

  return [...scoreByUrl.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxPages)
    .map(([url]) => url);
}
