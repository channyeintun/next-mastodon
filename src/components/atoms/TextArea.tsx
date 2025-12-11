import styled from '@emotion/styled';
import { type TextareaHTMLAttributes, forwardRef } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Container = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  gap: var(--size-1);
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

const Label = styled.label`
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  color: var(--text-1);
`;

const StyledTextArea = styled.textarea<{ $error?: boolean; $fullWidth: boolean }>`
  padding: var(--size-2) var(--size-3);
  font-size: var(--font-size-1);
  border: 1px solid ${({ $error }) => ($error ? 'var(--red-6)' : 'var(--surface-4)')};
  border-radius: var(--radius-2);
  background: var(--surface-1);
  color: var(--text-1);
  outline: none;
  transition: border-color 0.2s ease;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  resize: vertical;
  font-family: inherit;
  min-height: var(--size-12);

  &:focus {
    border-color: ${({ $error }) => ($error ? 'var(--red-6)' : 'var(--blue-6)')};
  }
`;

const ErrorMessage = styled.span`
  font-size: var(--font-size-0);
  color: var(--red-7);
`;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, fullWidth = false, ...props }, ref) => {
    return (
      <Container $fullWidth={fullWidth}>
        {label && (
          <Label htmlFor={props.id}>
            {label}
          </Label>
        )}
        <StyledTextArea
          ref={ref}
          {...props}
          $error={!!error}
          $fullWidth={fullWidth}
        />
        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}
      </Container>
    );
  }
);

TextArea.displayName = 'TextArea';
