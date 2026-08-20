'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, List as ListIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrapeStatusBadge } from '../shared';
import type { KnowledgeBase, ScrapeStatus } from '@/types/knowledge-base';

type ViewMode = 'card' | 'table';
type StatusFilter = 'all' | ScrapeStatus;

export function KnowledgeListView({
  initialData,
}: {
  initialData: KnowledgeBase[];
}) {
  const [items, setItems] = useState(initialData);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((kb) => {
      const matchesQuery =
        query.length === 0 ||
        (kb.companyName ?? '').toLowerCase().includes(query) ||
        kb.sourceUrl.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'all' || kb.scrapeStatus === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [items, search, statusFilter]);

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this knowledge base? This cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    try {
      const response = await fetch(`/api/knowledge/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setItems((prev) => prev.filter((kb) => kb.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Knowledge Bases</h1>
          <p className="text-sm text-neutral-500">
            {items.length} saved {items.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <Link href="/knowledge">
          <Button type="button">+ New</Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
          No knowledge bases yet.{' '}
          <Link href="/knowledge" className="font-medium text-black underline">
            Build one
          </Link>{' '}
          to get started.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or URL..."
              className="max-w-xs"
            />
            <select
              className="h-10 rounded-md border border-neutral-300 bg-white px-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="all">All statuses</option>
              <option value="success">Success</option>
              <option value="partial">Partial</option>
              <option value="failed">Failed</option>
            </select>
            <div className="ml-auto flex gap-1">
              <Button
                type="button"
                variant={viewMode === 'card' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('card')}
                aria-label="Card view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('table')}
                aria-label="Table view"
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
              No knowledge bases match your search.
            </div>
          ) : viewMode === 'card' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((kb) => (
                <Card key={kb.id}>
                  <CardHeader className="flex-row items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <CardTitle>{kb.companyName ?? 'Untitled'}</CardTitle>
                      <a
                        href={kb.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-neutral-500 underline"
                      >
                        {kb.sourceUrl}
                      </a>
                    </div>
                    <ScrapeStatusBadge status={kb.scrapeStatus} />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600">
                      {kb.companyFoundation.industry ?? 'Industry unknown'}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {kb.offerings.length} offerings ·{' '}
                      {kb.keyPeople.length} people ·{' '}
                      {kb.testimonials.length} testimonials
                    </p>
                    <p className="text-xs text-neutral-400">
                      Updated {new Date(kb.updatedAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Link href={`/knowledge/view/${kb.id}`} className="flex-1">
                        <Button type="button" variant="outline" className="w-full">
                          View
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(kb.id)}
                        disabled={deletingId === kb.id}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-neutral-200">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
                  <tr>
                    <th className="px-4 py-2">Company</th>
                    <th className="px-4 py-2">Website</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Industry</th>
                    <th className="px-4 py-2">Updated</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((kb) => (
                    <tr key={kb.id} className="border-b border-neutral-100 last:border-0">
                      <td className="px-4 py-2 font-medium">
                        {kb.companyName ?? 'Untitled'}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-2 text-neutral-500">
                        {kb.sourceUrl}
                      </td>
                      <td className="px-4 py-2">
                        <ScrapeStatusBadge status={kb.scrapeStatus} />
                      </td>
                      <td className="px-4 py-2 text-neutral-500">
                        {kb.companyFoundation.industry ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-neutral-500">
                        {new Date(kb.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/knowledge/view/${kb.id}`}>
                            <Button type="button" variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(kb.id)}
                            disabled={deletingId === kb.id}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
