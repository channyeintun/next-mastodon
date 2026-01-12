import { makeAutoObservable, runInAction } from 'mobx';
import type { Visibility } from '@/components/molecules/VisibilitySettingsModal';

export interface Draft {
    content: string;
    spoilerText: string;
    visibility: Visibility;
    sensitive: boolean;
    media: any[];
    poll: any | null;
    language: string;
    scheduledAt: string;
}

const STORAGE_KEY = 'mastodon_compose_draft';

export class DraftStore {
    draft: Draft | null = null;

    constructor() {
        makeAutoObservable(this);
        this.loadFromStorage();
    }

    setDraft(draft: Draft) {
        this.draft = draft;
        this.saveToStorage();
    }

    clearDraft() {
        this.draft = null;
        this.saveToStorage();
    }

    private saveToStorage() {
        if (typeof window === 'undefined') return;
        if (this.draft) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.draft));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    private loadFromStorage() {
        if (typeof window === 'undefined') return;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                runInAction(() => {
                    this.draft = parsed;
                });
            } catch (e) {
                console.error('Failed to parse draft from storage', e);
            }
        }
    }
}
