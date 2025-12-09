'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { getCookie, setCookie, deleteCookie, type CookieOptions } from '../../utils/cookies';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeOption {
    value: Theme;
    label: string;
    icon: React.ReactNode;
    description: string;
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

const COOKIE_OPTIONS: CookieOptions = {
    expires: 365, // 1 year
    sameSite: 'lax',
};

function getActiveTheme(theme: Theme): 'light' | 'dark' {
    if (theme === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
}

export function ThemeSelector() {
    const [currentTheme, setCurrentTheme] = useState<Theme>('auto');

    useEffect(() => {
        // Read theme from cookie on mount to set button state
        const loadTheme = async () => {
            const savedTheme = await getCookie('theme') as 'light' | 'dark' | undefined;
            setCurrentTheme((savedTheme ?? 'auto') as Theme);
        };
        loadTheme();
    }, []);

    const handleThemeChange = async (theme: Theme) => {
        // Update state for button highlighting
        setCurrentTheme(theme);

        // Save to cookie - only store explicit choices (light/dark)
        // For 'auto', remove the cookie so undefined = auto
        if (theme === 'auto') {
            await deleteCookie('theme');
        } else {
            await setCookie('theme', theme, COOKIE_OPTIONS);
        }

        // Update DOM immediately
        const activeTheme = getActiveTheme(theme);
        document.documentElement.dataset.theme = activeTheme;
    };

    return (
        <div className="theme-selector-container">
            {themeOptions.map((option) => (
                <label
                    key={option.value}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--size-2)',
                        padding: 'var(--size-3)',
                        borderRadius: 'var(--radius-2)',
                        border: `2px solid ${currentTheme === option.value ? 'var(--blue-6)' : 'var(--surface-3)'
                            }`,
                        background: currentTheme === option.value ? 'var(--blue-6)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flex: 1,
                    }}
                >
                    <input
                        type="radio"
                        name="theme"
                        value={option.value}
                        checked={currentTheme === option.value}
                        onChange={() => handleThemeChange(option.value)}
                        style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            accentColor: currentTheme === option.value ? 'white' : 'var(--blue-6)',
                        }}
                    />
                    <div
                        style={{
                            color: currentTheme === option.value ? 'white' : 'var(--text-2)',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {option.icon}
                    </div>
                    <div
                        style={{
                            fontWeight: 'var(--font-weight-6)',
                            fontSize: 'var(--font-size-2)',
                            color: currentTheme === option.value ? 'white' : 'var(--text-1)',
                        }}
                    >
                        {option.label}
                    </div>
                </label>
            ))}
        </div>
    );
}
