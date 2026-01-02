import { cookies } from 'next/headers';
import { SettingsClient } from './SettingsClient';

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value as 'light' | 'dark' | undefined;
  const initialTheme = theme ?? 'auto';

  return <SettingsClient initialTheme={initialTheme} />;
}
