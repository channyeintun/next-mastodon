/**
 * Shared styled components for conversation pages
 */

import styled from '@emotion/styled'
import { IconButton } from '@/components/atoms/IconButton'

export const PageContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-3);
  padding: var(--size-4);
  background: var(--surface-1);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: var(--shadow-2);
`

export const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  flex: 1;
`

export const HeaderTitle = styled.h1`
  font-size: var(--font-size-3);
  margin: 0;
  font-weight: 600;
`

export const HeaderSubtitle = styled.p`
  font-size: var(--font-size-0);
  color: var(--text-2);
  margin: 0;
`

export const FallbackTitle = styled.h1`
  font-size: var(--font-size-4);
  margin: 0;
  flex: 1;
`

export const PageTitle = styled.h1`
  font-size: var(--font-size-4);
  margin: 0;
`

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
    padding-bottom: calc(64px + var(--size-2));
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

  &:focus {
    outline: none;
    border-color: var(--blue-7);
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
  color: var(--red-9);
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
