'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AuthGuard from '@/components/organisms/AuthGuard';
import { ComposerPanel } from '@/components/organisms/ComposerPanel';
import { IconButton } from '@/components/atoms/IconButton';

export default function ComposePage() {
  return (
    <AuthGuard>
      <div className="compose-page-container">
        <div className="compose-card">
          {/* Detailed header inside ComposerPanel or here? 
              Common mobile pattern is to have a simple 'Compose' or just the close button.
              Let's keep the back button here but make it cleaner.
           */}
          <div className="compose-header">
            <Link href="/">
              <IconButton>
                <ArrowLeft size={24} />
              </IconButton>
            </Link>
            <h1 style={{ fontSize: 'var(--font-size-4)', fontWeight: 'var(--font-weight-7)' }}>
              New Post
            </h1>
          </div>

          {/* Composer */}
          <ComposerPanel />
        </div>
      </div>
    </AuthGuard>
  );
}
