'use client';

import { Activity, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { authEvents } from '@/lib/authEvents';

export function AuthModal() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = authEvents.subscribe(() => {
            setIsOpen(true);
        });

        return unsubscribe;
    }, []);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleSignIn = () => {
        setIsOpen(false);
        router.push('/auth/signin');
    };

    return (
        <Activity mode={isOpen ? 'visible' : 'hidden'}>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 999,
                }}
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                    width: '90%',
                    maxWidth: '400px',
                }}
            >
                <Card padding="large">
                    <div style={{ textAlign: 'center' }}>
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
                            <Button variant="secondary" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleSignIn}>
                                Sign in
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </Activity>
    );
}
