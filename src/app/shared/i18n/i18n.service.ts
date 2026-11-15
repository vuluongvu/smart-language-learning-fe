import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { EN_TRANSLATIONS, TxKey, VI_TRANSLATIONS } from './translations';

export type AppLocale = 'en' | 'vi';

const LANG_STORAGE_KEY = 'openquiz_lang';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  readonly lang = signal<AppLocale>(this.loadInitialLang());

  constructor() {
    this.applyHtmlLang(this.lang());
  }

  toggleLang(): void {
    const next: AppLocale = this.lang() === 'en' ? 'vi' : 'en';
    this.setLang(next);
  }

  setLang(next: AppLocale): void {
    this.lang.set(next);
    this.applyHtmlLang(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // Ignore storage failures in restricted contexts
    }
  }

  t(key: TxKey, params?: Record<string, string | number>): string {
    const locale = this.lang();
    const dict = locale === 'vi' ? VI_TRANSLATIONS : EN_TRANSLATIONS;
    let template: string = dict[key] ?? EN_TRANSLATIONS[key] ?? key;

    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        template = template.replaceAll(`{{${paramKey}}}`, String(paramValue));
      }
    }
    return template;
  }

  private loadInitialLang(): AppLocale {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return saved === 'vi' ? 'vi' : 'en';
    } catch {
      return 'en';
    }
  }

  private applyHtmlLang(lang: AppLocale): void {
    this.document.documentElement.setAttribute('lang', lang);
  }
}
