'use client';

interface AudioSource {
    src: string;
    type: string;
}

/**
 * Class to manage notification sound playback.
 * Creates audio, plays it, then cleans up.
 */
class NotificationSound {
    private audio: HTMLAudioElement;

    constructor(sources: AudioSource[]) {
        this.audio = new Audio();
        sources.forEach(({ type, src }) => {
            const source = document.createElement('source');
            source.type = type;
            source.src = src;
            this.audio.appendChild(source);
        });
    }

    play(): Promise<void> {
        return new Promise((resolve) => {
            this.audio.addEventListener('ended', () => resolve(), { once: true });
            this.audio.play().catch((error) => {
                // Silently ignore autoplay errors (e.g., user hasn't interacted with the page yet)
                console.debug('Audio play was prevented:', error);
                resolve();
            });
        });
    }

    destroy(): void {
        this.audio.pause();
        this.audio.src = '';
        this.audio.load();
    }
}

/**
 * Hook to get notification sound controls.
 * Returns a play function that creates audio, plays it, then cleans up.
 */
export function useNotificationSound() {
    const play = async (): Promise<void> => {
        const sound = new NotificationSound([
            { src: '/boop.ogg', type: 'audio/ogg' },
            { src: '/boop.mp3', type: 'audio/mpeg' },
        ]);
        await sound.play();
        sound.destroy();
    };

    return { play };
}
