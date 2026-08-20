# Supabase Schema Design (Bonus)

Documentation only — no real Supabase project or client code. This sketches
how the current JSON-file store (`src/lib/store/knowledgeBaseStore.ts`)
would map onto Postgres/Supabase if MoKnowledge needed multi-company
support, real persistence, and version history.

## Design decisions

- **`companies` is the tenant boundary.** Every other table traces back to
  a `company_id`, either directly or through `knowledge_base_id`. RLS is
  built entirely around company membership.
- **Versioning via a separate `knowledge_base_versions` table**, not a
  version column on one mutable row. `knowledge_bases` is a stable
  identity (one row per tracked company site); each scrape or manual save
  creates a new row in `knowledge_base_versions` and moves
  `knowledge_bases.current_version_id` to point at it. This preserves full
  history for free (diffing, rollback, audit) instead of overwriting data
  in place the way the current JSON-file store does.
- **Nested 1:1 objects stay JSONB; arrays become tables.** `companyFoundation`,
  `positioning`, `marketAndCustomers`, and `brandingAndStyle` are single
  nested objects per version — normalizing them into more tables would add
  joins without adding query value, so they stay JSONB columns on
  `knowledge_base_versions`. `keyPeople`, `offerings`, `testimonials`,
  `trustSignals`, `socialLinks`, and `dataQuality.flags` are all arrays
  that benefit from being individually queryable/filterable (e.g. "find all
  offerings mentioning tax prep across every company"), so each gets its
  own table with a foreign key back to the version.

## Tables

```sql
-- Tenant boundary. Every knowledge base belongs to exactly one company.
create table companies (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  created_at   timestamptz not null default now()
);

-- Membership join table — who can see/edit a company's data, and at what
-- level. Backs every RLS policy below.
create table company_members (
  company_id   uuid not null references companies(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null check (role in ('owner', 'editor', 'viewer')),
  created_at   timestamptz not null default now(),
  primary key (company_id, user_id)
);

-- Stable identity for "this company's knowledge base." Points at whichever
-- version is current; history lives in knowledge_base_versions.
create table knowledge_bases (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid not null references companies(id) on delete cascade,
  source_url         text not null,
  current_version_id uuid references knowledge_base_versions(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (company_id, source_url)
);

-- One row per scrape/save. Append-only — never updated in place, so this
-- table is the version history.
create table knowledge_base_versions (
  id                    uuid primary key default gen_random_uuid(),
  knowledge_base_id     uuid not null references knowledge_bases(id) on delete cascade,
  version_number        integer not null,
  scrape_status         text not null check (scrape_status in ('pending','success','partial','failed')),
  company_name          text,
  pages_scraped         jsonb not null default '[]',
  company_foundation    jsonb not null default '{}',
  positioning           jsonb not null default '{}',
  market_and_customers  jsonb not null default '{}',
  branding_and_style    jsonb not null default '{}',
  created_by            uuid references auth.users(id),
  created_at            timestamptz not null default now(),
  unique (knowledge_base_id, version_number)
);

create table social_links (
  id                        uuid primary key default gen_random_uuid(),
  knowledge_base_version_id uuid not null references knowledge_base_versions(id) on delete cascade,
  platform                  text not null check (platform in ('linkedin','facebook','instagram','twitter_x','youtube','tiktok','other')),
  url                       text not null
);

create table key_people (
  id                        uuid primary key default gen_random_uuid(),
  knowledge_base_version_id uuid not null references knowledge_base_versions(id) on delete cascade,
  name                      text not null,
  title                     text,
  gender                    text check (gender in ('male','female','unspecified')),
  description               text,
  sort_order                integer not null default 0
);

create table offerings (
  id                        uuid primary key default gen_random_uuid(),
  knowledge_base_version_id uuid not null references knowledge_base_versions(id) on delete cascade,
  name                      text not null,
  offering_type             text not null check (offering_type in ('product','service','package','subscription')),
  category                  text,
  description               text,
  features                  jsonb not null default '[]',  -- string[], leaf array, not independently queried
  pricing                   text,
  sort_order                integer not null default 0
);

create table testimonials (
  id                        uuid primary key default gen_random_uuid(),
  knowledge_base_version_id uuid not null references knowledge_base_versions(id) on delete cascade,
  quote_text                text not null,
  author_name               text,
  author_title_or_company   text,
  source_context            text,
  sort_order                integer not null default 0
);

create table trust_signals (
  id                        uuid primary key default gen_random_uuid(),
  knowledge_base_version_id uuid not null references knowledge_base_versions(id) on delete cascade,
  label                     text not null,
  type                      text not null check (type in ('certification','award','license','membership','guarantee','other')),
  issuer                    text,
  description               text,
  sort_order                integer not null default 0
);

create table data_quality_flags (
  id                        uuid primary key default gen_random_uuid(),
  knowledge_base_version_id uuid not null references knowledge_base_versions(id) on delete cascade,
  field_path                text not null,  -- e.g. "companyFoundation.industry"
  status                    text not null check (status in ('missing','low_confidence','ai_generated_mock')),
  note                      text
);

create index on knowledge_base_versions (knowledge_base_id);
create index on key_people (knowledge_base_version_id);
create index on offerings (knowledge_base_version_id);
create index on testimonials (knowledge_base_version_id);
create index on trust_signals (knowledge_base_version_id);
create index on social_links (knowledge_base_version_id);
create index on data_quality_flags (knowledge_base_version_id);
```

## Relationships

```
companies 1──* company_members *──1 auth.users
companies 1──* knowledge_bases
knowledge_bases 1──* knowledge_base_versions
knowledge_bases 1──1 knowledge_base_versions   (current_version_id, nullable FK)
knowledge_base_versions 1──* key_people
knowledge_base_versions 1──* offerings
knowledge_base_versions 1──* testimonials
knowledge_base_versions 1──* trust_signals
knowledge_base_versions 1──* social_links
knowledge_base_versions 1──* data_quality_flags
```

## Row Level Security

RLS is enabled on every table; access is derived from `company_members`.
Child tables (`key_people`, `offerings`, etc.) check membership by joining
back up through `knowledge_base_versions → knowledge_bases → company_id`.

```sql
alter table companies enable row level security;
alter table company_members enable row level security;
alter table knowledge_bases enable row level security;
alter table knowledge_base_versions enable row level security;
alter table key_people enable row level security;
alter table offerings enable row level security;
alter table testimonials enable row level security;
alter table trust_signals enable row level security;
alter table social_links enable row level security;
alter table data_quality_flags enable row level security;

-- Members can see their own company; only owners can update company metadata.
create policy "members can view their company"
  on companies for select
  using (id in (select company_id from company_members where user_id = auth.uid()));

create policy "owners can update their company"
  on companies for update
  using (id in (
    select company_id from company_members
    where user_id = auth.uid() and role = 'owner'
  ));

-- Knowledge bases: any member can read; editors/owners can write.
create policy "members can view knowledge bases"
  on knowledge_bases for select
  using (company_id in (select company_id from company_members where user_id = auth.uid()));

create policy "editors can modify knowledge bases"
  on knowledge_bases for insert with check (
    company_id in (
      select company_id from company_members
      where user_id = auth.uid() and role in ('owner', 'editor')
    )
  );

create policy "editors can update knowledge bases"
  on knowledge_bases for update using (
    company_id in (
      select company_id from company_members
      where user_id = auth.uid() and role in ('owner', 'editor')
    )
  );

-- Versions and every child table follow the same shape: join up to
-- knowledge_bases.company_id, then check company_members. Shown once for
-- knowledge_base_versions; the pattern repeats identically for key_people,
-- offerings, testimonials, trust_signals, social_links, data_quality_flags
-- (swap the join target from knowledge_base_versions to the child table).
create policy "members can view versions"
  on knowledge_base_versions for select
  using (
    knowledge_base_id in (
      select id from knowledge_bases
      where company_id in (
        select company_id from company_members where user_id = auth.uid()
      )
    )
  );

create policy "editors can insert versions"
  on knowledge_base_versions for insert with check (
    knowledge_base_id in (
      select id from knowledge_bases
      where company_id in (
        select company_id from company_members
        where user_id = auth.uid() and role in ('owner', 'editor')
      )
    )
  );
```

`knowledge_base_versions` intentionally has no `update`/`delete` policy —
versions are append-only. "Editing" a saved knowledge base in the app means
inserting a new version and repointing `current_version_id`, not mutating
history.

## How this supports multiple companies and versioning

- **Multiple companies:** every table traces back to `company_id` (directly
  or via `knowledge_base_id`), and RLS enforces that a user only ever sees
  rows for companies they belong to via `company_members`. A user on
  multiple companies (e.g. an agency managing several client knowledge
  bases) just has multiple `company_members` rows.
- **Versioning:** `knowledge_base_versions` is append-only and keeps full
  history per `knowledge_base_id`; `knowledge_bases.current_version_id`
  is the only mutable pointer, so "what does this company's knowledge base
  look like right now" is a single indexed lookup, while "what did it look
  like before the March re-scrape" is a normal historical query — `select *
  from knowledge_base_versions where knowledge_base_id = $1 order by
  version_number desc`. This is the piece the current JSON-file store
  (`data/knowledge-bases/<uuid>.json`, overwritten in place by
  `updateKnowledgeBase`) doesn't have — every edit or re-scrape today loses
  the previous snapshot.
