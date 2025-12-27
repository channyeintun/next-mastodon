'use client';

import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { Languages, Search, X, ChevronDown } from 'lucide-react';
import { useInstanceLanguages } from '@/api';

interface LanguageDropdownProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

/**
 * Language selection dropdown for the composer.
 * Allows users to select the language of their post.
 */
export function LanguageDropdown({ value, onChange, disabled }: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: languages = [] } = useInstanceLanguages();

  // Fallback language names for when the API hasn't loaded yet
  const fallbackLanguages: Record<string, string> = {
    en: 'English',
  };

  // Get the current language name
  const currentLanguage = languages.find((l) => l.code === value);
  const displayName = currentLanguage?.name || fallbackLanguages[value];

  // Filter languages based on search query
  const filteredLanguages = languages.filter((lang) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lang.name.toLowerCase().includes(query) ||
      lang.code.toLowerCase().includes(query)
    );
  });

  // Sort languages: put selected first, then by name
  const sortedLanguages = [...filteredLanguages].sort((a, b) => {
    if (a.code === value) return -1;
    if (b.code === value) return 1;
    return a.name.localeCompare(b.name);
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (isOpen) {
        setSearchQuery('');
      }
    }
  };

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <Container ref={dropdownRef} onKeyDown={handleKeyDown}>
      <TriggerButton
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Select post language"
      >
        <Languages size={16} />
        <ButtonLabel>{displayName}</ButtonLabel>
        <ChevronDown size={14} className={isOpen ? 'rotate' : ''} />
      </TriggerButton>

      {isOpen && (
        <DropdownMenu role="listbox">
          <SearchContainer>
            <Search size={14} />
            <SearchInput
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search languages..."
              aria-label="Search languages"
            />
            {searchQuery && (
              <ClearButton
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </ClearButton>
            )}
          </SearchContainer>

          <LanguageList>
            {sortedLanguages.length === 0 ? (
              <NoResults>No languages found</NoResults>
            ) : (
              sortedLanguages.map((lang) => (
                <LanguageOption
                  key={lang.code}
                  role="option"
                  aria-selected={lang.code === value}
                  $isSelected={lang.code === value}
                  onClick={() => handleSelect(lang.code)}
                >
                  <LanguageName>{lang.name}</LanguageName>
                  <LanguageCode>{lang.code}</LanguageCode>
                </LanguageOption>
              ))
            )}
          </LanguageList>
        </DropdownMenu>
      )}
    </Container>
  );
}

// Styled components
const Container = styled.div`
  position: relative;
  display: inline-flex;
`;

const TriggerButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--size-1);
  padding: var(--size-1) var(--size-3);
  background: var(--surface-2);
  border: none;
  border-radius: 999px;
  color: var(--text-2);
  font-size: var(--font-size-0);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--surface-3);
    color: var(--text-1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg.rotate {
    transform: rotate(180deg);
  }

  svg {
    transition: transform 0.15s ease;
  }
`;

const ButtonLabel = styled.span`
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  min-width: 240px;
  max-width: 300px;
  margin-top: var(--size-1);
  background: var(--surface-2);
  border: 1px solid var(--gray-4);
  border-radius: var(--radius-2);
  box-shadow: var(--shadow-4);
  overflow: hidden;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  padding: var(--size-2) var(--size-3);
  border-bottom: 1px solid var(--gray-4);
  background: var(--surface-3);

  svg {
    color: var(--text-2);
    flex-shrink: 0;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-1);
  font-size: var(--font-size-1);
  outline: none;

  &::placeholder {
    color: var(--text-3);
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--size-1);
  background: transparent;
  border: none;
  color: var(--text-2);
  cursor: pointer;
  border-radius: var(--radius-1);

  &:hover {
    background: var(--surface-4);
    color: var(--text-1);
  }
`;

const LanguageList = styled.div`
  max-height: 280px;
  overflow-y: auto;
`;

const LanguageOption = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--size-2) var(--size-3);
  cursor: pointer;
  background: ${(props) => (props.$isSelected ? 'var(--blue-6)' : 'transparent')};
  color: ${(props) => (props.$isSelected ? 'white' : 'inherit')};

  &:hover {
    background: ${(props) => (props.$isSelected ? 'var(--blue-7)' : 'var(--surface-3)')};
  }

  span {
    color: ${(props) => (props.$isSelected ? 'white' : 'inherit')};
  }
`;

const LanguageName = styled.span`
  color: var(--text-1);
  font-size: var(--font-size-1);
`;

const LanguageCode = styled.span`
  color: var(--text-3);
  font-size: var(--font-size-0);
  text-transform: uppercase;
`;

const NoResults = styled.div`
  padding: var(--size-4);
  text-align: center;
  color: var(--text-2);
  font-size: var(--font-size-1);
`;
