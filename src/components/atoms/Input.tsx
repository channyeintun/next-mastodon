import styled from '@emotion/styled';
import { type InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
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

const StyledInput = styled.input<{ $error?: boolean; $fullWidth: boolean }>`
  padding: var(--size-2) var(--size-3);
  font-size: var(--font-size-1);
  border: 1px solid ${({ $error }) => ($error ? 'var(--red-6)' : 'var(--surface-4)')};
  border-radius: var(--radius-2);
  background: var(--surface-1);
  color: var(--text-1);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  /* A 1px border shift alone is easy to miss, especially at the low contrast
     between --surface-4 and --blue-6. The ring adds a second, larger cue.
     box-shadow rather than outline so the rounded corners are followed. */
  &:focus-visible {
    border-color: ${({ $error }) => ($error ? 'var(--red-6)' : 'var(--brand)')};
    box-shadow: 0 0 0 3px ${({ $error }) =>
    ($error
      ? 'color-mix(in oklab, var(--red-6) 25%, transparent)'
      : 'var(--brand-subtle)')};
  }

  /* Pointer users get the same ring: these are text fields, where :focus and
     :focus-visible coincide, and losing the cue on click would be worse. */
  &:focus:not(:focus-visible) {
    border-color: ${({ $error }) => ($error ? 'var(--red-6)' : 'var(--brand)')};
  }
`;

const ErrorMessage = styled.span`
  font-size: var(--font-size-0);
  color: var(--red-7);
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, id, ...props }, ref) => {
    /* Fall back to a generated id so <label for> always resolves. Without this,
       an Input rendered without an explicit id has a label that points nowhere,
       so tapping it does not focus the field and screen readers announce the
       control as unlabelled. */
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <Container $fullWidth={fullWidth}>
        {label && (
          <Label htmlFor={inputId}>
            {label}
          </Label>
        )}
        <StyledInput
          ref={ref}
          {...props}
          id={inputId}
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
          /* role="alert" so the message is announced when it appears after a
             failed submit, not just when the field is next focused. */
          <ErrorMessage id={errorId} role="alert">
            {error}
          </ErrorMessage>
        )}
      </Container>
    );
  }
);

Input.displayName = 'Input';
