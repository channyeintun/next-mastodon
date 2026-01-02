import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';
import AuthGuard from '@/components/organisms/AuthGuard';
import { ComposerPanel } from '@/components/organisms/ComposerPanel';
import { IconButton } from '@/components/atoms/IconButton';
import { MainLayout } from '@/components/layouts/MainLayout';
import type { Visibility } from '@/components/molecules/VisibilitySettingsModal';

export default function ComposePage() {
    const router = useRouter();
    const {
        quoted_status_id: quotedStatusId,
        scheduled_status_id: scheduledStatusId,
        visibility,
        mention,
        text
    } = router.query;

    const getParam = (val: string | string[] | undefined): string | undefined =>
        typeof val === 'string' ? val : undefined;

    const quotedId = getParam(quotedStatusId);
    const scheduledId = getParam(scheduledStatusId);
    const visibilityParam = getParam(visibility) as Visibility | undefined;
    const mentionParam = getParam(mention);
    const textParam = getParam(text);

    // Create initial content with mention or text if provided
    const initialContent = mentionParam
        ? `<p><span class="mention" data-type="mention" data-id="${mentionParam}" data-label="@${mentionParam}">@${mentionParam}</span> </p>`
        : textParam
            ? `<p>${textParam.split('\n').join('</p><p>')}</p>`
            : undefined;

    // Create a unique key that changes when params change to force remount
    const composerKey = [quotedId, scheduledId, visibilityParam, mentionParam, textParam].filter(Boolean).join('-') || 'default';

    return (
        <MainLayout>
            <Head>
                <title>{visibilityParam === 'direct' ? 'New Message' : 'New Post'} - Mastodon</title>
                <meta name="description" content="Compose a new post" />
            </Head>
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
                                {visibilityParam === 'direct' ? 'New message' : 'New post'}
                            </h1>
                        </div>

                        {/* Composer - key forces remount when params change */}
                        <ComposerPanel
                            key={composerKey}
                            quotedStatusId={quotedId}
                            scheduledStatusId={scheduledId}
                            initialVisibility={visibilityParam}
                            initialContent={initialContent}
                        />
                    </div>
                </div>
            </AuthGuard>
        </MainLayout>
    );
}
