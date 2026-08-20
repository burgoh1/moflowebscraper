import { listKnowledgeBases } from '@/lib/store/knowledgeBaseStore';
import { KnowledgeListView } from '@/components/knowledge/view/KnowledgeListView';

export default async function KnowledgeViewPage() {
  const knowledgeBases = await listKnowledgeBases();
  return <KnowledgeListView initialData={knowledgeBases} />;
}
