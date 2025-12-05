'use client';

import Link, { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenSquare, Bookmark, Search, Settings } from 'lucide-react';

interface NavigationProps {
  isAuthenticated: boolean;
  instanceURL?: string | null;
}

export default function Navigation({ isAuthenticated, instanceURL }: NavigationProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/compose', label: 'Compose', icon: PenSquare },
    { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="navigation-sidebar">
        {/* Logo */}
        <div className="navigation-sidebar-header">
          <Link href="/" className="navigation-sidebar-logo">
            Mastodon
          </Link>
        </div>

        {/* Navigation Links */}
        {isAuthenticated && (
          <nav className="navigation-sidebar-nav">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <NavigationLink
                  key={link.href}
                  href={link.href}
                  icon={Icon}
                  label={link.label}
                  isActive={isActive}
                  variant="sidebar"
                />
              );
            })}
          </nav>
        )}

        {/* User Info / Auth */}
        <div className="navigation-sidebar-footer">
          {isAuthenticated ? (
            <div className="navigation-sidebar-instance">
              {instanceURL?.replace('https://', '')}
            </div>
          ) : (
            <Link href="/auth/signin" className="navigation-sidebar-signin">
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && (
        <nav className="navigation-bottom">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <NavigationLink
                key={link.href}
                href={link.href}
                icon={Icon}
                label={link.label}
                isActive={isActive}
                variant="bottom"
              />
            );
          })}
        </nav>
      )}
    </>
  );
}

interface NavigationLinkProps {
  href: string;
  icon: React.ComponentType<{ size: number }>;
  label: string;
  isActive: boolean;
  variant: 'sidebar' | 'bottom';
}

function NavigationLink({ href, icon: Icon, label, isActive, variant }: NavigationLinkProps) {
  const status = useLinkStatus(href);
  const isPending = status === 'pending';

  const className = variant === 'sidebar'
    ? `navigation-sidebar-link ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`
    : `navigation-bottom-link ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`;

  return (
    <Link
      href={href}
      className={className}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="navigation-link-icon">
        <Icon size={variant === 'sidebar' ? 24 : 22} />
        {isPending && (
          <span className="navigation-link-spinner" aria-label="Loading..." />
        )}
      </div>
      <span className="navigation-link-label">{label}</span>
    </Link>
  );
}
