import * as cheerio from 'cheerio';
import type { TrustSignal, TrustSignalType } from '@/types/knowledge-base';
import { textWithSpaces } from './utils';

const MAX_SIGNALS = 10;

const SIGNAL_PATTERNS: { pattern: RegExp; type: TrustSignalType }[] = [
  {
    pattern: /\bBBB\s*(A\+?\s*)?(Accredited|Rated)[^.,\n]*/i,
    type: 'certification',
  },
  { pattern: /\bLicensed\s*(&|and)?\s*Insured\b/i, type: 'license' },
  { pattern: /\bCertified\s+[A-Z][\w\s]{2,40}/, type: 'certification' },
  { pattern: /\b[\w\s]{2,40}\s+Certified\b/, type: 'certification' },
  { pattern: /\bMember of\s+(the\s+)?[A-Z][\w\s&]{2,60}/, type: 'membership' },
  { pattern: /\b\d{1,3}[-\s]?years?\s+warranty\b/i, type: 'guarantee' },
  { pattern: /\bmoney[-\s]back guarantee\b/i, type: 'guarantee' },
  { pattern: /\baward[-\s]winning\b/i, type: 'award' },
  { pattern: /\bAccredited\b[^.,\n]*/i, type: 'certification' },
];

export function extractTrustSignals(html: string): TrustSignal[] {
  const $ = cheerio.load(html);
  const signals: TrustSignal[] = [];
  const seenLabels = new Set<string>();

  const addSignal = (label: string, type: TrustSignalType) => {
    const cleaned = label.replace(/\s+/g, ' ').trim();
    if (!cleaned || cleaned.length > 100 || signals.length >= MAX_SIGNALS)
      return;
    const key = cleaned.toLowerCase();
    if (seenLabels.has(key)) return;
    seenLabels.add(key);
    signals.push({ label: cleaned, type, issuer: null, description: null });
  };

  // trust badge images often carry the certification name in their alt text
  $('img[alt]').each((_, img) => {
    const alt = $(img).attr('alt')?.trim() ?? '';
    for (const { label, type } of findSignalsInText(alt))
      addSignal(label, type);
  });

  for (const { label, type } of findSignalsInText(
    textWithSpaces($('body').html())
  )) {
    addSignal(label, type);
  }

  return signals;
}

// Several patterns can match overlapping substrings of the same phrase
function findSignalsInText(
  text: string
): { label: string; type: TrustSignalType }[] {
  const matches: {
    label: string;
    type: TrustSignalType;
    start: number;
    end: number;
  }[] = [];

  for (const { pattern, type } of SIGNAL_PATTERNS) {
    const match = pattern.exec(text);
    if (match?.index === undefined) continue;
    matches.push({
      label: match[0],
      type,
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return matches
    .filter(
      (m) =>
        !matches.some(
          (other) =>
            other !== m &&
            other.start <= m.start &&
            other.end >= m.end &&
            other.end - other.start > m.end - m.start
        )
    )
    .map(({ label, type }) => ({ label, type }));
}
