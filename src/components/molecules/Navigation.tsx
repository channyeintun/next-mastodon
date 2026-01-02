'use client';

import styled from '@emotion/styled';
import Link, { useLinkStatus } from 'next/link';
import { useRouter } from 'next/router';
import { Home, PenSquare, Search, Settings, Github, Bell, List, TrendingUp, Mail } from 'lucide-react';
import { useInstance, useUnreadNotificationCount, useNotificationMarker, useAnnualReportState } from '@/api';
import { CircleSkeleton, TextSkeleton } from '@/components/atoms';
import { SiBuymeacoffee } from 'react-icons/si';
import { GiRingedPlanet } from 'react-icons/gi';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { WrapstodonModal } from '@/components/wrapstodon/WrapstodonModal';
import { useStores } from '@/hooks/useStores';

interface NavigationProps {
  isAuthenticated: boolean;
  instanceURL?: string | null;
}

export default function Navigation({ isAuthenticated, instanceURL }: NavigationProps) {
  const router = useRouter();
  const pathname = router.pathname;
  const { data: instance, isLoading: isLoadingInstance } = useInstance();
  const { data: unreadCount } = useUnreadNotificationCount();
  const { initialAnnualReportState, initialWrapstodonYear } = useStores();

  // Get Wrapstodon year from instance - the server tells us which year is available
  // Use SSR initial year as fallback while instance is loading
  const wrapstodonYear = instance?.wrapstodon ?? initialWrapstodonYear;

  // Get current year to check if wrapstodon is for the current year
  const currentYear = new Date().getFullYear();
  const isCurrentYear = wrapstodonYear === currentYear;

  // Check if Wrapstodon is available for the user (only if server has current year set)
  const { data: annualReportState } = useAnnualReportState(wrapstodonYear ?? 0, {
    enabled: isAuthenticated && !!wrapstodonYear && isCurrentYear,
  });

  // Use SSR initial state as fallback while loading
  const effectiveState = annualReportState?.state ?? initialAnnualReportState;

  // Show Wrapstodon link if server has current year and user is eligible, generating, or has available report
  const showWrapstodon = isCurrentYear && effectiveState && effectiveState !== 'ineligible';

  // Prefetch notification marker globally so it's available immediately when visiting notifications
  useNotificationMarker();

  // Desktop sidebar includes all links
  const sidebarNavLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/explore', label: 'Trending', icon: TrendingUp },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/compose', label: 'Create', icon: PenSquare },
    { href: '/conversations', label: 'Messages', icon: Mail },
    { href: '/lists', label: 'Lists', icon: List },
    { href: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount?.count },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  // Mobile bottom nav is simplified - explore accessible via Settings
  const bottomNavLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/conversations', label: 'Messages', icon: Mail },
    { href: '/compose', label: 'Create', icon: PenSquare },
    { href: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount?.count },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <nav className="navigation-sidebar" aria-label="Site navigation">
        {/* Logo */}
        <div className="navigation-sidebar-header">
          <Link href="/" className="navigation-sidebar-instance">
            {isLoadingInstance ? (
              <>
                <CircleSkeleton size="40px" />
                <InstanceInfoSkeleton className="navigation-sidebar-instance-info">
                  <TextSkeleton width={96} height={16} />
                  <TextSkeleton width={64} height={12} />
                </InstanceInfoSkeleton>
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
                  <span className="navigation-sidebar-instance-title text-truncate">{instance.title}</span>
                  <span className="navigation-sidebar-instance-domain text-truncate">{instance.domain}</span>
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
          <nav className="navigation-sidebar-nav" aria-label="Main navigation">
            {sidebarNavLinks.map((link) => {
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
                  badge={link.badge}
                />
              );
            })}

            {/* Wrapstodon - shown dynamically based on API state or SSR cookie */}
            {showWrapstodon && wrapstodonYear && (
              <WrapstodonButton
                year={wrapstodonYear}
                highlight={effectiveState === 'available'}
                textBadge={effectiveState === 'available' ? 'New' : undefined}
              />
            )}
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
            href="https://github.com/channyeintun/mastodon-nextjs-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="navigation-sidebar-link"
          >
            <div className="navigation-link-icon">
              <Github size={24} />
            </div>
            <span className="navigation-link-label">Source code</span>
          </a>

          <a
            href="https://buymeacoffee.com/channyeintun"
            target="_blank"
            rel="noopener noreferrer"
            className="navigation-sidebar-link"
          >
            <div className="navigation-link-icon">
              <SiBuymeacoffee size={24} />
            </div>
            <span className="navigation-link-label">Buy me a coffee</span>
          </a>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && (
        <nav className="navigation-bottom" aria-label="Mobile navigation">
          {bottomNavLinks.map((link) => {
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
                badge={link.badge}
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
  badge?: number;
  textBadge?: string;
  highlight?: boolean;
}

function NavigationLink({ href, icon: Icon, label, isActive, variant, badge, textBadge, highlight }: NavigationLinkProps) {

  const className = variant === 'sidebar'
    ? `navigation-sidebar-link ${isActive ? 'active' : ''} ${highlight ? 'highlight' : ''}`
    : `navigation-bottom-link ${isActive ? 'active' : ''}`;

  return (
    <Link
      href={href}
      className={className}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      scroll={false}
    >
      <IconWrapper className="navigation-link-icon">
        <Icon size={variant === 'sidebar' ? 24 : 22} />
        {badge !== undefined && badge > 0 && (
          <Badge
            aria-live="polite"
            aria-atomic="true"
            aria-label={`${badge > 99 ? '99+' : badge} unread notifications`}
          >
            {badge > 99 ? '99+' : badge}
          </Badge>
        )}
      </IconWrapper>
      <span className="navigation-link-label">{label}</span>
      {textBadge && <TextBadge>{textBadge}</TextBadge>}
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

// Styled components
const InstanceInfoSkeleton = styled.div`
  gap: 4px;
`;

const IconWrapper = styled.div`
  position: relative;
`;

const Badge = styled.span`
  position: absolute;
  top: -4px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 10px;
  font-weight: bold;
  color: white;
  background: var(--red-6);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -8px;
  padding: 2px 5px;
  font-size: 7px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
`;

// Wrapstodon button component that opens the modal
interface WrapstodonButtonProps {
  year: number;
  highlight?: boolean;
  textBadge?: string;
}

function WrapstodonButton({ year, highlight, textBadge }: WrapstodonButtonProps) {
  const { openModal, closeModal } = useGlobalModal();

  const handleClick = () => {
    openModal(<WrapstodonModal onClose={closeModal} />);
  };

  const className = `navigation-sidebar-link ${highlight ? 'highlight' : ''}`;

  return (
    <button
      onClick={handleClick}
      className={className}
      aria-label={`Wrapstodon ${year}`}
    >
      <IconWrapper className="navigation-link-icon">
        <GiRingedPlanet style={{ fontSize: 24, width: 24, height: 24, minWidth: 24, minHeight: 24, flexShrink: 0 }} />
      </IconWrapper>
      <span className="navigation-link-label">Wrapstodon {year}</span>
      {textBadge && <TextBadge>{textBadge}</TextBadge>}
    </button>
  );
}
