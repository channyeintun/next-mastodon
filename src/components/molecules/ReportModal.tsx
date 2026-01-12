'use client';

import { useState, useCallback, useMemo } from 'react';
import { X, Check, AlertTriangle, Trash2, Scale, ChevronRight, Flag } from 'lucide-react';
import { useCreateReport, useInstance } from '@/api';
import { Button, IconButton, Avatar } from '@/components/atoms';
import type { Account, Status, ReportCategory, Rule } from '@/types/mastodon';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/hooks/useLocale';
import {
    Container, Header, HeaderInfo, HeaderText, HeaderTitle, Content,
    StepTitle, StepDescription, OptionsContainer, OptionButton, OptionIcon,
    OptionContent, OptionLabel, OptionDescription, OptionCheck, RulesContainer,
    RuleButton, RuleCheckbox, RuleText, RuleHint, InfoBox, CommentTextarea, CharCount,
    ForwardContainer, ForwardCheckbox, ForwardLabel, ActionRow,
    ThankYouContainer, ThankYouIcon, SuggestionList,
} from './ReportModalStyles';

interface ReportModalProps {
    account: Account;
    status?: Status;
    onClose: () => void;
}

type ReportStep = 'category' | 'rules' | 'statuses' | 'comment' | 'thanks';

interface CategoryOption {
    value: ReportCategory | 'dislike';
    label: string;
    description: string;
    icon: React.ReactNode;
}

export function ReportModal({ account, status, onClose }: ReportModalProps) {
    const t = useTranslations('report');
    const tCommon = useTranslations('common');
    const { locale } = useLocale();

    const [step, setStep] = useState<ReportStep>('category');
    const [category, setCategory] = useState<ReportCategory | 'dislike' | null>(null);
    const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
    const [comment, setComment] = useState('');
    const [forward, setForward] = useState(false);

    const { data: instance } = useInstance();
    const createReportMutation = useCreateReport();

    const categoryOptionsList = useMemo<CategoryOption[]>(() => [
        { value: 'dislike', label: t('step.category.dislike.label'), description: t('step.category.dislike.description'), icon: <X size={20} /> },
        { value: 'spam', label: t('step.category.spam.label'), description: t('step.category.spam.description'), icon: <Trash2 size={20} /> },
        { value: 'legal', label: t('step.category.legal.label'), description: t('step.category.legal.description'), icon: <Scale size={20} /> },
        { value: 'violation', label: t('step.category.violation.label'), description: t('step.category.violation.description'), icon: <AlertTriangle size={20} /> },
        { value: 'other', label: t('step.category.other.label'), description: t('step.category.other.description'), icon: <Flag size={20} /> },
    ], [t]);

    const rules = instance?.rules ?? [];
    const hasRules = rules.length > 0;
    const isRemote = account.acct.includes('@');
    const domain = isRemote ? account.acct.split('@')[1] : null;
    const statusIds = status ? [status.id] : [];

    const categoryOptions = hasRules ? categoryOptionsList : categoryOptionsList.filter((opt) => opt.value !== 'violation');

    const handleCategorySelect = useCallback((value: ReportCategory | 'dislike') => setCategory(value), []);

    const handleNextFromCategory = useCallback(() => {
        if (!category) return;
        if (category === 'dislike') setStep('thanks');
        else if (category === 'violation' && hasRules) setStep('rules');
        else setStep('statuses');
    }, [category, hasRules]);

    const handleRuleToggle = useCallback((ruleId: string) => {
        setSelectedRuleIds((prev) => prev.includes(ruleId) ? prev.filter((id) => id !== ruleId) : [...prev, ruleId]);
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!category || category === 'dislike') return;
        await createReportMutation.mutateAsync({
            account_id: account.id,
            status_ids: statusIds.length > 0 ? statusIds : undefined,
            comment: comment || undefined,
            forward: isRemote && forward,
            category: category,
            rule_ids: selectedRuleIds.length > 0 ? selectedRuleIds : undefined,
        });
        setStep('thanks');
    }, [category, account.id, statusIds, comment, isRemote, forward, selectedRuleIds, createReportMutation]);

    const renderCategoryStep = () => (
        <>
            <StepTitle>{t('step.category.title', { type: status ? t('step.category.post') : t('step.category.profile') })}</StepTitle>
            <StepDescription>{t('step.category.description')}</StepDescription>
            <OptionsContainer>
                {categoryOptions.map((option: CategoryOption) => (
                    <OptionButton key={option.value} $selected={category === option.value} onClick={() => handleCategorySelect(option.value)}>
                        <OptionIcon $selected={category === option.value}>{option.icon}</OptionIcon>
                        <OptionContent>
                            <OptionLabel>{option.label}</OptionLabel>
                            <OptionDescription>{option.description}</OptionDescription>
                        </OptionContent>
                        <OptionCheck $visible={category === option.value}><Check size={20} /></OptionCheck>
                    </OptionButton>
                ))}
            </OptionsContainer>
            <ActionRow>
                <Button onClick={handleNextFromCategory} disabled={!category}>
                    {tCommon('next')}
                    <ChevronRight size={16} style={{ marginLeft: 4 }} />
                </Button>
            </ActionRow>
        </>
    );

    const renderRulesStep = () => (
        <>
            <StepTitle>{t('step.rules.title')}</StepTitle>
            <StepDescription>{t('step.rules.description')}</StepDescription>
            <RulesContainer>
                {rules.map((rule: Rule) => {
                    const localized = rule.translations?.[locale];
                    const text = localized?.text || rule.text;
                    const hint = localized?.hint || rule.hint;

                    return (
                        <RuleButton key={rule.id} $selected={selectedRuleIds.includes(rule.id)} onClick={() => handleRuleToggle(rule.id)}>
                            <RuleCheckbox $selected={selectedRuleIds.includes(rule.id)}>{selectedRuleIds.includes(rule.id) && <Check size={14} />}</RuleCheckbox>
                            <div style={{ flex: 1 }}>
                                <RuleText>{text}</RuleText>
                                {hint && <RuleHint>{hint}</RuleHint>}
                            </div>
                        </RuleButton>
                    );
                })}
            </RulesContainer>
            <ActionRow>
                <Button variant="ghost" onClick={() => setStep('category')}>{tCommon('back')}</Button>
                <Button onClick={() => setStep('statuses')}>
                    {tCommon('next')}
                    <ChevronRight size={16} style={{ marginLeft: 4 }} />
                </Button>
            </ActionRow>
        </>
    );

    const renderStatusesStep = () => (
        <>
            <StepTitle>{t('step.statuses.title')}</StepTitle>
            <StepDescription>{t('step.statuses.description')}</StepDescription>
            <InfoBox><p>{status ? t('step.statuses.included') : t('step.statuses.optional')}</p></InfoBox>
            <ActionRow>
                <Button variant="ghost" onClick={() => setStep(category === 'violation' && hasRules ? 'rules' : 'category')}>{tCommon('back')}</Button>
                <Button onClick={() => setStep('comment')}>
                    {tCommon('next')}
                    <ChevronRight size={16} style={{ marginLeft: 4 }} />
                </Button>
            </ActionRow>
        </>
    );

    const renderCommentStep = () => (
        <>
            <StepTitle>{t('step.comment.title')}</StepTitle>
            <StepDescription>{t('step.comment.description')}</StepDescription>
            <CommentTextarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('step.comment.placeholder')}
                maxLength={1000}
                rows={4}
            />
            <CharCount>{comment.length} / 1000</CharCount>
            {isRemote && domain && (
                <ForwardContainer>
                    <ForwardCheckbox type="checkbox" id="forward" checked={forward} onChange={(e) => setForward(e.target.checked)} />
                    <ForwardLabel htmlFor="forward">
                        {t('step.comment.forward', { domain })}
                    </ForwardLabel>
                </ForwardContainer>
            )}
            <ActionRow>
                <Button variant="ghost" onClick={() => setStep('statuses')}>{tCommon('back')}</Button>
                <Button onClick={handleSubmit} disabled={createReportMutation.isPending}>
                    {createReportMutation.isPending ? t('step.comment.submitting') : t('step.comment.submit')}
                </Button>
            </ActionRow>
        </>
    );

    const renderThanksStep = () => (
        <>
            <ThankYouContainer>
                <ThankYouIcon><Check size={32} /></ThankYouIcon>
                <StepTitle>
                    {category === 'dislike' ? t('step.thanks.title.dislike') : t('step.thanks.title.other')}
                </StepTitle>
                <StepDescription>
                    {category === 'dislike' ? t('step.thanks.description.dislike') : t('step.thanks.description.other')}
                </StepDescription>
                {category === 'dislike' && (
                    <SuggestionList>
                        <li>{t('step.thanks.suggestions.unfollow')}</li>
                        <li>{t('step.thanks.suggestions.block')}</li>
                        <li>{t('step.thanks.suggestions.filter')}</li>
                    </SuggestionList>
                )}
            </ThankYouContainer>
            <ActionRow><Button onClick={onClose}>{tCommon('done')}</Button></ActionRow>
        </>
    );

    const stepRenderers = { category: renderCategoryStep, rules: renderRulesStep, statuses: renderStatusesStep, comment: renderCommentStep, thanks: renderThanksStep };

    return (
        <Container className="modal-medium">
            <Header>
                <HeaderInfo>
                    <Avatar src={account.avatar} alt={account.display_name || account.username} size="medium" />
                    <HeaderText><HeaderTitle>{t('title', { acct: account.acct })}</HeaderTitle></HeaderText>
                </HeaderInfo>
                <IconButton onClick={onClose} aria-label={tCommon('close')}><X size={20} /></IconButton>
            </Header>
            <Content>{stepRenderers[step]()}</Content>
        </Container>
    );
}
