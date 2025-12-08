'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../atoms/Button';
import { authEvents } from '@/lib/authEvents';

export function AuthModal() {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = authEvents.subscribe(() => {
            dialogRef.current?.showModal();
        });

        return unsubscribe;
    }, []);

    const handleClose = () => {
        dialogRef.current?.close();
    };

    const handleSignIn = () => {
        dialogRef.current?.close();
        router.push('/auth/signin');
    };

    return (
        <dialog
            ref={dialogRef}
            onClick={(e) => {
                // Close on backdrop click
                if (e.target === dialogRef.current) {
                    handleClose();
                }
            }}
            style={{ maxWidth: '400px' }}
        >
            <div
                className="dialog-content"
                style={{ textAlign: 'center' }}
                onClick={(e) => e.stopPropagation()}
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
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSignIn} autoFocus>
                        Sign in
                    </Button>
                </div>
            </div>
        </dialog>
    );
}
