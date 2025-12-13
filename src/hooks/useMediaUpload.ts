import { useState, useRef } from 'react'
import { uploadMedia } from '@/api/client'
import { useCropper } from '@/hooks/useCropper'
import type { MediaAttachment } from '@/types/mastodon'

/**
 * Custom hook for managing media uploads with cropping support
 */
export function useMediaUpload() {
    const [media, setMedia] = useState<MediaAttachment[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [pendingFiles, setPendingFiles] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { cropperImage, openCropper, closeCropper, handleCropComplete } = useCropper()

    const handleMediaAdd = async (file: File) => {
        setIsUploading(true)
        try {
            const attachment = await uploadMedia(file)
            setMedia(prev => [...prev, attachment])
        } catch (err) {
            console.error('Failed to upload media:', err)
        } finally {
            setIsUploading(false)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const remainingSlots = 4 - media.length
        const filesToProcess: File[] = []

        for (let i = 0; i < files.length && i < remainingSlots; i++) {
            filesToProcess.push(files[i])
        }

        if (filesToProcess.length === 0) {
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }

        // Take the first file and queue the rest
        const [firstFile, ...restFiles] = filesToProcess
        setPendingFiles(restFiles)

        // Try to open cropper for the first image
        if (!openCropper(firstFile)) {
            // Non-image file, upload directly
            await handleMediaAdd(firstFile)
            // Process next file if any
            if (restFiles.length > 0) {
                const [next, ...remaining] = restFiles
                setPendingFiles(remaining)
                if (!openCropper(next)) {
                    await handleMediaAdd(next)
                }
            }
        }

        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const onCropComplete = async (croppedBlob: Blob) => {
        handleCropComplete(croppedBlob, async (file) => {
            await handleMediaAdd(file)
            // Process next file in queue after crop
            if (pendingFiles.length > 0) {
                const [nextFile, ...rest] = pendingFiles
                setPendingFiles(rest)
                if (!openCropper(nextFile)) {
                    await handleMediaAdd(nextFile)
                }
            }
        })
    }

    const handleMediaRemove = (mediaId: string) => {
        setMedia(prev => prev.filter(m => m.id !== mediaId))
    }

    const clearMedia = () => {
        setMedia([])
        setPendingFiles([])
    }

    return {
        media,
        isUploading,
        fileInputRef,
        cropperImage,
        handleFileChange,
        onCropComplete,
        handleMediaRemove,
        clearMedia,
        closeCropper,
    }
}
