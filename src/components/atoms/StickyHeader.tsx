'use client';

import styled from '@emotion/styled';
import type { HTMLAttributes, ReactNode } from 'react';

/**
 * CSS Variables for Sticky Header Configuration
 * These can be overridden by consumers to customize behavior:
 * 
 * --header-stuck: 0 (not stuck) or 1 (stuck at top) - set automatically by scroll-state query
 * --header-padding: padding when not stuck (default: var(--size-4))
 * --header-padding-stuck: padding when stuck (default: var(--size-2) var(--size-4))
 * --header-gap: gap between elements (default: var(--size-3))
 * --header-gap-stuck: gap when stuck (default: var(--size-2))
 * --header-bg: background when not stuck (default: linear-gradient(...))
 * --header-bg-stuck: background when stuck (default: var(--surface-1))
 * --header-title-opacity-stuck: title opacity when stuck (default: 0)
 * --header-subtitle-opacity-stuck: subtitle opacity when stuck (default: 0)
 */

interface StickyHeaderContainerProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

/**
 * StickyHeaderContainer - The outer wrapper that enables scroll-state container queries.
 * 
 * Usage:
 * ```tsx
 * <StickyHeaderContainer>
 *   <StickyHeaderContent>
 *     <StickyHeaderTitle>
 *       <h1>Title</h1>
 *       <StickyHeaderSubtitle>Subtitle</StickyHeaderSubtitle>
 *     </StickyHeaderTitle>
 *     <StickyHeaderActions>
 *       <button>Action</button>
 *     </StickyHeaderActions>
 *   </StickyHeaderContent>
 * </StickyHeaderContainer>
 * ```
 */
export const StickyHeaderContainer = styled.div<StickyHeaderContainerProps>`
  /* Enable both scroll-state and style container queries */
  container-type: scroll-state;
  container-name: sticky-header;
  position: sticky;
  top: 0;
  z-index: 10;

  /* CSS variable for scroll state: 0 = not stuck, 1 = stuck */
  --header-stuck: 0;

  /* Default configurable values - can be overridden by consumers */
  --header-padding: var(--size-4);
  --header-padding-stuck: var(--size-2) var(--size-4);
  --header-gap: var(--size-3);
  --header-gap-stuck: var(--size-2);
  --header-bg: linear-gradient(to bottom, var(--surface-1) 60%, transparent);
  --header-bg-stuck: var(--surface-1);
  --header-title-opacity-stuck: 0;
  --header-subtitle-opacity-stuck: 0;

  /* Update CSS variable when stuck using scroll-state query */
  @container scroll-state(stuck: top) {
    --header-stuck: 1;
  }
`;

/**
 * StickyHeaderContent - The main content wrapper for header elements.
 * Responds to --header-stuck variable via style() container query.
 */
export const StickyHeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  
  /* Use CSS variables for configurable values */
  padding: var(--header-padding);
  gap: var(--header-gap);
  background: var(--header-bg);
  
  transition: 
    padding 0.3s ease, 
    gap 0.3s ease, 
    background 0.3s ease;

  /* Respond to stuck state via style() container query */
  @container style(--header-stuck: 1) {
    padding: var(--header-padding-stuck);
    gap: var(--header-gap-stuck);
    background: var(--header-bg-stuck);
  }
`;

/**
 * StickyHeaderTitle - Container for title and subtitle.
 * Fades out when stuck by default (can be overridden via CSS variables).
 */
export const StickyHeaderTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--size-1);
  opacity: 1;
  visibility: visible;
  transition: 
    opacity 0.2s ease, 
    visibility 0.2s ease, 
    gap 0.3s ease;
  transition-behavior: allow-discrete;

  h1 {
    font-size: var(--font-size-5);
    margin: 0;
    transition: font-size 0.3s ease;
  }

  /* Respond to stuck state - fade out by default */
  @container style(--header-stuck: 1) {
    opacity: var(--header-title-opacity-stuck);
    visibility: if(
      style(--header-title-opacity-stuck: 0),
      hidden,
      visible
    );
    
    /* Fallback for browsers without if() support */
    @supports not (visibility: if(style(--header-title-opacity-stuck: 0), hidden, visible)) {
      visibility: hidden;
    }
  }
`;

/**
 * StickyHeaderSubtitle - Subtitle text that fades out when stuck.
 */
export const StickyHeaderSubtitle = styled.p`
  font-size: var(--font-size-0);
  color: var(--text-2);
  margin: 0;
  max-height: 2em;
  overflow: hidden;
  opacity: 1;
  visibility: visible;
  transition: 
    opacity 0.3s ease, 
    visibility 0.3s ease, 
    max-height 0.3s ease, 
    margin-top 0.3s ease;
  transition-behavior: allow-discrete;

  /* Respond to stuck state */
  @container style(--header-stuck: 1) {
    opacity: var(--header-subtitle-opacity-stuck);
    max-height: 0;
    margin-top: 0;
    visibility: hidden;
  }
`;

/**
 * StickyHeaderActions - Container for action buttons.
 * Stays visible when stuck.
 */
export const StickyHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  flex-shrink: 0;
`;

/**
 * StickyHeaderButtonText - Text inside buttons that hides when stuck.
 * Useful for icon+text buttons that become icon-only when collapsed.
 */
export const StickyHeaderButtonText = styled.span`
  opacity: 1;
  transition: opacity 0.2s ease, display 0.2s ease;
  transition-behavior: allow-discrete;
  
  @container style(--header-stuck: 1) {
    opacity: 0;
    display: none;
  }
`;

/**
 * StickyHeaderRow - A secondary row in the header (like tabs).
 * Can be configured to stay visible or hide when stuck.
 */
export const StickyHeaderRow = styled.div<{ $hideWhenStuck?: boolean }>`
  opacity: 1;
  visibility: visible;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  transition-behavior: allow-discrete;
  
  ${props => props.$hideWhenStuck && `
    @container style(--header-stuck: 1) {
      opacity: 0;
      visibility: hidden;
    }
  `}
`;

/**
 * StickyHeaderPersistent - Content that remains fully visible when stuck.
 * Use this for elements that should not fade or hide.
 */
export const StickyHeaderPersistent = styled.div`
  /* This element ignores the stuck state and remains fully visible */
`;
