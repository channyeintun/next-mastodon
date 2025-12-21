import { useState } from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Copy, ChevronDown, GripVertical } from 'lucide-react';
import { Input, FormField } from '@/components/atoms';
import { formatVerificationDate } from '@/utils/date';
import type { ProfileFormData, ProfileField } from '@/schemas/profileFormSchema';
import {
  SectionCard,
  SectionTitle,
  FieldsTitle,
  FieldsDescription,
  FieldsWrapper,
  Textarea,
  FieldsContainer,
  FieldRow,
  DragHandle,
  DropIndicator,
  FieldInput,
  VerificationIcon,
  GreenCheck,
  Details,
  Summary,
  DetailsContent,
  VerificationText,
  CodeSnippet,
  CodeBlock,
  CodeContent,
  CopyButton,
  TipText,
} from './ProfileFieldsEditorStyled';

interface ProfileFieldsEditorProps {
  register: UseFormRegister<ProfileFormData>;
  control: Control<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  watch: UseFormWatch<ProfileFormData>;
  setValue: UseFormSetValue<ProfileFormData>;
  profileUrl: string;
}

export function ProfileFieldsEditor({
  register,
  errors,
  watch,
  setValue,
  profileUrl,
}: ProfileFieldsEditorProps) {
  const bio = watch('bio');
  const fields = watch('fields');

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Set drag image opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const dropPosition = e.clientY < midY ? index : index + 1;

    // Don't show indicator at the same position as dragged item
    if (dropPosition !== draggedIndex && dropPosition !== draggedIndex + 1) {
      setDropIndicatorIndex(dropPosition);
    } else {
      setDropIndicatorIndex(null);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only hide indicator if leaving the container entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(relatedTarget)) {
      setDropIndicatorIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex === null || dropIndicatorIndex === null) {
      setDraggedIndex(null);
      setDropIndicatorIndex(null);
      return;
    }

    // Reorder fields
    const newFields = [...fields];
    const [draggedField] = newFields.splice(draggedIndex, 1);
    const insertIndex = dropIndicatorIndex > draggedIndex ? dropIndicatorIndex - 1 : dropIndicatorIndex;
    newFields.splice(insertIndex, 0, draggedField);

    setValue('fields', newFields as [ProfileField, ProfileField, ProfileField, ProfileField]);

    setDraggedIndex(null);
    setDropIndicatorIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropIndicatorIndex(null);
  };

  return (
    <>
      {/* Profile Information */}
      <SectionCard padding="medium">
        <SectionTitle>Profile information</SectionTitle>

        <FieldsWrapper>
          <FormField
            label="Display name"
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
        <FieldsTitle>Extra fields</FieldsTitle>
        <FieldsDescription>
          You can have up to 4 items displayed as a table on your profile
        </FieldsDescription>

        <FieldsContainer
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {fields.map((field, index) => (
            <div key={index}>
              {/* Drop indicator before this row */}
              {dropIndicatorIndex === index && (
                <DropIndicator />
              )}
              <FieldRow
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                $isDragging={draggedIndex === index}
              >
                <DragHandle>
                  <GripVertical size={18} />
                </DragHandle>
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
                      title={`Verified on ${formatVerificationDate(field.verified_at)}`}
                    >
                      <GreenCheck size={18} />
                    </span>
                  )}
                </VerificationIcon>
              </FieldRow>
            </div>
          ))}
          {/* Drop indicator at the end */}
          {dropIndicatorIndex === fields.length && (
            <DropIndicator />
          )}
        </FieldsContainer>

        {/* Verification Info */}
        <Details>
          <Summary>
            <ChevronDown size={18} className="details-chevron" />
            Link verification
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