'use client';

import { useState, useCallback } from 'react';
import { X, Check, AlertTriangle, Trash2, Scale, ChevronRight, Flag } from 'lucide-react';
import { useCreateReport, useInstance } from '@/api';
import { Button, IconButton, Avatar } from '@/components/atoms';
import type { Account, Status, ReportCategory, Rule } from '@/types/mastodon';
import {
    Container, Header, HeaderInfo, HeaderText, HeaderTitle, Content,
    StepTitle, StepDescription, OptionsContainer, OptionButton, OptionIcon,
    OptionContent, OptionLabel, OptionDescription, OptionCheck, RulesContainer,
    RuleButton, RuleCheckbox, RuleText, InfoBox, CommentTextarea, CharCount,
    ForwardContainer, ForwardCheckbox, ForwardLabel, ActionRow,
    ThankYouContainer, ThankYouIcon, SuggestionList,
} from './ReportModalStyles';

interface ReportModalProps {
    account: Account;
    status?: Status;
    onClose: () => void;
}

type ReportStep = 'category' | 'rules' | 'statuses' | 'comment' | 'thanks';

const CATEGORY_OPTIONS: Array<{
    value: ReportCategory | 'dislike';
    label: string;
    description: string;
    icon: React.ReactNode;
}> = [
        { value: 'dislike', label: "I don't like it", description: 'It is not something you want to see', icon: <X size={20} /> },
        { value: 'spam', label: "It's spam", description: 'Malicious links, fake engagement, or repetitive replies', icon: <Trash2 size={20} /> },
        { value: 'legal', label: "It's illegal", description: "You believe it violates the law of your or the server's country", icon: <Scale size={20} /> },
        { value: 'violation', label: 'It violates server rules', description: 'You are aware that it breaks specific rules', icon: <AlertTriangle size={20} /> },
        { value: 'other', label: "It's something else", description: 'The issue does not fit into other categories', icon: <Flag size={20} /> },
    ];

export function ReportModal({ account, status, onClose }: ReportModalProps) {
    const [step, setStep] = useState<ReportStep>('category');
    const [category, setCategory] = useState<ReportCategory | 'dislike' | null>(null);
    const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
    const [comment, setComment] = useState('');
    const [forward, setForward] = useState(false);

    const { data: instance } = useInstance();
    const createReportMutation = useCreateReport();

    const rules = instance?.rules ?? [];
    const hasRules = rules.length > 0;
    const isRemote = account.acct.includes('@');
    const domain = isRemote ? account.acct.split('@')[1] : null;
    const statusIds = status ? [status.id] : [];

    const categoryOptions = hasRules ? CATEGORY_OPTIONS : CATEGORY_OPTIONS.filter((opt) => opt.value !== 'violation');

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
            <StepTitle>Tell us what's going on with this {status ? 'post' : 'profile'}</StepTitle>
            <StepDescription>Choose the best match</StepDescription>
            <OptionsContainer>
                {categoryOptions.map((option) => (
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
                <Button onClick={handleNextFromCategory} disabled={!category}>Next<ChevronRight size={16} style={{ marginLeft: 4 }} /></Button>
            </ActionRow>
        </>
    );

    const renderRulesStep = () => (
        <>
            <StepTitle>Which rules are being violated?</StepTitle>
            <StepDescription>Select all that apply</StepDescription>
            <RulesContainer>
                {rules.map((rule: Rule) => (
                    <RuleButton key={rule.id} $selected={selectedRuleIds.includes(rule.id)} onClick={() => handleRuleToggle(rule.id)}>
                        <RuleCheckbox $selected={selectedRuleIds.includes(rule.id)}>{selectedRuleIds.includes(rule.id) && <Check size={14} />}</RuleCheckbox>
                        <RuleText>{rule.text}</RuleText>
                    </RuleButton>
                ))}
            </RulesContainer>
            <ActionRow>
                <Button variant="ghost" onClick={() => setStep('category')}>Back</Button>
                <Button onClick={() => setStep('statuses')}>Next<ChevronRight size={16} style={{ marginLeft: 4 }} /></Button>
            </ActionRow>
        </>
    );

    const renderStatusesStep = () => (
        <>
            <StepTitle>Is there anything else you want to add?</StepTitle>
            <StepDescription>You can include more posts from this account if you'd like</StepDescription>
            <InfoBox><p>{status ? 'The post you selected has been included in your report.' : 'You can select specific posts to include in your report if relevant.'}</p></InfoBox>
            <ActionRow>
                <Button variant="ghost" onClick={() => setStep(category === 'violation' && hasRules ? 'rules' : 'category')}>Back</Button>
                <Button onClick={() => setStep('comment')}>Next<ChevronRight size={16} style={{ marginLeft: 4 }} /></Button>
            </ActionRow>
        </>
    );

    const renderCommentStep = () => (
        <>
            <StepTitle>Anything else we should know?</StepTitle>
            <StepDescription>Add any additional comments that might help us understand the situation</StepDescription>
            <CommentTextarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add any additional comments here..." maxLength={1000} rows={4} />
            <CharCount>{comment.length} / 1000</CharCount>
            {isRemote && domain && (
                <ForwardContainer>
                    <ForwardCheckbox type="checkbox" id="forward" checked={forward} onChange={(e) => setForward(e.target.checked)} />
                    <ForwardLabel htmlFor="forward">Forward to <strong>{domain}</strong></ForwardLabel>
                </ForwardContainer>
            )}
            <ActionRow>
                <Button variant="ghost" onClick={() => setStep('statuses')}>Back</Button>
                <Button onClick={handleSubmit} disabled={createReportMutation.isPending}>{createReportMutation.isPending ? 'Submitting...' : 'Submit Report'}</Button>
            </ActionRow>
        </>
    );

    const renderThanksStep = () => (
        <>
            <ThankYouContainer>
                <ThankYouIcon><Check size={32} /></ThankYouIcon>
                <StepTitle>{category === 'dislike' ? 'Noted' : 'Thanks for reporting'}</StepTitle>
                <StepDescription>
                    {category === 'dislike' ? "While we won't take action on this specific report, you have options to reduce what you see from this account." : "Your report has been submitted. We'll look into this and take appropriate action if needed."}
                </StepDescription>
                {category === 'dislike' && <SuggestionList><li>Unfollow or mute the account</li><li>Block the account to hide their content</li><li>Filter specific keywords or phrases</li></SuggestionList>}
            </ThankYouContainer>
            <ActionRow><Button onClick={onClose}>Done</Button></ActionRow>
        </>
    );

    const stepRenderers = { category: renderCategoryStep, rules: renderRulesStep, statuses: renderStatusesStep, comment: renderCommentStep, thanks: renderThanksStep };

    return (
        <Container>
            <Header>
                <HeaderInfo>
                    <Avatar src={account.avatar} alt={account.display_name || account.username} size="medium" />
                    <HeaderText><HeaderTitle>Report @{account.acct}</HeaderTitle></HeaderText>
                </HeaderInfo>
                <IconButton onClick={onClose} aria-label="Close"><X size={20} /></IconButton>
            </Header>
            <Content>{stepRenderers[step]()}</Content>
        </Container>
    );
}
