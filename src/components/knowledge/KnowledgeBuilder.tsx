'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CompanyFoundationSection,
  PositioningSection,
  MarketAndCustomersSection,
  BrandingAndStyleSection,
  OnlinePresenceSection,
} from './SimpleSections';
import {
  KeyPeopleSection,
  OfferingsSection,
  TestimonialsSection,
  TrustSignalsSection,
} from './ListSections';
import type { KnowledgeBaseDraft } from '@/types/knowledge-base';

type Status = 'idle' | 'loading' | 'error' | 'ready' | 'saving';

function cleanString(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function cleanStringList(values: string[]): string[] {
  return values.map((v) => v.trim()).filter(Boolean);
}

// Textareas keep blank lines/entries while the user is actively editing (see
// StringListField) so the controlled input doesn't fight their cursor. This
// is the one place that gets cleaned up, right before the draft is sent to
// the server — converting "" back to null and dropping blank list entries.
function cleanDraftForSave(draft: KnowledgeBaseDraft): KnowledgeBaseDraft {
  return {
    ...draft,
    companyName: cleanString(draft.companyName),
    companyFoundation: {
      ...draft.companyFoundation,
      overview: cleanString(draft.companyFoundation.overview),
      website: cleanString(draft.companyFoundation.website),
      industry: cleanString(draft.companyFoundation.industry),
      businessModel: cleanString(draft.companyFoundation.businessModel),
      companyRole: cleanString(draft.companyFoundation.companyRole),
      legalEntityType: cleanString(draft.companyFoundation.legalEntityType),
      mainAddress: cleanString(draft.companyFoundation.mainAddress),
      otherLocations: cleanStringList(draft.companyFoundation.otherLocations),
      serviceLocations: cleanStringList(
        draft.companyFoundation.serviceLocations
      ),
      alternativeNames: cleanStringList(
        draft.companyFoundation.alternativeNames
      ),
    },
    positioning: {
      companyPitch: cleanString(draft.positioning.companyPitch),
      foundingStory: cleanString(draft.positioning.foundingStory),
    },
    marketAndCustomers: {
      ...draft.marketAndCustomers,
      targetBuyers: cleanStringList(draft.marketAndCustomers.targetBuyers),
      customerNeeds: cleanString(draft.marketAndCustomers.customerNeeds),
      idealCustomerPersona: cleanString(
        draft.marketAndCustomers.idealCustomerPersona
      ),
      industryGroupings: cleanStringList(
        draft.marketAndCustomers.industryGroupings
      ),
      industryOutlook: cleanString(draft.marketAndCustomers.industryOutlook),
      channels: cleanStringList(draft.marketAndCustomers.channels),
      funnels: cleanStringList(draft.marketAndCustomers.funnels),
      ctas: cleanStringList(draft.marketAndCustomers.ctas),
      suppliersOrPartners: cleanStringList(
        draft.marketAndCustomers.suppliersOrPartners
      ),
    },
    brandingAndStyle: {
      ...draft.brandingAndStyle,
      writingStyle: cleanString(draft.brandingAndStyle.writingStyle),
      artStyle: cleanString(draft.brandingAndStyle.artStyle),
      fonts: cleanStringList(draft.brandingAndStyle.fonts),
      brandColors: cleanStringList(draft.brandingAndStyle.brandColors),
      logos: cleanStringList(draft.brandingAndStyle.logos),
    },
    onlinePresence: {
      socialLinks: draft.onlinePresence.socialLinks.filter(
        (link) => link.url.trim().length > 0
      ),
    },
    keyPeople: draft.keyPeople
      .filter((person) => person.name.trim().length > 0)
      .map((person) => ({
        ...person,
        title: cleanString(person.title),
        description: cleanString(person.description),
      })),
    offerings: draft.offerings
      .filter((offering) => offering.name.trim().length > 0)
      .map((offering) => ({
        ...offering,
        category: cleanString(offering.category),
        description: cleanString(offering.description),
        pricing: cleanString(offering.pricing),
        features: cleanStringList(offering.features),
      })),
    testimonials: draft.testimonials
      .filter((testimonial) => testimonial.quoteText.trim().length > 0)
      .map((testimonial) => ({
        ...testimonial,
        authorName: cleanString(testimonial.authorName),
        authorTitleOrCompany: cleanString(testimonial.authorTitleOrCompany),
        sourceContext: cleanString(testimonial.sourceContext),
      })),
    trustSignals: draft.trustSignals
      .filter((signal) => signal.label.trim().length > 0)
      .map((signal) => ({
        ...signal,
        issuer: cleanString(signal.issuer),
        description: cleanString(signal.description),
      })),
  };
}

export function KnowledgeBuilder() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState<KnowledgeBaseDraft | null>(null);

  async function handleScrape(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      setErrorMessage('Enter a company website URL to get started.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setErrorMessage(
          body?.error ?? 'Something went wrong while scraping that site.'
        );
        setStatus('error');
        return;
      }

      const result: KnowledgeBaseDraft = await response.json();
      setDraft(result);
      setStatus('ready');
    } catch {
      setErrorMessage(
        "Couldn't reach the server. Check your connection and try again."
      );
      setStatus('error');
    }
  }

  async function handleSave() {
    if (!draft) return;
    setStatus('saving');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanDraftForSave(draft)),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setErrorMessage(body?.error ?? "Couldn't save this knowledge base.");
        setStatus('ready');
        return;
      }

      router.push('/knowledge/view');
    } catch {
      setErrorMessage(
        "Couldn't reach the server. Check your connection and try again."
      );
      setStatus('ready');
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold">Build a Knowledge Base</h1>
        <p className="text-sm text-neutral-500">
          Enter a company website and we&apos;ll scrape and structure what we
          find.
        </p>
      </div>

      <form onSubmit={handleScrape} className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          disabled={status === 'loading'}
        />
        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Scraping...' : 'Scrape'}
        </Button>
      </form>

      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {status === 'loading' && (
        <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
          Fetching the homepage and a few internal pages, then extracting what
          we can find. This can take a few seconds…
        </div>
      )}

      {draft && (
        <>
          {draft.scrapeStatus === 'failed' && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              We couldn&apos;t reach that site. You can still fill in the
              knowledge base by hand below.
            </div>
          )}
          {draft.scrapeStatus === 'partial' && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Some pages on this site couldn&apos;t be fetched — review the
              fields below for gaps.
            </div>
          )}

          <CompanyFoundationSection
            value={draft.companyFoundation}
            flags={draft.dataQuality.flags}
            onChange={(next) => setDraft({ ...draft, companyFoundation: next })}
          />
          <PositioningSection
            value={draft.positioning}
            flags={draft.dataQuality.flags}
            onChange={(next) => setDraft({ ...draft, positioning: next })}
          />
          <MarketAndCustomersSection
            value={draft.marketAndCustomers}
            flags={draft.dataQuality.flags}
            onChange={(next) =>
              setDraft({ ...draft, marketAndCustomers: next })
            }
          />
          <BrandingAndStyleSection
            value={draft.brandingAndStyle}
            flags={draft.dataQuality.flags}
            onChange={(next) => setDraft({ ...draft, brandingAndStyle: next })}
          />
          <OnlinePresenceSection
            value={draft.onlinePresence}
            flags={draft.dataQuality.flags}
            onChange={(next) => setDraft({ ...draft, onlinePresence: next })}
          />
          <KeyPeopleSection
            value={draft.keyPeople}
            flags={draft.dataQuality.flags}
            onChange={(next) => setDraft({ ...draft, keyPeople: next })}
          />
          <OfferingsSection
            value={draft.offerings}
            flags={draft.dataQuality.flags}
            onChange={(next) => setDraft({ ...draft, offerings: next })}
          />
          <TestimonialsSection
            value={draft.testimonials}
            flags={draft.dataQuality.flags}
            onChange={(next) => setDraft({ ...draft, testimonials: next })}
          />
          <TrustSignalsSection
            value={draft.trustSignals}
            flags={draft.dataQuality.flags}
            onChange={(next) => setDraft({ ...draft, trustSignals: next })}
          />

          <Button
            onClick={handleSave}
            disabled={status === 'saving'}
            className="self-start"
          >
            {status === 'saving' ? 'Saving...' : 'Save Knowledge Base'}
          </Button>
        </>
      )}
    </div>
  );
}
