import { Control, Controller } from 'react-hook-form';
import { Card, CheckboxField } from '@/components/atoms';
import type { ProfileFormData } from '@/schemas/profileFormSchema';

import { useTranslations } from 'next-intl';

interface PrivacySettingsFormProps {
  control: Control<ProfileFormData>;
}

export function PrivacySettingsForm({ control }: PrivacySettingsFormProps) {
  const t = useTranslations('settings.preferencesPage');

  return (
    <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
      <h2
        style={{
          fontSize: 'var(--font-size-3)',
          fontWeight: 'var(--font-weight-6)',
          marginBottom: 'var(--size-4)',
        }}
      >
        {t('privacy')}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-3)' }}>
        <Controller
          name="locked"
          control={control}
          render={({ field }) => (
            <CheckboxField
              id="locked"
              label={t('lockedAccount')}
              description={t('lockedAccountDesc')}
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
              label={t('botAccount')}
              description={t('botAccountDesc')}
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
              label={t('discoverable')}
              description={t('discoverableDesc')}
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </Card>
  );
}
