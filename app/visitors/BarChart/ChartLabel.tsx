'use client';

import {useT, useLocale} from '../LocaleContext';
import {getDayLabel} from './dayUtils';

type Props = {
  /** День недели (0 = воскресенье … 6 = суббота), отображается в подписи заголовка. */
  selectedDow: number;
};

export function ChartLabel({selectedDow}: Props) {
  const t = useT();
  const locale = useLocale();

  return (
    <div className="font-mono text-[10px] md:text-[11px] tracking-[0.08em] uppercase">
      {t.avgLoad} · <span className="opacity-60">({getDayLabel(selectedDow, locale, 'long')})</span>
    </div>
  );
}
