'use client';

import styled from '@emotion/styled';
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '../atoms/Button';
import { IconButton } from '../atoms/IconButton';
import { useTranslations } from 'next-intl';

export interface PollData {
  options: string[];
  expiresIn: number; // seconds
  multiple: boolean;
}

interface PollComposerProps {
  poll: PollData | null;
  onPollChange: (poll: PollData | null) => void;
}

export function PollComposer({ poll, onPollChange }: PollComposerProps) {
  const t = useTranslations('composer');
  const [options, setOptions] = useState<string[]>(poll?.options || ['', '']);
  const [expiresIn, setExpiresIn] = useState<number>(poll?.expiresIn || 86400);
  const [multiple, setMultiple] = useState<boolean>(poll?.multiple || false);

  const EXPIRY_OPTIONS = [
    { label: t('duration.5m') || '5 minutes', value: 300 },
    { label: t('duration.30m') || '30 minutes', value: 1800 },
    { label: t('duration.1h') || '1 hour', value: 3600 },
    { label: t('duration.6h') || '6 hours', value: 21600 },
    { label: t('duration.1d') || '1 day', value: 86400 },
    { label: t('duration.3d') || '3 days', value: 259200 },
    { label: t('duration.7d') || '7 days', value: 604800 },
  ];

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    updatePoll(newOptions, expiresIn, multiple);
  };

  const handleAddOption = () => {
    if (options.length < 4) {
      const newOptions = [...options, ''];
      setOptions(newOptions);
      updatePoll(newOptions, expiresIn, multiple);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      updatePoll(newOptions, expiresIn, multiple);
    }
  };

  const handleExpiryChange = (value: number) => {
    setExpiresIn(value);
    updatePoll(options, value, multiple);
  };

  const handleMultipleChange = (value: boolean) => {
    setMultiple(value);
    updatePoll(options, expiresIn, value);
  };

  const updatePoll = (opts: string[], exp: number, mult: boolean) => {
    onPollChange({
      options: opts,
      expiresIn: exp,
      multiple: mult,
    });
  };

  const handleRemovePoll = () => {
    onPollChange(null);
  };

  if (!poll) {
    return null;
  }

  return (
    <Container>
      {/* Header */}
      <Header>
        <Title>{t('poll')}</Title>
        <IconButton size="small" onClick={handleRemovePoll} title={t('removePoll')}>
          <X size={16} />
        </IconButton>
      </Header>

      {/* Options */}
      <OptionsSection>
        {options.map((option, index) => (
          <OptionRow key={index}>
            <OptionInput
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={t('optionPlaceholder', { number: index + 1 })}
              maxLength={50}
            />
            {options.length > 2 && (
              <IconButton
                size="small"
                onClick={() => handleRemoveOption(index)}
                title={t('removeOption')}
              >
                <X size={16} />
              </IconButton>
            )}
          </OptionRow>
        ))}

        {options.length < 4 && (
          <Button
            type="button"
            variant="ghost"
            size="small"
            onClick={handleAddOption}
          >
            <Plus size={14} />
            {t('addOption')}
          </Button>
        )}
      </OptionsSection>

      {/* Settings */}
      <SettingsRow>
        {/* Expiry */}
        <SettingField>
          <SettingLabel>{t('pollDuration')}</SettingLabel>
          <Select
            value={expiresIn}
            onChange={(e) => handleExpiryChange(Number(e.target.value))}
          >
            {EXPIRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </SettingField>

        {/* Multiple choice */}
        <div>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={multiple}
              onChange={(e) => handleMultipleChange(e.target.checked)}
            />
            <CheckboxText>{t('multipleChoice')}</CheckboxText>
          </CheckboxLabel>
        </div>
      </SettingsRow>
    </Container>
  );
}

// Styled components
const Container = styled.div`
  padding: var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  margin-bottom: var(--size-3);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--size-3);
`;

const Title = styled.h3`
  font-size: 0.9375rem;
  font-weight: var(--font-weight-6);
  color: var(--text-1);
  margin: 0;
`;

const OptionsSection = styled.div`
  margin-bottom: var(--size-3);
`;

const OptionRow = styled.div`
  display: flex;
  gap: var(--size-2);
  margin-bottom: var(--size-2);
`;

const OptionInput = styled.input`
  flex: 1;
  padding: var(--size-2);
  border: 1px solid var(--surface-4);
  border-radius: var(--radius-2);
  background: var(--surface-1);
  color: var(--text-1);
  font-size: 0.9375rem;
`;

const SettingsRow = styled.div`
  display: flex;
  gap: var(--size-3);
  flex-wrap: wrap;
  align-items: center;
`;

const SettingField = styled.div`
  flex: 1;
  min-width: 150px;
`;

const SettingLabel = styled.label`
  display: block;
  font-size: 0.9375rem;
  font-weight: var(--font-weight-6);
  margin-bottom: var(--size-1);
  color: var(--text-1);
`;

const Select = styled.select`
  width: 100%;
  padding: var(--size-2);
  border: 1px solid var(--surface-4);
  border-radius: var(--radius-2);
  background: var(--surface-1);
  color: var(--text-1);
  font-size: 0.9375rem;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  cursor: pointer;
  font-size: 0.9375rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const CheckboxText = styled.span`
  color: var(--text-1);
  font-weight: var(--font-weight-5);
`;