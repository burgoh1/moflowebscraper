import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';

type PathPattern = { pattern: RegExp; weight: number };

// only checked when path scoring finds nothing, so it can't change behavior
// on a site where path scoring already works.
const LINK_CONTEXT_HINT = /\b(products?|apps?|solutions?|offerings?)\b/i;
const LINK_CONTEXT_SCORE = 2;

function nearbySectionHeadingMatches(
  $: cheerio.CheerioAPI,
  link: Element,
  hint: RegExp
): boolean {
  let ancestor = $(link).parent();
  for (let depth = 0; depth < 5 && ancestor.length > 0; depth++) {
    // Exclude headings inside ANY link
    const heading = ancestor
      .find('h1,h2,h3,h4,h5,h6')
      .filter((_, h) => !isInsideAnyLink($, h))
      .first();
    if (heading.length > 0) {
      const text = heading.text().trim();
      // Found the nearest heading for this section
      return text.length > 0 && text.length <= 50 && hint.test(text);
    }
    ancestor = ancestor.parent();
  }
  return false;
}

function isInsideAnyLink($: cheerio.CheerioAPI, node: Element): boolean {
  let current = $(node).parent();
  while (current.length > 0) {
    if (current.get(0)?.tagName?.toLowerCase() === 'a') return true;
    current = current.parent();
  }
  return false;
}

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
  maxPages: number = 15
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

    let score = RELEVANT_PATH_PATTERNS.reduce(
      (total, { pattern, weight }) =>
        pattern.test(resolved.pathname) ? total + weight : total,
      0
    );

    if (
      score === 0 &&
      nearbySectionHeadingMatches($, element, LINK_CONTEXT_HINT)
    ) {
      score = LINK_CONTEXT_SCORE;
    }

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
