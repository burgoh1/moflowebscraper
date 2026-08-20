import Link from 'next/link';
import { TopBarActions } from './TopBarActions';

export function TopBar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-100 bg-surface px-6">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm font-semibold text-neutral-900"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-white">
          M
        </span>
        MoKnowledge
      </Link>

      <TopBarActions />
    </header>
  );
}
