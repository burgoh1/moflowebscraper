# MoKnowledge

## What MoKnowledge does

MoKnowledge is a web app that scrapes a company website and turns it into a
structured, editable knowledge base. It covers 9 categories — the
assignment's 7 baseline categories (Company Foundation, Positioning,
Market & Customers, Branding & Style, Online Presence, Key People,
Offerings) plus two added ones (Testimonials & Social Proof, Trust
Signals) — and saves the result as a JSON record you can browse, search,
filter, edit, and delete.

## How to set it up and run it

Requirements: Node 18+ (the scraper uses the built-in `fetch` API).

```
npm install
npm run dev
```

Then visit:
- `http://localhost:3000/knowledge` — enter a company URL, scrape, review/edit, save
- `http://localhost:3000/knowledge/view` — browse saved knowledge bases

No environment variables or API keys are required. Saved records are
stored as local JSON files under `data/knowledge-bases/` (not committed to
git).

## Key features and functionality

- **Scrape & Build (`/knowledge`)**: URL input, scrape trigger, loading
  state, structured editable form across all 9 categories, a save button,
  and inline data-quality badges (missing / low confidence / AI-generated
  mock) next to every field they apply to.
- **View/Manage (`/knowledge/view`)**: card and table view modes, a
  detail/edit page per record, search by name/URL, filter by scrape
  status, delete, and a "Download JSON" button on both the list and the
  detail page.
- **Mock AI enrichment**: fields that need judgment rather than pattern
  matching (industry, business model, company pitch, writing style,
  target buyers, customer needs) are filled automatically after scraping
  with clearly-labeled placeholder text, tagged with an "AI-generated
  (mock)" badge.

## Approach to scraping and data extraction

The scraper uses `fetch` + `cheerio` — no headless browser. `scrapeWebsite.ts`
fetches the homepage, runs `discoverInternalPages()` to find and
rank same-domain internal pages by keyword relevance, fetches up to 15 of
them in parallel, then runs a set of independent extractor functions
across every page and merges/dedupes the results.

Each extractor first looks for elements whose class/id names hint at what
they contain (e.g. `team`, `service`). Since some site builders (like
Framer) generate hashed class names with no semantic hint at all, several
extractors fall back to structural signals when that lookup finds nothing:
a nearby, real section heading ("Meet the team", "Products") scoped to
just that section, or — for a site that gives each product its own
dedicated page instead of a shared list — treating the whole page as one
offering when it has a title and a price. Fetch failures never crash the
pipeline: a single unreachable page degrades the result to a partial
scrape rather than failing it outright.

Fields extraction can't reliably determine (industry classification,
business model, pitch, writing style, etc.) are left `null` by the
extractors and filled separately by the mock AI enrichment step, so
real extraction and simulated AI output are never conflated.

## Knowledge base schema design

The schema is defined in `src/types/knowledge-base.ts`. A `KnowledgeBase`
has the 9 category objects/arrays described above, plus `dataQuality`, an
array of `{ field, status, note? }` flags tracked at the individual-field
level (not just per-record) so the UI can show exactly which fields are
missing, low-confidence, or AI-generated. Arrays default to `[]`, never
`null`. See `examples/sample-knowledge-base.json` for one complete example,
and `docs/supabase-schema.md` for how this maps onto a persisted,
multi-company, versioned Postgres/Supabase schema (bonus).

## Example prompts for AI enrichment

Four example prompts, documenting what a real LLM call would look like for
each judgment-based field, live in `/prompts`:

- `company-pitch-prompt.md` — generates `positioning.companyPitch`
- `industry-classification-prompt.md` — generates `companyFoundation.industry` and `businessModel`
- `market-and-customers-prompt.md` — generates `targetBuyers` and `customerNeeds`
- `writing-style-prompt.md` — generates `brandingAndStyle.writingStyle`

Each includes a system prompt, a user prompt template, and the expected
JSON output shape. `src/lib/enrichment/` implements a mock (non-LLM)
version of the same fields, referencing these prompts in code comments.

## Assumptions or limitations

- Static HTML only — the scraper never executes JavaScript, so
  content that only appears after client-side rendering won't be found.
- Page discovery and the structural extraction fallbacks depend on a site
  having real, human-readable heading text somewhere near the content
  (even if class names are hashed); a site with neither meaningful URL
  paths nor any semantic headings may still under-extract.
- Mock enrichment produces deterministic template text, not real model
  output — always flagged via the `ai_generated_mock` data-quality status,
  never presented as verified data.
- Persistence is local JSON files with no auth or multi-user support; see
  `docs/supabase-schema.md` for the intended production design.
- `npm audit` reports 3 pre-existing high-severity vulnerabilities from the
  initial project scaffold, unrelated to code added here.
