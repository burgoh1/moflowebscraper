import * as cheerio from 'cheerio';

// Returns the first non-empty string from a list of candidates
export function firstNonEmpty(
  ...values: Array<string | null | undefined>
): string | null {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

// Same idea as firstNonEmpty, but for values that aren't necessarily strings
// (e.g. a year-founded number found on one page out of several).
export function firstNonNull<T>(values: Array<T | null>): T | null {
  for (const value of values) {
    if (value !== null) return value;
  }
  return null;
}

// Picks the longest candidate instead of the first — used for fields like
// foundingStory where a longer match is a better one, not just an earlier one.
export function longestNonEmpty(
  values: Array<string | null | undefined>
): string | null {
  const candidates = values.filter((value): value is string =>
    Boolean(value?.trim())
  );
  if (candidates.length === 0) return null;
  return [...candidates].sort((a, b) => b.length - a.length)[0];
}

// cheerio's .text() concatenates text nodes with no separator, so compact
// HTML with no whitespace between tags ("<span>Founder</span><p>Male</p>")
// collapses into one word ("FounderMale") and silently breaks any \b-anchored
// regex scanning it. This forces a space at every tag boundary instead.
const TAG_PATTERN = /<[^>]*>/g;
const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&nbsp;': ' ',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
};

export function textWithSpaces(html: string | null | undefined): string {
  if (!html) return '';
  let text = html.replace(TAG_PATTERN, ' ');
  for (const [entity, replacement] of Object.entries(HTML_ENTITIES)) {
    text = text.split(entity).join(replacement);
  }
  return text.replace(/\s+/g, ' ').trim();
}

export function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

// Shared by any extractor that wants Organization/LocalBusiness JSON-LD data
// without re-parsing the same <script> tag itself.
export function extractOrganizationJsonLd(
  $: cheerio.CheerioAPI
): Record<string, unknown> | null {
  let result: Record<string, unknown> | null = null;

  $('script[type="application/ld+json"]').each((_, element) => {
    if (result) return;
    try {
      const parsed = JSON.parse($(element).text());
      const entries = Array.isArray(parsed) ? parsed : [parsed];
      const org = entries.find(
        (entry) =>
          entry?.['@type'] === 'Organization' ||
          entry?.['@type'] === 'LocalBusiness'
      );
      if (org) result = org;
    } catch {
      // malformed JSON-LD on this page — skip it
    }
  });

  return result;
}
