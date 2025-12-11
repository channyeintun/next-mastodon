import styled from '@emotion/styled';

interface CheckboxFieldProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Container = styled.div`
  display: flex;
  gap: var(--size-3);
  align-items: flex-start;
`;

const StyledCheckbox = styled.input<{ disabled?: boolean }>`
  margin-top: 4px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;

const LabelContainer = styled.div`
  flex: 1;
`;

const Label = styled.label<{ disabled?: boolean }>`
  font-size: var(--font-size-1);
  font-weight: 500;
  color: var(--text-1);
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: block;
`;

const Description = styled.p`
  font-size: var(--font-size-0);
  color: var(--text-2);
  margin: 4px 0 0 0;
`;

export function CheckboxField({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: CheckboxFieldProps) {
  return (
    <Container>
      <StyledCheckbox
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <LabelContainer>
        <Label htmlFor={id} disabled={disabled}>
          {label}
        </Label>
        {description && (
          <Description>
            {description}
          </Description>
        )}
      </LabelContainer>
    </Container>
  );
}
