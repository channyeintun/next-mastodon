'use client';

import styled from '@emotion/styled';
import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { setCookie, deleteCookie, getCookie, getCookieDomain, type CookieOptions } from '../../utils/cookies';

type Theme = 'light' | 'dark' | 'auto';

const ThemeLabel = styled.label<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  padding: var(--size-3);
  border-radius: var(--radius-2);
  border: 2px solid ${({ $isSelected }) => ($isSelected ? 'var(--blue-6)' : 'var(--surface-3)')};
  background: ${({ $isSelected }) => ($isSelected ? 'var(--blue-6)' : 'transparent')};
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
`;

const ThemeRadio = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--cyan-6);
`;

const ThemeIcon = styled.div<{ $isSelected: boolean }>`
  color: ${({ $isSelected }) => ($isSelected ? 'white' : 'var(--text-2)')};
  display: flex;
  align-items: center;
`;

const ThemeTitle = styled.div<{ $isSelected: boolean }>`
  font-weight: var(--font-weight-6);
  font-size: var(--font-size-2);
  color: ${({ $isSelected }) => ($isSelected ? 'white' : 'var(--text-1)')};
`;

interface ThemeOption {
    value: Theme;
    label: string;
    icon: React.ReactNode;
    description: string;
}

interface ThemeSelectorProps {
    initialTheme?: 'light' | 'dark' | 'auto';
}

const themeOptions: ThemeOption[] = [
    {
        value: 'light',
        label: 'Light',
        icon: <Sun size={20} />,
        description: 'Always use light theme',
    },
    {
        value: 'dark',
        label: 'Dark',
        icon: <Moon size={20} />,
        description: 'Always use dark theme',
    },
    {
        value: 'auto',
        label: 'Auto',
        icon: <Monitor size={20} />,
        description: 'Match system preference',
    },
];

const getCookieOptions = (): CookieOptions => ({
    expires: 365, // 1 year
    sameSite: 'lax',
    domain: getCookieDomain(),
});

function getActiveTheme(theme: Theme): 'light' | 'dark' {
    if (theme === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
}

export function ThemeSelector({ initialTheme = 'auto' }: ThemeSelectorProps) {
    // Initialize state with server-provided theme, no useEffect needed
    const [currentTheme, setCurrentTheme] = useState<Theme>(initialTheme);

    // Sync with actual cookie value on mount to handle back/forward navigation
    useEffect(() => {
        const syncTheme = async () => {
            const cookieTheme = await getCookie('theme');
            // If cookie exists, it should be the source of truth
            // If cookie is missing, it means 'auto'
            const actualTheme = (cookieTheme as Theme) || 'auto';

            if (actualTheme !== currentTheme) {
                setCurrentTheme(actualTheme);
            }
        };

        syncTheme();
    }, []);

    const handleThemeChange = async (theme: Theme) => {
        // Update state for button highlighting
        setCurrentTheme(theme);

        // Save to cookie - only store explicit choices (light/dark)
        // For 'auto', remove the cookie so undefined = auto
        if (theme === 'auto') {
            await deleteCookie('theme', getCookieOptions());
        } else {
            await setCookie('theme', theme, getCookieOptions());
        }

        // Update DOM immediately
        const activeTheme = getActiveTheme(theme);
        document.documentElement.dataset.theme = activeTheme;
    };

    return (
        <div className="theme-selector-container">
            {themeOptions.map((option) => (
                <ThemeLabel
                    key={option.value}
                    $isSelected={currentTheme === option.value}
                >
                    <ThemeRadio
                        type="radio"
                        name="theme"
                        value={option.value}
                        checked={currentTheme === option.value}
                        onChange={() => handleThemeChange(option.value)}
                    />
                    <ThemeIcon $isSelected={currentTheme === option.value}>
                        {option.icon}
                    </ThemeIcon>
                    <ThemeTitle $isSelected={currentTheme === option.value}>
                        {option.label}
                    </ThemeTitle>
                </ThemeLabel>
            ))}
        </div>
    );
}
