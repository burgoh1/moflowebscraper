import { NextResponse } from 'next/server';
import {
  listKnowledgeBases,
  createKnowledgeBase,
} from '@/lib/store/knowledgeBaseStore';
import type { KnowledgeBaseDraft } from '@/types/knowledge-base';

export async function GET() {
  const knowledgeBases = await listKnowledgeBases();
  return NextResponse.json(knowledgeBases);
}

export async function POST(request: Request) {
  let draft: unknown;
  try {
    draft = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 }
    );
  }

  if (!isKnowledgeBaseDraft(draft)) {
    return NextResponse.json(
      { error: 'Request body is missing required knowledge base fields.' },
      { status: 400 }
    );
  }

  const saved = await createKnowledgeBase(draft);
  return NextResponse.json(saved, { status: 201 });
}

// A lightweight structural check, not full schema validation — good enough
// to catch "this isn't even shaped like a draft" before writing it to disk.
function isKnowledgeBaseDraft(value: unknown): value is KnowledgeBaseDraft {
  return (
    typeof value === 'object' &&
    value !== null &&
    'sourceUrl' in value &&
    'companyFoundation' in value
  );
}
