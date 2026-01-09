import styled from '@emotion/styled';
import Link from 'next/link';
import { Avatar, Card, IconButton } from '@/components/atoms';

export const ContentWrapper = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: var(--size-3);
`;

export const IconColumn = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--size-2);
`;

export const IconCircle = styled.div<{ $color: string }>`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: color-mix(in srgb, ${props => props.$color} 20%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
`;

export const ContentColumn = styled.div`
    flex: 1;
    min-width: 0;
`;

export const StatusContent = styled.div`
    grid-column: 2;
    margin-top: var(--size-2);

    @media (max-width: 767px) {
        grid-column: span 2;
    }
`;

export const HeaderRow = styled.div`
    position: relative;
    margin-bottom: var(--size-2);
    padding-right: var(--size-6);
`;

export const AvatarsWrapper = styled.span`
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    margin-right: var(--size-1);
`;

export const StackedAvatarWrapper = styled.span<{ $index: number; $total: number }>`
    display: inline-block;
    margin-left: ${props => props.$index > 0 ? '-12px' : '0'};
    position: relative;
    z-index: ${props => props.$total - props.$index};
`;

export const StackedAvatarLink = styled(Link)`
    display: inline-block;
    line-height: 0;
`;

export const AvatarWithBorder = styled(Avatar)`
    border: 2px solid var(--surface-1);
    box-sizing: content-box;
    width: 1.4em;
    height: 1.4em;
`;

export const RemainingCount = styled.span`
    margin-left: var(--size-1);
    font-size: var(--font-size-0);
    color: var(--text-3);
`;

export const InfoWrapper = styled.span`
    display: contents;
`;

export const MessageText = styled.span`
    font-size: var(--font-size-1);
    color: var(--text-1);
    line-height: 1.4;
`;

export const AccountLink = styled(Link)`
    text-decoration: none;
    color: var(--text-1);
    font-weight: var(--font-weight-6);
`;

export const TopRightActions = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--size-1);
`;

export const TimeText = styled.div`
    font-size: var(--font-size-0);
    color: var(--text-3);
`;

export const DismissButton = styled(IconButton)`
    opacity: 0.6;
`;

export const NewCard = styled(Card)`
    border-left: 3px solid var(--blue-6);
    background: color-mix(in srgb, var(--blue-6) 5%, var(--surface-2));
`;
