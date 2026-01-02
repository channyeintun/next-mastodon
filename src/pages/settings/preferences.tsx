import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Settings2, Globe, Lock, Users, Mail } from 'lucide-react';
import Select, { components, OptionProps, SingleValueProps, StylesConfig } from 'react-select';
import { Check } from 'lucide-react';
import { useCurrentAccount, usePreferences, useUpdateAccount } from '@/api';
import { Button, IconButton, Card, CircleSkeleton, TextSkeleton } from '@/components/atoms';
import { MainLayout } from '@/components/layouts/MainLayout';

type Visibility = 'public' | 'unlisted' | 'private' | 'direct';
type QuotePolicy = 'public' | 'followers' | 'nobody';

interface OptionType {
    value: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
    isDisabled?: boolean;
}

const customSelectStyles: StylesConfig<OptionType, false> = {
    control: (base, state) => ({
        ...base,
        background: state.isDisabled ? 'var(--surface-3)' : 'transparent',
        borderColor: 'var(--surface-3)',
        borderRadius: 'var(--radius-2)',
        padding: '4px',
        boxShadow: state.isFocused ? '0 0 0 1px var(--blue-6)' : 'none',
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
        opacity: state.isDisabled ? 0.6 : 1,
        '&:hover': { borderColor: state.isDisabled ? 'var(--surface-3)' : 'var(--text-2)' }
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
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    option: (base, state) => ({
        ...base,
        background: state.isSelected ? 'var(--blue-6)' : state.isFocused ? 'var(--surface-3)' : 'transparent',
        color: state.isSelected ? 'white' : 'var(--text-1)',
        padding: '12px',
        cursor: 'pointer',
        borderBottom: '1px solid var(--surface-3)',
        '&:last-child': { borderBottom: 'none' },
        ':active': { backgroundColor: 'var(--blue-6)' },
    }),
    singleValue: (base) => ({ ...base, color: 'var(--text-1)', display: 'flex', alignItems: 'center' }),
    input: (base) => ({ ...base, color: 'var(--text-1)' }),
    dropdownIndicator: (base) => ({ ...base, color: 'var(--text-2)', '&:hover': { color: 'var(--text-1)' } }),
    indicatorSeparator: () => ({ display: 'none' }),
};

function CustomOption(props: OptionProps<OptionType, false>) {
    const { data, isSelected } = props;
    const Icon = data.icon;
    return (
        <components.Option {...props}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: props.isDisabled ? 0.5 : 1 }}>
                {Icon && <div style={{ color: isSelected ? 'white' : 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={20} /></div>}
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: isSelected ? 'bold' : 'normal', fontSize: '1em' }}>{data.label}</div>
                    {data.description && <div style={{ fontSize: '0.85em', color: 'var(--text-2)', marginTop: '2px' }}>{data.description}</div>}
                </div>
                {isSelected && <Check size={18} style={{ color: 'var(--blue-6)' }} />}
            </div>
        </components.Option>
    );
}

function CustomSingleValue(props: SingleValueProps<OptionType, false>) {
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

export default function PreferencesPage() {
    const router = useRouter();
    const { data: currentAccount, isLoading: isLoadingAccount } = useCurrentAccount();
    const { data: preferences, isLoading: isLoadingPreferences } = usePreferences();
    const updateAccountMutation = useUpdateAccount();

    const [defaultVisibility, setDefaultVisibility] = useState<Visibility>('public');
    const [defaultQuotePolicy, setDefaultQuotePolicy] = useState<QuotePolicy>('public');
    const [defaultSensitive, setDefaultSensitive] = useState(false);
    const [hideCollections, setHideCollections] = useState(false);
    const [indexable, setIndexable] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

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

    useEffect(() => {
        if (currentAccount?.source) {
            const changed = defaultVisibility !== (currentAccount.source.privacy || 'public') ||
                defaultQuotePolicy !== (currentAccount.source.quote_policy || 'public') ||
                defaultSensitive !== (currentAccount.source.sensitive || false) ||
                hideCollections !== (currentAccount.source.hide_collections || false) ||
                indexable !== (currentAccount.source.indexable ?? true);
            setHasChanges(changed);
        }
    }, [defaultVisibility, defaultQuotePolicy, defaultSensitive, hideCollections, indexable, currentAccount]);

    const isQuotePolicyDisabled = defaultVisibility === 'private' || defaultVisibility === 'direct';

    useEffect(() => {
        if (isQuotePolicyDisabled) setDefaultQuotePolicy('nobody');
    }, [isQuotePolicyDisabled]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateAccountMutation.mutateAsync({
                source: { privacy: defaultVisibility, quote_policy: defaultQuotePolicy, sensitive: defaultSensitive },
                hide_collections: hideCollections,
                indexable: indexable,
            });
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to update preferences:', error);
        }
    };

    if (isLoadingAccount || isLoadingPreferences) {
        return (
            <MainLayout>
                <Head><title>Preferences - Mastodon</title></Head>
                <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'var(--size-4) var(--size-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)', marginBottom: 'var(--size-5)' }}>
                        <CircleSkeleton size="40px" />
                        <TextSkeleton width={120} height={24} />
                    </div>
                    <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                        <TextSkeleton width={150} height={20} style={{ marginBottom: 'var(--size-4)' }} />
                        <TextSkeleton width="100%" height={50} style={{ marginBottom: 'var(--size-3)' }} />
                        <TextSkeleton width="100%" height={50} style={{ marginBottom: 'var(--size-3)' }} />
                        <TextSkeleton width="100%" height={40} />
                    </Card>
                    <Card padding="medium"><TextSkeleton width={120} height={20} style={{ marginBottom: 'var(--size-4)' }} /><TextSkeleton width="100%" height={40} style={{ marginBottom: 'var(--size-3)' }} /><TextSkeleton width="100%" height={40} /></Card>
                </div>
            </MainLayout>
        );
    }

    const checkboxStyle = { width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px' };
    const labelStyle = { display: 'flex', alignItems: 'flex-start', gap: 'var(--size-3)', padding: 'var(--size-3)', borderRadius: 'var(--radius-2)', background: 'transparent', cursor: 'pointer' } as const;

    return (
        <MainLayout>
            <Head><title>Preferences - Mastodon</title></Head>
            <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'var(--size-4) var(--size-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)', marginBottom: 'var(--size-5)' }}>
                    <IconButton onClick={() => router.back()}><ArrowLeft size={20} /></IconButton>
                    <h1 style={{ fontSize: 'var(--font-size-4)', fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                        <Settings2 size={24} />Preferences
                    </h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                        <h2 style={{ fontSize: 'var(--font-size-3)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-2)', color: 'var(--text-1)' }}>Posting Defaults</h2>
                        <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)', marginBottom: 'var(--size-4)' }}>Configure default settings for new posts</p>

                        <div style={{ marginBottom: 'var(--size-4)' }}>
                            <label style={{ display: 'block', fontSize: 'var(--font-size-1)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-2)', color: 'var(--text-1)' }}>Visibility</label>
                            <Select value={visibilityOptions.find(opt => opt.value === defaultVisibility)} onChange={(option) => option && setDefaultVisibility(option.value as Visibility)} options={visibilityOptions} styles={customSelectStyles} components={{ Option: CustomOption, SingleValue: CustomSingleValue }} isSearchable={false} />
                        </div>

                        <div style={{ marginBottom: 'var(--size-4)' }}>
                            <label style={{ display: 'block', fontSize: 'var(--font-size-1)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-2)', color: 'var(--text-1)' }}>Who can quote</label>
                            <Select value={quotePolicyOptions.find(opt => opt.value === defaultQuotePolicy)} onChange={(option) => option && setDefaultQuotePolicy(option.value as QuotePolicy)} options={quotePolicyOptions} styles={customSelectStyles} components={{ Option: CustomOption, SingleValue: CustomSingleValue }} isDisabled={isQuotePolicyDisabled} isSearchable={false} />
                            {isQuotePolicyDisabled && <div style={{ padding: 'var(--size-2)', fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>Follower-only and private posts can&apos;t be quoted by others.</div>}
                        </div>

                        <label style={labelStyle}>
                            <input type="checkbox" checked={defaultSensitive} onChange={(e) => setDefaultSensitive(e.target.checked)} style={checkboxStyle} />
                            <div><div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>Mark media as sensitive by default</div><div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>Hide media attachments behind a content warning</div></div>
                        </label>
                    </Card>

                    <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                        <h2 style={{ fontSize: 'var(--font-size-3)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-2)', color: 'var(--text-1)' }}>Privacy</h2>
                        <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)', marginBottom: 'var(--size-4)' }}>Control your profile visibility and discoverability</p>

                        <div style={{ marginBottom: 'var(--size-3)' }}>
                            <label style={labelStyle}>
                                <input type="checkbox" checked={hideCollections} onChange={(e) => setHideCollections(e.target.checked)} style={checkboxStyle} />
                                <div><div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>Hide followers and following</div><div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>Hide your followers and who you follow from your profile</div></div>
                            </label>
                        </div>

                        <label style={labelStyle}>
                            <input type="checkbox" checked={indexable} onChange={(e) => setIndexable(e.target.checked)} style={checkboxStyle} />
                            <div><div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>Include public posts in search results</div><div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>Allow your public posts to be discoverable through search</div></div>
                        </label>
                    </Card>

                    <div style={{ display: 'flex', gap: 'var(--size-3)', justifyContent: 'flex-end' }}>
                        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={updateAccountMutation.isPending}>Cancel</Button>
                        <Button type="submit" disabled={!hasChanges || updateAccountMutation.isPending} isLoading={updateAccountMutation.isPending}>Save changes</Button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
