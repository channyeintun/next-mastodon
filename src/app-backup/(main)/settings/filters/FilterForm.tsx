'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { IconButton, Button, Card } from '@/components/atoms';
import { useCreateFilter, useUpdateFilter } from '@/api/mutations';
import { toast } from 'sonner';
import type { Filter, FilterContext, FilterAction, FilterKeywordParams } from '@/types/mastodon';
import {
    filterFormSchema,
    type FilterFormData,
    FILTER_CONTEXTS,
    FILTER_ACTIONS,
} from '@/schemas/filterFormSchema';
import {
    FiltersContainer,
    FiltersHeader,
    FiltersTitle,
    FormSection,
    FormLabel,
    FormInput,
    FormSelect,
    CheckboxGroup,
    CheckboxLabel,
    RadioGroup,
    RadioLabel,
    RadioContent,
    RadioTitle,
    RadioDescription,
    KeywordsSection,
    KeywordRow,
    KeywordInput,
    WholeWordCheckbox,
    FormButtons,
} from './FilterStyles';

const CONTEXT_LABELS: Record<FilterContext, string> = {
    home: 'Home and lists',
    notifications: 'Notifications',
    public: 'Public timelines',
    thread: 'Conversations',
    account: 'Profiles',
};

const ACTION_CONFIG: Record<FilterAction, { label: string; description: string }> = {
    warn: { label: 'Warn', description: 'Show a warning that can be clicked through' },
    blur: { label: 'Blur', description: 'Blur the content but still show it in the timeline' },
    hide: { label: 'Hide', description: 'Completely hide the content from view' },
};

const EXPIRATION_OPTIONS = [
    { value: '', label: 'Never expires' },
    { value: '1800', label: '30 minutes' },
    { value: '3600', label: '1 hour' },
    { value: '21600', label: '6 hours' },
    { value: '43200', label: '12 hours' },
    { value: '86400', label: '1 day' },
    { value: '604800', label: '1 week' },
];

interface FilterFormProps {
    filter?: Filter;
    isEdit?: boolean;
}

export function FilterForm({ filter, isEdit = false }: FilterFormProps) {
    const router = useRouter();
    const createFilter = useCreateFilter();
    const updateFilter = useUpdateFilter();

    // Track deleted keyword IDs for update
    const deletedKeywordIdsRef = useMemo(() => new Set<string>(), []);

    // Compute default values from filter (for edit) or defaults (for create)
    const defaultValues = useMemo((): FilterFormData => {
        if (filter) {
            return {
                title: filter.title,
                expiresIn: '',
                contexts: filter.context,
                filterAction: filter.filter_action,
                keywords: filter.keywords.map((k) => ({
                    id: k.id,
                    keyword: k.keyword,
                    whole_word: k.whole_word,
                })),
            };
        }
        return {
            title: '',
            expiresIn: '',
            contexts: ['home', 'notifications', 'public', 'thread', 'account'] as FilterContext[],
            filterAction: 'warn' as FilterAction,
            keywords: [{ keyword: '', whole_word: true }],
        };
    }, [filter]);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<FilterFormData>({
        resolver: zodResolver(filterFormSchema),
        defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'keywords',
    });

    const handleRemoveKeyword = (index: number) => {
        const keyword = fields[index];
        if (keyword.id) {
            deletedKeywordIdsRef.add(keyword.id);
        }
        remove(index);
    };

    const onSubmit = async (data: FilterFormData) => {
        try {
            const validKeywords = data.keywords.filter((k) => k.keyword.trim());

            if (isEdit && filter) {
                // Build keywords_attributes for update
                const keywordsAttributes: FilterKeywordParams[] = [];

                // Add updated/new keywords
                for (const k of validKeywords) {
                    if (k.id) {
                        keywordsAttributes.push({
                            id: k.id,
                            keyword: k.keyword,
                            whole_word: k.whole_word,
                        });
                    } else {
                        keywordsAttributes.push({
                            keyword: k.keyword,
                            whole_word: k.whole_word,
                        });
                    }
                }

                // Mark deleted keywords
                for (const id of deletedKeywordIdsRef) {
                    keywordsAttributes.push({
                        id,
                        keyword: '',
                        _destroy: true,
                    });
                }

                await updateFilter.mutateAsync({
                    id: filter.id,
                    params: {
                        title: data.title,
                        context: data.contexts,
                        filter_action: data.filterAction,
                        expires_in: data.expiresIn ? parseInt(data.expiresIn, 10) : undefined,
                        keywords_attributes: keywordsAttributes.length > 0 ? keywordsAttributes : undefined,
                    },
                });
                toast.success('Filter updated');
            } else {
                await createFilter.mutateAsync({
                    title: data.title,
                    context: data.contexts,
                    filter_action: data.filterAction,
                    expires_in: data.expiresIn ? parseInt(data.expiresIn, 10) : undefined,
                    keywords_attributes: validKeywords.map((k) => ({
                        keyword: k.keyword,
                        whole_word: k.whole_word,
                    })),
                });
                toast.success('Filter created');
            }
            router.push('/settings/filters');
        } catch {
            toast.error(isEdit ? 'Failed to update filter' : 'Failed to create filter');
        }
    };

    return (
        <FiltersContainer>
            <FiltersHeader>
                <IconButton onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </IconButton>
                <FiltersTitle>{isEdit ? 'Edit filter' : 'New filter'}</FiltersTitle>
            </FiltersHeader>

            <Card padding="medium">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FormSection>
                        <FormLabel htmlFor="title">Title</FormLabel>
                        <FormInput
                            id="title"
                            type="text"
                            {...register('title')}
                            placeholder="e.g., Spoilers"
                        />
                        {errors.title && (
                            <span style={{ color: 'var(--red-7)', fontSize: 'var(--font-size-0)' }}>
                                {errors.title.message}
                            </span>
                        )}
                    </FormSection>

                    <FormSection>
                        <FormLabel htmlFor="expiresIn">Expiration</FormLabel>
                        <FormSelect id="expiresIn" {...register('expiresIn')}>
                            {EXPIRATION_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </FormSelect>
                    </FormSection>

                    <FormSection>
                        <FormLabel>Filter contexts</FormLabel>
                        <Controller
                            name="contexts"
                            control={control}
                            render={({ field }) => (
                                <CheckboxGroup>
                                    {FILTER_CONTEXTS.map((ctx) => (
                                        <CheckboxLabel key={ctx}>
                                            <input
                                                type="checkbox"
                                                checked={field.value.includes(ctx)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        field.onChange([...field.value, ctx]);
                                                    } else {
                                                        field.onChange(field.value.filter((c) => c !== ctx));
                                                    }
                                                }}
                                            />
                                            {CONTEXT_LABELS[ctx]}
                                        </CheckboxLabel>
                                    ))}
                                </CheckboxGroup>
                            )}
                        />
                        {errors.contexts && (
                            <span style={{ color: 'var(--red-7)', fontSize: 'var(--font-size-0)' }}>
                                {errors.contexts.message}
                            </span>
                        )}
                    </FormSection>

                    <FormSection>
                        <FormLabel>Filter action</FormLabel>
                        <Controller
                            name="filterAction"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup>
                                    {FILTER_ACTIONS.map((action) => (
                                        <RadioLabel key={action}>
                                            <input
                                                type="radio"
                                                name="filterAction"
                                                value={action}
                                                checked={field.value === action}
                                                onChange={() => field.onChange(action)}
                                            />
                                            <RadioContent>
                                                <RadioTitle>{ACTION_CONFIG[action].label}</RadioTitle>
                                                <RadioDescription>{ACTION_CONFIG[action].description}</RadioDescription>
                                            </RadioContent>
                                        </RadioLabel>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                    </FormSection>

                    <FormSection>
                        <FormLabel>Keywords</FormLabel>
                        <KeywordsSection>
                            {fields.map((field, index) => (
                                <KeywordRow key={field.id}>
                                    <KeywordInput
                                        type="text"
                                        {...register(`keywords.${index}.keyword`)}
                                        placeholder="Enter keyword or phrase"
                                    />
                                    <Controller
                                        name={`keywords.${index}.whole_word`}
                                        control={control}
                                        render={({ field: wholeWordField }) => (
                                            <WholeWordCheckbox>
                                                <input
                                                    type="checkbox"
                                                    checked={wholeWordField.value}
                                                    onChange={(e) => wholeWordField.onChange(e.target.checked)}
                                                />
                                                Whole word
                                            </WholeWordCheckbox>
                                        )}
                                    />
                                    <IconButton
                                        type="button"
                                        onClick={() => handleRemoveKeyword(index)}
                                        disabled={fields.length === 1}
                                    >
                                        <X size={16} />
                                    </IconButton>
                                </KeywordRow>
                            ))}
                            <Button
                                type="button"
                                variant="secondary"
                                size="small"
                                onClick={() => append({ keyword: '', whole_word: true })}
                            >
                                <Plus size={16} />
                                Add keyword
                            </Button>
                        </KeywordsSection>
                    </FormSection>

                    <FormButtons>
                        <Button type="button" variant="secondary" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create filter'}
                        </Button>
                    </FormButtons>
                </form>
            </Card>
        </FiltersContainer>
    );
}
