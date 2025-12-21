import styled from '@emotion/styled';
import { Check } from 'lucide-react';
import { Card } from '@/components/atoms';

export const SectionCard = styled(Card)`
  margin-bottom: var(--size-4);
`;

export const SectionTitle = styled.h2`
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--size-4);
`;

export const FieldsTitle = styled.h2`
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--size-2);
`;

export const FieldsDescription = styled.p`
  font-size: var(--font-size-0);
  color: var(--text-2);
  margin-bottom: var(--size-4);
`;

export const FieldsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: var(--size-2);
  border: 1px solid var(--surface-4);
  border-radius: var(--radius-2);
  background: var(--surface-1);
  color: var(--text-1);
  font-size: var(--font-size-1);
  resize: vertical;
  font-family: inherit;
`;

export const FieldsContainer = styled.div`
  position: relative;
`;

export const FieldRow = styled.div<{ $isDragging?: boolean }>`
  display: grid;
  grid-template-columns: auto 1fr 1fr auto;
  gap: var(--size-2);
  margin-bottom: var(--size-3);
  align-items: center;
  opacity: ${props => props.$isDragging ? 0.5 : 1};
  background: var(--surface-1);
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }

  @media (max-width: 500px) {
    grid-template-columns: auto 1fr auto;
    
    & > input:nth-of-type(2) {
      grid-column: 2;
    }
  }
`;

export const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
  cursor: grab;
  padding: var(--size-1);
  
  &:hover {
    color: var(--text-2);
  }
  
  &:active {
    cursor: grabbing;
  }
`;

export const DropIndicator = styled.div`
  height: 2px;
  background: var(--cyan-6);
  margin: var(--size-1) 0;
  border-radius: 1px;
  box-shadow: 0 0 4px var(--cyan-6);
`;

export const FieldInput = styled.input<{ $verified?: boolean }>`
  padding: var(--size-2);
  border: 1px solid ${props => props.$verified ? 'var(--green-6)' : 'var(--surface-4)'};
  border-radius: var(--radius-2);
  background: ${props => props.$verified ? 'color-mix(in srgb, var(--green-6) 10%, var(--surface-1))' : 'var(--surface-1)'};
  color: var(--text-1);
  font-size: var(--font-size-1);
`;

export const VerificationIcon = styled.div`
  width: 24px;
  display: flex;
  justify-content: center;
`;

export const GreenCheck = styled(Check)`
  color: var(--green-6);
`;

export const Details = styled.details`
  margin-top: var(--size-4);
  border-top: 1px solid var(--surface-3);
  padding-top: var(--size-4);
`;

export const Summary = styled.summary`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  color: var(--text-1);
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  cursor: pointer;
  list-style: none;
`;

export const DetailsContent = styled.div`
  margin-top: var(--size-3);
`;

export const VerificationText = styled.p`
  font-size: var(--font-size-0);
  color: var(--text-2);
  margin-bottom: var(--size-3);
  line-height: 1.5;
`;

export const CodeSnippet = styled.code`
  background: var(--surface-3);
  padding: 2px 4px;
  border-radius: 4px;
`;

export const CodeBlock = styled.div`
  background: var(--surface-2);
  border-radius: var(--radius-2);
  padding-block: var(--size-3);
  display: flex;
  place-items: center;
`;

export const CodeContent = styled.code`
  font-size: var(--font-size-0);
  font-family: monospace;
  white-space: nowrap;
  display: block;
  padding-right: var(--size-8);
  overflow: auto;
`;

export const CopyButton = styled.button`
  background: var(--surface-3);
  border: none;
  border-radius: var(--radius-1);
  padding: var(--size-1);
  cursor: pointer;
  color: var(--text-2);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--surface-4);
  }
`;

export const TipText = styled.p`
  font-size: var(--font-size-0);
  color: var(--text-2);
  margin-top: var(--size-3);
  line-height: 1.5;
`;
