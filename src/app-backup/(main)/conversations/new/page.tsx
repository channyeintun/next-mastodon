'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import styled from '@emotion/styled'
import { ArrowLeft, Search, X, Send, Image } from 'lucide-react'
import { useSearch } from '@/api/queries'
import { useCreateStatus } from '@/api/mutations'
import { queryKeys } from '@/api/queryKeys'
import { AccountCard } from '@/components/molecules/AccountCard'
import { ImageCropper } from '@/components/molecules/ImageCropper'
import { IconButton } from '@/components/atoms/IconButton'
import { Spinner } from '@/components/atoms/Spinner'
import { Avatar } from '@/components/atoms/Avatar'
import { EmojiText } from '@/components/atoms/EmojiText'
import {
    PageContainer, Header, HeaderInfo, HeaderTitle, HeaderSubtitle,
    PageTitle, InputContainer, MessageTextarea, SendButton, EmptyState,
    MediaPreviewContainer, MediaPreviewItem, MediaPreviewImage,
    UploadingIndicator, AttachButton, HiddenInput,
    MediaPreviewControls, MediaPreviewOverlayButton,
} from '@/components/atoms/ConversationStyles'
import { useMediaUpload } from '@/hooks/useMediaUpload'
import type { Account } from '@/types/mastodon'

export default function NewConversationPage() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
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
    const createStatus = useCreateStatus()

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const { data: searchResults, isLoading } = useSearch(
        { q: debouncedQuery, type: 'accounts', limit: 20, resolve: true },
        { enabled: debouncedQuery.length > 0 && !selectedAccount }
    )
    const accounts = searchResults?.accounts || []

    const handleSelect = (account: Account) => {
        setSelectedAccount(account)
        setMessageText('')
        clearMedia()
    }
    const handleBack = () => {
        if (selectedAccount) {
            setSelectedAccount(null)
            setMessageText('')
            clearMedia()
        }
        else router.back()
    }
    const handleClear = () => { setSearchQuery(''); setDebouncedQuery('') }

    const handleSend = async () => {
        if ((!messageText.trim() && media.length === 0) || !selectedAccount) return
        try {
            await createStatus.mutateAsync({
                status: `@${selectedAccount.acct} ${messageText}`,
                visibility: 'direct',
                media_ids: media.length > 0 ? media.map(m => m.id) : undefined,
            })
            // Invalidate conversations query to refresh the list
            queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() })
            router.push('/conversations')
        } catch { console.error('Failed to send') }
    }
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    }

    const canSend = Boolean((messageText.trim() || media.length > 0) && !createStatus.isPending && !isUploading)

    return (
        <PageContainer>
            <Header>
                <IconButton onClick={handleBack} aria-label="Back"><ArrowLeft size={20} /></IconButton>
                {selectedAccount ? (
                    <HeaderInfo>
                        <Avatar src={selectedAccount.avatar} alt={selectedAccount.display_name || selectedAccount.username} size="small" />
                        <div>
                            <HeaderTitle><EmojiText text={selectedAccount.display_name || selectedAccount.username} emojis={selectedAccount.emojis} /></HeaderTitle>
                            <HeaderSubtitle>@{selectedAccount.acct}</HeaderSubtitle>
                        </div>
                    </HeaderInfo>
                ) : <PageTitle>New Message</PageTitle>}
            </Header>

            {selectedAccount ? (
                <MessageInterface>
                    <EmptyMessages>No messages yet</EmptyMessages>

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
                                        <MediaPreviewOverlayButton onClick={() => handleMediaRemove(m.id)} title="Remove">
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
                        <AttachButton onClick={() => fileInputRef.current?.click()} aria-label="Attach media" disabled={media.length >= 4 || isUploading}>
                            <Image size={20} />
                        </AttachButton>
                        <HiddenInput ref={fileInputRef} type="file" accept="image/*,video/*,audio/*" onChange={handleFileChange} multiple />
                        <MessageTextarea value={messageText} onChange={e => setMessageText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." rows={1} />
                        <SendButton onClick={handleSend} disabled={!canSend} aria-label="Send" $active={canSend}><Send size={20} /></SendButton>
                    </InputContainer>
                </MessageInterface>
            ) : (
                <>
                    <SearchSection>
                        <SearchInputWrapper>
                            <SearchIcon size={18} />
                            <SearchInput type="text" placeholder="Search for people..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus $hasValue={!!searchQuery} />
                            {searchQuery && <ClearButton onClick={handleClear} aria-label="Clear"><X size={16} /></ClearButton>}
                        </SearchInputWrapper>
                    </SearchSection>

                    <ResultsContainer>
                        {!debouncedQuery ? (
                            <EmptyState>
                                <div>
                                    <EmptySearchIcon><Search size={48} style={{ color: 'var(--text-3)' }} /></EmptySearchIcon>
                                    <EmptySearchTitle>Search for people</EmptySearchTitle>
                                    <EmptySearchSubtitle>Enter a name or username to start a conversation</EmptySearchSubtitle>
                                </div>
                            </EmptyState>
                        ) : isLoading ? (
                            <LoadingContainer><Spinner /></LoadingContainer>
                        ) : accounts.length > 0 ? (
                            <AccountsList>
                                {accounts.map(account => (
                                    <AccountCard
                                        key={account.id}
                                        account={account}
                                        showFollowButton={false}
                                        onClick={handleSelect}
                                    />
                                ))}
                            </AccountsList>
                        ) : (
                            <EmptyState>
                                <div>
                                    <EmptySearchTitle>No results found</EmptySearchTitle>
                                    <EmptySearchSubtitle>Try searching with a different name</EmptySearchSubtitle>
                                </div>
                            </EmptyState>
                        )}
                    </ResultsContainer>
                </>
            )}
        </PageContainer>
    )
}

// Styled Components
const MessageInterface = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const EmptyMessages = styled.div`
  flex: 1;
  padding: var(--size-4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
  font-size: var(--font-size-1);
`

const SearchSection = styled.div`
  padding: var(--size-4);
  border-bottom: 1px solid var(--surface-3);
`

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const SearchIcon = styled(Search)`
  position: absolute;
  left: var(--size-3);
  color: var(--text-3);
  pointer-events: none;
`

const SearchInput = styled.input<{ $hasValue: boolean }>`
  width: 100%;
  padding: var(--size-3);
  padding-left: var(--size-8);
  padding-right: ${props => props.$hasValue ? 'var(--size-8)' : 'var(--size-3)'};
  border: 1px solid var(--surface-5);
  border-radius: var(--radius-3);
  font-size: var(--font-size-2);
  background: var(--surface-2);
  color: var(--text-1);
  height: 44px;
  &:focus { outline: none; border-color: var(--blue-7); }
`

const ClearButton = styled(IconButton)`
  position: absolute;
  right: var(--size-2);
  padding: var(--size-1);
  min-width: auto;
  width: auto;
  height: auto;
`

const ResultsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: var(--size-3);
`

const EmptySearchIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: var(--size-4);
`

const EmptySearchTitle = styled.p`
  font-size: var(--font-size-3);
  margin-bottom: var(--size-2);
  font-weight: 600;
`

const EmptySearchSubtitle = styled.p`
  font-size: var(--font-size-1);
  color: var(--text-2);
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: var(--size-8);
`

const AccountsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
`
