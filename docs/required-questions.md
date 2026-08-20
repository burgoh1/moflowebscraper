# MoKnowledge — Required Questions

## 1. What approach did you take to scraping and structuring the knowledge base data?

The scraper uses plain `fetch` + `cheerio` no
headless browser. My theory was that most of what's in this schema
(overview text, addresses, social links, offering lists, testimonials)
lives in static HTML or JSON-LD.
`scrapeWebsite.ts` fetches the homepage, runs `discoverInternalPages()`
to find up to 15 same-domain internal pages
ranked by keyword relevance, fetches, then runs a dozen
independent extractor functions across every fetched page and
merges/dedupes the results.

Each extractor first looks for elements whose class/id names hint at what
they contain. That works well on hand-coded sites but breaks on no-code
site builders (Framer, Webflow) that emit hashed, generated class names
with no semantic hint at all. Confirmed directly against a real Framer
site during development. So several extractors; key people, page
discovery, offerings fall back to a second signal when the first finds
nothing. Getting that fallback logic right took several real iterations,
including one full revert after an early version proved too broad on more
complex pages.

Every extractor is defensive — `fetchPage()` never throws, returning a
discriminated union so one unreachable page degrades the result to
`"partial"` rather than failing the whole scrape, and an unreachable
homepage degrades to `"failed"` with an otherwise-empty draft the user can
still fill in by hand. Fields that require judgment rather than
pattern-matching (`industry`, `businessModel`, `companyPitch`,
`writingStyle`, `targetBuyers`, `customerNeeds`) are left `null` by the
real extractors and filled by a separate, clearly-labeled mock enrichment
step so real extraction and simulated AI output are never
conflated in the data itself.

## 2. What information beyond our current baseline did you choose to include, and why?

Two categories:

- **Testimonials & Social Proof** (`testimonials[]`) — quote text, author
  name/title, and source context. Customer language is one of the
  highest-signal inputs for tone-matching and social proof in generated
  content, and who leaves a testimonial is often a better signal of the
  real target audience than the marketing copy itself.
- **Trust Signals** (`trustSignals[]`) — certifications, awards, licenses,
  memberships, guarantees, each with a type, issuer, and description.
  Small businesses lean heavily on credibility markers that generic
  marketing copy generation tends to omit unless it's explicitly
  structured data to draw from.

Beyond new categories, every record also carries a `dataQuality.flags[]`
array (field-path + status + optional note) that tracks completeness at
the individual-field level rather than only at the record level.

## 3. How would your knowledge base design improve the outputs of MoSocial, MoMail, and MoBlogs specifically?

- **MoSocial** `testimonial` and `trustSignals` are ready-made
  "customer spotlight" and credibility posts; `offerings[]` with real
  pricing and descriptions gives detail to write from.
- **MoMail** `targetBuyers`, `customerNeeds`, `ctas`, `funnels` lets generated
  email sequences map to an actual buyer journey instead of one generic
  voice for every client.
- **MoBlogs** `keyPeople[].description`, and `companyFoundation` give a blog generator
  real facts to ground an article in, and `trustSignals[]` supports
  credibility claims instead of unverifiable ones.

## 4. What would you improve or change about MoKnowledge if you had more time?

- **Real LLM enrichment**, replacing the mock templates in
  `src/lib/enrichment/` with actual calls.
- **Ranking, not just presence, for page discovery and offerings.** The
  current fallback logic only activates when the primary signal finds
  _nothing_; when it finds something wrong-but-non-empty, nothing corrects it.
  A scored/ranked approach across candidates would be better
  than "first non-empty wins."
- **Headless-browser fallback** for JavaScript-rendered content the static
  scraper can't see.
- **Versioning**, sketched in `docs/supabase-schema.md` but not
  implemented in the current JSON-file store

## 5. What was the most challenging part of this assignment?

Getting the fallback extraction logic to generalize, instead of overfitting
to whatever site I happened to be testing against. Testing on sample data was
simple and easy to debug the code but against real and more complex sites proved
to be more challenging to extract all the right data.
