'use client';

import { useMemo } from 'react';
import Select, { StylesConfig } from 'react-select';
import { Languages } from 'lucide-react';
import { useInstanceLanguages } from '@/api';
import { useTranslations } from 'next-intl';

interface LanguageDropdownProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

interface LanguageOption {
  value: string;
  label: string;
}

// Compact styles for the language dropdown
const customStyles: StylesConfig<LanguageOption, false> = {
  control: (base, state) => ({
    ...base,
    background: 'var(--surface-2)',
    border: 'none',
    borderRadius: '999px',
    padding: '0 2px 0 8px',
    minHeight: '28px',
    height: '28px',
    boxShadow: 'var(--shadow-2), 0 1px var(--surface-3)',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    opacity: state.isDisabled ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '0.9375rem',
    transition: 'all 0.15s ease',
    '&:hover': {
      background: 'var(--surface-3)',
    }
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 4px',
  }),
  menu: (base) => ({
    ...base,
    background: 'var(--surface-2)',
    border: '1px solid var(--gray-4)',
    borderRadius: 'var(--radius-2)',
    boxShadow: 'var(--shadow-4)',
    zIndex: 10000,
    width: 'min(220px, calc(100vw - 32px))',
    right: 0,
    left: 'auto',
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 10000,
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '280px',
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected ? 'var(--blue-6)' : state.isFocused ? 'var(--surface-3)' : 'transparent',
    color: state.isSelected ? 'white' : 'var(--text-1)',
    padding: '8px 12px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9375rem',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--text-2)',
    fontSize: '0.9375rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  }),
  input: (base) => ({
    ...base,
    color: 'var(--text-1)',
    fontSize: '0.9375rem',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--text-3)',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'var(--text-2)',
    padding: '0 4px',
    '&:hover': {
      color: 'var(--text-1)',
    }
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
};

// Custom format for the selected value to show icon + language name
const formatOptionLabel = (option: LanguageOption, { context }: { context: 'menu' | 'value' }) => {
  if (context === 'value') {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Languages size={14} />
        {option.label}
      </span>
    );
  }
  return (
    <span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <span>{option.label}</span>
      <span style={{ color: 'var(--text-3)', fontSize: '0.9375rem', textTransform: 'uppercase' }}>
        {option.value}
      </span>
    </span>
  );
};

/**
 * Language selection dropdown for the composer.
 * Uses react-select with portal for proper positioning in modals.
 */
export function LanguageDropdown({ value, onChange, disabled }: LanguageDropdownProps) {
  const { data: languages = [] } = useInstanceLanguages();
  const t = useTranslations('composer');

  // Convert languages to react-select format
  const options: LanguageOption[] = useMemo(() => {
    return languages.map((lang) => ({
      value: lang.code,
      label: lang.name,
    }));
  }, [languages]);

  // Find current value
  const selectedOption = options.find((opt) => opt.value === value) || {
    value: value,
    label: value === 'en' ? 'English' : value,
  };

  return (
    <Select
      value={selectedOption}
      onChange={(option) => option && onChange(option.value)}
      options={options}
      styles={customStyles}
      formatOptionLabel={formatOptionLabel}
      isDisabled={disabled}
      isSearchable
      placeholder={t('language')}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPlacement="auto"
    />
  );
}
