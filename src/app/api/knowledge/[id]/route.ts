import { NextResponse } from 'next/server';
import {
  getKnowledgeBase,
  updateKnowledgeBase,
  deleteKnowledgeBase,
} from '@/lib/store/knowledgeBaseStore';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const knowledgeBase = await getKnowledgeBase(id);

  if (!knowledgeBase) {
    return NextResponse.json(
      { error: 'Knowledge base not found.' },
      { status: 404 }
    );
  }
  return NextResponse.json(knowledgeBase);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;

  let patch: unknown;
  try {
    patch = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 }
    );
  }

  if (typeof patch !== 'object' || patch === null) {
    return NextResponse.json(
      { error: 'Request body must be a JSON object.' },
      { status: 400 }
    );
  }

  const updated = await updateKnowledgeBase(id, patch);
  if (!updated) {
    return NextResponse.json(
      { error: 'Knowledge base not found.' },
      { status: 404 }
    );
  }
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const deleted = await deleteKnowledgeBase(id);

  if (!deleted) {
    return NextResponse.json(
      { error: 'Knowledge base not found.' },
      { status: 404 }
    );
  }
  return new NextResponse(null, { status: 204 });
}
