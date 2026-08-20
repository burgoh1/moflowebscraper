import { Home, Database, Library } from 'lucide-react';
import { SidebarLink } from './SidebarLink';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/knowledge', label: 'Build Knowledge Base', icon: Database },
  { href: '/knowledge/view', label: 'Browse Knowledge Base', icon: Library },
];

export function Sidebar() {
  return (
    <aside className="flex w-16 shrink-0 flex-col items-center gap-1 bg-surface py-4">
      <nav className="flex flex-col items-center gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <SidebarLink key={href} href={href} label={label}>
            <Icon size={20} strokeWidth={2} />
          </SidebarLink>
        ))}
      </nav>
    </aside>
  );
}
