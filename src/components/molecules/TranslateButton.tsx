'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { Languages } from 'lucide-react';
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
    const userLocale = typeof navigator !== 'undefined' ? navigator.language?.split('-')[0] ?? 'en' : 'en';
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
                <TranslateLink onClick={handleTranslate}>
                    Show original
                </TranslateLink>
            </TranslationInfo>
        );
    }

    return (
        <TranslateLink onClick={handleTranslate} disabled={translateMutation.isPending}>
            <Languages size={14} />
            {translateMutation.isPending ? 'Translating...' : 'Translate'}
        </TranslateLink>
    );
}

// Hook to get translation state for external content display
export function useTranslation(status: Status) {
    const { data: translationLanguages } = useTranslationLanguages();
    const authStore = useAuthStore();

    const userLocale = typeof navigator !== 'undefined' ? navigator.language?.split('-')[0] ?? 'en' : 'en';
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
  padding: var(--size-1) var(--size-2);
  background: transparent;
  border: none;
  border-radius: var(--radius-1);
  color: var(--blue-6);
  font-size: var(--font-size-1);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--blue-1);
  }

  &:disabled {
    color: var(--text-3);
    cursor: not-allowed;
  }
`;

const TranslationInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--size-2);
  padding: var(--size-2);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  font-size: var(--font-size-0);
  color: var(--text-2);
`;
