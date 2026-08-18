import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">MoKnowledge</h1>
      <p className="text-muted-foreground">
        Scrape a company website and turn it into a structured, editable
        knowledge base.
      </p>
      <div className="flex gap-4">
        <Link
          href="/knowledge"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Build a knowledge base
        </Link>
        <Link
          href="/knowledge/view"
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          View saved knowledge bases
        </Link>
      </div>
    </main>
  );
}
