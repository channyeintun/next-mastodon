import styled from '@emotion/styled';

interface ContentWarningSectionProps {
  spoilerText: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ContentWarningSection({
  spoilerText,
  isExpanded,
  onToggle,
}: ContentWarningSectionProps) {
  return (
    <Container>
      <WarningText>
        Content Warning: {spoilerText}
      </WarningText>
      <ToggleButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
      >
        {isExpanded ? 'Hide content' : 'Show content'}
      </ToggleButton>
    </Container>
  );
}

const Container = styled.div`
  margin-top: var(--size-2);
  padding: var(--size-3);
  background: var(--yellow-1);
  border: 1px solid var(--yellow-3);
  border-radius: var(--radius-2);

  [data-theme="dark"] & {
    background: color-mix(in srgb, var(--yellow-9) 30%, black);
    border-color: var(--yellow-9);
  }
`;

const WarningText = styled.div`
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  color: var(--yellow-9);
  margin-bottom: var(--size-2);

  [data-theme="dark"] & {
    color: var(--yellow-2);
  }
`;

const ToggleButton = styled.button`
  padding: var(--size-2) var(--size-3);
  background: var(--yellow-2);
  color: var(--yellow-9);
  border: 1px solid var(--yellow-4);
  border-radius: var(--radius-2);
  cursor: pointer;
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  transition: all 0.2s ease;

  [data-theme="dark"] & {
    background: var(--yellow-9);
    color: var(--yellow-1);
    border-color: var(--yellow-8);
  }

  &:hover {
    background: var(--yellow-3);
    border-color: var(--blue-6);

    [data-theme="dark"] & {
      background: var(--yellow-8);
    }
  }
`;