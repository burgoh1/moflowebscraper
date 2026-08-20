import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import type { KeyPerson } from '@/types/knowledge-base';
import {
  findCardGroupsNearHeading,
  firstNonEmpty,
  textWithSpaces,
} from './utils';

const CARD_HINT = /team|staff|member|person|leadership|bio|employee/i;
const HEADING_HINT = /\b(team|staff|member|person|leadership|bio|employee)\b/i;
const GENDER_WORD = /\b(male|female)\b/i;
const MAX_PEOPLE = 12;

export function extractKeyPeople(html: string): KeyPerson[] {
  const $ = cheerio.load(html);

  const hinted = $('[class], [id]')
    .filter((_, element) =>
      CARD_HINT.test(
        `${$(element).attr('class') ?? ''} ${$(element).attr('id') ?? ''}`
      )
    )
    .toArray();

  const people = peopleFromCandidates($, hinted);
  if (people.length > 0) return people;
  return peopleFromCandidates($, findCardGroupsNearHeading($, HEADING_HINT));
}

function peopleFromCandidates(
  $: cheerio.CheerioAPI,
  candidates: Element[]
): KeyPerson[] {
  const people: KeyPerson[] = [];
  const seenNames = new Set<string>();

  for (const element of candidates) {
    if (people.length >= MAX_PEOPLE) break;

    const el = $(element);

    // Exactly one heading means "one card" — zero means no name found
    const headings = el.find('h1,h2,h3,h4,h5,h6');
    if (headings.length !== 1) continue;

    const name = headings.first().text().trim();
    if (!name || name.length > 60 || seenNames.has(name.toLowerCase()))
      continue;

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

    const genderMatch = GENDER_WORD.exec(textWithSpaces(el.html()));
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
  }

  return people;
}
