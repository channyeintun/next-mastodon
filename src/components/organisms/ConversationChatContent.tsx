'use client'

import { useRef, useLayoutEffect, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { observer } from 'mobx-react-lite'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, Trash2, Image, X } from 'lucide-react'
import * as R from 'ramda'
import { useCurrentAccount, useStatusContext } from '@/api/queries'
import { queryKeys } from '@/api/queryKeys'
import { useCreateStatus, useDeleteConversation } from '@/api/mutations'
import { IconButton } from '@/components/atoms/IconButton'
import { Avatar } from '@/components/atoms/Avatar'
import { EmojiText } from '@/components/atoms/EmojiText'
import { Spinner } from '@/components/atoms/Spinner'
import { useTranslations } from 'next-intl'
import {
    PageContainer, Header, HeaderInfo, HeaderTitle, HeaderSubtitle,
    FallbackTitle, InputContainer, MessageTextarea, SendButton, DeleteButton,
    EmptyState, MessagesContainer, MediaPreviewContainer, MediaPreviewItem,
    MediaPreviewImage, UploadingIndicator, AttachButton, HiddenInput,
    MediaPreviewControls, MediaPreviewOverlayButton, ScrollSentinel,
} from '@/components/atoms/ConversationStyles'
import { MessageBubble } from '@/components/molecules/MessageBubble'
import { ConversationLoading, ConversationError } from '@/components/molecules/ConversationStates'
import { DeleteConversationModal } from '@/components/molecules/DeleteConversationModal'
import { ImageCropper } from '@/components/molecules/ImageCropper'
import { useConversationStream } from '@/hooks/useStreaming'
import { useConversationStore } from '@/hooks/useStores'
import { useMediaUpload } from '@/hooks/useMediaUpload'
import { useGlobalModal } from '@/contexts/GlobalModalContext'
import {
    getLastStatusId,
    buildMessageList,
    appendIfNotExists,
    stripMentions,
} from '@/utils/conversationUtils'
import type { Context } from '@/types/mastodon'

function ConversationChatContent() {
    useConversationStream()
    const router = useRouter()
    const queryClient = useQueryClient()
    const conversationStore = useConversationStore()
    const t = useTranslations('conversation')
    const tCommon = useTranslations('common')
    const { openModal, closeModal } = useGlobalModal()

    // Use cached conversation from store (set when clicking from conversation list)
    const conversation = conversationStore.cachedConversation
    const id = conversation?.id
    // lastStatus from cached conversation serves as the original status
    const lastStatus = conversation?.last_status

    const { data: currentAccount } = useCurrentAccount()
    const currentUserId = currentAccount?.id
    const createStatus = useCreateStatus()
    const deleteConversation = useDeleteConversation()
    const [messageText, setMessageText] = useState('')
    const {
        media,
        isUploading,
        fileInputRef,
        cropperImage,
        handleFileChange,
        onCropComplete,
        handleMediaRemove,
        clearMedia,
        closeCropper,
    } = useMediaUpload()

    const storedLastStatusId = conversationStore.lastStatusId
    const [stableContextId, setStableContextId] = useState<string | null>(null)

    useEffect(() => {
        if (!stableContextId) {
            const newId = storedLastStatusId || lastStatus?.id
            if (newId) {
                setStableContextId(newId)
                if (!storedLastStatusId) conversationStore.setLastStatusId(newId)
            }
        }
    }, [storedLastStatusId, lastStatus?.id, stableContextId, conversationStore])

    useEffect(() => {
        if (lastStatus?.id && stableContextId && lastStatus.id !== stableContextId) {
            conversationStore.setLastStatusId(lastStatus.id)
            queryClient.setQueryData<Context>(
                queryKeys.statuses.context(stableContextId),
                appendIfNotExists(lastStatus)
            )
        }
    }, [lastStatus?.id, stableContextId, conversationStore, queryClient, lastStatus])

    const { data: context, isLoading, error } = useStatusContext(stableContextId || '')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const prevMessageCountRef = useRef(0)

    // Build message list only after context data arrives
    // Don't show just lastStatus before context loads to avoid partial display
    const allStatuses = context
        ? buildMessageList(
            context.ancestors,
            context.descendants,
            lastStatus || null
        )
        : []

    // Scroll to bottom on first load and new messages
    useLayoutEffect(() => {
        const count = allStatuses.length
        if (count > 0 && (prevMessageCountRef.current === 0 || count > prevMessageCountRef.current)) {
            const scroll = () => {
                if (messagesEndRef.current?.parentElement) {
                    const container = messagesEndRef.current.parentElement
                    container.scrollTo({ top: container.scrollHeight, behavior: 'instant' })
                }
            }

            // Initial load often needs a tiny delay for the browser to calculate scrollHeight correctly
            if (prevMessageCountRef.current === 0) {
                const timeout = setTimeout(scroll, 0)
                return () => clearTimeout(timeout)
            } else {
                scroll()
            }
        }
        prevMessageCountRef.current = count
    }, [allStatuses.length])

    const otherAccount = R.head(conversation?.accounts || [])

    // No need to manually clear - cleanup effect handles it on unmount
    const handleBack = () => router.back()

    const handleDelete = () => {
        if (!id) return
        openModal(
            <DeleteConversationModal
                onClose={closeModal}
                onConfirm={async () => {
                    try {
                        await deleteConversation.mutateAsync(id)
                        conversationStore.clearConversation()
                        closeModal()
                        router.push('/conversations')
                    } catch (error) {
                        console.error('Failed to delete conversation:', error)
                        alert(t('deleteError'))
                    }
                }}
                isPending={deleteConversation.isPending}
            />
        )
    }

    const handleSend = async () => {
        if ((!messageText.trim() && media.length === 0) || !stableContextId) return

        // Cancel any ongoing context query to prevent race conditions
        await queryClient.cancelQueries({ queryKey: queryKeys.statuses.context(stableContextId) })

        const replyToId = getLastStatusId(allStatuses, lastStatus?.id)
        try {
            const newStatus = await createStatus.mutateAsync({
                status: `@${otherAccount?.acct} ${messageText}`,
                visibility: 'direct',
                in_reply_to_id: replyToId,
                media_ids: media.length > 0 ? media.map(m => m.id) : undefined,
            })
            queryClient.setQueryData<Context>(
                queryKeys.statuses.context(stableContextId),
                appendIfNotExists(newStatus)
            )
            conversationStore.setLastStatusId(newStatus.id)
            setMessageText('')
            clearMedia()
        } catch { console.error(t('sendError')) }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    }

    const canSend = Boolean((messageText.trim() || media.length > 0) && !createStatus.isPending && !isUploading)

    if (!id) {
        return <ConversationLoading />
    }

    if (error) {
        return <ConversationError onBack={handleBack} />
    }

    if (isLoading && !context && !conversation) {
        return <ConversationLoading onBack={handleBack} />
    }

    return (
        <PageContainer>
            <Header>
                <IconButton onClick={handleBack} aria-label={tCommon('back')}><ArrowLeft size={20} /></IconButton>
                {otherAccount ? (
                    <HeaderInfo>
                        <Avatar src={otherAccount.avatar} alt={otherAccount.display_name || otherAccount.username} size="small" />
                        <div>
                            <HeaderTitle><EmojiText text={otherAccount.display_name || otherAccount.username} emojis={otherAccount.emojis} /></HeaderTitle>
                            <HeaderSubtitle>@{otherAccount.acct}</HeaderSubtitle>
                        </div>
                    </HeaderInfo>
                ) : <FallbackTitle>{t('title')}</FallbackTitle>}
                <DeleteButton onClick={handleDelete} aria-label={tCommon('delete')} disabled={deleteConversation.isPending}><Trash2 size={20} /></DeleteButton>
            </Header>

            <MessagesContainer>
                {(isLoading || !context) && R.isEmpty(allStatuses) ? (
                    <EmptyState><Spinner /></EmptyState>
                ) : R.isEmpty(allStatuses) ? (
                    <EmptyState>{t('noMessages')}</EmptyState>
                ) : (
                    allStatuses.map((status, index) => {
                        const prevStatus = index > 0 ? allStatuses[index - 1] : null
                        const showAvatar = !prevStatus || prevStatus.account.id !== status.account.id
                        const isConsecutive = Boolean(prevStatus && prevStatus.account.id === status.account.id)
                        const isLastMessage = index === allStatuses.length - 1
                        return (
                            <MessageBubble
                                key={status.id}
                                status={status}
                                isOwn={status.account.id === currentUserId}
                                stripMentions={stripMentions}
                                showAvatar={showAvatar}
                                isLastMessage={isLastMessage}
                                isConsecutive={isConsecutive}
                            />
                        )
                    })
                )}
                <ScrollSentinel ref={messagesEndRef} />
            </MessagesContainer>

            {/* Image Cropper Modal */}
            {cropperImage && (
                <ImageCropper
                    image={cropperImage}
                    onCropComplete={onCropComplete}
                    onCancel={closeCropper}
                    aspectRatio={16 / 9}
                />
            )}

            {/* Media Preview - Anchored above input */}
            {media.length > 0 && (
                <MediaPreviewContainer>
                    {media.map(m => (
                        <MediaPreviewItem key={m.id}>
                            <MediaPreviewImage src={m.preview_url || m.url || ''} alt="" />
                            <MediaPreviewControls className="media-preview-controls">
                                <MediaPreviewOverlayButton onClick={() => handleMediaRemove(m.id)} title={tCommon('remove')}>
                                    <X size={14} />
                                </MediaPreviewOverlayButton>
                            </MediaPreviewControls>
                        </MediaPreviewItem>
                    ))}
                    {isUploading && (
                        <UploadingIndicator><Spinner /></UploadingIndicator>
                    )}
                </MediaPreviewContainer>
            )}

            <InputContainer>
                <AttachButton onClick={() => fileInputRef.current?.click()} aria-label={tCommon('addMedia') || 'Attach media'} disabled={media.length >= 4 || isUploading}>
                    <Image size={20} />
                </AttachButton>
                <HiddenInput ref={fileInputRef} type="file" accept="image/*,video/*,audio/*" onChange={handleFileChange} multiple />
                <MessageTextarea value={messageText} onChange={e => setMessageText(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('typeMessage')} rows={1} />
                <SendButton onClick={handleSend} disabled={!canSend} aria-label={tCommon('send') || 'Send'} $active={canSend}><Send size={20} /></SendButton>
            </InputContainer>
        </PageContainer>
    )
}

export default observer(ConversationChatContent)
