import * as cheerio from 'cheerio';

const STORY_KEYWORD =
  /\b(founded|founder|started|began|story|journey|origin|legacy|history)\b/i;
const MIN_LENGTH = 60;

export function extractFoundingStory(html: string): string | null {
  const $ = cheerio.load(html);

  const candidates = $('p')
    .map((_, p) => $(p).text().trim())
    .get()
    .filter((text) => text.length >= MIN_LENGTH && STORY_KEYWORD.test(text));

  if (candidates.length === 0) return null;
  return [...candidates].sort((a, b) => b.length - a.length)[0];
}
