'use client';

import { useState } from 'react';
import { Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TopBarActions() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Notifications"
        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
      >
        <Bell size={18} />
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Account menu"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
        >
          <User size={18} />
        </button>

        {menuOpen && (
          <>
            {/* click-outside catcher */}
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setMenuOpen(false)}
            />
            <div
              role="menu"
              className={cn(
                'absolute right-0 z-20 mt-2 w-40 rounded-2xl bg-surface p-1',
                'shadow-card'
              )}
            >
              <button
                type="button"
                role="menuitem"
                className="w-full rounded-full px-3 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-100"
              >
                Settings
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
