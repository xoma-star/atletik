'use client';

import type {Locale, Translations} from '@/lib/i18n';

type Props = {lastUpdated: string; locale: Locale; t: Translations};

export function LastUpdatedAt({lastUpdated, locale, t}: Props) {
  const formatted = new Date(lastUpdated).toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
  return (
    <time className="text-sm text-on-surface" dateTime={new Date(lastUpdated).toISOString()}>
      {t.updatedAt} {formatted}
    </time>
  );
}
