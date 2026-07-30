'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type ButtonHTMLAttributes } from 'react';
import { IconButton } from './IconButton';

interface BackButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Overrides the default `router.back()` behaviour. */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  size?: number;
  buttonSize?: 'small' | 'medium' | 'large';
}

/**
 * Back navigation control.
 *
 * Exists so the accessible name is declared once. These were previously written
 * inline as `<IconButton><ArrowLeft /></IconButton>` in ~24 files, none of which
 * carried a label — a screen reader announced each as an unlabelled "button".
 */
export function BackButton({
  onClick,
  size = 20,
  buttonSize = 'medium',
  ...props
}: BackButtonProps) {
  const router = useRouter();
  const t = useTranslations('common');

  return (
    <IconButton
      {...props}
      size={buttonSize}
      aria-label={t('back')}
      onClick={onClick ?? (() => router.back())}
    >
      <ArrowLeft size={size} />
    </IconButton>
  );
}
