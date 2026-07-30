import styled from '@emotion/styled';
import { type TextareaHTMLAttributes, forwardRef, useId } from 'react';

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
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  resize: vertical;
  font-family: inherit;
  min-height: var(--size-12);

  /* Matches Input: border shift plus a ring, since 1px alone reads as noise
     at this contrast. box-shadow follows the border radius. */
  &:focus-visible {
    border-color: ${({ $error }) => ($error ? 'var(--red-6)' : 'var(--brand)')};
    box-shadow: 0 0 0 3px ${({ $error }) =>
    ($error
      ? 'color-mix(in oklab, var(--red-6) 25%, transparent)'
      : 'var(--brand-subtle)')};
  }

  &:focus:not(:focus-visible) {
    border-color: ${({ $error }) => ($error ? 'var(--red-6)' : 'var(--brand)')};
  }
`;

const ErrorMessage = styled.span`
  font-size: var(--font-size-0);
  color: var(--red-7);
`;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, fullWidth = false, id, ...props }, ref) => {
    /* See Input: guarantees <label for> resolves even without an explicit id. */
    const generatedId = useId();
    const textAreaId = id ?? generatedId;
    const errorId = `${textAreaId}-error`;

    return (
      <Container $fullWidth={fullWidth}>
        {label && (
          <Label htmlFor={textAreaId}>
            {label}
          </Label>
        )}
        <StyledTextArea
          ref={ref}
          {...props}
          id={textAreaId}
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={
            [error ? errorId : null, props['aria-describedby']]
              .filter(Boolean)
              .join(' ') || undefined
          }
          $error={!!error}
          $fullWidth={fullWidth}
        />
        {error && (
          <ErrorMessage id={errorId} role="alert">
            {error}
          </ErrorMessage>
        )}
      </Container>
    );
  }
);

TextArea.displayName = 'TextArea';
