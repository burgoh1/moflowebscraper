import { NextResponse } from 'next/server';
import { scrapeWebsite } from '@/lib/scraper/scrapeWebsite';
import { enrichDraft } from '@/lib/enrichment/mockEnrichment';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 }
    );
  }

  const url =
    typeof body === 'object' && body !== null && 'url' in body
      ? (body as { url: unknown }).url
      : undefined;

  if (typeof url !== 'string' || url.trim().length === 0) {
    return NextResponse.json(
      { error: "A non-empty 'url' string is required." },
      { status: 400 }
    );
  }

  let normalizedUrl: string;
  try {
    normalizedUrl = new URL(url.trim()).href;
  } catch {
    return NextResponse.json(
      { error: "That doesn't look like a valid URL." },
      { status: 400 }
    );
  }

  const draft = await scrapeWebsite(normalizedUrl);
  return NextResponse.json(enrichDraft(draft));
}
