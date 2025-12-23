import styled from '@emotion/styled';

export const Container = styled.div`
  width: 500px;
  max-width: 90vw;
  max-height: 80dvh;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--size-4);
  border-bottom: 1px solid var(--surface-3);
`;

export const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-3);
`;

export const HeaderText = styled.div``;

export const HeaderTitle = styled.h2`
  margin: 0;
  font-size: var(--font-size-2);
  font-weight: 600;
`;

export const Content = styled.div`
  padding: var(--size-4);
  overflow-y: auto;
  flex: 1;
`;

export const StepTitle = styled.h3`
  margin: 0 0 var(--size-2) 0;
  font-size: var(--font-size-3);
  font-weight: 600;
`;

export const StepDescription = styled.p`
  margin: 0 0 var(--size-4) 0;
  color: var(--text-2);
`;

export const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  margin-bottom: var(--size-4);
`;

export const OptionButton = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: var(--size-3);
  padding: var(--size-3);
  border: 1px solid ${(props) => (props.$selected ? 'var(--blue-6)' : 'var(--surface-3)')};
  border-radius: var(--radius-2);
  background: ${(props) => (props.$selected ? 'color-mix(in srgb, var(--blue-6) 15%, transparent)' : 'transparent')};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${(props) => (props.$selected ? 'var(--blue-6)' : 'var(--surface-4)')};
    background: ${(props) => (props.$selected ? 'color-mix(in srgb, var(--blue-6) 20%, transparent)' : 'var(--surface-2)')};
  }
`;

export const OptionIcon = styled.div<{ $selected: boolean }>`
  flex-shrink: 0;
  color: ${(props) => (props.$selected ? 'var(--blue-6)' : 'var(--text-2)')};
  margin-top: 2px;
`;

export const OptionContent = styled.div`
  flex: 1;
`;

export const OptionLabel = styled.div`
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: var(--size-1);
`;

export const OptionDescription = styled.div`
  font-size: var(--font-size-0);
  color: var(--text-2);
`;

export const OptionCheck = styled.div<{ $visible: boolean }>`
  flex-shrink: 0;
  color: var(--blue-6);
  opacity: ${(props) => (props.$visible ? 1 : 0)};
`;

export const RulesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  margin-bottom: var(--size-4);
`;

export const RuleButton = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: var(--size-3);
  padding: var(--size-3);
  border: 1px solid ${(props) => (props.$selected ? 'var(--blue-6)' : 'var(--surface-3)')};
  border-radius: var(--radius-2);
  background: ${(props) => (props.$selected ? 'color-mix(in srgb, var(--blue-6) 15%, transparent)' : 'transparent')};
  cursor: pointer;
  text-align: left;

  &:hover {
    border-color: ${(props) => (props.$selected ? 'var(--blue-6)' : 'var(--surface-4)')};
    background: ${(props) => (props.$selected ? 'color-mix(in srgb, var(--blue-6) 20%, transparent)' : 'var(--surface-2)')};
  }
`;

export const RuleCheckbox = styled.div<{ $selected: boolean }>`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border: 2px solid ${(props) => (props.$selected ? 'var(--blue-6)' : 'var(--surface-4)')};
  border-radius: var(--radius-1);
  background: ${(props) => (props.$selected ? 'var(--blue-6)' : 'transparent')};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const RuleText = styled.div`
  color: var(--text-1);
  line-height: 1.4;
`;

export const InfoBox = styled.div`
  padding: var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  margin-bottom: var(--size-4);

  p {
    margin: 0;
    color: var(--text-2);
  }
`;

export const CommentTextarea = styled.textarea`
  width: 100%;
  padding: var(--size-3);
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-2);
  background: var(--surface-1);
  color: var(--text-1);
  font-size: var(--font-size-1);
  font-family: inherit;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: var(--blue-6);
  }
`;

export const CharCount = styled.div`
  text-align: right;
  font-size: var(--font-size-0);
  color: var(--text-3);
  margin-top: var(--size-1);
  margin-bottom: var(--size-3);
`;

export const ForwardContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  padding: var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  margin-bottom: var(--size-4);
`;

export const ForwardCheckbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

export const ForwardLabel = styled.label`
  color: var(--text-1);
  font-size: var(--font-size-1);
  cursor: pointer;

  strong {
    color: var(--blue-6);
  }
`;

export const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--size-2);
  margin-top: auto;
  padding-top: var(--size-4);
  border-top: 1px solid var(--surface-3);
`;

export const ThankYouContainer = styled.div`
  text-align: center;
  padding: var(--size-4) 0;
`;

export const ThankYouIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--green-2);
  color: var(--green-6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--size-4);
`;

export const SuggestionList = styled.ul`
  text-align: left;
  margin: var(--size-4) 0 0;
  padding: var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  list-style: disc inside;

  li {
    color: var(--text-2);
    margin-bottom: var(--size-1);

    &:last-child {
      margin-bottom: 0;
    }
  }
`;
