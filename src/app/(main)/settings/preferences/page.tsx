'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings2, Globe, Lock, Users, Mail } from 'lucide-react';
import Select from 'react-select';
import { useCurrentAccount, usePreferences, useUpdateAccount } from '@/api';
import { Button, IconButton, Card, CircleSkeleton, TextSkeleton } from '@/components/atoms';
import { customSelectStyles, CustomOption, CustomSingleValue, OptionType } from './SelectStyles';
import { useTranslations } from 'next-intl';

type Visibility = 'public' | 'unlisted' | 'private' | 'direct';
type QuotePolicy = 'public' | 'followers' | 'nobody';

// Options defined inside component to use translations

export default function PreferencesPage() {
    const router = useRouter();
    const tSettings = useTranslations('settings');
    const t = useTranslations('settings.preferencesPage');
    const tCommon = useTranslations('common');
    const tOptions = useTranslations('settings.options');
    const { data: currentAccount, isLoading: isLoadingAccount } = useCurrentAccount();
    const { data: preferences, isLoading: isLoadingPreferences } = usePreferences();
    const updateAccountMutation = useUpdateAccount();

    const visibilityOptions: OptionType[] = [
        { value: 'public', label: tOptions('public'), description: tOptions('publicDesc'), icon: Globe },
        { value: 'unlisted', label: tOptions('unlisted'), description: tOptions('unlistedDesc'), icon: Lock },
        { value: 'private', label: tOptions('private'), description: tOptions('privateDesc'), icon: Users },
        { value: 'direct', label: tOptions('direct'), description: tOptions('directDesc'), icon: Mail },
    ];

    const quotePolicyOptions: OptionType[] = [
        { value: 'public', label: tOptions('quotePublic'), description: tOptions('quotePublicDesc'), icon: Globe },
        { value: 'followers', label: tOptions('quoteFollowers'), description: tOptions('quoteFollowersDesc'), icon: Users },
        { value: 'nobody', label: tOptions('quoteNobody'), description: tOptions('quoteNobodyDesc'), icon: Lock },
    ];

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
        );
    }

    const checkboxStyle = { width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px' };
    const labelStyle = { display: 'flex', alignItems: 'flex-start', gap: 'var(--size-3)', padding: 'var(--size-3)', borderRadius: 'var(--radius-2)', background: 'transparent', cursor: 'pointer' } as const;

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'var(--size-4) var(--size-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)', marginBottom: 'var(--size-5)' }}>
                <IconButton onClick={() => router.back()} aria-label={tCommon('back')}><ArrowLeft size={20} /></IconButton>
                <h1 style={{ fontSize: 'var(--font-size-4)', fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                    <Settings2 size={24} />{tSettings('preferences')}
                </h1>
            </div>

            <form onSubmit={handleSubmit}>

                <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                    <h2 style={{ fontSize: 'var(--font-size-3)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-2)', color: 'var(--text-1)' }}>{t('postingDefaults')}</h2>
                    <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)', marginBottom: 'var(--size-4)' }}>{t('postingDefaultsDesc')}</p>

                    <div style={{ marginBottom: 'var(--size-4)' }}>
                        <label style={{ display: 'block', fontSize: 'var(--font-size-1)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-2)', color: 'var(--text-1)' }}>{t('visibility')}</label>
                        <Select value={visibilityOptions.find(opt => opt.value === defaultVisibility)} onChange={(option) => option && setDefaultVisibility(option.value as Visibility)} options={visibilityOptions} styles={customSelectStyles} components={{ Option: CustomOption, SingleValue: CustomSingleValue }} isSearchable={false} />
                    </div>

                    <div style={{ marginBottom: 'var(--size-4)' }}>
                        <label style={{ display: 'block', fontSize: 'var(--font-size-1)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-2)', color: 'var(--text-1)' }}>{t('whoCanQuote')}</label>
                        <Select value={quotePolicyOptions.find(opt => opt.value === defaultQuotePolicy)} onChange={(option) => option && setDefaultQuotePolicy(option.value as QuotePolicy)} options={quotePolicyOptions} styles={customSelectStyles} components={{ Option: CustomOption, SingleValue: CustomSingleValue }} isDisabled={isQuotePolicyDisabled} isSearchable={false} />
                        {isQuotePolicyDisabled && <div style={{ padding: 'var(--size-2)', fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>{t('quoteDisabled')}</div>}
                    </div>

                    <label style={labelStyle}>
                        <input type="checkbox" checked={defaultSensitive} onChange={(e) => setDefaultSensitive(e.target.checked)} style={checkboxStyle} />
                        <div><div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>{t('markSensitive')}</div><div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>{t('markSensitiveDesc')}</div></div>
                    </label>
                </Card>

                <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                    <h2 style={{ fontSize: 'var(--font-size-3)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-2)', color: 'var(--text-1)' }}>{t('privacy')}</h2>
                    <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)', marginBottom: 'var(--size-4)' }}>{t('privacyDesc')}</p>

                    <div style={{ marginBottom: 'var(--size-3)' }}>
                        <label style={labelStyle}>
                            <input type="checkbox" checked={hideCollections} onChange={(e) => setHideCollections(e.target.checked)} style={checkboxStyle} />
                            <div><div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>{t('hideCollections')}</div><div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>{t('hideCollectionsDesc')}</div></div>
                        </label>
                    </div>

                    <label style={labelStyle}>
                        <input type="checkbox" checked={indexable} onChange={(e) => setIndexable(e.target.checked)} style={checkboxStyle} />
                        <div><div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>{t('indexable')}</div><div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>{t('indexableDesc')}</div></div>
                    </label>
                </Card>

                <div style={{ display: 'flex', gap: 'var(--size-3)', justifyContent: 'flex-end' }}>
                    <Button type="button" variant="ghost" onClick={() => router.back()} disabled={updateAccountMutation.isPending}>{tCommon('cancel')}</Button>
                    <Button type="submit" disabled={!hasChanges || updateAccountMutation.isPending} isLoading={updateAccountMutation.isPending}>{t('saveChanges')}</Button>
                </div>
            </form>
        </div>
    );
}
