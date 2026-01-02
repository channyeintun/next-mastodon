import styled from '@emotion/styled';
import Link from 'next/link';

export const Header = styled.div`
    display: flex;
    align-items: center;
    gap: var(--size-3);
    margin-bottom: var(--size-5);

    h1 {
        font-size: var(--font-size-4);
        font-weight: var(--font-weight-6);
        color: var(--text-1);
        display: flex;
        align-items: center;
        gap: var(--size-2);
        margin: 0;
    }
`;

export const Description = styled.p`
    font-size: var(--font-size-1);
    color: var(--text-2);
    margin-bottom: var(--size-4);
    line-height: 1.5;
`;

export const PendingBanner = styled(Link)`
    display: flex;
    align-items: center;
    gap: var(--size-2);
    padding: var(--size-3) var(--size-4);
    margin-bottom: var(--size-4);
    background: var(--blue-2);
    border-radius: var(--radius-2);
    color: var(--blue-9);
    text-decoration: none;
    font-size: var(--font-size-1);
    font-weight: var(--font-weight-5);

    &:hover {
        background: var(--blue-3);
    }
`;

export const PolicyRow = styled.div<{ $isLast: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--size-4);
    padding: var(--size-3) 0;
    border-bottom: ${props => props.$isLast ? 'none' : '1px solid var(--surface-3)'};

    @media (max-width: 500px) {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--size-2);
    }
`;

export const PolicyInfo = styled.div`
    display: flex;
    align-items: flex-start;
    gap: var(--size-3);
    flex: 1;
    min-width: 0;
`;

export const PolicyIcon = styled.div`
    color: var(--text-2);
    flex-shrink: 0;
    margin-top: 2px;
`;

export const PolicyText = styled.div`
    min-width: 0;
`;

export const PolicyLabel = styled.div`
    font-weight: var(--font-weight-6);
    color: var(--text-1);
    margin-bottom: var(--size-1);
`;

export const PolicyDescription = styled.div`
    font-size: var(--font-size-0);
    color: var(--text-2);
`;

export const PolicySelect = styled.select`
    padding: var(--size-2) var(--size-3);
    border: 1px solid var(--surface-4);
    border-radius: var(--radius-2);
    background: var(--surface-2);
    color: var(--text-1);
    font-size: var(--font-size-1);
    min-width: 120px;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: var(--blue-6);
    }

    @media (max-width: 500px) {
        width: 100%;
    }
`;

export const ButtonRow = styled.div`
    display: flex;
    gap: var(--size-3);
    justify-content: flex-end;
`;

export const SectionTitle = styled.h2`
    font-size: var(--font-size-2);
    font-weight: var(--font-weight-6);
    color: var(--text-1);
    margin-bottom: var(--size-3);
    margin-top: var(--size-2);
`;
