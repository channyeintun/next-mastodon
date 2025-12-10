'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useStatus, useStatusContext } from '@/api';
import { useAuthStore } from '@/hooks/useStores';
import { PostCard, PostCardSkeleton } from '@/components/molecules';
import { Button, IconButton } from '@/components/atoms';
import { ComposerPanel } from '@/components/organisms/ComposerPanel';

export default function StatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    data: status,
    isLoading: statusLoading,
    isError: statusError,
    error: statusErrorData,
  } = useStatus(id);

  const {
    data: context,
    isLoading: contextLoading,
    isError: contextError,
  } = useStatusContext(id);

  const authStore = useAuthStore();
  const router = useRouter();

  const isLoading = statusLoading || contextLoading;
  const isError = statusError || contextError;

  if (isLoading) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'var(--surface-1)',
          zIndex: 10,
          padding: 'var(--size-4) 0',
          marginBottom: 'var(--size-4)',
          borderBottom: '1px solid var(--surface-3)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-3)',
        }}>
          <IconButton onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </IconButton>
          <h1 style={{ fontSize: 'var(--font-size-4)' }}>
            Post
          </h1>
        </div>

        {/* Skeleton loading */}
        <div>
          {/* Main post skeleton with highlight border */}
          <div style={{
            border: '2px solid var(--blue-6)',
            borderRadius: 'var(--radius-3)',
            overflow: 'hidden',
            marginBottom: 'var(--size-4)',
          }}>
            <PostCardSkeleton />
          </div>

          {/* Replies section skeleton */}
          <h2 style={{
            fontSize: 'var(--font-size-2)',
            fontWeight: 'var(--font-weight-6)',
            marginBottom: 'var(--size-4)',
            color: 'var(--text-2)',
          }}>
            <div
              style={{
                width: '120px',
                height: '20px',
                background: 'var(--surface-3)',
                borderRadius: 'var(--radius-1)',
                animation: 'var(--animation-blink)',
              }}
            />
          </h2>
          <PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />
          <PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />
        </div>
      </div>
    );
  }

  if (isError || !status) {
    return (
      <div style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
        <h2 style={{ color: 'var(--red-6)', marginBottom: 'var(--size-3)' }}>
          Error Loading Post
        </h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 'var(--size-4)' }}>
          {statusErrorData instanceof Error
            ? statusErrorData.message
            : 'This post could not be found or loaded.'}
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const ancestors = context?.ancestors ?? [];
  const descendants = context?.descendants ?? [];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'var(--surface-1)',
        zIndex: 10,
        padding: 'var(--size-4) 0',
        marginBottom: 'var(--size-4)',
        borderBottom: '1px solid var(--surface-3)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-3)',
      }}>
        <IconButton onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </IconButton>
        <h1 style={{ fontSize: 'var(--font-size-4)' }}>
          Post
        </h1>
      </div>

      {/* Thread container */}
      <div>
        {/* Ancestors (parent posts) */}
        {ancestors.length > 0 && (
          <div>
            {ancestors.map((ancestor) => (
              <div key={ancestor.id}>
                <PostCard status={ancestor} />
                {/* Thread line connector */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  paddingLeft: 'var(--size-5)',
                }}>
                  <div style={{
                    width: '2px',
                    height: '32px',
                    background: 'var(--surface-4)',
                    marginLeft: '18px', // Center align with avatar
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main status (highlighted) */}
        <div style={{
          border: '2px solid var(--blue-6)',
          borderRadius: 'var(--radius-3)',
          marginBottom: 'var(--size-3)', // Reduced margin here as reply box follows
        }}>
          <PostCard status={status} showEditHistory={true} />
        </div>

        {/* Reply Composer - Comment Box Style */}
        {authStore.isAuthenticated && (
          <div style={{
            marginBottom: 'var(--size-4)',
            border: '1px solid var(--surface-3)',
            borderRadius: 'var(--radius-3)',
            background: 'var(--surface-2)', // Slightly different bg for contrast
            padding: 'var(--size-3)',
          }}>
            <ComposerPanel
              key={`reply-${status.id}`}
              initialVisibility={status.visibility}
              initialContent={`<span data-type="mention" class="mention" data-id="${status.account.acct}" data-label="${status.account.acct}">@${status.account.acct}</span> `}
              inReplyToId={status.id}
              isReply={true}
            />
          </div>
        )}

        {/* Descendants (replies) */}
        {descendants.length > 0 && (
          <div>
            <h2 style={{
              fontSize: 'var(--font-size-2)',
              fontWeight: 'var(--font-weight-6)',
              marginBottom: 'var(--size-4)',
              color: 'var(--text-2)',
            }}>
              Replies ({descendants.length})
            </h2>
            {descendants.map((descendant, index) => (
              <div key={descendant.id}>
                {/* Thread line connector */}
                {index > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    paddingLeft: 'var(--size-5)',
                  }}>
                    <div style={{
                      width: '2px',
                      height: '24px',
                      background: 'var(--surface-4)',
                      marginLeft: '18px',
                    }} />
                  </div>
                )}
                <PostCard status={descendant} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state for no replies */}
        {descendants.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--size-8) var(--size-4)',
            color: 'var(--text-2)',
            display: 'grid',
            justifyContent: 'center',
          }}>
            <p>No replies yet.</p>
            <p style={{ fontSize: 'var(--font-size-0)', marginTop: 'var(--size-2)' }}>
              Be the first to reply!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
