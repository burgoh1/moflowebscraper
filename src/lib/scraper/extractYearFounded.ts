import * as cheerio from 'cheerio';
import { textWithSpaces } from './utils';

// Allows a short gap of words between the trigger and the year
const YEAR_PATTERN =
  /\b(?:since|est\.?|established|founded)[^.\d]{0,30}(\d{4})\b/i;

export function extractYearFounded(html: string): number | null {
  const $ = cheerio.load(html);
  const match = YEAR_PATTERN.exec(textWithSpaces($('body').html()));
  if (!match) return null;

  const year = Number(match[1]);
  const currentYear = new Date().getFullYear();
  if (year < 1600 || year > currentYear) return null; // sanity bound, not a real match

  return year;
}
