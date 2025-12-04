'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AuthGuard from '@/components/organisms/AuthGuard';
import { ComposerPanel } from '@/components/organisms/ComposerPanel';
import { IconButton } from '@/components/atoms/IconButton';

export default function ComposePage() {
  return (
    <AuthGuard>
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
            Compose Post
          </h1>
        </div>

        {/* Composer */}
        <ComposerPanel />
      </div>
    </AuthGuard>
  );
}
