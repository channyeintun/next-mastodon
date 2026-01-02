'use client';

import { components, OptionProps, SingleValueProps, StylesConfig } from 'react-select';
import { Check } from 'lucide-react';

export interface OptionType {
    value: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
    isDisabled?: boolean;
}

export const customSelectStyles: StylesConfig<OptionType, false> = {
    control: (base, state) => ({
        ...base,
        background: state.isDisabled ? 'var(--surface-3)' : 'transparent',
        borderColor: 'var(--surface-3)',
        borderRadius: 'var(--radius-2)',
        padding: '4px',
        boxShadow: state.isFocused ? '0 0 0 1px var(--blue-6)' : 'none',
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
        opacity: state.isDisabled ? 0.6 : 1,
        '&:hover': {
            borderColor: state.isDisabled ? 'var(--surface-3)' : 'var(--text-2)',
        }
    }),
    menu: (base) => ({
        ...base,
        position: 'absolute',
        background: 'var(--surface-2)',
        border: '1px solid var(--surface-3)',
        borderRadius: 'var(--radius-2)',
        boxShadow: 'var(--shadow-4)',
        zIndex: 9999,
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
    }),
    option: (base, state) => ({
        ...base,
        background: state.isSelected ? 'var(--blue-6)' : state.isFocused ? 'var(--surface-3)' : 'transparent',
        color: state.isSelected ? 'white' : 'var(--text-1)',
        padding: '12px',
        cursor: 'pointer',
        borderBottom: '1px solid var(--surface-3)',
        '&:last-child': {
            borderBottom: 'none',
        },
        ':active': {
            backgroundColor: 'var(--blue-6)',
        },
    }),
    singleValue: (base) => ({
        ...base,
        color: 'var(--text-1)',
        display: 'flex',
        alignItems: 'center',
    }),
    input: (base) => ({
        ...base,
        color: 'var(--text-1)',
    }),
    dropdownIndicator: (base) => ({
        ...base,
        color: 'var(--text-2)',
        '&:hover': {
            color: 'var(--text-1)',
        }
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
};

export function CustomOption(props: OptionProps<OptionType, false>) {
    const { data, isSelected } = props;
    const Icon = data.icon;
    return (
        <components.Option {...props}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: props.isDisabled ? 0.5 : 1 }}>
                {Icon && (
                    <div style={{ color: isSelected ? 'white' : 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} />
                    </div>
                )}
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: isSelected ? 'bold' : 'normal', fontSize: '1em' }}>{data.label}</div>
                    {data.description && (
                        <div style={{ fontSize: '0.85em', color: 'var(--text-2)', marginTop: '2px' }}>{data.description}</div>
                    )}
                </div>
                {isSelected && <Check size={18} style={{ color: 'var(--blue-6)' }} />}
            </div>
        </components.Option>
    );
}

export function CustomSingleValue(props: SingleValueProps<OptionType, false>) {
    const { data } = props;
    const Icon = data.icon;
    return (
        <components.SingleValue {...props}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {Icon && <Icon size={18} style={{ color: 'var(--text-2)' }} />}
                <span>{data.label}</span>
            </div>
        </components.SingleValue>
    );
}
