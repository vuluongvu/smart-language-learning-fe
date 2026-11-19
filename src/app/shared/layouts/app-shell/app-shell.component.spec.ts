import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../../features/auth/auth.service';
import { UserProfile } from '../../types/auth.types';
import { ThemeService } from '../../services/theme.service';
import { LearningLanguageService } from '../../services/learning-language.service';
import { AppShellComponent } from './app-shell.component';

describe('AppShellComponent', () => {
  const mockUser = signal<UserProfile | null>({
    id: 1,
    email: 'learner@argonlearning.test',
    displayName: 'Argon Learning Learner',
    avatarUrl: null,
    timezone: 'Asia/Ho_Chi_Minh',
    isLeaderboardVisible: true,
    role: 'USER',
    hasPassword: true,
    linkedProviders: ['local'],
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  });
  const mockTheme = signal<'light' | 'dark'>('light');

  const authServiceMock = {
    user: mockUser.asReadonly(),
    logout: vi.fn(() => of(void 0)),
  };

  const themeServiceMock = {
    theme: mockTheme.asReadonly(),
    toggleTheme: vi.fn(() => {
      mockTheme.update((t) => (t === 'light' ? 'dark' : 'light'));
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockTheme.set('light');

    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ThemeService, useValue: themeServiceMock },
      ],
    }).compileComponents();
  });

  it('renders skip link, main landmark, and navigation aria attributes', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const skipLink = el.querySelector<HTMLAnchorElement>('.oq-skip-link');
    const main = el.querySelector<HTMLElement>('main#main-content');
    const menuBtn = el.querySelector<HTMLButtonElement>('.shell__menu-btn');
    const aside = el.querySelector<HTMLElement>('aside#app-sidebar-nav');

    expect(skipLink?.getAttribute('href')).toBe('#main-content');
    expect(main?.getAttribute('tabindex')).toBe('-1');
    expect(menuBtn?.getAttribute('aria-controls')).toBe('app-sidebar-nav');
    expect(menuBtn?.getAttribute('aria-expanded')).toBe('false');
    expect(aside).not.toBeNull();
  });

  it('opens the mobile drawer and closes it on Escape key', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const menuBtn = el.querySelector<HTMLButtonElement>('.shell__menu-btn');

    menuBtn?.click();
    fixture.detectChanges();
    expect(menuBtn?.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('.shell__sidebar--open')).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(menuBtn?.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('.shell__sidebar--open')).toBeNull();
  });

  it('toggles theme and logs out cleanly', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const themeBtn = el.querySelector<HTMLButtonElement>('.shell__theme-btn');
    themeBtn?.click();
    expect(themeServiceMock.toggleTheme).toHaveBeenCalledTimes(1);

    fixture.componentInstance.logout();
    expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('switches active course between English and Korean from the sidebar switcher', () => {
    localStorage.removeItem('argon_learning_course');
    const fixture = TestBed.createComponent(AppShellComponent);
    const learningLang = TestBed.inject(LearningLanguageService);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const courseButtons = Array.from(el.querySelectorAll<HTMLButtonElement>('.shell__course-btn'));
    expect(courseButtons.length).toBe(2);

    const koBtn = courseButtons.find((btn) => btn.textContent?.includes('한국어'));
    koBtn?.click();
    fixture.detectChanges();

    expect(learningLang.activeLang()).toBe('ko');
    expect(localStorage.getItem('argon_learning_course')).toBe('ko');
    localStorage.removeItem('argon_learning_course');
  });
});
