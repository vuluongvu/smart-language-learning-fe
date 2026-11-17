import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';
import { TranslatePipe } from './translate.pipe';
import { EN_TRANSLATIONS, TxKey, VI_TRANSLATIONS } from './translations';

@Component({
  imports: [TranslatePipe],
  template: `
    <span data-testid="nav-label">{{ 'nav.vocabulary' | t }}</span>
    <span data-testid="interpolated">{{ 'common.pageOf' | t: { page: 2, total: 5 } }}</span>
  `,
})
class PipeHostComponent {
  readonly i18n = inject(I18nService);
}

describe('I18nService and TranslatePipe', () => {
  const storageKey = 'openquiz_lang';

  beforeEach(() => {
    localStorage.removeItem(storageKey);
    document.documentElement.setAttribute('lang', 'en');
  });

  afterEach(() => {
    localStorage.removeItem(storageKey);
    document.documentElement.setAttribute('lang', 'en');
    TestBed.resetTestingModule();
  });

  it('defaults to English when localStorage has no saved locale', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(I18nService);

    expect(service.lang()).toBe('en');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
    expect(service.t('nav.dashboard')).toBe('Dashboard');
  });

  it('loads saved Vietnamese locale from localStorage on initialization', () => {
    localStorage.setItem(storageKey, 'vi');
    TestBed.configureTestingModule({});
    const service = TestBed.inject(I18nService);

    expect(service.lang()).toBe('vi');
    expect(document.documentElement.getAttribute('lang')).toBe('vi');
    expect(service.t('nav.dashboard')).toBe(VI_TRANSLATIONS['nav.dashboard']);
  });

  it('switches locale, updates html[lang], and persists preference to localStorage', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(I18nService);

    service.setLang('vi');
    expect(service.lang()).toBe('vi');
    expect(document.documentElement.getAttribute('lang')).toBe('vi');
    expect(localStorage.getItem(storageKey)).toBe('vi');

    service.toggleLang();
    expect(service.lang()).toBe('en');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
    expect(localStorage.getItem(storageKey)).toBe('en');
  });

  it('interpolates parameters in both English and Vietnamese strings', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(I18nService);

    expect(service.t('streak.longest', { days: 7 })).toBe('Longest streak: 7 days');

    service.setLang('vi');
    expect(service.t('streak.longest', { days: 7 })).toBe('Chuỗi dài nhất: 7 ngày');
  });

  it('updates TranslatePipe output reactively when language changes', () => {
    TestBed.configureTestingModule({ imports: [PipeHostComponent] });
    const fixture = TestBed.createComponent(PipeHostComponent);
    fixture.detectChanges();

    const navEl = fixture.nativeElement.querySelector('[data-testid="nav-label"]') as HTMLElement;
    const interpEl = fixture.nativeElement.querySelector(
      '[data-testid="interpolated"]',
    ) as HTMLElement;

    expect(navEl.textContent?.trim()).toBe(EN_TRANSLATIONS['nav.vocabulary']);
    expect(interpEl.textContent?.trim()).toBe('Page 2 of 5');

    fixture.componentInstance.i18n.setLang('vi');
    fixture.detectChanges();

    expect(navEl.textContent?.trim()).toBe(VI_TRANSLATIONS['nav.vocabulary']);
    expect(interpEl.textContent?.trim()).toBe('Trang 2 / 5');
  });

  it('maintains 100% key parity and non-empty strings between EN and VI dictionaries', () => {
    const enKeys = Object.keys(EN_TRANSLATIONS).sort() as TxKey[];
    const viKeys = Object.keys(VI_TRANSLATIONS).sort() as TxKey[];

    expect(viKeys).toEqual(enKeys);
    for (const key of enKeys) {
      expect(EN_TRANSLATIONS[key].trim().length).toBeGreaterThan(0);
      expect(VI_TRANSLATIONS[key].trim().length).toBeGreaterThan(0);
    }
  });
});
