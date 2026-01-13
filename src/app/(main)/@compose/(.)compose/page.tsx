'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AuthGuard from '@/components/organisms/AuthGuard';
import { ComposerPanel } from '@/components/organisms/ComposerPanel';
import { ComposeModal } from '@/components/molecules/ComposeModal';
import { useStatus, useStatusSource } from '@/api';
import type { Visibility } from '@/components/molecules/VisibilitySettingsModal';

/**
 * Intercepting route for /compose.
 * When navigating to /compose via client-side navigation,
 * this page renders the compose content inside a modal overlay.
 * 
 * For direct URL visits or page refreshes, the regular /compose/page.tsx is used instead.
 * 
 * Supports edit mode via ?edit_status_id=xxx query param.
 */
export default function ComposeInterceptPage() {
    const searchParams = useSearchParams();
    const t = useTranslations('composer');
    const quotedStatusId = searchParams.get('quoted_status_id') || undefined;
    const scheduledStatusId = searchParams.get('scheduled_status_id') || undefined;
    const visibility = (searchParams.get('visibility') as Visibility) || undefined;
    const mention = searchParams.get('mention') || undefined;
    const text = searchParams.get('text') || undefined;
    const editStatusId = searchParams.get('edit_status_id') || undefined;
    const mediaIds = searchParams.get('media_ids')?.split(',') || [];

    // Fetch status and source when editing
    const { data: editStatus, isLoading: isLoadingStatus, error: statusError } = useStatus(editStatusId || '');
    const { data: editSource, isLoading: isLoadingSource, error: sourceError } = useStatusSource(editStatusId || '');

    const isEditMode = !!editStatusId;
    const isLoading = isEditMode && (isLoadingStatus || isLoadingSource);
    const error = isEditMode && (statusError || sourceError);

    // Create initial content with mention or text if provided (for new posts)
    const initialContent = isEditMode
        ? (editSource?.text
            ? editSource.text.replace(/\n/g, '<br>')
            : editStatus?.content || '')
        : mention
            ? `<p><span class="mention" data-type="mention" data-id="${mention}" data-label="@${mention}">@${mention}</span> </p>`
            : text
                ? `<p>${text.split('\n').join('</p><p>')}</p>`
                : undefined;

    // Create initial media objects from IDs if provided
    const initialMedia = isEditMode
        ? editStatus?.media_attachments
        : mediaIds.length > 0
            ? mediaIds.map(id => ({ id, type: 'image', url: '', preview_url: '' }))
            : undefined;

    // Create a unique key that changes when params change to force remount
    const composerKey = [quotedStatusId, scheduledStatusId, visibility, mention, text, editStatusId, ...mediaIds].filter(Boolean).join('-') || 'default';

    // Determine title
    const getTitle = () => {
        if (isEditMode) return t('editPost');
        if (visibility === 'direct') return t('newMessage');
        return t('newPost');
    };

    return (
        <AuthGuard>
            <ComposeModal>
                <h1 style={{
                    fontSize: 'var(--font-size-4)',
                    fontWeight: 'var(--font-weight-7)',
                    marginBottom: 'var(--size-3)'
                }}>
                    {getTitle()}
                </h1>
                {isLoading ? (
                    <div style={{
                        padding: 'var(--size-6)',
                        textAlign: 'center',
                        color: 'var(--text-2)',
                    }}>
                        Loading post...
                    </div>
                ) : error ? (
                    <div style={{
                        padding: 'var(--size-6)',
                        textAlign: 'center',
                        color: 'var(--red-6)',
                    }}>
                        Failed to load post. Please try again.
                    </div>
                ) : (
                    <ComposerPanel
                        key={composerKey}
                        editMode={isEditMode}
                        statusId={editStatus?.id}
                        quotedStatusId={quotedStatusId}
                        scheduledStatusId={scheduledStatusId}
                        initialVisibility={isEditMode ? editStatus?.visibility : visibility}
                        initialContent={initialContent}
                        initialSpoilerText={isEditMode ? (editSource?.spoiler_text || editStatus?.spoiler_text) : undefined}
                        initialSensitive={isEditMode ? editStatus?.sensitive : undefined}
                        initialMedia={initialMedia}
                    />
                )}
            </ComposeModal>
        </AuthGuard>
    );
}

