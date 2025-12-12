import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

/**
 * Regex to detect URL-like strings that could be link cards
 * Matches URLs with a path component (e.g., https://example.com/path)
 */
const URL_LIKE_REGEX = /^https?:\/\/[^\s]+\/[^\s]+$/i;

export interface FilePasteHandlerOptions {
    /**
     * Callback when files are pasted or dropped
     */
    onFilePaste?: (files: File[]) => void;
    /**
     * Callback when a URL is pasted (for potential link card creation)
     */
    onUrlPaste?: (url: URL) => void;
    /**
     * Maximum number of files that can be uploaded
     */
    maxFiles?: number;
    /**
     * Allowed MIME types for file upload
     */
    allowedMimeTypes?: string[];
}

/**
 * Tiptap extension to handle file paste and drop operations
 * Similar to how Mastodon handles paste/drop in compose
 */
export const FilePasteHandler = Extension.create<FilePasteHandlerOptions>({
    name: 'filePasteHandler',

    addOptions() {
        return {
            onFilePaste: undefined,
            onUrlPaste: undefined,
            maxFiles: 4,
            allowedMimeTypes: ['image/*', 'video/*', 'audio/*'],
        };
    },

    addProseMirrorPlugins() {
        const { onFilePaste, onUrlPaste, maxFiles, allowedMimeTypes } = this.options;

        /**
         * Check if a file matches allowed MIME types
         */
        const isAllowedFile = (file: File): boolean => {
            if (!allowedMimeTypes || allowedMimeTypes.length === 0) return true;

            return allowedMimeTypes.some((pattern) => {
                if (pattern.endsWith('/*')) {
                    const type = pattern.slice(0, -2);
                    return file.type.startsWith(type);
                }
                return file.type === pattern;
            });
        };

        /**
         * Process files from DataTransfer object
         */
        const processFiles = (transfer: DataTransfer): File[] => {
            const files: File[] = [];

            if (transfer.files && transfer.files.length > 0) {
                for (let i = 0; i < Math.min(transfer.files.length, maxFiles || 4); i++) {
                    const file = transfer.files[i];
                    if (isAllowedFile(file)) {
                        files.push(file);
                    }
                }
            }

            return files;
        };

        /**
         * Try to extract and validate URL from text data
         */
        const tryExtractUrl = (transfer: DataTransfer): URL | null => {
            const text = transfer.getData('text/plain');
            if (!text || !URL_LIKE_REGEX.test(text)) return null;

            try {
                return new URL(text);
            } catch {
                return null;
            }
        };

        return [
            new Plugin({
                key: new PluginKey('filePasteHandler'),
                props: {
                    handlePaste: (view, event) => {
                        const clipboardData = event.clipboardData;
                        if (!clipboardData) return false;

                        // Check for files first
                        const files = processFiles(clipboardData);
                        if (files.length > 0 && onFilePaste) {
                            event.preventDefault();
                            onFilePaste(files);
                            return true;
                        }

                        // Check for URL paste (when no files)
                        if (clipboardData.files.length === 0 && onUrlPaste) {
                            const url = tryExtractUrl(clipboardData);
                            if (url) {
                                // Don't prevent default - let the URL be pasted as text
                                // But also trigger the URL handler for link card creation
                                onUrlPaste(url);
                            }
                        }

                        return false;
                    },
                    handleDrop: (view, event) => {
                        const dataTransfer = event.dataTransfer;
                        if (!dataTransfer) return false;

                        // Check for files
                        const files = processFiles(dataTransfer);
                        if (files.length > 0 && onFilePaste) {
                            event.preventDefault();
                            onFilePaste(files);
                            return true;
                        }

                        return false;
                    },
                },
            }),
        ];
    },
});
