'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import AuthGuard from '@/components/organisms/AuthGuard';
import { useSearchParams } from 'next/navigation';
import { ComposerPanel } from '@/components/organisms/ComposerPanel';
import { IconButton } from '@/components/atoms/IconButton';
import { useStatus, useStatusSource } from '@/api';
import type { Visibility } from '@/components/molecules/VisibilitySettingsModal';

/**
 * Full-page compose view.
 * Supports edit mode via ?edit_status_id=xxx query param.
 */
export default function ComposePage() {
  const router = useRouter();
  const t = useTranslations('composer');
  const searchParams = useSearchParams();
  const quotedStatusId = searchParams.get('quoted_status_id') || undefined;
  const scheduledStatusId = searchParams.get('scheduled_status_id') || undefined;
  const visibility = (searchParams.get('visibility') as Visibility) || undefined;
  const mention = searchParams.get('mention') || undefined;
  const text = searchParams.get('text') || undefined;
  const editStatusId = searchParams.get('edit_status_id') || undefined;

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

  // Create a unique key that changes when params change to force remount
  const composerKey = [quotedStatusId, scheduledStatusId, visibility, mention, text, editStatusId].filter(Boolean).join('-') || 'default';

  // Determine title
  const getTitle = () => {
    if (isEditMode) return t('editPost');
    if (visibility === 'direct') return t('newMessage');
    return t('newPost');
  };

  return (
    <AuthGuard>
      <div className="compose-page-container">
        <div className="compose-card">
          <div className="compose-header">
            <IconButton onClick={() => router.back()}>
              <ArrowLeft size={24} />
            </IconButton>
            <h1 style={{ fontSize: 'var(--font-size-4)', fontWeight: 'var(--font-weight-7)' }}>
              {getTitle()}
            </h1>
          </div>

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
              initialMedia={isEditMode ? editStatus?.media_attachments : undefined}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

