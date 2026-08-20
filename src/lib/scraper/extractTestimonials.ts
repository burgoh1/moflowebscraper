import * as cheerio from 'cheerio';
import type { Testimonial } from '@/types/knowledge-base';

const REVIEW_HINT = /testimonial|review|quote/i;
const MAX_TESTIMONIALS = 10;

// A section classed "testimonials" doesn't guarantee its content actually is one
const HASHTAG_PATTERN = /#\w+/;
const IMPERATIVE_START =
  /^(enter|input|choose|select|click|tap|type|fill|review|track|connect|monitor|upload|download|pick|drag)\b/i;
const QUOTED_PATTERN = /^["“'‘].*["”'’]$/;

function looksLikeGenuineQuoteCandidate(text: string): boolean {
  return !HASHTAG_PATTERN.test(text) && !IMPERATIVE_START.test(text.trim());
}

export function extractTestimonials(
  html: string,
  pageLabel: string
): Testimonial[] {
  const $ = cheerio.load(html);
  const testimonials: Testimonial[] = [];
  const seenQuotes = new Set<string>();

  const addTestimonial = (
    quoteText: string,
    authorName: string | null,
    authorTitleOrCompany: string | null
  ) => {
    const trimmed = quoteText.trim();
    if (
      !trimmed ||
      trimmed.length < 15 ||
      testimonials.length >= MAX_TESTIMONIALS
    )
      return;
    const key = trimmed.slice(0, 80).toLowerCase();
    if (seenQuotes.has(key)) return;
    seenQuotes.add(key);
    testimonials.push({
      quoteText: trimmed,
      authorName,
      authorTitleOrCompany,
      sourceContext: pageLabel,
    });
  };

  // <blockquote> is the semantically correct tag for quoted testimonials
  $('blockquote').each((_, element) => {
    const el = $(element);
    const cite = el.find('cite').first();
    const withoutCite = el.clone();
    withoutCite.find('cite').remove();
    const [authorName, authorTitleOrCompany] = splitAuthorLine(
      cite.text().trim() || null
    );
    addTestimonial(withoutCite.text(), authorName, authorTitleOrCompany);
  });

  // fallback: elements hinting at a testimonial/review by class or id
  $('[class], [id]').each((_, element) => {
    if (testimonials.length >= MAX_TESTIMONIALS) return;

    const el = $(element);
    const identifier = `${el.attr('class') ?? ''} ${el.attr('id') ?? ''}`;
    if (!REVIEW_HINT.test(identifier)) return;

    const isWrapper =
      el
        .find('[class], [id]')
        .filter((_, inner) =>
          REVIEW_HINT.test(
            `${$(inner).attr('class') ?? ''} ${$(inner).attr('id') ?? ''}`
          )
        ).length > 0;
    if (isWrapper) return;

    const rawParagraphs = el
      .find('p')
      .map((_, p) => $(p).text().trim())
      .get()
      .filter(Boolean);
    if (rawParagraphs.length === 0) return;

    // testimonial card
    const hasQuotedParagraph = rawParagraphs.some((text) =>
      QUOTED_PATTERN.test(text)
    );
    if (!hasQuotedParagraph && rawParagraphs.length >= 3) return;

    const candidates = rawParagraphs.filter(looksLikeGenuineQuoteCandidate);
    if (candidates.length === 0) return;

    const quotedCandidates = candidates.filter((text) =>
      QUOTED_PATTERN.test(text)
    );
    const pool = quotedCandidates.length > 0 ? quotedCandidates : candidates;
    const quoteText = [...pool].sort((a, b) => b.length - a.length)[0];

    const authorLine =
      el.find('cite, .author, .name').first().text().trim() || null;
    const [authorName, authorTitleOrCompany] = splitAuthorLine(authorLine);
    addTestimonial(quoteText, authorName, authorTitleOrCompany);
  });

  return testimonials;
}

function splitAuthorLine(line: string | null): [string | null, string | null] {
  if (!line) return [null, null];
  const [name, ...rest] = line.split(/,|—|-/).map((part) => part.trim());
  return [name || null, rest.join(', ') || null];
}
