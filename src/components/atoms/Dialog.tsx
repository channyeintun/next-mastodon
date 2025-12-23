import styled from '@emotion/styled';
import { type ReactNode, useEffect } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function Dialog({
  isOpen,
  onClose,
  children,
  maxWidth = '600px',
}: DialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Content $maxWidth={maxWidth} onClick={(e) => e.stopPropagation()}>
        {children}
      </Content>
    </Overlay>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return (
    <HeaderWrapper>
      <HeaderTitle>{children}</HeaderTitle>
    </HeaderWrapper>
  );
}

export function DialogBody({ children }: { children: ReactNode }) {
  return <BodyWrapper>{children}</BodyWrapper>;
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return <FooterWrapper>{children}</FooterWrapper>;
}

// Styled components
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--size-4);
`;

const Content = styled.div<{ $maxWidth: string }>`
  background-color: var(--surface-1);
  border-radius: var(--radius-3);
  max-width: ${props => props.$maxWidth};
  width: 100%;
  max-height: 90dvh;
  overflow: auto;
`;

const HeaderWrapper = styled.div`
  padding: var(--size-4);
  border-bottom: 1px solid var(--surface-3);
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: var(--font-size-3);
  font-weight: 600;
`;

const BodyWrapper = styled.div`
  padding: var(--size-4);
`;

const FooterWrapper = styled.div`
  padding: var(--size-4);
  border-top: 1px solid var(--surface-3);
  display: flex;
  gap: var(--size-3);
  justify-content: flex-end;
`;
