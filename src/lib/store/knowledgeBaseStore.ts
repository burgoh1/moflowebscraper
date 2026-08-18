import { randomUUID } from 'crypto';
import { mkdir, readFile, writeFile, unlink, readdir } from 'fs/promises';
import path from 'path';
import type { KnowledgeBase, KnowledgeBaseDraft } from '@/types/knowledge-base';

const DATA_DIR = path.join(process.cwd(), 'data', 'knowledge-bases');

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

function filePathFor(id: string): string {
  return path.join(DATA_DIR, `${id}.json`);
}

export async function listKnowledgeBases(): Promise<KnowledgeBase[]> {
  await ensureDataDir();
  const files = await readdir(DATA_DIR);
  const jsonFiles = files.filter((file) => file.endsWith('.json'));

  const entries = await Promise.all(
    jsonFiles.map(async (file) => {
      const raw = await readFile(path.join(DATA_DIR, file), 'utf-8');
      return JSON.parse(raw) as KnowledgeBase;
    })
  );

  return entries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getKnowledgeBase(
  id: string
): Promise<KnowledgeBase | null> {
  try {
    const raw = await readFile(filePathFor(id), 'utf-8');
    return JSON.parse(raw) as KnowledgeBase;
  } catch {
    return null; // file doesn't exist (or isn't valid JSON) — either way, "not found"
  }
}

export async function createKnowledgeBase(
  draft: KnowledgeBaseDraft
): Promise<KnowledgeBase> {
  await ensureDataDir();
  const now = new Date().toISOString();

  const knowledgeBase: KnowledgeBase = {
    ...draft,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  await writeFile(
    filePathFor(knowledgeBase.id),
    JSON.stringify(knowledgeBase, null, 2)
  );
  return knowledgeBase;
}

export async function updateKnowledgeBase(
  id: string,
  patch: Partial<Omit<KnowledgeBase, 'id' | 'createdAt'>>
): Promise<KnowledgeBase | null> {
  const existing = await getKnowledgeBase(id);
  if (!existing) return null;

  const updated: KnowledgeBase = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  await writeFile(filePathFor(id), JSON.stringify(updated, null, 2));
  return updated;
}

export async function deleteKnowledgeBase(id: string): Promise<boolean> {
  try {
    await unlink(filePathFor(id));
    return true;
  } catch {
    return false; // already gone, or never existed
  }
}
