'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TextField } from '../shared';
import { ScrapeStatusBadge } from '../shared';
import {
  CompanyFoundationSection,
  PositioningSection,
  MarketAndCustomersSection,
  BrandingAndStyleSection,
  OnlinePresenceSection,
} from '../SimpleSections';
import {
  KeyPeopleSection,
  OfferingsSection,
  TestimonialsSection,
  TrustSignalsSection,
} from '../ListSections';
import { cleanDraftForSave } from '../cleanDraftForSave';
import { downloadKnowledgeBaseJson } from '../downloadKnowledgeBaseJson';
import type { KnowledgeBase } from '@/types/knowledge-base';

type Status = 'idle' | 'saving' | 'deleting' | 'error';

export function KnowledgeDetailView({ initial }: { initial: KnowledgeBase }) {
  const router = useRouter();
  const [record, setRecord] = useState<KnowledgeBase>(initial);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSave() {
    setStatus('saving');
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/knowledge/${record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanDraftForSave(record)),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setErrorMessage(body?.error ?? "Couldn't save this knowledge base.");
        setStatus('error');
        return;
      }

      const updated: KnowledgeBase = await response.json();
      setRecord(updated);
      setStatus('idle');
    } catch {
      setErrorMessage(
        "Couldn't reach the server. Check your connection and try again."
      );
      setStatus('error');
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this knowledge base? This cannot be undone.')) {
      return;
    }
    setStatus('deleting');
    try {
      const response = await fetch(`/api/knowledge/${record.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        router.push('/knowledge/view');
        return;
      }
      setErrorMessage("Couldn't delete this knowledge base.");
      setStatus('error');
    } catch {
      setErrorMessage(
        "Couldn't reach the server. Check your connection and try again."
      );
      setStatus('error');
    }
  }

  const flags = record.dataQuality.flags;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/knowledge/view"
            className="text-sm text-neutral-500 underline"
          >
            ← All knowledge bases
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-2xl font-semibold">
              {record.companyName ?? 'Untitled'}
            </h1>
            <ScrapeStatusBadge status={record.scrapeStatus} />
          </div>
          <p className="text-sm text-neutral-500">
            {record.sourceUrl} · Updated{' '}
            {new Date(record.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => downloadKnowledgeBaseJson(record)}
          >
            Download JSON
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={status === 'deleting'}
          >
            {status === 'deleting' ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <TextField
        label="Company Name"
        field="companyName"
        flags={flags}
        value={record.companyName}
        onChange={(v) => setRecord({ ...record, companyName: v })}
      />

      <CompanyFoundationSection
        value={record.companyFoundation}
        flags={flags}
        onChange={(next) => setRecord({ ...record, companyFoundation: next })}
      />
      <PositioningSection
        value={record.positioning}
        flags={flags}
        onChange={(next) => setRecord({ ...record, positioning: next })}
      />
      <MarketAndCustomersSection
        value={record.marketAndCustomers}
        flags={flags}
        onChange={(next) => setRecord({ ...record, marketAndCustomers: next })}
      />
      <BrandingAndStyleSection
        value={record.brandingAndStyle}
        flags={flags}
        onChange={(next) => setRecord({ ...record, brandingAndStyle: next })}
      />
      <OnlinePresenceSection
        value={record.onlinePresence}
        flags={flags}
        onChange={(next) => setRecord({ ...record, onlinePresence: next })}
      />
      <KeyPeopleSection
        value={record.keyPeople}
        flags={flags}
        onChange={(next) => setRecord({ ...record, keyPeople: next })}
      />
      <OfferingsSection
        value={record.offerings}
        flags={flags}
        onChange={(next) => setRecord({ ...record, offerings: next })}
      />
      <TestimonialsSection
        value={record.testimonials}
        flags={flags}
        onChange={(next) => setRecord({ ...record, testimonials: next })}
      />
      <TrustSignalsSection
        value={record.trustSignals}
        flags={flags}
        onChange={(next) => setRecord({ ...record, trustSignals: next })}
      />

      <Button
        onClick={handleSave}
        disabled={status === 'saving'}
        className="self-start"
      >
        {status === 'saving' ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
