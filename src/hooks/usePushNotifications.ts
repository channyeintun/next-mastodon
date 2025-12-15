'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePushSubscription, useCreatePushSubscription, useUpdatePushSubscription, useDeletePushSubscription, useInstance } from '@/api';
import type { PushAlerts, PushPolicy } from '@/types';
import { useAuthStore } from './useStores';

/**
 * Convert a base64 string to a Uint8Array for use with PushManager
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export type PushPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export interface UsePushNotificationsResult {
    /** Whether push notifications are supported in this browser */
    isSupported: boolean;
    /** Current permission state */
    permissionState: PushPermissionState;
    /** Whether the user has an active push subscription on the server */
    isSubscribed: boolean;
    /** Current subscription alerts configuration */
    alerts: PushAlerts | null;
    /** Loading states */
    isLoading: boolean;
    isSubscribing: boolean;
    isUpdating: boolean;
    isUnsubscribing: boolean;
    /** Error state */
    error: Error | null;
    /** Subscribe to push notifications */
    subscribe: (alerts?: Partial<PushAlerts>, policy?: PushPolicy) => Promise<void>;
    /** Unsubscribe from push notifications */
    unsubscribe: () => Promise<void>;
    /** Update alert preferences */
    updateAlerts: (alerts: Partial<PushAlerts>, policy?: PushPolicy) => Promise<void>;
}

/**
 * Hook to manage push notification subscriptions with Mastodon
 * Handles browser permission, service worker, and Mastodon API integration
 */
export function usePushNotifications(): UsePushNotificationsResult {
    const authStore = useAuthStore();
    const { data: instance } = useInstance();
    const { data: serverSubscription, isLoading: isLoadingSubscription, error: queryError } = usePushSubscription();
    const createMutation = useCreatePushSubscription();
    const updateMutation = useUpdatePushSubscription();
    const deleteMutation = useDeletePushSubscription();

    const [isSupported, setIsSupported] = useState(false);
    const [permissionState, setPermissionState] = useState<PushPermissionState>('prompt');

    // Check for push notification support
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);

            // Check current permission state
            if ('Notification' in window) {
                const permission = Notification.permission;
                if (permission === 'granted') {
                    setPermissionState('granted');
                } else if (permission === 'denied') {
                    setPermissionState('denied');
                } else {
                    setPermissionState('prompt');
                }
            }
        } else {
            setIsSupported(false);
            setPermissionState('unsupported');
        }
    }, []);

    // Subscribe to push notifications
    const subscribe = useCallback(async (alerts?: Partial<PushAlerts>, policy?: PushPolicy) => {
        if (!isSupported || !authStore.isAuthenticated) {
            throw new Error('Push notifications not supported or user not authenticated');
        }

        // Get VAPID public key from instance
        const vapidKey = instance?.configuration?.vapid?.public_key;
        if (!vapidKey) {
            throw new Error('Instance does not support push notifications (no VAPID key)');
        }

        // Request notification permission
        const permission = await Notification.requestPermission();
        setPermissionState(permission as PushPermissionState);

        if (permission !== 'granted') {
            throw new Error('Notification permission denied');
        }

        // Get or register service worker
        const registration = await navigator.serviceWorker.ready;

        // Subscribe to push via browser
        const applicationServerKey = urlBase64ToUint8Array(vapidKey);
        const browserSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
        });

        // Extract keys from browser subscription
        const p256dh = browserSubscription.getKey('p256dh');
        const auth = browserSubscription.getKey('auth');

        if (!p256dh || !auth) {
            throw new Error('Failed to get push subscription keys');
        }

        // Convert keys to base64
        const p256dhBase64 = btoa(String.fromCharCode(...new Uint8Array(p256dh)));
        const authBase64 = btoa(String.fromCharCode(...new Uint8Array(auth)));

        // Send subscription to Mastodon server
        await createMutation.mutateAsync({
            subscription: {
                endpoint: browserSubscription.endpoint,
                keys: {
                    p256dh: p256dhBase64,
                    auth: authBase64,
                },
            },
            data: {
                alerts: {
                    follow: true,
                    favourite: true,
                    reblog: true,
                    mention: true,
                    poll: true,
                    ...alerts,
                },
                policy: policy || 'all',
            },
        });
    }, [isSupported, authStore.isAuthenticated, instance, createMutation]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async () => {
        // Unsubscribe from Mastodon server
        await deleteMutation.mutateAsync();

        // Also unsubscribe from browser
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
            }
        } catch (err) {
            console.warn('Failed to unsubscribe from browser push:', err);
        }
    }, [deleteMutation]);

    // Update alert preferences
    const updateAlerts = useCallback(async (alerts: Partial<PushAlerts>, policy?: PushPolicy) => {
        await updateMutation.mutateAsync({
            data: {
                alerts,
                ...(policy && { policy }),
            },
        });
    }, [updateMutation]);

    // Determine error state - ignore 404 from query as it just means no subscription exists
    // The error is converted to a simple Error with message like "HTTP 404" or "Record not found"
    const isQueryError404 = queryError && (
        queryError.message?.includes('404') ||
        queryError.message?.toLowerCase().includes('not found') ||
        queryError.message?.toLowerCase().includes('record not found')
    );
    const error = (!isQueryError404 ? queryError : null) || createMutation.error || updateMutation.error || deleteMutation.error || null;

    return {
        isSupported,
        permissionState,
        isSubscribed: !!serverSubscription,
        alerts: serverSubscription?.alerts || null,
        isLoading: isLoadingSubscription,
        isSubscribing: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isUnsubscribing: deleteMutation.isPending,
        error: error as Error | null,
        subscribe,
        unsubscribe,
        updateAlerts,
    };
}
