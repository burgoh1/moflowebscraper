import * as cheerio from 'cheerio';

const HEX_COLOR_PATTERN = /#([0-9a-f]{6}|[0-9a-f]{3})\b/gi;
const VALID_THEME_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const MAX_COLORS = 5;

export function extractBrandColors(html: string): string[] {
  const $ = cheerio.load(html);

  const rawTheme = $('meta[name="theme-color"]').attr('content')?.trim();
  const themeColor =
    rawTheme && VALID_THEME_COLOR.test(rawTheme)
      ? normalizeHex(rawTheme)
      : null;

  // Only sees colors present in the raw HTML
  const styleTagText = $('style').text();
  const inlineStyleText = $('[style]')
    .map((_, el) => $(el).attr('style') ?? '')
    .get()
    .join(' ');

  const counts = new Map<string, number>();
  for (const match of `${styleTagText} ${inlineStyleText}`.matchAll(
    HEX_COLOR_PATTERN
  )) {
    const hex = normalizeHex(match[0]);
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }

  const rankedByFrequency = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex);
  const colors = themeColor
    ? [themeColor, ...rankedByFrequency]
    : rankedByFrequency;

  return [...new Set(colors)].slice(0, MAX_COLORS);
}

function normalizeHex(hex: string): string {
  const lower = hex.toLowerCase();
  if (lower.length === 4) {
    const [, r, g, b] = lower;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return lower;
}
