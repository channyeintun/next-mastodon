/**
 * Shared styled components for conversation pages
 */

import styled from '@emotion/styled'
import { IconButton } from '@/components/atoms/IconButton'

export const PageContainer = styled.div`
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100dvh;

  @media (max-width: 767px) {
    height: calc(100dvh - var(--app-bottom-nav-height));
  }
`

export * from './ConversationHeaderStyles'

export const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-3);
  font-size: var(--font-size-1);
`

export const InputContainer = styled.div`
  background: var(--surface-1);
  padding: var(--size-4);
  display: flex;
  gap: var(--size-2);
  align-items: center;
  position: sticky;
  bottom: 0;
  z-index: 10;
  box-shadow: var(--shadow-2);

  @media (max-width: 767px) {
    padding-bottom: var(--size-4);
  }
`

export const MessageTextarea = styled.textarea`
  flex: 1;
  padding: var(--size-3);
  border: 1px solid var(--surface-5);
  border-radius: var(--radius-3);
  font-size: var(--font-size-2);
  background: var(--surface-2);
  color: var(--text-1);
  resize: none;
  min-height: 44px;
  max-height: 120px;
  font-family: inherit;
  outline: none;

  /* Matches the TextArea atom: border shift plus a ring, since 1px against
     --surface-5 is easy to miss. Pointer users keep the border shift because
     this is a text field. */
  &:focus-visible {
    border-color: var(--brand);
    box-shadow: 0 0 0 3px var(--brand-subtle);
  }

  &:focus:not(:focus-visible) {
    border-color: var(--brand);
  }
`

export const SendButton = styled(IconButton) <{ $active: boolean }>`
  background: ${props => props.$active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--text-3)'};
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
`

export const DeleteButton = styled(IconButton)`
  color: var(--text-2);
`

export const CenteredContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--size-8);
`

export const ErrorContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--size-4);
`

export const ErrorTitle = styled.p`
  font-size: var(--font-size-3);
  margin-bottom: var(--size-2);
  font-weight: 600;
`

export const ErrorMessage = styled.p`
  font-size: var(--font-size-1);
  color: var(--text-2);
`

export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: var(--size-4);
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
  overflow-anchor: auto;
  scroll-behavior: auto;

  /* Disable anchoring for all messages so only the sentinel at the bottom anchors */
  & > * {
    overflow-anchor: none;
  }
`

export const ScrollSentinel = styled.div`
  height: 1px;
  width: 1px;
  overflow-anchor: auto;
  flex-shrink: 0;
`

// Re-export media preview styles for convenience
export {
  MediaPreviewContainer,
  MediaPreviewItem,
  MediaPreviewImage,
  MediaPreviewControls,
  MediaPreviewOverlayButton,
  RemoveMediaButton,
  UploadingIndicator,
  AttachButton,
  HiddenInput,
} from './MediaPreviewStyles'
