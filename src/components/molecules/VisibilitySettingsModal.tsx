import styled from '@emotion/styled';
import { useState, useEffect } from 'react';
import { X, Globe, Lock, Users, Mail, Check } from 'lucide-react';
import Select, { components, OptionProps, SingleValueProps, StylesConfig } from 'react-select';
import { useTranslations } from 'next-intl';

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
    const t = useTranslations('composer');
    const tCommon = useTranslations('common');
    const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
    const [quoteVisibility, setQuoteVisibility] = useState<QuoteVisibility>(initialQuoteVisibility);

    // Auto-update quote visibility constraints
    useEffect(() => {
        if (visibility === 'private' || visibility === 'direct' || isReply) {
            setQuoteVisibility('nobody');
        }
    }, [visibility, isReply]);

    const visibilityOptions: OptionType[] = [
        { value: 'public', label: t('visibilityOptions.public'), description: t('visibilityOptions.publicDesc'), icon: Globe },
        { value: 'unlisted', label: t('visibilityOptions.unlisted'), description: t('visibilityOptions.unlistedDesc'), icon: Lock },
        { value: 'private', label: t('visibilityOptions.private'), description: t('visibilityOptions.privateDesc'), icon: Users },
        { value: 'direct', label: t('visibilityOptions.direct'), description: t('visibilityOptions.directDesc'), icon: Mail },
    ];

    const quoteOptions: OptionType[] = [
        { value: 'public', label: t('options.quotePublic'), description: t('options.quotePublicDesc'), icon: Globe },
        { value: 'followers', label: t('options.quoteFollowers'), description: t('options.quoteFollowersDesc'), icon: Users },
        { value: 'nobody', label: t('options.quoteNobody'), description: t('options.quoteNobodyDesc'), icon: Lock },
    ];

    const isQuoteDisabled = visibility === 'private' || visibility === 'direct' || isReply;

    return (
        <Container>
            {/* Header */}
            <div className="dialog-header">
                <HeaderTitle>
                    {t('visibilityInteraction')}
                </HeaderTitle>
                <CloseButton onClick={onClose}>
                    <X size={20} />
                </CloseButton>
            </div>

            {/* Content */}
            <div className="dialog-body" style={{ overflow: 'visible' }}>
                <Description>
                    {t('visibilityDescription')}
                </Description>

                <FieldContainer>
                    <FieldLabel>{t('visibility')}</FieldLabel>
                    <Select
                        value={visibilityOptions.find(opt => opt.value === visibility)}
                        onChange={(option) => option && setVisibility(option.value as Visibility)}
                        options={visibilityOptions}
                        styles={customStyles}
                        components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                        isSearchable={false}
                    />
                </FieldContainer>

                <FieldContainer>
                    <FieldLabel>{t('whoCanQuote')}</FieldLabel>
                    <Select
                        value={quoteOptions.find(opt => opt.value === quoteVisibility)}
                        onChange={(option) => option && setQuoteVisibility(option.value as QuoteVisibility)}
                        options={quoteOptions}
                        styles={customStyles}
                        components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                        isDisabled={isQuoteDisabled}
                        isSearchable={false}
                    />
                    {isQuoteDisabled && (
                        <DisabledMessage>
                            {t('quoteDisabled')}
                        </DisabledMessage>
                    )}
                </FieldContainer>

            </div>

            {/* Footer */}
            <div className="dialog-footer">
                <CancelButton onClick={onClose}>
                    {tCommon('cancel')}
                </CancelButton>
                <SaveButton
                    onClick={() => onSave(visibility, quoteVisibility)}
                    autoFocus
                >
                    {tCommon('save')}
                </SaveButton>
            </div>
        </Container>
    );
}

const Container = styled.div`
  width: 500px;
  max-width: 90vw;
  overflow: visible;
`;

const HeaderTitle = styled.h2`
  font-size: var(--font-size-3);
  font-weight: bold;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-2);
  cursor: pointer;
  padding: var(--size-1);
`;

const Description = styled.p`
  color: var(--text-2);
  margin-bottom: var(--size-4);
  line-height: 1.5;
`;

const FieldContainer = styled.div`
  margin-bottom: var(--size-4);
  position: relative;
`;

const FieldLabel = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: var(--size-2);
`;

const DisabledMessage = styled.div`
  padding: var(--size-2);
  font-size: 0.85em;
  color: var(--text-2);
`;

const CancelButton = styled.button`
  padding: var(--size-2) var(--size-3);
  border-radius: var(--radius-2);
  border: 1px solid var(--surface-3);
  background: transparent;
  color: var(--text-1);
  cursor: pointer;
  font-weight: 600;
`;

const SaveButton = styled.button`
  padding: var(--size-2) var(--size-3);
  border-radius: var(--radius-2);
  border: none;
  background: var(--blue-6);
  color: white;
  cursor: pointer;
  font-weight: 600;
`;