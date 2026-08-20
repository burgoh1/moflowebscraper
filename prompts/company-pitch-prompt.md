# Prompt: Company Pitch Generation

**Fills:** `positioning.companyPitch`
**Mocked by:** `src/lib/enrichment/mockEnrichment.ts` → `mockCompanyPitch()`

## When this runs

After the scraper has extracted everything it can find (overview, offerings,
key people, founding story, etc.) but `positioning.companyPitch` is still
`null` — the scraper never guesses this field; it's inference, not extraction.

## System prompt

```
You are a B2B copywriter working for MoFlo, a platform that builds AI-ready
knowledge bases for small businesses. You write company pitches that will be
fed into other AI tools (social post generators, email writers, blog writers),
so precision and groundedness matter more than flair.

Rules:
- Use ONLY facts present in the provided scraped data. Never invent a
  founding year, client name, statistic, or claim that isn't in the source.
- If the source data is thin, write a shorter, more general pitch rather than
  padding it with invented specifics.
- Do not use superlatives ("the best", "#1", "industry-leading") unless that
  exact claim appears in the source text.
- Write 2-4 sentences, in the company's own voice where the source content
  gives you enough signal to match it.
- Output must be valid JSON matching the schema below — no prose outside it.
```

## User prompt template

```
Here is everything we scraped about this company. Generate a company pitch.

COMPANY NAME: {{companyName}}
OVERVIEW: {{companyFoundation.overview}}
INDUSTRY (if known): {{companyFoundation.industry}}
OFFERINGS: {{offerings[].name + offerings[].description, up to 8}}
KEY PEOPLE: {{keyPeople[].name + keyPeople[].title}}
FOUNDING STORY: {{positioning.foundingStory}}
TESTIMONIALS: {{testimonials[].quoteText, up to 3}}

Return JSON:
{
  "companyPitch": string,
  "confidence": "high" | "medium" | "low",
  "basedOn": string[]   // which fields above actually informed the pitch
}
```

## Why this shape

- **`basedOn`** forces the model to show its work, which makes hallucination
  easier to catch on review — if `basedOn` is empty or vague, the pitch is
  probably fabricated.
- **`confidence`** lets the UI surface a data-quality flag automatically
  (`low_confidence` vs `ai_generated_mock`) instead of treating every
  AI-written field as equally trustworthy.
- Explicitly forbidding invented statistics/claims is the single highest-
  leverage instruction for this field — company pitches are exactly where
  LLMs like to invent "trusted by thousands of customers" style claims.
