import * as cheerio from 'cheerio';
import type { KeyPerson } from '@/types/knowledge-base';
import { firstNonEmpty } from './utils';

const CARD_HINT = /team|staff|member|person|leadership|bio|employee/i;
const GENDER_WORD = /\b(male|female)\b/i;
const MAX_PEOPLE = 12;

export function extractKeyPeople(html: string): KeyPerson[] {
  const $ = cheerio.load(html);
  const people: KeyPerson[] = [];
  const seenNames = new Set<string>();

  $('[class], [id]').each((_, element) => {
    if (people.length >= MAX_PEOPLE) return;

    const el = $(element);
    const identifier = `${el.attr('class') ?? ''} ${el.attr('id') ?? ''}`;
    if (!CARD_HINT.test(identifier)) return;

    // Exactly one heading means "one card" — zero means no name found,
    // more than one means this is the section wrapper, not a single person.
    const headings = el.find('h1,h2,h3,h4,h5,h6');
    if (headings.length !== 1) return;

    const name = headings.first().text().trim();
    if (!name || name.length > 60 || seenNames.has(name.toLowerCase())) return;

    const title = firstNonEmpty(
      headings.first().next('p, span, em, small').text(),
      el.find('p, span, em, small').not(headings).first().text()
    );

    const bioCandidates = el
      .find('p')
      .map((_, p) => $(p).text().trim())
      .get()
      .filter((text) => text && text !== title);
    const description = firstNonEmpty(
      ...[...bioCandidates].sort((a, b) => b.length - a.length)
    );

    const genderMatch = GENDER_WORD.exec(el.text());
    const gender = genderMatch
      ? (genderMatch[1].toLowerCase() as 'male' | 'female')
      : null;

    people.push({
      name,
      title: title !== name ? title : null,
      gender,
      description,
    });
    seenNames.add(name.toLowerCase());
  });

  return people;
}
