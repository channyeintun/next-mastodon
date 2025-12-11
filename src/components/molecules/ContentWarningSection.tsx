import styled from '@emotion/styled';

interface ContentWarningSectionProps {
  spoilerText: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const Container = styled.div`
  margin-top: var(--size-2);
  padding: var(--size-3);
  background: var(--orange-2);
  border-radius: var(--radius-2);
`;

const WarningText = styled.div`
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  color: var(--text-1);
  margin-bottom: var(--size-2);
`;

const ToggleButton = styled.button`
  padding: var(--size-2) var(--size-3);
  background: var(--orange-6);
  color: white;
  border: none;
  border-radius: var(--radius-2);
  cursor: pointer;
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);

  &:hover {
    opacity: 0.9;
  }
`;

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
