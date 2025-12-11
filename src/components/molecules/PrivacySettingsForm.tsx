import { Control, Controller } from 'react-hook-form';
import { Card, CheckboxField } from '@/components/atoms';
import type { ProfileFormData } from '@/schemas/profileFormSchema';

interface PrivacySettingsFormProps {
  control: Control<ProfileFormData>;
}

export function PrivacySettingsForm({ control }: PrivacySettingsFormProps) {
  return (
    <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
      <h2
        style={{
          fontSize: 'var(--font-size-3)',
          fontWeight: 'var(--font-weight-6)',
          marginBottom: 'var(--size-4)',
        }}
      >
        Privacy & Preferences
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-3)' }}>
        <Controller
          name="locked"
          control={control}
          render={({ field }) => (
            <CheckboxField
              id="locked"
              label="Locked Account"
              description="Manually approve followers"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="bot"
          control={control}
          render={({ field }) => (
            <CheckboxField
              id="bot"
              label="Bot Account"
              description="This account mainly performs automated actions"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="discoverable"
          control={control}
          render={({ field }) => (
            <CheckboxField
              id="discoverable"
              label="Suggest Account to Others"
              description="Allow your account to be discovered"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </Card>
  );
}
