'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useStatus, useStatusContext } from '@/api/queries';
import { PostCard } from '@/components/molecules/PostCard';
import { PostCardSkeleton } from '@/components/molecules/PostCardSkeleton';
import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';

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

  const isLoading = statusLoading || contextLoading;
  const isError = statusError || contextError;

  if (isLoading) {
    return (
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
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
          <Link href="/">
            <IconButton>
              <ArrowLeft size={20} />
            </IconButton>
          </Link>
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
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
      <div className="container" style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
        <h2 style={{ color: 'var(--red-6)', marginBottom: 'var(--size-3)' }}>
          Error Loading Post
        </h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 'var(--size-4)' }}>
          {statusErrorData instanceof Error
            ? statusErrorData.message
            : 'This post could not be found or loaded.'}
        </p>
        <Link href="/">
          <Button>Back to Timeline</Button>
        </Link>
      </div>
    );
  }

  const ancestors = context?.ancestors ?? [];
  const descendants = context?.descendants ?? [];

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
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
        <Link href="/">
          <IconButton>
            <ArrowLeft size={20} />
          </IconButton>
        </Link>
        <h1 style={{ fontSize: 'var(--font-size-4)' }}>
          Post
        </h1>
      </div>

      {/* Thread container */}
      <div>
        {/* Ancestors (parent posts) */}
        {ancestors.length > 0 && (
          <div>
            {ancestors.map((ancestor, index) => (
              <div key={ancestor.id}>
                <PostCard status={ancestor} style={{ marginBottom: 'var(--size-3)' }} />
                {/* Thread line connector */}
                {index < ancestors.length - 1 || index === ancestors.length - 1 ? (
                  <div style={{
                    width: '2px',
                    height: 'var(--size-4)',
                    background: 'var(--surface-4)',
                    marginLeft: 'var(--size-8)',
                    marginBottom: 'var(--size-3)',
                  }} />
                ) : null}
              </div>
            ))}
            {/* Connector to main status */}
            <div style={{
              width: '2px',
              height: 'var(--size-4)',
              background: 'var(--surface-4)',
              marginLeft: 'var(--size-8)',
              marginBottom: 'var(--size-3)',
            }} />
          </div>
        )}

        {/* Main status (highlighted) */}
        <div style={{
          border: '2px solid var(--blue-6)',
          borderRadius: 'var(--radius-3)',
          overflow: 'hidden',
          marginBottom: 'var(--size-4)',
        }}>
          <PostCard status={status} />
        </div>

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
                    width: '2px',
                    height: 'var(--size-3)',
                    background: 'var(--surface-4)',
                    marginLeft: 'var(--size-8)',
                    marginBottom: 'var(--size-3)',
                  }} />
                )}
                <PostCard status={descendant} style={{ marginBottom: 'var(--size-3)' }} />
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
