'use client';

import styled from '@emotion/styled';
import Link from 'next/link';
import { MoreHorizontal, Ban, VolumeX, Volume2, Bell, BellRing } from 'lucide-react';
import { Button, IconButton } from '@/components/atoms';
import { useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface ProfileActionButtonsProps {
    isOwnProfile: boolean;
    isBlocking: boolean;
    isMuting: boolean;
    isFollowing: boolean;
    isRequested?: boolean;
    isNotifying?: boolean;
    isLoading: boolean;
    isMutePending: boolean;
    isBlockPending: boolean;
    isNotifyPending?: boolean;
    acct: string;
    onFollowToggle: () => void;
    onMuteToggle: () => void;
    onBlockToggle: () => void;
    onNotifyToggle?: () => void;
}

/**
 * Presentation component for profile action buttons
 * (edit profile, follow/unfollow, notification toggle, mute/block menu).
 */
export function ProfileActionButtons({
    isOwnProfile,
    isBlocking,
    isMuting,
    isFollowing,
    isRequested,
    isNotifying,
    isLoading,
    isMutePending,
    isBlockPending,
    isNotifyPending,
    acct,
    onFollowToggle,
    onMuteToggle,
    onBlockToggle,
    onNotifyToggle,
}: ProfileActionButtonsProps) {
    const t = useTranslations('account');
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    if (isOwnProfile) {
        return (
            <Link href="/profile/edit">
                <Button variant="secondary">
                    {t('editProfile')}
                </Button>
            </Link>
        );
    }

    return (
        <ButtonContainer>
            {!isBlocking && (
                <Button
                    variant={isFollowing || isRequested ? 'secondary' : 'primary'}
                    onClick={onFollowToggle}
                    isLoading={isLoading}
                >
                    {isRequested ? t('requested') : (isFollowing ? t('following') : t('follow'))}
                </Button>
            )}

            {/* Notification toggle - only show when following */}
            {isFollowing && onNotifyToggle && (
                <NotifyButton
                    onClick={onNotifyToggle}
                    title={isNotifying ? t('stopNotifying', { acct }) : t('startNotifying', { acct })}
                    disabled={isNotifyPending}
                    $isActive={isNotifying}
                >
                    {isNotifying ? <BellRing size={20} /> : <Bell size={20} />}
                </NotifyButton>
            )}

            {/* More actions menu */}
            <MenuContainer ref={menuRef}>
                <StyledIconButton onClick={() => setShowMenu(!showMenu)} aria-label={t('unmute') || 'More'}>
                    <MoreHorizontal size={20} />
                </StyledIconButton>

                {showMenu && (
                    <Menu>
                        {/* Mute option */}
                        <MenuItem
                            onClick={() => {
                                onMuteToggle();
                                setShowMenu(false);
                            }}
                            disabled={isMutePending}
                        >
                            {isMuting ? (
                                <>
                                    <Volume2 size={18} />
                                    {t('unmute')}
                                </>
                            ) : (
                                <>
                                    <VolumeX size={18} />
                                    {t('mute')}
                                </>
                            )}
                        </MenuItem>

                        {/* Block option */}
                        <MenuItem
                            onClick={() => {
                                onBlockToggle();
                                setShowMenu(false);
                            }}
                            disabled={isBlockPending}
                            $isDestructive={!isBlocking}
                        >
                            <Ban size={18} />
                            {isBlocking ? t('unblock') : t('block')}
                        </MenuItem>
                    </Menu>
                )}
            </MenuContainer>
        </ButtonContainer>
    );
}

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-2);
`;

const MenuContainer = styled.div`
  position: relative;
`;

const StyledIconButton = styled(IconButton)`
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-round);
`;

const Menu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--size-2);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  box-shadow: var(--shadow-3);
  overflow: hidden;
  z-index: 50;
  min-width: 180px;
  border: 1px solid var(--surface-3);
`;

const MenuItem = styled.button<{ $isDestructive?: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  width: 100%;
  padding: var(--size-3);
  background: transparent;
  border: none;
  color: ${({ $isDestructive }) => ($isDestructive ? 'var(--red-6)' : 'var(--text-1)')};
  cursor: pointer;
  font-size: var(--font-size-1);
  text-align: left;
  transition: background 0.2s ease;

  &:hover {
    background: var(--surface-3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NotifyButton = styled(IconButton) <{ $isActive?: boolean }>`
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-round);
  color: ${({ $isActive }) => ($isActive ? 'var(--brand)' : 'var(--text-2)')};
  
  &:hover {
    color: var(--brand);
    background: var(--surface-3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;