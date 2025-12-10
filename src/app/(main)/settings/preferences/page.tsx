'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings2, Globe, Lock, Users, Mail, Check } from 'lucide-react';
import Select, { components, OptionProps, SingleValueProps, StylesConfig } from 'react-select';
import { useCurrentAccount, usePreferences, useUpdateAccount } from '@/api';
import { Button, IconButton, Card } from '@/components/atoms';

type Visibility = 'public' | 'unlisted' | 'private' | 'direct';
type QuotePolicy = 'public' | 'followers' | 'nobody';

interface OptionType {
    value: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
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

export default function PreferencesPage() {
    const router = useRouter();
    const { data: currentAccount, isLoading: isLoadingAccount } = useCurrentAccount();
    const { data: preferences, isLoading: isLoadingPreferences } = usePreferences();
    const updateAccountMutation = useUpdateAccount();

    // Posting defaults
    const [defaultVisibility, setDefaultVisibility] = useState<Visibility>('public');
    const [defaultQuotePolicy, setDefaultQuotePolicy] = useState<QuotePolicy>('public');
    const [defaultSensitive, setDefaultSensitive] = useState(false);

    // Privacy settings
    const [hideCollections, setHideCollections] = useState(false);
    const [indexable, setIndexable] = useState(true);

    const [hasChanges, setHasChanges] = useState(false);

    const visibilityOptions: OptionType[] = [
        { value: 'public', label: 'Public', description: 'Anyone on and off Mastodon', icon: Globe },
        { value: 'unlisted', label: 'Quiet public', description: 'Hidden from search results, viral timelines', icon: Lock },
        { value: 'private', label: 'Followers', description: 'Only your followers', icon: Users },
        { value: 'direct', label: 'Private mention', description: 'Everyone mentioned in the post', icon: Mail },
    ];

    const quotePolicyOptions: OptionType[] = [
        { value: 'public', label: 'Everyone', description: 'Anyone can quote this post', icon: Globe },
        { value: 'followers', label: 'Followers', description: 'Only followers can quote', icon: Users },
        { value: 'nobody', label: 'Just me', description: 'No one else can quote', icon: Lock },
    ];

    // Initialize form from preferences/account source
    useEffect(() => {
        if (currentAccount?.source) {
            setDefaultVisibility(currentAccount.source.privacy || 'public');
            setDefaultQuotePolicy(currentAccount.source.quote_policy || 'public');
            setDefaultSensitive(currentAccount.source.sensitive || false);
            setHideCollections(currentAccount.source.hide_collections || false);
            setIndexable(currentAccount.source.indexable ?? true);
        } else if (preferences) {
            setDefaultVisibility(preferences['posting:default:visibility'] || 'public');
            setDefaultQuotePolicy(preferences['posting:default:quote_policy'] || 'public');
            setDefaultSensitive(preferences['posting:default:sensitive'] || false);
        }
    }, [currentAccount, preferences]);

    // Track changes
    useEffect(() => {
        if (currentAccount?.source) {
            const privacyChanged = defaultVisibility !== (currentAccount.source.privacy || 'public');
            const quotePolicyChanged = defaultQuotePolicy !== (currentAccount.source.quote_policy || 'public');
            const sensitiveChanged = defaultSensitive !== (currentAccount.source.sensitive || false);
            const hideCollectionsChanged = hideCollections !== (currentAccount.source.hide_collections || false);
            const indexableChanged = indexable !== (currentAccount.source.indexable ?? true);
            setHasChanges(privacyChanged || quotePolicyChanged || sensitiveChanged || hideCollectionsChanged || indexableChanged);
        }
    }, [defaultVisibility, defaultQuotePolicy, defaultSensitive, hideCollections, indexable, currentAccount]);

    // Quote policy is restricted when visibility is private or direct
    const isQuotePolicyDisabled = defaultVisibility === 'private' || defaultVisibility === 'direct';

    // Auto-update quote policy when visibility restricts it
    useEffect(() => {
        if (isQuotePolicyDisabled) {
            setDefaultQuotePolicy('nobody');
        }
    }, [isQuotePolicyDisabled]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await updateAccountMutation.mutateAsync({
                source: {
                    privacy: defaultVisibility,
                    quote_policy: defaultQuotePolicy,
                    sensitive: defaultSensitive,
                },
                hide_collections: hideCollections,
                indexable: indexable,
            });
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to update preferences:', error);
        }
    };

    const isLoading = isLoadingAccount || isLoadingPreferences;

    if (isLoading) {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--size-4)' }}>
                {/* Header Skeleton */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--size-3)',
                    marginBottom: 'var(--size-5)',
                }}>
                    <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 'var(--radius-round)' }} />
                    <div className="skeleton" style={{ width: 120, height: 24, borderRadius: 'var(--radius-2)' }} />
                </div>

                {/* Card Skeletons */}
                <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                    <div className="skeleton" style={{ width: 150, height: 20, marginBottom: 'var(--size-4)', borderRadius: 'var(--radius-2)' }} />
                    <div className="skeleton" style={{ width: '100%', height: 50, marginBottom: 'var(--size-3)', borderRadius: 'var(--radius-2)' }} />
                    <div className="skeleton" style={{ width: '100%', height: 50, marginBottom: 'var(--size-3)', borderRadius: 'var(--radius-2)' }} />
                    <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 'var(--radius-2)' }} />
                </Card>
                <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                    <div className="skeleton" style={{ width: 120, height: 20, marginBottom: 'var(--size-4)', borderRadius: 'var(--radius-2)' }} />
                    <div className="skeleton" style={{ width: '100%', height: 40, marginBottom: 'var(--size-3)', borderRadius: 'var(--radius-2)' }} />
                    <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 'var(--radius-2)' }} />
                </Card>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--size-4)' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--size-3)',
                marginBottom: 'var(--size-5)',
            }}>
                <IconButton onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </IconButton>
                <h1 style={{
                    fontSize: 'var(--font-size-4)',
                    fontWeight: 'var(--font-weight-6)',
                    color: 'var(--text-1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--size-2)',
                }}>
                    <Settings2 size={24} />
                    Preferences
                </h1>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Posting Defaults */}
                <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                    <h2 style={{
                        fontSize: 'var(--font-size-3)',
                        fontWeight: 'var(--font-weight-6)',
                        marginBottom: 'var(--size-2)',
                        color: 'var(--text-1)',
                    }}>
                        Posting Defaults
                    </h2>
                    <p style={{
                        fontSize: 'var(--font-size-0)',
                        color: 'var(--text-2)',
                        marginBottom: 'var(--size-4)',
                    }}>
                        Configure default settings for new posts
                    </p>

                    {/* Default Visibility */}
                    <div style={{ marginBottom: 'var(--size-4)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--font-size-1)',
                            fontWeight: 'var(--font-weight-6)',
                            marginBottom: 'var(--size-2)',
                            color: 'var(--text-1)',
                        }}>
                            Visibility
                        </label>
                        <Select
                            value={visibilityOptions.find(opt => opt.value === defaultVisibility)}
                            onChange={(option) => option && setDefaultVisibility(option.value as Visibility)}
                            options={visibilityOptions}
                            styles={customStyles}
                            components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                            isSearchable={false}
                        />
                    </div>

                    {/* Default Quote Policy */}
                    <div style={{ marginBottom: 'var(--size-4)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--font-size-1)',
                            fontWeight: 'var(--font-weight-6)',
                            marginBottom: 'var(--size-2)',
                            color: 'var(--text-1)',
                        }}>
                            Who can quote
                        </label>
                        <Select
                            value={quotePolicyOptions.find(opt => opt.value === defaultQuotePolicy)}
                            onChange={(option) => option && setDefaultQuotePolicy(option.value as QuotePolicy)}
                            options={quotePolicyOptions}
                            styles={customStyles}
                            components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                            isDisabled={isQuotePolicyDisabled}
                            isSearchable={false}
                        />
                        {isQuotePolicyDisabled && (
                            <div style={{
                                padding: 'var(--size-2)',
                                fontSize: 'var(--font-size-0)',
                                color: 'var(--text-2)',
                            }}>
                                Follower-only and private posts can&apos;t be quoted by others.
                            </div>
                        )}
                    </div>

                    {/* Default Sensitive */}
                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'var(--size-3)',
                            padding: 'var(--size-3)',
                            borderRadius: 'var(--radius-2)',
                            background: 'transparent',
                            cursor: 'pointer',
                        }}>
                            <input
                                type="checkbox"
                                checked={defaultSensitive}
                                onChange={(e) => setDefaultSensitive(e.target.checked)}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                    marginTop: '2px',
                                }}
                            />
                            <div>
                                <div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>
                                    Mark media as sensitive by default
                                </div>
                                <div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                                    Hide media attachments behind a content warning
                                </div>
                            </div>
                        </label>
                    </div>
                </Card>

                {/* Privacy Settings */}
                <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                    <h2 style={{
                        fontSize: 'var(--font-size-3)',
                        fontWeight: 'var(--font-weight-6)',
                        marginBottom: 'var(--size-2)',
                        color: 'var(--text-1)',
                    }}>
                        Privacy
                    </h2>
                    <p style={{
                        fontSize: 'var(--font-size-0)',
                        color: 'var(--text-2)',
                        marginBottom: 'var(--size-4)',
                    }}>
                        Control your profile visibility and discoverability
                    </p>

                    {/* Hide Collections */}
                    <div style={{ marginBottom: 'var(--size-3)' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'var(--size-3)',
                            padding: 'var(--size-3)',
                            borderRadius: 'var(--radius-2)',
                            background: 'transparent',
                            cursor: 'pointer',
                        }}>
                            <input
                                type="checkbox"
                                checked={hideCollections}
                                onChange={(e) => setHideCollections(e.target.checked)}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                    marginTop: '2px',
                                }}
                            />
                            <div>
                                <div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>
                                    Hide followers and following
                                </div>
                                <div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                                    Hide your followers and who you follow from your profile
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Indexable */}
                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'var(--size-3)',
                            padding: 'var(--size-3)',
                            borderRadius: 'var(--radius-2)',
                            background: 'transparent',
                            cursor: 'pointer',
                        }}>
                            <input
                                type="checkbox"
                                checked={indexable}
                                onChange={(e) => setIndexable(e.target.checked)}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                    marginTop: '2px',
                                }}
                            />
                            <div>
                                <div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>
                                    Include public posts in search results
                                </div>
                                <div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                                    Allow your public posts to be discoverable through search
                                </div>
                            </div>
                        </label>
                    </div>
                </Card>

                {/* Actions */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--size-3)',
                    justifyContent: 'flex-end',
                }}>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        disabled={updateAccountMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={!hasChanges || updateAccountMutation.isPending}
                        isLoading={updateAccountMutation.isPending}
                    >
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
