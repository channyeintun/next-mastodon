'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { useTranslateStatus, useTranslationLanguages } from '@/api';
import { useAuthStore } from '@/hooks/useStores';
import type { Status, Translation } from '@/types';

interface TranslateButtonProps {
    status: Status;
    onTranslated?: (translation: Translation) => void;
    onShowOriginal?: () => void;
}

/**
 * Translate button component that handles translation logic.
 * Shows translate button when translation is available, and displays
 * translation info after translating.
 */
export function TranslateButton({ status, onTranslated, onShowOriginal }: TranslateButtonProps) {
    const translateMutation = useTranslateStatus();
    const { data: translationLanguages } = useTranslationLanguages();
    const authStore = useAuthStore();

    const [translation, setTranslation] = useState<Translation | null>(null);
    const [showTranslation, setShowTranslation] = useState(false);

    // Check if translation is available for this post
    // Based on Mastodon's logic: check if user's locale is in target languages for post's source language
    const userLocale = typeof navigator !== 'undefined' && navigator.language ? navigator.language.split('-')[0] : 'en';
    const sourceLanguage = status.language || 'und'; // 'und' = undetermined
    const targetLanguages = translationLanguages?.[sourceLanguage] ?? [];
    const canTranslateToUserLocale = targetLanguages.includes(userLocale);

    const canTranslate =
        authStore.isAuthenticated &&
        status.language &&
        ['public', 'unlisted'].includes(status.visibility) &&
        status.content.trim().length > 0 &&
        canTranslateToUserLocale;

    const handleTranslate = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (translation) {
            // Toggle between original and translated
            const newShowTranslation = !showTranslation;
            setShowTranslation(newShowTranslation);
            if (!newShowTranslation) {
                onShowOriginal?.();
            } else {
                onTranslated?.(translation);
            }
        } else {
            // Fetch translation
            try {
                const result = await translateMutation.mutateAsync(status.id);
                setTranslation(result);
                setShowTranslation(true);
                onTranslated?.(result);
            } catch (error) {
                console.error('Translation failed:', error);
            }
        }
    };

    if (!canTranslate) {
        return null;
    }

    if (showTranslation && translation) {
        return (
            <TranslationInfo>
                <span>
                    Translated from {translation.detected_source_language || status.language}
                    {translation.provider && ` · ${translation.provider}`}
                </span>
                <TranslateLink className="translate-button" onClick={handleTranslate}>
                    See original
                </TranslateLink>
            </TranslationInfo>
        );
    }

    return (
        <TranslateLink className="translate-button" onClick={handleTranslate} disabled={translateMutation.isPending}>
            {translateMutation.isPending ? 'Translating...' : 'See translation'}
        </TranslateLink>
    );
}

// Hook to get translation state for external content display
export function useTranslation(status: Status) {
    const { data: translationLanguages } = useTranslationLanguages();
    const authStore = useAuthStore();

    const userLocale = typeof navigator !== 'undefined' && navigator.language ? navigator.language.split('-')[0] : 'en';
    const sourceLanguage = status.language || 'und';
    const targetLanguages = translationLanguages?.[sourceLanguage] ?? [];
    const canTranslateToUserLocale = targetLanguages.includes(userLocale);

    const canTranslate =
        authStore.isAuthenticated &&
        status.language &&
        ['public', 'unlisted'].includes(status.visibility) &&
        status.content.trim().length > 0 &&
        canTranslateToUserLocale;

    return { canTranslate };
}

// Styled components
const TranslateLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: var(--size-1);
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  color: var(--text-2);
  font-size: var(--font-size-1);
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  outline: none;

  &:hover:not(:disabled) {
    color: var(--text-1);
    text-decoration: underline;
    box-shadow: none;
    outline: none;
  }

  &:focus, &:active, &:focus-visible {
    outline: none;
    box-shadow: none;
  }

  &:disabled {
    color: var(--text-3);
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const TranslationInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--size-2);
  font-size: var(--font-size-1);
  color: var(--text-2);
  padding-top: var(--size-1);
`;
