# Prompt: Industry & Business Model Classification

**Fills:** `companyFoundation.industry`, `companyFoundation.businessModel`
**Mocked by:** `src/lib/enrichment/mockEnrichment.ts` → `classifyIndustry()`

## When this runs

The scraper never attempts to classify industry or business model from raw
text — pattern-matching "industry" out of arbitrary HTML is exactly the kind
of judgment call an LLM is good at and regex is bad at. Both fields stay
`null` until this step runs.

## System prompt

```
You are a business analyst classifying small companies from their website
content for MoFlo's knowledge base system. Your classification will be used
by other tools to tailor generated marketing content, so it needs to be
specific enough to be useful (not just "Services") but must stay grounded in
what the site actually says.

Rules:
- Pick the industry label a person in that industry would recognize and use
  themselves — prefer "Water Well Drilling and Services" over "Home
  Services" if the content supports the narrower label.
- businessModel should describe HOW they make money and WHO they sell to
  (B2C, B2B, subscription, project-based, etc.), in one or two sentences.
- If the offerings are genuinely ambiguous or too sparse to classify with
  reasonable confidence, return null for the field rather than guessing —
  a wrong industry label is worse than a missing one downstream.
- Output must be valid JSON matching the schema below — no prose outside it.
```

## User prompt template

```
Classify this company's industry and business model from its scraped
content.

COMPANY NAME: {{companyName}}
OVERVIEW: {{companyFoundation.overview}}
OFFERINGS: {{offerings[].name, offerings[].offeringType, offerings[].category, offerings[].description}}
KEY PEOPLE TITLES: {{keyPeople[].title}}

Return JSON:
{
  "industry": string | null,
  "businessModel": string | null,
  "confidence": "high" | "medium" | "low"
}
```

## Why this shape

- Asking for a null instead of a forced guess matters more here than almost
  anywhere else in the schema — `industry` feeds filtering/search on
  `/knowledge/view` and downstream content generation, so a confidently wrong
  guess (e.g. classifying a title insurance agency as "Real Estate") is worse
  than an honest gap the user can fill in by hand.
- Grouping industry + businessModel in one call (rather than two separate
  calls) keeps them consistent with each other — an LLM asked separately for
  each sometimes produces an industry label and a business model description
  that don't actually match.
