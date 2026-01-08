'use client';

import styled from '@emotion/styled';
import { Button } from '@/components/atoms';
import { formatPollExpiration } from '@/utils/date';
import type { Poll } from '@/types';

interface PostPollProps {
    poll: Poll;
    selectedChoices: number[];
    isVoting: boolean;
    canVote: boolean;
    onChoiceToggle: (index: number) => void;
    onVote: () => void;
}

/**
 * Presentation component for poll display and voting.
 * Handles both voting interface (when canVote is true) and results display.
 */
export function PostPoll({
    poll,
    selectedChoices,
    isVoting,
    canVote,
    onChoiceToggle,
    onVote,
}: PostPollProps) {
    return (
        <Container onClick={(e) => e.stopPropagation()}>
            {canVote ? (
                <>
                    {/* Voting interface */}
                    {poll.options.map((option, index) => (
                        <OptionLabel
                            key={index}
                            $isSelected={selectedChoices.includes(index)}
                        >
                            <OptionInput
                                type={poll.multiple ? 'checkbox' : 'radio'}
                                name={`poll-${poll.id}`}
                                checked={selectedChoices.includes(index)}
                                onChange={() => onChoiceToggle(index)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <OptionText>
                                {option.title}
                            </OptionText>
                        </OptionLabel>
                    ))}
                    <VoteFooter>
                        <VoteInfo>
                            {poll.votes_count} votes · {poll.multiple ? 'Multiple choice' : 'Single choice'}
                        </VoteInfo>
                        <Button
                            size="small"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onVote();
                            }}
                            disabled={selectedChoices.length === 0 || isVoting}
                            isLoading={isVoting}
                        >
                            Vote
                        </Button>
                    </VoteFooter>
                </>
            ) : (
                <>
                    {/* Results display */}
                    {poll.options.map((option, index) => {
                        const percentage = poll.votes_count > 0
                            ? ((option.votes_count || 0) / poll.votes_count) * 100
                            : 0;
                        const isOwnVote = poll.own_votes?.includes(index);

                        return (
                            <ResultOption
                                key={index}
                                $isOwnVote={isOwnVote || false}
                            >
                                <ResultBar $percentage={percentage} $isOwnVote={isOwnVote || false} />
                                <ResultContent>
                                    <ResultOptionText $isOwnVote={isOwnVote || false}>
                                        {option.title}
                                        {isOwnVote && (
                                            <VoteCheckmark>
                                                ✓
                                            </VoteCheckmark>
                                        )}
                                    </ResultOptionText>
                                    <ResultPercentage>
                                        {percentage.toFixed(1)}%
                                    </ResultPercentage>
                                </ResultContent>
                            </ResultOption>
                        );
                    })}
                    <ResultsFooter>
                        {poll.votes_count.toLocaleString()} votes
                        {poll.voters_count !== null &&
                            ` · ${poll.voters_count.toLocaleString()} voters`}
                        {' · '}
                        {poll.expired ? (
                            <ClosedText>Closed</ClosedText>
                        ) : (
                            `Closes ${formatPollExpiration(poll.expires_at!)}`
                        )}
                    </ResultsFooter>
                </>
            )}
        </Container>
    );
}

const Container = styled.div`
  margin-top: var(--size-3);
  padding: var(--size-3);
  background: var(--surface-3);
  border-radius: var(--radius-2);
`;

const OptionLabel = styled.label<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  padding: var(--size-2);
  margin-bottom: var(--size-2);
  background: ${({ $isSelected }) => ($isSelected ? 'color-mix(in srgb, var(--blue-6), transparent 85%)' : 'var(--surface-2)')};
  border-radius: var(--radius-2);
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
`;

const OptionInput = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const OptionText = styled.span`
  flex: 1;
  color: var(--text-1);
  font-size: var(--font-size-1);
`;

const VoteFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--size-3);
`;

const VoteInfo = styled.div`
  font-size: var(--font-size-0);
  color: var(--text-2);
`;

const ResultOption = styled.div<{ $isOwnVote: boolean }>`
  margin-bottom: var(--size-2);
  padding: var(--size-2);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  position: relative;
  border: 2px solid transparent;
`;

const ResultBar = styled.div<{ $percentage: number; $isOwnVote: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: ${({ $isOwnVote }) => ($isOwnVote ? 'var(--poll-bar-bg-own)' : 'var(--poll-bar-bg)')};
  border-radius: var(--radius-2);
  width: ${({ $percentage }) => $percentage}%;
  transition: width 0.5s ease;
`;

const ResultContent = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--size-2);
`;

const ResultOptionText = styled.span<{ $isOwnVote: boolean }>`
  flex: 1;
  color: var(--text-1);
  font-weight: ${({ $isOwnVote }) => ($isOwnVote ? 'var(--font-weight-6)' : 'normal')};
`;

const VoteCheckmark = styled.span`
  margin-left: var(--size-2);
  font-size: var(--font-size-0);
  color: var(--blue-6);
`;

const ResultPercentage = styled.span`
  color: var(--text-2);
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-6);
`;

const ResultsFooter = styled.div`
  margin-top: var(--size-2);
  font-size: var(--font-size-0);
  color: var(--text-2);
`;

const ClosedText = styled.span`
  color: var(--red-6);
`;
