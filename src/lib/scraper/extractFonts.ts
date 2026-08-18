import * as cheerio from 'cheerio';

const MAX_FONTS = 5;
const GENERIC_FONT_KEYWORDS = new Set([
  'sans-serif',
  'serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'inherit',
  'initial',
  'unset',
  '-apple-system',
  'blinkmacsystemfont',
]);

export function extractFonts(html: string): string[] {
  const $ = cheerio.load(html);
  const fonts = new Set<string>();

  // Google Fonts links declare the exact family names right in the URL
  $('link[href*="fonts.googleapis.com"]').each((_, link) => {
    const href = $(link).attr('href');
    if (!href) return;
    try {
      const url = new URL(href, 'https://fonts.googleapis.com');
      for (const family of url.searchParams.getAll('family')) {
        const name = family.split(':')[0].replace(/\+/g, ' ').trim(); // "Inter:wght@400;700" -> "Inter"
        if (name) fonts.add(name);
      }
    } catch {
      // malformed link — skip
    }
  });

  // fall back to font-family declarations in inline/embedded CSS
  const styleText =
    $('style').text() +
    ' ' +
    $('[style]')
      .map((_, el) => $(el).attr('style') ?? '')
      .get()
      .join(' ');

  for (const match of styleText.matchAll(/font-family:\s*([^;}]+)/gi)) {
    const firstFamily = match[1].split(',')[0].replace(/["']/g, '').trim();
    const isUsable =
      firstFamily &&
      !firstFamily.startsWith('var(') &&
      !GENERIC_FONT_KEYWORDS.has(firstFamily.toLowerCase());
    if (isUsable) fonts.add(firstFamily);
  }

  return [...fonts].slice(0, MAX_FONTS);
}
