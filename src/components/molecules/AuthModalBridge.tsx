'use client';

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { useAuthStore } from '@/hooks/useStores';
import { Button } from '../atoms/Button';

/**
 * Bridge component that watches authStore.showAuthModal
 * and displays the auth modal via GlobalModalProvider
 */
function AuthModalBridgeComponent() {
    const { openModal, closeModal } = useGlobalModal();
    const router = useRouter();
    const authStore = useAuthStore();

    // Read observable during render phase so MobX can track it
    const showAuthModal = authStore.showAuthModal;

    useEffect(() => {
        if (showAuthModal) {
            openModal(
                <div
                    className="dialog-content"
                    style={{ textAlign: 'center', maxWidth: '400px' }}
                >
                    <div
                        style={{
                            fontSize: 'var(--font-size-5)',
                            fontWeight: 'var(--font-weight-7)',
                            color: 'var(--text-1)',
                            marginBottom: 'var(--size-3)',
                        }}
                    >
                        Sign in required
                    </div>
                    <div
                        style={{
                            fontSize: 'var(--font-size-2)',
                            color: 'var(--text-2)',
                            marginBottom: 'var(--size-5)',
                        }}
                    >
                        You need to be signed in to perform this action.
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            gap: 'var(--size-3)',
                            justifyContent: 'center',
                        }}
                    >
                        <Button
                            variant="secondary"
                            onClick={() => {
                                authStore.closeAuthModal();
                                closeModal();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                authStore.closeAuthModal();
                                closeModal();
                                router.push('/auth/signin');
                            }}
                            autoFocus
                        >
                            Sign in
                        </Button>
                    </div>
                </div>
            );
        }
    }, [showAuthModal, openModal, closeModal, router, authStore]);

    return null;
}

export const AuthModalBridge = observer(AuthModalBridgeComponent);
