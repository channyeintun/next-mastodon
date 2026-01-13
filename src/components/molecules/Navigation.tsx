'use client';

import Link, { useLinkStatus } from 'next/link';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { WrapstodonModal } from '@/components/wrapstodon/WrapstodonModal';
import { GiRingedPlanet } from 'react-icons/gi';
import React from 'react';

export interface NavigationLinkProps {
  href: string;
  icon: React.ComponentType<{ size: number }>;
  label: string;
  isActive: boolean;
  variant: 'sidebar' | 'bottom';
  badge?: number;
  textBadge?: string;
  highlight?: boolean;
}

export function NavigationLink({ href, icon: Icon, label, isActive, variant, badge, textBadge, highlight }: NavigationLinkProps) {
  const className = variant === 'sidebar'
    ? `navigation-sidebar-link ${isActive ? 'active' : ''} ${highlight ? 'highlight' : ''}`
    : `navigation-bottom-link ${isActive ? 'active' : ''}`;

  return (
    <Link
      href={href}
      className={className}
      aria-label={variant === 'bottom' ? label : undefined}
      aria-current={isActive ? 'page' : undefined}
      scroll={false}
    >
      <div className="navigation-link-icon">
        <Icon size={variant === 'sidebar' ? 24 : 22} />
        {badge !== undefined && badge > 0 && (
          <span
            className="badge-count"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`${badge > 99 ? '99+' : badge} unread notifications`}
          >
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      {variant !== 'bottom' && <span className="navigation-link-label">{label}</span>}
      {textBadge && <span className="badge-text">{textBadge}</span>}
      <LinkStatus />
    </Link>
  );
}

export const LinkStatus = () => {
  const status = useLinkStatus();
  if (!status.pending) return null;
  return (
    <span className="navigation-link-spinner pending" aria-label="Loading..." />
  );
}

interface WrapstodonButtonProps {
  year: number;
  highlight?: boolean;
  textBadge?: string;
}

export function WrapstodonButton({ year, highlight, textBadge }: WrapstodonButtonProps) {
  const { openModal, closeModal } = useGlobalModal();
  const handleClick = () => openModal(<WrapstodonModal onClose={closeModal} />);
  const className = `navigation-sidebar-link ${highlight ? 'highlight' : ''}`;

  return (
    <button
      onClick={handleClick}
      className={className}
      aria-label={`Wrapstodon ${year}`}
    >
      <div className="navigation-link-icon">
        <GiRingedPlanet style={{ fontSize: 24, width: 24, height: 24, minWidth: 24, minHeight: 24, flexShrink: 0 }} />
      </div>
      <span className="navigation-link-label">Wrapstodon {year}</span>
      {textBadge && <span className="badge-text">{textBadge}</span>}
    </button>
  );
}
