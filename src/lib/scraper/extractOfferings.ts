import * as cheerio from 'cheerio';
import type { Offering, OfferingType } from '@/types/knowledge-base';
import { firstNonEmpty } from './utils';

const CARD_HINT = /service|product|offering|package|plan|solution/i;
const PRICE_PATTERN =
  /\$[\d,]+(\.\d{2})?|\bfree\b|\bquote\b|\/(mo|month|year|yr)\b/i;
const MAX_OFFERINGS = 15;

export function extractOfferings(html: string): Offering[] {
  const $ = cheerio.load(html);
  const offerings: Offering[] = [];
  const seenNames = new Set<string>();

  $('[class], [id]').each((_, element) => {
    if (offerings.length >= MAX_OFFERINGS) return;

    const el = $(element);
    const identifier = `${el.attr('class') ?? ''} ${el.attr('id') ?? ''}`;
    if (!CARD_HINT.test(identifier)) return;

    const headings = el.find('h1,h2,h3,h4,h5,h6');
    if (headings.length !== 1) return;

    const name = headings.first().text().trim();
    if (!name || name.length > 80 || seenNames.has(name.toLowerCase())) return;

    const description = firstNonEmpty(
      ...el
        .find('p')
        .map((_, p) => $(p).text().trim())
        .get()
    );

    const features = el
      .find('li')
      .map((_, li) => $(li).text().trim())
      .get()
      .filter((text) => text.length > 0 && text.length < 200);

    const bodyText = el.text();
    const priceMatch = PRICE_PATTERN.exec(bodyText);

    offerings.push({
      name,
      offeringType: guessOfferingType(bodyText),
      // industry-specific label — left for manual review, not reliably scrapable
      category: null,
      description,
      features,
      pricing: priceMatch ? priceMatch[0].trim() : null,
    });
    seenNames.add(name.toLowerCase());
  });

  return offerings;
}

function guessOfferingType(text: string): OfferingType {
  if (/\bsubscription\b|\/(mo|month)\b|\bmonthly\b/i.test(text))
    return 'subscription';
  if (/\bpackage\b|\bbundle\b/i.test(text)) return 'package';
  if (/\bproduct\b/i.test(text)) return 'product';
  return 'service';
}
