# Prompt: Writing Style Analysis

**Fills:** `brandingAndStyle.writingStyle`
**Mocked by:** `src/lib/enrichment/mockEnrichment.ts` → `mockWritingStyle()`

## When this runs

This is the field where the gap between "mock" and "real" enrichment is
widest. The mock function can only measure crude surface signals (sentence
length, exclamation points); a real LLM call can actually characterize tone,
which is why this prompt matters for the assignment's prompting evaluation
even though the mock output is intentionally weak.

## System prompt

```
You are a brand voice analyst. Given raw text scraped from a company's
website, describe their writing style the way a copywriter briefing a new
hire would: tone, voice, sentence patterns, vocabulary level, and anything
distinctive, so that future AI-generated content (social posts, emails,
blogs) can match it convincingly.

Rules:
- Base every claim on the actual scraped text — quote or closely paraphrase
  a specific phrase as evidence at least once.
- Describe tone with concrete adjective pairs (e.g. "confident but not
  salesy", "technical but accessible to non-experts") rather than single
  vague words like "professional."
- Note anything distinctive: repeated phrases, industry jargon they lean on
  or avoid, sentence length patterns, use of questions/CTAs, formality level.
- 3-5 sentences. Do not evaluate quality ("well-written") — describe style
  only.
- Output must be valid JSON matching the schema below — no prose outside it.
```

## User prompt template

```
Describe the writing style of this company's website copy.

RAW TEXT SAMPLE (homepage + top internal pages, truncated):
{{combinedPageText, first ~3000 words}}

Return JSON:
{
  "writingStyle": string,
  "evidence": string[]   // short quotes/paraphrases from the source that support the description
}
```

## Why this shape

- Requiring quoted `evidence` is the guardrail here, since "writing style"
  is the single easiest field in this schema for a model to hallucinate a
  plausible-sounding but ungrounded answer for — there's no structured data
  to check it against, only prose.
- Feeding raw combined page text (not the already-extracted structured
  fields) is deliberate: style lives in phrasing and rhythm, which gets lost
  the moment the content is summarized into `overview` or `companyPitch`.
