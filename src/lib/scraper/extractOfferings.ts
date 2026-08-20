import * as cheerio from 'cheerio';
import type { Offering, OfferingType } from '@/types/knowledge-base';
import { firstNonEmpty, longestNonEmpty } from './utils';

const CARD_HINT = /service|product|offering|package|plan|solution/i;
const PRICE_PATTERN =
  /\$[\d,]+(\.\d{2})?|\bfree\b|\bquote\b|\/(mo|month|year|yr)\b/i;
const MAX_OFFERINGS = 15;

// Pages that are almost never a single offering themselves, even if they
// mention a price in passing.
const NON_OFFERING_PATH =
  /\b(about|contact|privacy|terms|faq|blog|careers|login|signin|cart|checkout|pricing|team|staff)\b/i;

export function extractOfferings(html: string, pageLabel: string): Offering[] {
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

  if (offerings.length > 0) return offerings;

  // No card-shaped offerings found. Some sites give each product its own
  // dedicated page instead of listing them as cards
  const pageOffering = extractWholePageOffering($, pageLabel);
  return pageOffering ? [pageOffering] : [];
}

function extractWholePageOffering(
  $: cheerio.CheerioAPI,
  pageLabel: string
): Offering | null {
  if (pageLabel === 'Homepage' || NON_OFFERING_PATH.test(pageLabel)) {
    return null;
  }

  const bodyText = $('body').text();
  const priceMatch = PRICE_PATTERN.exec(bodyText);
  if (!priceMatch) return null;

  const name = $('h1').first().text().trim();
  if (!name || name.length > 80) return null;

  const description = longestNonEmpty(
    $('p')
      .slice(0, 8)
      .map((_, p) => $(p).text().trim())
      .get()
  );

  return {
    name,
    offeringType: guessOfferingType(bodyText),
    category: null,
    description,
    features: [],
    pricing: priceMatch[0].trim(),
  };
}

function guessOfferingType(text: string): OfferingType {
  if (/\bsubscription\b|\/(mo|month)\b|\bmonthly\b/i.test(text))
    return 'subscription';
  if (/\bpackage\b|\bbundle\b/i.test(text)) return 'package';
  if (/\bproduct\b/i.test(text)) return 'product';
  return 'service';
}
