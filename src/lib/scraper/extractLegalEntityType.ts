const ENTITY_SUFFIXES: { pattern: RegExp; label: string }[] = [
  { pattern: /\bL\.?L\.?C\.?\b/i, label: 'LLC' },
  { pattern: /\bL\.?L\.?P\.?\b/i, label: 'LLP' },
  { pattern: /\bPLLC\b/i, label: 'PLLC' },
  { pattern: /\bInc\.?\b/i, label: 'Inc' },
  { pattern: /\bCorp(oration)?\.?\b/i, label: 'Corp' },
  { pattern: /\bCo\.?\b/i, label: 'Co' },
];

// Reads the suffix off the already-extracted company name rather than the page
export function extractLegalEntityType(
  companyName: string | null
): string | null {
  if (!companyName) return null;

  for (const { pattern, label } of ENTITY_SUFFIXES) {
    if (pattern.test(companyName)) return label;
  }
  return null;
}
