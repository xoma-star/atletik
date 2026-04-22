'use client';

import {createContext, useContext, type ReactNode} from 'react';
import type {Locale, Translations} from '@/lib/i18n';

type LocaleContextValue = {locale: Locale; t: Translations};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useT(): Translations {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useT вызван вне LocaleProvider');
  return ctx.t;
}

export function useLocale(): Locale {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale вызван вне LocaleProvider');
  return ctx.locale;
}

export function LocaleProvider({locale, t, children}: {locale: Locale; t: Translations; children: ReactNode}) {
  return <LocaleContext.Provider value={{locale, t}}>{children}</LocaleContext.Provider>;
}
