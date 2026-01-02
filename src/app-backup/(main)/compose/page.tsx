'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AuthGuard from '@/components/organisms/AuthGuard';
import { useSearchParams } from 'next/navigation';
import { ComposerPanel } from '@/components/organisms/ComposerPanel';
import { IconButton } from '@/components/atoms/IconButton';
import type { Visibility } from '@/components/molecules/VisibilitySettingsModal';

export default function ComposePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotedStatusId = searchParams.get('quoted_status_id') || undefined;
  const scheduledStatusId = searchParams.get('scheduled_status_id') || undefined;
  const visibility = (searchParams.get('visibility') as Visibility) || undefined;
  const mention = searchParams.get('mention') || undefined;
  const text = searchParams.get('text') || undefined;

  // Create initial content with mention or text if provided
  const initialContent = mention
    ? `<p><span class="mention" data-type="mention" data-id="${mention}" data-label="@${mention}">@${mention}</span> </p>`
    : text
    ? `<p>${text.split('\n').join('</p><p>')}</p>`
    : undefined;

  // Create a unique key that changes when params change to force remount
  const composerKey = [quotedStatusId, scheduledStatusId, visibility, mention, text].filter(Boolean).join('-') || 'default';

  return (
    <AuthGuard>
      <div className="compose-page-container">
        <div className="compose-card">
          {/* Detailed header inside ComposerPanel or here?
              Common mobile pattern is to have a simple 'Compose' or just the close button.
              Let's keep the back button here but make it cleaner.
           */}
          <div className="compose-header">
            <IconButton onClick={() => router.back()}>
              <ArrowLeft size={24} />
            </IconButton>
            <h1 style={{ fontSize: 'var(--font-size-4)', fontWeight: 'var(--font-weight-7)' }}>
              {visibility === 'direct' ? 'New message' : 'New post'}
            </h1>
          </div>

          {/* Composer - key forces remount when params change */}
          <ComposerPanel
            key={composerKey}
            quotedStatusId={quotedStatusId}
            scheduledStatusId={scheduledStatusId}
            initialVisibility={visibility}
            initialContent={initialContent}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
