'use client';

import styled from '@emotion/styled';

export const FiltersContainer = styled.div`
  max-width: 680px;
  margin: 0 auto;
  padding: var(--size-4) var(--size-2);
  overflow-anchor: none;

  @media (max-width: 768px) {
    padding-bottom: var(--app-bottom-nav-height);
  }
`;

export const FiltersHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-3);
  margin-bottom: var(--size-4);
`;

export const FiltersTitle = styled.h1`
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-6);
  color: var(--text-1);
  flex: 1;
`;

export const FiltersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
`;

export const FilterCard = styled.div`
  background: var(--surface-2);
  border-radius: var(--radius-2);
  padding: var(--size-4);
  border: 1px solid var(--surface-3);
`;

export const FilterCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--size-3);
  margin-bottom: var(--size-3);
`;

export const FilterTitle = styled.a`
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  color: var(--text-1);
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
    color: var(--brand);
  }
`;

export const FilterBadge = styled.span<{ $action: 'warn' | 'hide' | 'blur' }>`
  display: inline-flex;
  align-items: center;
  padding: var(--size-1) var(--size-2);
  border-radius: var(--radius-1);
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-5);
  text-transform: capitalize;
  background: ${({ $action }) => {
    switch ($action) {
      case 'warn':
        return 'var(--yellow-3)';
      case 'hide':
        return 'var(--red-3)';
      case 'blur':
        return 'var(--blue-3)';
      default:
        return 'var(--surface-3)';
    }
  }};
  color: ${({ $action }) => {
    switch ($action) {
      case 'warn':
        return 'var(--yellow-9)';
      case 'hide':
        return 'var(--red-9)';
      case 'blur':
        return 'var(--blue-9)';
      default:
        return 'var(--text-2)';
    }
  }};
`;

export const FilterMeta = styled.div`
  font-size: var(--font-size-1);
  color: var(--text-2);
  margin-bottom: var(--size-2);
`;

export const FilterKeywords = styled.div`
  font-size: var(--font-size-1);
  color: var(--text-3);
  margin-bottom: var(--size-3);
  
  strong {
    color: var(--text-2);
  }
`;

export const FilterContexts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-1);
  margin-bottom: var(--size-3);
`;

export const ContextTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: var(--size-1) var(--size-2);
  background: var(--surface-3);
  border-radius: var(--radius-1);
  font-size: var(--font-size-0);
  color: var(--text-2);
`;

export const FilterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--size-2);
  padding-top: var(--size-3);
  border-top: 1px solid var(--surface-3);
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: var(--size-8) var(--size-4);
  color: var(--text-2);
  
  p {
    margin-bottom: var(--size-4);
  }
`;

export const ExpirationInfo = styled.span`
  font-size: var(--font-size-0);
  color: var(--text-3);
  margin-left: var(--size-2);
`;

// Form styles
export const FormSection = styled.div`
  margin-bottom: var(--size-5);
`;

export const FormLabel = styled.label`
  display: block;
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-5);
  color: var(--text-2);
  margin-bottom: var(--size-2);
`;

export const FormInput = styled.input`
  width: 100%;
  padding: var(--size-2) var(--size-3);
  background: var(--surface-1);
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-2);
  font-size: var(--font-size-1);
  color: var(--text-1);

  &:focus {
    outline: none;
    border-color: var(--brand);
  }

  &::placeholder {
    color: var(--text-3);
  }
`;

export const FormSelect = styled.select`
  width: 100%;
  padding: var(--size-2) var(--size-3);
  background: var(--surface-1);
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-2);
  font-size: var(--font-size-1);
  color: var(--text-1);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--brand);
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-3);
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  cursor: pointer;
  font-size: var(--font-size-1);
  color: var(--text-1);

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--brand);
  }
`;

export const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: var(--size-2);
  cursor: pointer;
  padding: var(--size-2);
  border-radius: var(--radius-2);
  transition: background 0.2s;

  &:hover {
    background: var(--surface-2);
  }

  input[type="radio"] {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    cursor: pointer;
    accent-color: var(--brand);
  }
`;

export const RadioContent = styled.div`
  flex: 1;
`;

export const RadioTitle = styled.div`
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-5);
  color: var(--text-1);
`;

export const RadioDescription = styled.div`
  font-size: var(--font-size-0);
  color: var(--text-3);
  margin-top: var(--size-1);
`;

export const KeywordsSection = styled.div`
  background: var(--surface-2);
  border-radius: var(--radius-2);
`;

export const KeywordRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  margin-bottom: var(--size-2);

  &:last-of-type {
    margin-bottom: var(--size-3);
  }
`;

export const KeywordInput = styled.input`
  flex: 1;
  padding: var(--size-2) var(--size-3);
  background: var(--surface-1);
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-2);
  font-size: var(--font-size-1);
  color: var(--text-1);

  &:focus {
    outline: none;
    border-color: var(--brand);
  }

  &::placeholder {
    color: var(--text-3);
  }
`;

export const WholeWordCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: var(--size-1);
  font-size: var(--font-size-0);
  color: var(--text-2);
  white-space: nowrap;
  cursor: pointer;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: var(--brand);
  }
`;

export const FormButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--size-2);
  margin-top: var(--size-5);
`;
