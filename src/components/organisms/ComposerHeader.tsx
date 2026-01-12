'use client';

import { Avatar, EmojiText, CircleSkeleton, TextSkeleton } from '@/components/atoms';
import { VisibilityButtonWrapper, VisibilityButton, VisibilityLabel, DisplayName } from './ComposerPanelStyles';
import { LanguageDropdown } from '@/components/molecules';
import { LucideIcon } from 'lucide-react';
import { Visibility } from '@/components/molecules/VisibilitySettingsModal';

interface ComposerHeaderProps {
    currentAccount: any;
    editMode: boolean;
    visibility: Visibility;
    language: string;
    setLanguage: (lang: string) => void;
    VisibilityIcon: LucideIcon;
    currentVisibilityLabel?: string;
    handleOpenVisibilitySettings: () => void;
}

export function ComposerHeader({
    currentAccount,
    editMode,
    language,
    setLanguage,
    VisibilityIcon,
    currentVisibilityLabel,
    handleOpenVisibilitySettings,
}: ComposerHeaderProps) {
    return (
        <div className="compose-header">
            {currentAccount ? (
                <Avatar
                    src={currentAccount.avatar}
                    alt={currentAccount.display_name || currentAccount.username}
                    size="medium"
                />
            ) : (
                <CircleSkeleton size="40px" />
            )}
            <div className="compose-user-info">
                <div className="compose-user-details">
                    <DisplayName>
                        {currentAccount ? (
                            <EmojiText
                                text={currentAccount.display_name || currentAccount.username}
                                emojis={currentAccount.emojis}
                            />
                        ) : (
                            <TextSkeleton width="120px" height="16px" />
                        )}
                    </DisplayName>

                    <div className="compose-controls">
                        <VisibilityButtonWrapper>
                            <VisibilityButton
                                onClick={editMode ? undefined : handleOpenVisibilitySettings}
                                type="button"
                                disabled={editMode}
                            >
                                <VisibilityIcon size={18} />
                                <VisibilityLabel>{currentVisibilityLabel}</VisibilityLabel>
                            </VisibilityButton>
                        </VisibilityButtonWrapper>

                        <LanguageDropdown
                            value={language}
                            onChange={setLanguage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
