'use client'

import dynamic from 'next/dynamic'
import { Spinner } from '@/components/atoms/Spinner'
import { PageContainer, Header, FallbackTitle, CenteredContent } from '@/components/atoms/ConversationStyles'
import { IconButton } from '@/components/atoms/IconButton'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Dynamic import with SSR disabled to avoid hydration mismatch with sessionStorage
const ConversationChatContent = dynamic(
    () => import('@/components/organisms/ConversationChatContent'),
    {
        ssr: false,
        loading: () => <ChatLoadingFallback />,
    }
)

function ChatLoadingFallback() {
    const router = useRouter()
    return (
        <PageContainer>
            <Header>
                <IconButton onClick={() => router.back()} aria-label="Back"><ArrowLeft size={20} /></IconButton>
                <FallbackTitle>Conversation</FallbackTitle>
            </Header>
            <CenteredContent><Spinner /></CenteredContent>
        </PageContainer>
    )
}

export default function ConversationChatPage() {
    return <ConversationChatContent />
}
