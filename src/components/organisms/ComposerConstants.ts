'use client';

import { Globe, Lock, Users, Mail } from 'lucide-react';
import { Visibility } from '@/components/molecules/VisibilitySettingsModal';

export const MAX_CHAR_COUNT = 500;

export const getVisibilityOptions = (t: (key: string) => string) => [
    { value: 'public' as Visibility, label: t('visibilityOptions.public'), icon: Globe, description: t('visibilityOptions.publicDesc') },
    { value: 'unlisted' as Visibility, label: t('visibilityOptions.unlisted'), icon: Lock, description: t('visibilityOptions.unlistedDesc') },
    { value: 'private' as Visibility, label: t('visibilityOptions.private'), icon: Users, description: t('visibilityOptions.privateDesc') },
    { value: 'direct' as Visibility, label: t('visibilityOptions.direct'), icon: Mail, description: t('visibilityOptions.directDesc') },
];
