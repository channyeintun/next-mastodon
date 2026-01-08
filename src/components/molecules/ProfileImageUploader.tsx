import styled from '@emotion/styled';
import { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button, IconButton, Card } from '@/components/atoms';
import type { Account } from '@/types';

interface ProfileImageUploaderProps {
  currentAccount: Account;
  avatarPreview: string | null;
  headerPreview: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHeaderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveHeader: () => void;
}

export function ProfileImageUploader({
  currentAccount,
  avatarPreview,
  headerPreview,
  onAvatarChange,
  onHeaderChange,
  onRemoveHeader,
}: ProfileImageUploaderProps) {
  const t = useTranslations('profileEditor');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const headerBackground = headerPreview
    ? `url(${headerPreview})`
    : currentAccount.header
      ? `url(${currentAccount.header})`
      : 'var(--surface-3)';

  const avatarBackground = avatarPreview
    ? `url(${avatarPreview})`
    : currentAccount.avatar
      ? `url(${currentAccount.avatar})`
      : 'var(--surface-3)';

  return (
    <>
      <ImageCard padding="none">
        <HeaderContainer>
          {/* Header Image */}
          <HeaderImage $background={headerBackground}>
            <HeaderControls>
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={() => headerInputRef.current?.click()}
              >
                <Upload size={16} />
                {t('uploadHeader')}
              </Button>
              {headerPreview && (
                <IconButton size="small" onClick={onRemoveHeader}>
                  <X size={16} />
                </IconButton>
              )}
            </HeaderControls>
          </HeaderImage>

          {/* Avatar */}
          <AvatarContainer>
            <AvatarWrapper>
              <AvatarImage $background={avatarBackground} />
              <AvatarButton
                type="button"
                variant="secondary"
                size="small"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Upload size={14} />
              </AvatarButton>
            </AvatarWrapper>
          </AvatarContainer>
        </HeaderContainer>

        <BottomPadding />
      </ImageCard>

      {/* Hidden file inputs */}
      <HiddenInput
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={onAvatarChange}
      />
      <HiddenInput
        ref={headerInputRef}
        type="file"
        accept="image/*"
        onChange={onHeaderChange}
      />
    </>
  );
}

// Styled components
const ImageCard = styled(Card)`
    margin-bottom: var(--size-4);
`;

const HeaderContainer = styled.div`
    position: relative;
`;

const HeaderImage = styled.div<{ $background: string }>`
    width: 100%;
    height: 200px;
    background: ${props => props.$background};
    background-size: cover;
    background-position: center;
    border-radius: var(--radius-2) var(--radius-2) 0 0;
    position: relative;
`;

const HeaderControls = styled.div`
    position: absolute;
    top: var(--size-3);
    right: var(--size-3);
    display: flex;
    gap: var(--size-2);
`;

const AvatarContainer = styled.div`
    position: absolute;
    bottom: -40px;
    left: var(--size-4);
`;

const AvatarWrapper = styled.div`
    position: relative;
`;

const AvatarImage = styled.div<{ $background: string }>`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: ${props => props.$background};
    background-size: cover;
    background-position: center;
    border: 4px solid var(--surface-1);
`;

const AvatarButton = styled(Button)`
    position: absolute;
    bottom: 0;
    right: 0;
`;

const BottomPadding = styled.div`
    padding: var(--size-4);
    padding-top: var(--size-8);
`;

const HiddenInput = styled.input`
    display: none;
`;