/**
 * Conversation state components - Loading, Error, and Empty states
 */

import { useRouter } from 'next/router'
import { ArrowLeft } from 'lucide-react'
import { Spinner } from '@/components/atoms/Spinner'
import { IconButton } from '@/components/atoms/IconButton'
import {
    PageContainer, Header, FallbackTitle,
    CenteredContent, ErrorContent, ErrorTitle, ErrorMessage,
} from '@/components/atoms/ConversationStyles'

interface ConversationLoadingProps {
    onBack?: () => void
}

export function ConversationLoading({ onBack }: ConversationLoadingProps) {
    const router = useRouter()
    const handleBack = onBack || (() => router.back())

    return (
        <PageContainer>
            <Header>
                <IconButton onClick={handleBack} aria-label="Back"><ArrowLeft size={20} /></IconButton>
                <FallbackTitle>Conversation</FallbackTitle>
            </Header>
            <CenteredContent><Spinner /></CenteredContent>
        </PageContainer>
    )
}

interface ConversationErrorProps {
    onBack: () => void
    title?: string
    message?: string
}

export function ConversationError({ onBack, title = 'Error loading conversation', message = 'Please try again later.' }: ConversationErrorProps) {
    return (
        <PageContainer>
            <Header>
                <IconButton onClick={onBack} aria-label="Back"><ArrowLeft size={20} /></IconButton>
                <FallbackTitle>Conversation</FallbackTitle>
            </Header>
            <ErrorContent>
                <div><ErrorTitle>{title}</ErrorTitle><ErrorMessage>{message}</ErrorMessage></div>
            </ErrorContent>
        </PageContainer>
    )
}
