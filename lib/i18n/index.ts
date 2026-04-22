import {match} from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import type {Translations} from './types';
import ru from './ru';
import en from './en';

export type {Translations} from './types';

export const SUPPORTED_LOCALES = ['ru', 'en'] as const;
export const DEFAULT_LOCALE = 'ru' as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

const translations: Record<Locale, Translations> = {ru, en};

export function getTranslations(locale: Locale): Translations {
  return translations[locale] ?? translations[DEFAULT_LOCALE];
}

export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  try {
    const headers = {'accept-language': acceptLanguage};
    const languages = new Negotiator({headers}).languages();
    return match(languages, SUPPORTED_LOCALES as unknown as string[], DEFAULT_LOCALE) as Locale;
  } catch {
    return DEFAULT_LOCALE;
  }
}
