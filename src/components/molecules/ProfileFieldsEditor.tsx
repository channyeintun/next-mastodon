import { UseFormRegister, Control, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Check, Copy, ChevronDown } from 'lucide-react';
import { Card, Input, FormField } from '@/components/atoms';
import type { ProfileFormData } from '@/schemas/profileFormSchema';

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
      <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
        <h2
          style={{
            fontSize: 'var(--font-size-3)',
            fontWeight: 'var(--font-weight-6)',
            marginBottom: 'var(--size-4)',
          }}
        >
          Profile Information
        </h2>

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
          <textarea
            id="bio"
            {...register('bio')}
            maxLength={500}
            rows={4}
            style={{
              width: '100%',
              padding: 'var(--size-2)',
              border: '1px solid var(--surface-4)',
              borderRadius: 'var(--radius-2)',
              background: 'var(--surface-1)',
              color: 'var(--text-1)',
              fontSize: 'var(--font-size-1)',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </FormField>
      </Card>

      {/* Extra Fields */}
      <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
        <h2
          style={{
            fontSize: 'var(--font-size-3)',
            fontWeight: 'var(--font-weight-6)',
            marginBottom: 'var(--size-2)',
          }}
        >
          Extra Fields
        </h2>
        <p
          style={{
            fontSize: 'var(--font-size-0)',
            color: 'var(--text-2)',
            marginBottom: 'var(--size-4)',
          }}
        >
          You can have up to 4 items displayed as a table on your profile
        </p>

        <div className="profile-edit-fields-container">
          {fields.map((field, index) => (
            <div key={index} className="profile-edit-field-row">
              <input
                type="text"
                placeholder={`Label ${index + 1}`}
                {...register(`fields.${index}.name`)}
                style={{
                  padding: 'var(--size-2)',
                  border: '1px solid var(--surface-4)',
                  borderRadius: 'var(--radius-2)',
                  background: 'var(--surface-1)',
                  color: 'var(--text-1)',
                  fontSize: 'var(--font-size-1)',
                }}
              />
              <input
                type="text"
                placeholder="Content"
                {...register(`fields.${index}.value`)}
                style={{
                  padding: 'var(--size-2)',
                  border: field.verified_at
                    ? '1px solid var(--green-6)'
                    : '1px solid var(--surface-4)',
                  borderRadius: 'var(--radius-2)',
                  background: field.verified_at
                    ? 'color-mix(in srgb, var(--green-6) 10%, var(--surface-1))'
                    : 'var(--surface-1)',
                  color: 'var(--text-1)',
                  fontSize: 'var(--font-size-1)',
                }}
              />
              <div
                style={{ width: '24px', display: 'flex', justifyContent: 'center' }}
              >
                {field.verified_at && (
                  <span
                    title={`Verified on ${new Date(field.verified_at).toLocaleDateString()}`}
                  >
                    <Check size={18} style={{ color: 'var(--green-6)' }} />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Verification Info */}
        <details
          style={{
            marginTop: 'var(--size-4)',
            borderTop: '1px solid var(--surface-3)',
            paddingTop: 'var(--size-4)',
          }}
        >
          <summary
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-2)',
              color: 'var(--text-1)',
              fontSize: 'var(--font-size-1)',
              fontWeight: 'var(--font-weight-6)',
              cursor: 'pointer',
              listStyle: 'none',
            }}
          >
            <ChevronDown size={18} className="details-chevron" />
            Link Verification
          </summary>

          <div style={{ marginTop: 'var(--size-3)' }}>
            <p
              style={{
                fontSize: 'var(--font-size-0)',
                color: 'var(--text-2)',
                marginBottom: 'var(--size-3)',
                lineHeight: 1.5,
              }}
            >
              You can verify yourself as the owner of the links in your profile
              metadata. For this, the linked website must contain a link back to
              your Mastodon profile. The link back must have a{' '}
              <code
                style={{
                  background: 'var(--surface-3)',
                  padding: '2px 4px',
                  borderRadius: '4px',
                }}
              >
                rel=&quot;me&quot;
              </code>{' '}
              attribute.
            </p>

            <div
              style={{
                background: 'var(--surface-2)',
                borderRadius: 'var(--radius-2)',
                paddingBlock: 'var(--size-3)',
                display: 'flex',
                placeItems: 'center',
              }}
            >
              <code
                style={{
                  fontSize: 'var(--font-size-0)',
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  paddingRight: 'var(--size-8)',
                  overflow: 'auto',
                }}
              >
                {`<a rel="me" href="${profileUrl}">Mastodon</a>`}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `<a rel="me" href="${profileUrl}">Mastodon</a>`
                  );
                }}
                style={{
                  background: 'var(--surface-3)',
                  border: 'none',
                  borderRadius: 'var(--radius-1)',
                  padding: 'var(--size-1)',
                  cursor: 'pointer',
                  color: 'var(--text-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Copy to clipboard"
              >
                <Copy size={14} />
              </button>
            </div>

            <p
              style={{
                fontSize: 'var(--font-size-0)',
                color: 'var(--text-2)',
                marginTop: 'var(--size-3)',
                lineHeight: 1.5,
              }}
            >
              <strong>Tip:</strong> The link on your website can be invisible. The
              important part is{' '}
              <code
                style={{
                  background: 'var(--surface-3)',
                  padding: '2px 4px',
                  borderRadius: '4px',
                }}
              >
                rel=&quot;me&quot;
              </code>{' '}
              which prevents impersonation.
            </p>
          </div>
        </details>
      </Card>
    </>
  );
}
