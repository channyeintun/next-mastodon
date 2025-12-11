import styled from '@emotion/styled';
import { UseFormRegister, Control, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Check, Copy, ChevronDown } from 'lucide-react';
import { Card, Input, FormField } from '@/components/atoms';
import type { ProfileFormData } from '@/schemas/profileFormSchema';

// Styled components
const SectionCard = styled(Card)`
  margin-bottom: var(--size-4);
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--size-4);
`;

const FieldsTitle = styled.h2`
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--size-2);
`;

const FieldsDescription = styled.p`
  font-size: var(--font-size-0);
  color: var(--text-2);
  margin-bottom: var(--size-4);
`;

const FieldsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: var(--size-2);
  border: 1px solid var(--surface-4);
  border-radius: var(--radius-2);
  background: var(--surface-1);
  color: var(--text-1);
  font-size: var(--font-size-1);
  resize: vertical;
  font-family: inherit;
`;

const FieldInput = styled.input<{ $verified?: boolean }>`
  padding: var(--size-2);
  border: 1px solid ${props => props.$verified ? 'var(--green-6)' : 'var(--surface-4)'};
  border-radius: var(--radius-2);
  background: ${props => props.$verified ? 'color-mix(in srgb, var(--green-6) 10%, var(--surface-1))' : 'var(--surface-1)'};
  color: var(--text-1);
  font-size: var(--font-size-1);
`;

const VerificationIcon = styled.div`
  width: 24px;
  display: flex;
  justify-content: center;
`;

const GreenCheck = styled(Check)`
  color: var(--green-6);
`;

const Details = styled.details`
  margin-top: var(--size-4);
  border-top: 1px solid var(--surface-3);
  padding-top: var(--size-4);
`;

const Summary = styled.summary`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  color: var(--text-1);
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  cursor: pointer;
  list-style: none;
`;

const DetailsContent = styled.div`
  margin-top: var(--size-3);
`;

const VerificationText = styled.p`
  font-size: var(--font-size-0);
  color: var(--text-2);
  margin-bottom: var(--size-3);
  line-height: 1.5;
`;

const CodeSnippet = styled.code`
  background: var(--surface-3);
  padding: 2px 4px;
  border-radius: 4px;
`;

const CodeBlock = styled.div`
  background: var(--surface-2);
  border-radius: var(--radius-2);
  padding-block: var(--size-3);
  display: flex;
  place-items: center;
`;

const CodeContent = styled.code`
  font-size: var(--font-size-0);
  font-family: monospace;
  white-space: nowrap;
  display: block;
  padding-right: var(--size-8);
  overflow: auto;
`;

const CopyButton = styled.button`
  background: var(--surface-3);
  border: none;
  border-radius: var(--radius-1);
  padding: var(--size-1);
  cursor: pointer;
  color: var(--text-2);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--surface-4);
  }
`;

const TipText = styled.p`
  font-size: var(--font-size-0);
  color: var(--text-2);
  margin-top: var(--size-3);
  line-height: 1.5;
`;

interface ProfileFieldsEditorProps {
  register: UseFormRegister<ProfileFormData>;
  control: Control<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  watch: UseFormWatch<ProfileFormData>;
  profileUrl: string;
}

export function ProfileFieldsEditor({
  register,
  errors,
  watch,
  profileUrl,
}: ProfileFieldsEditorProps) {
  const bio = watch('bio');
  const fields = watch('fields');

  return (
    <>
      {/* Profile Information */}
      <SectionCard padding="medium">
        <SectionTitle>Profile Information</SectionTitle>

        <FieldsWrapper>
          <FormField
            label="Display Name"
            htmlFor="display-name"
            error={errors.displayName?.message}
          >
            <Input
              id="display-name"
              type="text"
              {...register('displayName')}
              maxLength={30}
            />
          </FormField>

          <FormField
            label="Bio"
            htmlFor="bio"
            description={`${bio?.length || 0} / 500`}
            error={errors.bio?.message}
          >
            <Textarea
              id="bio"
              {...register('bio')}
              maxLength={500}
              rows={4}
            />
          </FormField>
        </FieldsWrapper>
      </SectionCard>

      {/* Extra Fields */}
      <SectionCard padding="medium">
        <FieldsTitle>Extra Fields</FieldsTitle>
        <FieldsDescription>
          You can have up to 4 items displayed as a table on your profile
        </FieldsDescription>

        <div className="profile-edit-fields-container">
          {fields.map((field, index) => (
            <div key={index} className="profile-edit-field-row">
              <FieldInput
                type="text"
                placeholder={`Label ${index + 1}`}
                {...register(`fields.${index}.name`)}
              />
              <FieldInput
                type="text"
                placeholder="Content"
                {...register(`fields.${index}.value`)}
                $verified={!!field.verified_at}
              />
              <VerificationIcon>
                {field.verified_at && (
                  <span
                    title={`Verified on ${new Date(field.verified_at).toLocaleDateString()}`}
                  >
                    <GreenCheck size={18} />
                  </span>
                )}
              </VerificationIcon>
            </div>
          ))}
        </div>

        {/* Verification Info */}
        <Details>
          <Summary>
            <ChevronDown size={18} className="details-chevron" />
            Link Verification
          </Summary>

          <DetailsContent>
            <VerificationText>
              You can verify yourself as the owner of the links in your profile
              metadata. For this, the linked website must contain a link back to
              your Mastodon profile. The link back must have a{' '}
              <CodeSnippet>rel=&quot;me&quot;</CodeSnippet>{' '}
              attribute.
            </VerificationText>

            <CodeBlock>
              <CodeContent>
                {`<a rel="me" href="${profileUrl}">Mastodon</a>`}
              </CodeContent>
              <CopyButton
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `<a rel="me" href="${profileUrl}">Mastodon</a>`
                  );
                }}
                title="Copy to clipboard"
              >
                <Copy size={14} />
              </CopyButton>
            </CodeBlock>

            <TipText>
              <strong>Tip:</strong> The link on your website can be invisible. The
              important part is{' '}
              <CodeSnippet>rel=&quot;me&quot;</CodeSnippet>{' '}
              which prevents impersonation.
            </TipText>
          </DetailsContent>
        </Details>
      </SectionCard>
    </>
  );
}
