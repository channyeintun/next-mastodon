'use client';

import Link, { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenSquare, Bookmark, Search, Settings, Coffee, Github, LogOut, Loader2 } from 'lucide-react';
import { useInstance } from '@/api/queries';
import type { Account } from '@/types/mastodon';

interface NavigationProps {
  isAuthenticated: boolean;
  instanceURL?: string | null;
  user?: Account | null;
}

export default function Navigation({ isAuthenticated, instanceURL, user }: NavigationProps) {
  const pathname = usePathname();
  const { data: instance, isLoading: isLoadingInstance } = useInstance();

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/compose', label: 'Create', icon: PenSquare },
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
          <Link href="/" className="navigation-sidebar-instance">
            {isLoadingInstance ? (
              <>
                <div className="skeleton" style={{ width: 40, height: 40, flexShrink: 0 }} />
                <div className="navigation-sidebar-instance-info" style={{ gap: 4 }}>
                  <div className="skeleton" style={{ height: 16, width: 96 }} />
                  <div className="skeleton" style={{ height: 12, width: 64 }} />
                </div>
              </>
            ) : instance ? (
              <>
                {instance.icon?.[instance.icon.length - 1]?.src || instance.thumbnail?.url ? (
                  <img
                    src={instance.icon?.[instance.icon.length - 1]?.src || instance.thumbnail?.url}
                    alt={instance.title}
                    className="navigation-instance-icon"
                  />
                ) : (
                  <div className="navigation-instance-placeholder">
                    <span>
                      {instance.title?.charAt(0) || 'M'}
                    </span>
                  </div>
                )}
                <div className="navigation-sidebar-instance-info">
                  <span className="navigation-sidebar-instance-title">{instance.title}</span>
                  <span className="navigation-sidebar-instance-domain">{instance.domain}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col">
                <span className="font-bold text-xl">Mastodon</span>
                {instanceURL && (
                  <span className="text-xs text-muted-foreground">
                    {instanceURL.replace('https://', '')}
                  </span>
                )}
              </div>
            )}
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
          {!isAuthenticated && (
            <Link href="/auth/signin" className="navigation-sidebar-signin">
              Sign In
            </Link>
          )}

          <a
            href="https://buymeacoffee.com/channyeintun"
            target="_blank"
            rel="noopener noreferrer"
            className="navigation-sidebar-link"
          >
            <div className="navigation-link-icon">
              <Coffee size={24} />
            </div>
            <span className="navigation-link-label">Buy me a coffee</span>
          </a>

          <a
            href="https://github.com/channyeintun/mastodon-nextjs-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="navigation-sidebar-link"
          >
            <div className="navigation-link-icon">
              <Github size={24} />
            </div>
            <span className="navigation-link-label">Source Code</span>
          </a>
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

  const className = variant === 'sidebar'
    ? `navigation-sidebar-link ${isActive ? 'active' : ''}`
    : `navigation-bottom-link ${isActive ? 'active' : ''}`;

  return (
    <Link
      href={href}
      className={className}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="navigation-link-icon">
        <Icon size={variant === 'sidebar' ? 24 : 22} />
      </div>
      <span className="navigation-link-label">{label}</span>
      <LinkStatus />
    </Link>
  );
}

const LinkStatus = () => {
  const status = useLinkStatus();

  return (
    <span className={`navigation-link-spinner ${status.pending ? 'pending' : ''}`} aria-label="Loading..." />
  );
}