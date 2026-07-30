'use client';

/** Styled components for InlineReplyBox. */

import styled from '@emotion/styled';

export const Row = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--size-2);
  padding-top: var(--size-2);
`;

export const CollapsedPill = styled.button`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--size-2);
  height: 36px;
  padding: 0 var(--size-3);
  border: none;
  box-shadow: none;
  border-radius: var(--radius-round);
  background: var(--comment-bg);
  color: var(--secondary-text);
  font-size: var(--fs-body);
  text-align: start;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: var(--hover-overlay);
  }

  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
`;

export const CollapsedTools = styled.span`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  color: var(--secondary-icon);
  flex-shrink: 0;
`;

export const Field = styled.div`
  flex: 1;
  min-width: 0;
  background: var(--comment-bg);
  border-radius: var(--radius-3);
  padding: var(--size-2) var(--size-3);
`;

export const TextArea = styled.textarea`
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: var(--text-1);
  font-family: inherit;
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  /* Grows with content instead of scrolling in a one-line box */
  field-sizing: content;
  max-height: 40vh;

  &::placeholder {
    color: var(--secondary-text);
  }
`;

export const PickerLayer = styled.div`
  position: fixed;
  z-index: 100;
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const Thumbs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-2);
  margin-top: var(--size-2);
`;

export const Thumb = styled.div`
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: var(--radius-2);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const RemoveThumb = styled.button`
  position: absolute;
  top: 2px;
  right: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  box-shadow: none;
  border-radius: var(--radius-round);
  background: rgb(0 0 0 / 0.6);
  color: #fff;
  cursor: pointer;

  &:hover {
    background: rgb(0 0 0 / 0.8);
  }
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--size-1);
`;

export const Tools = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-1);
`;

export const ToolButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  box-shadow: none;
  border-radius: var(--radius-round);
  background: transparent;
  color: var(--secondary-icon);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: var(--hover-overlay);
    color: var(--primary-icon);
  }

  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
`;

export const SendButton = styled(ToolButton) <{ $active: boolean }>`
  color: ${({ $active }) => ($active ? 'var(--accent)' : 'var(--secondary-icon)')};
  opacity: ${({ $active }) => ($active ? 1 : 0.5)};
  cursor: ${({ $active }) => ($active ? 'pointer' : 'not-allowed')};
`;
