import { useState, useEffect } from 'react';
import { X, Globe, Lock, Users, Mail, Check } from 'lucide-react';
import Select, { components, OptionProps, SingleValueProps, StylesConfig } from 'react-select';

export type Visibility = 'public' | 'unlisted' | 'private' | 'direct';
export type QuoteVisibility = 'public' | 'followers' | 'nobody';

interface VisibilitySettingsModalProps {
    initialVisibility: Visibility;
    initialQuoteVisibility: QuoteVisibility;
    isReply?: boolean;
    onSave: (visibility: Visibility, quoteVisibility: QuoteVisibility) => void;
    onClose: () => void;
}

interface OptionType {
    value: string;
    label: string;
    description: string;
    icon: any;
    isDisabled?: boolean;
}

// Custom styles for react-select to match app theme
const customStyles: StylesConfig<OptionType, false> = {
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

// Custom Option Component
const CustomOption = (props: OptionProps<OptionType, false>) => {
    const { data, isSelected } = props;
    const Icon = data.icon;
    return (
        <components.Option {...props}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: props.isDisabled ? 0.5 : 1 }}>
                {Icon && (
                    <div style={{
                        color: isSelected ? 'white' : 'var(--text-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Icon size={20} />
                    </div>
                )}
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: isSelected ? 'bold' : 'normal', fontSize: '1em' }}>
                        {data.label}
                    </div>
                    {data.description && (
                        <div style={{ fontSize: '0.85em', color: 'var(--text-2)', marginTop: '2px' }}>
                            {data.description}
                        </div>
                    )}
                </div>
                {isSelected && <Check size={18} style={{ color: 'var(--blue-6)' }} />}
            </div>
        </components.Option>
    );
};

// Custom SingleValue Component
const CustomSingleValue = (props: SingleValueProps<OptionType, false>) => {
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
};


export function VisibilitySettingsModal({
    initialVisibility,
    initialQuoteVisibility,
    isReply = false,
    onSave,
    onClose,
}: VisibilitySettingsModalProps) {
    const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
    const [quoteVisibility, setQuoteVisibility] = useState<QuoteVisibility>(initialQuoteVisibility);

    // Auto-update quote visibility constraints
    useEffect(() => {
        if (visibility === 'private' || visibility === 'direct' || isReply) {
            setQuoteVisibility('nobody');
        }
    }, [visibility, isReply]);

    const visibilityOptions: OptionType[] = [
        { value: 'public', label: 'Public', description: 'Anyone on and off Mastodon', icon: Globe },
        { value: 'unlisted', label: 'Quiet public', description: 'Hidden from search results, viral timelines', icon: Lock },
        { value: 'private', label: 'Followers', description: 'Only your followers', icon: Users },
        { value: 'direct', label: 'Private mention', description: 'Everyone mentioned in the post', icon: Mail },
    ];

    const quoteOptions: OptionType[] = [
        { value: 'public', label: 'Everyone', description: 'Anyone can quote this post', icon: Globe },
        { value: 'followers', label: 'Followers', description: 'Only followers can quote', icon: Users },
        { value: 'nobody', label: 'Just me', description: 'No one else can quote', icon: Lock },
    ];

    const isQuoteDisabled = visibility === 'private' || visibility === 'direct' || isReply;

    return (
        <div style={{ width: '500px', maxWidth: '90vw', overflow: 'visible' }}>
            {/* Header */}
            <div className="dialog-header">
                <h2 style={{ fontSize: 'var(--font-size-3)', fontWeight: 'bold', margin: 0 }}>
                    Visibility and interaction
                </h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-2)',
                        cursor: 'pointer',
                        padding: 'var(--size-1)',
                    }}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="dialog-body" style={{ overflow: 'visible' }}>
                <p style={{ color: 'var(--text-2)', marginBottom: 'var(--size-4)', lineHeight: '1.5' }}>
                    Control who can interact with this post. You can also apply settings to all future posts by navigating to Preferences &gt; Posting defaults.
                </p>

                <div style={{ marginBottom: 'var(--size-4)', position: 'relative' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 'var(--size-2)' }}>Visibility</label>
                    <Select
                        value={visibilityOptions.find(opt => opt.value === visibility)}
                        onChange={(option) => option && setVisibility(option.value as Visibility)}
                        options={visibilityOptions}
                        styles={customStyles}
                        components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                        isSearchable={false}
                        menuPortalTarget={document.body}
                    />
                </div>

                <div style={{ marginBottom: 'var(--size-4)', position: 'relative' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 'var(--size-2)' }}>Who can quote</label>
                    <Select
                        value={quoteOptions.find(opt => opt.value === quoteVisibility)}
                        onChange={(option) => option && setQuoteVisibility(option.value as QuoteVisibility)}
                        options={quoteOptions}
                        styles={customStyles}
                        components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                        isDisabled={isQuoteDisabled}
                        isSearchable={false}
                        menuPortalTarget={document.body}
                    />
                    {isQuoteDisabled && (
                        <div style={{ padding: 'var(--size-2)', fontSize: '0.85em', color: 'var(--text-2)' }}>
                            Follower-only posts authored on Mastodon can't be quoted by others.
                        </div>
                    )}
                </div>

            </div>

            {/* Footer */}
            <div className="dialog-footer">
                <button
                    onClick={onClose}
                    style={{
                        padding: 'var(--size-2) var(--size-3)',
                        borderRadius: 'var(--radius-2)',
                        border: '1px solid var(--surface-3)',
                        background: 'transparent',
                        color: 'var(--text-1)',
                        cursor: 'pointer',
                        fontWeight: 600,
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={() => onSave(visibility, quoteVisibility)}
                    autoFocus
                    style={{
                        padding: 'var(--size-2) var(--size-3)',
                        borderRadius: 'var(--radius-2)',
                        border: 'none',
                        background: 'var(--blue-6)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 600,
                    }}
                >
                    Save
                </button>
            </div>
        </div>
    );
}
