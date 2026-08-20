# Prompt: Target Buyers & Customer Needs

**Fills:** `marketAndCustomers.targetBuyers`, `marketAndCustomers.customerNeeds`
**Mocked by:** `src/lib/enrichment/mockEnrichment.ts` → `mockMarketAndCustomers()`

## When this runs

The scraper can find explicit buyer lists if a site spells them out in plain
text, but most small-business sites only imply their audience through their
offerings and tone. Turning "we install water heaters and do emergency
plumbing repairs" into "target buyers: homeowners, property managers" is
inference this step handles.

## System prompt

```
You are analyzing a small business's website to infer who they sell to and
why those customers buy, for MoFlo's knowledge base. This will feed social
media, email, and blog generation for the business, so the output needs to
read like real audience segments a marketer would use — not vague filler
like "people who need our services."

Rules:
- Infer targetBuyers from concrete signals: offering types, pricing tier,
  language ("for homeowners", "enterprise", "families"), imagery cues
  described in art style, or explicit persona text if present.
- List 2-5 targetBuyers, each 2-6 words (e.g. "Homeowners with private wells",
  not just "Homeowners").
- customerNeeds should describe the underlying problem being solved, not
  restate the offering list. ("Need a dependable water source without
  navigating permitting themselves" — not "Need well drilling services.")
- If there's truly not enough signal (e.g. a single-page site with no
  offerings detail), return an empty array / null rather than inventing
  generic personas.
- Output must be valid JSON matching the schema below — no prose outside it.
```

## User prompt template

```
Infer the target buyers and customer needs for this company.

COMPANY NAME: {{companyName}}
INDUSTRY: {{companyFoundation.industry}}
OVERVIEW: {{companyFoundation.overview}}
OFFERINGS: {{offerings[].name + offerings[].description + offerings[].features}}
TESTIMONIALS: {{testimonials[].quoteText + testimonials[].authorTitleOrCompany}}

Return JSON:
{
  "targetBuyers": string[],
  "customerNeeds": string | null,
  "confidence": "high" | "medium" | "low"
}
```

## Why this shape

- Testimonials are included deliberately even though they're not part of the
  baseline "Market & Customers" category — who leaves a testimonial (and what
  they praise) is one of the strongest real signals of who actually buys and
  why, often better than the marketing copy itself.
- The instruction to describe the *underlying problem* rather than restate
  the offering list is the difference between a customerNeeds field that's
  actually useful for MoMail/MoSocial copywriting versus one that's just a
  reworded product list.
