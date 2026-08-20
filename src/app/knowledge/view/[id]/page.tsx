import { notFound } from 'next/navigation';
import { getKnowledgeBase } from '@/lib/store/knowledgeBaseStore';
import { KnowledgeDetailView } from '@/components/knowledge/view/KnowledgeDetailView';

type PageProps = { params: Promise<{ id: string }> };

export default async function KnowledgeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const knowledgeBase = await getKnowledgeBase(id);

  if (!knowledgeBase) {
    notFound();
  }

  return <KnowledgeDetailView initial={knowledgeBase} />;
}
