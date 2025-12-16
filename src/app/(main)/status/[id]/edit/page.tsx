'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useStatus, useStatusSource } from '@/api';
import { ComposerPanel } from '@/components/organisms/ComposerPanel';
import { IconButton } from '@/components/atoms/IconButton';

export default function EditStatusPage() {
  const params = useParams();
  const router = useRouter();
  const statusId = params.id as string;

  const { data: status, isLoading: isLoadingStatus, error: statusError } = useStatus(statusId);
  const { data: source, isLoading: isLoadingSource, error: sourceError } = useStatusSource(statusId);

  const isLoading = isLoadingStatus || isLoadingSource;
  const error = statusError || sourceError;

  if (isLoading) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: 'var(--size-4)',
      }}>
        <div style={{
          padding: 'var(--size-6)',
          textAlign: 'center',
          color: 'var(--text-2)',
        }}>
          Loading post...
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: 'var(--size-4)',
      }}>
        <div style={{
          padding: 'var(--size-6)',
          textAlign: 'center',
          color: 'var(--red-6)',
        }}>
          Failed to load post. Please try again.
        </div>
      </div>
    );
  }

  // Use source text if available (converted to HTML-ish for Tiptap), otherwise fallback to status content
  // Note: Tiptap handles <br> for newlines. Source text has \n.
  const initialContent = source?.text
    ? source.text.replace(/\n/g, '<br>')
    : status.content;

  return (
    <div className="compose-page-container">
      <div className="compose-card">
        {/* Header */}
        <div className="compose-header">
          <IconButton onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </IconButton>
          <h1 style={{
            fontSize: 'var(--font-size-4)',
            fontWeight: 'var(--font-weight-7)',
          }}>
            Edit post
          </h1>
        </div>

        {/* Composer with initial content */}
        <ComposerPanel
          editMode
          statusId={status.id}
          initialContent={initialContent}
          initialSpoilerText={source?.spoiler_text || status.spoiler_text}
          initialVisibility={status.visibility}
          initialSensitive={status.sensitive}
          initialMedia={status.media_attachments}
        />
      </div>
    </div>
  );
}
