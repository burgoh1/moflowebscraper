'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
  href: string;
  label: string;
  children: ReactNode;
}

export function SidebarLink({ href, label, children }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      title={label}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
        isActive
          ? 'bg-primary-subtle text-primary'
          : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600'
      )}
    >
      {children}
    </Link>
  );
}
