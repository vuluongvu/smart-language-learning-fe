import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { I18nService } from '../../shared/i18n';
import { GoogleIdentityService } from '../../shared/services/google-identity.service';
import { ThemeService } from '../../shared/services/theme.service';
import { UserProfile } from '../../shared/types/auth.types';
import { AuthService } from '../auth/auth.service';
import { DELETE_ACCOUNT_COOLDOWN_SECONDS, SettingsComponent } from './settings.component';

@Component({ template: '' })
class DummyLoginComponent {}

function createUser(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 1,
    email: 'learner@example.com',
    displayName: 'Learner',
    avatarUrl: null,
    timezone: 'Asia/Ho_Chi_Minh',
    isLeaderboardVisible: true,
    role: 'user',
    hasPassword: true,
    linkedProviders: ['local'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('SettingsComponent', () => {
  const userSignal = signal<UserProfile | null>(createUser());
  let deleteAccountSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.useFakeTimers();
    localStorage.clear();
    userSignal.set(createUser());
    deleteAccountSpy = vi.fn(() => of({ message: 'Account deleted successfully' }));

    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        provideRouter([{ path: 'login', component: DummyLoginComponent }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            user: userSignal.asReadonly(),
            updateProfile: vi.fn(),
            changePassword: vi.fn(),
            deleteAccount: deleteAccountSpy,
            linkGoogle: vi.fn(),
            unlinkGoogle: vi.fn(),
          },
        },
        {
          provide: GoogleIdentityService,
          useValue: {
            resolveClientId: vi.fn(() => of(null)),
            renderButton: vi.fn(),
          },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('switches theme between light and dark mode', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    const themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();

    expect(themeService.theme()).toBe('light');
    themeService.setTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('hides account deletion controls inside a collapsed Danger Zone by default', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('[data-testid="open-delete-modal-btn"]')).toBeNull();
    expect(el.querySelector('oq-modal')).toBeNull();

    const toggleBtn = el.querySelector<HTMLButtonElement>('[data-testid="danger-zone-toggle"]');
    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('false');

    toggleBtn?.click();
    fixture.detectChanges();

    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('[data-testid="open-delete-modal-btn"]')).not.toBeNull();
  });

  it('requires step 1 acknowledgement, exact email, password, and cooldown before deleting a password account', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    // Expand Danger Zone and open modal
    el.querySelector<HTMLButtonElement>('[data-testid="danger-zone-toggle"]')?.click();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('[data-testid="open-delete-modal-btn"]')?.click();
    fixture.detectChanges();

    // Step 1: Continue button is disabled until irreversibility checkbox is checked
    const continueBtn = el.querySelector<HTMLButtonElement>('[data-testid="delete-continue-btn"]');
    expect(continueBtn?.disabled).toBe(true);

    const ackCheckbox = el.querySelector<HTMLInputElement>('[data-testid="delete-ack-checkbox"]');
    ackCheckbox!.checked = true;
    ackCheckbox!.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(continueBtn?.disabled).toBe(false);

    // Advance to Step 2: countdown starts and final submit is disabled
    continueBtn?.click();
    fixture.detectChanges();

    expect(el.querySelector('[data-testid="delete-cooldown-banner"]')).not.toBeNull();
    const submitBtn = el.querySelector<HTMLButtonElement>(
      '[data-testid="delete-final-submit-btn"]',
    );
    expect(submitBtn?.disabled).toBe(true);

    // Fill matching email (mixed case) and password while countdown is still running
    const emailInput = el.querySelector<HTMLInputElement>(
      '[data-testid="delete-confirm-email-input"]',
    )!;
    emailInput.value = '  LEARNER@Example.com ';
    emailInput.dispatchEvent(new Event('input'));

    const passwordInput = el.querySelector<HTMLInputElement>(
      '[data-testid="delete-password-input"]',
    )!;
    passwordInput.value = 'StrongPass123!';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Still locked during safety countdown
    expect(submitBtn?.disabled).toBe(true);
    expect(deleteAccountSpy).not.toHaveBeenCalled();

    // Complete 5-second safety countdown
    vi.advanceTimersByTime(DELETE_ACCOUNT_COOLDOWN_SECONDS * 1000);
    fixture.detectChanges();

    expect(el.querySelector('[data-testid="delete-cooldown-banner"]')).toBeNull();
    expect(submitBtn?.disabled).toBe(false);

    // Submit deletion
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    submitBtn?.click();
    fixture.detectChanges();

    expect(deleteAccountSpy).toHaveBeenCalledTimes(1);
    expect(deleteAccountSpy).toHaveBeenCalledWith({
      confirm: true,
      confirmEmail: 'LEARNER@Example.com',
      currentPassword: 'StrongPass123!',
    });
    expect(navSpy).toHaveBeenCalledWith(['/login']);
  });

  it('requires confirmation email, typed phrase, and cooldown for Google-only accounts without a password', () => {
    userSignal.set(
      createUser({
        email: 'google.user@example.com',
        hasPassword: false,
        linkedProviders: ['google'],
      }),
    );

    const fixture = TestBed.createComponent(SettingsComponent);
    const i18n = TestBed.inject(I18nService);
    i18n.setLang('vi');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    // Open Danger Zone -> Modal -> Step 1 -> Step 2
    el.querySelector<HTMLButtonElement>('[data-testid="danger-zone-toggle"]')?.click();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('[data-testid="open-delete-modal-btn"]')?.click();
    fixture.detectChanges();

    const ackCheckbox = el.querySelector<HTMLInputElement>('[data-testid="delete-ack-checkbox"]')!;
    ackCheckbox.checked = true;
    ackCheckbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('[data-testid="delete-continue-btn"]')?.click();
    fixture.detectChanges();

    // Password input is absent; confirmation phrase input is shown instead
    expect(el.querySelector('[data-testid="delete-password-input"]')).toBeNull();
    const phraseInput = el.querySelector<HTMLInputElement>(
      '[data-testid="delete-confirm-phrase-input"]',
    )!;
    expect(phraseInput).not.toBeNull();

    // Wait out cooldown first
    vi.advanceTimersByTime(DELETE_ACCOUNT_COOLDOWN_SECONDS * 1000);
    fixture.detectChanges();

    const emailInput = el.querySelector<HTMLInputElement>(
      '[data-testid="delete-confirm-email-input"]',
    )!;
    emailInput.value = 'google.user@example.com';
    emailInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitBtn = el.querySelector<HTMLButtonElement>(
      '[data-testid="delete-final-submit-btn"]',
    )!;
    // Still disabled without matching phrase
    expect(submitBtn.disabled).toBe(true);

    // Wrong phrase keeps button disabled
    phraseInput.value = 'xoa';
    phraseInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(submitBtn.disabled).toBe(true);

    // Accent-insensitive Vietnamese phrase matches "XOA TAI KHOAN"
    phraseInput.value = 'Xóa tài khoản';
    phraseInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(submitBtn.disabled).toBe(false);

    submitBtn.click();
    fixture.detectChanges();

    expect(deleteAccountSpy).toHaveBeenCalledTimes(1);
    expect(deleteAccountSpy).toHaveBeenCalledWith({
      confirm: true,
      confirmEmail: 'google.user@example.com',
      currentPassword: undefined,
    });
  });

  it('resets modal state and stops countdown when closed', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    el.querySelector<HTMLButtonElement>('[data-testid="danger-zone-toggle"]')?.click();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('[data-testid="open-delete-modal-btn"]')?.click();
    fixture.detectChanges();

    const ackCheckbox = el.querySelector<HTMLInputElement>('[data-testid="delete-ack-checkbox"]')!;
    ackCheckbox.checked = true;
    ackCheckbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('[data-testid="delete-continue-btn"]')?.click();
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('[data-testid="delete-cancel-btn"]')?.click();
    fixture.detectChanges();

    expect(el.querySelector('oq-modal')).toBeNull();

    // Reopening starts clean at Step 1 with unchecked box
    el.querySelector<HTMLButtonElement>('[data-testid="open-delete-modal-btn"]')?.click();
    fixture.detectChanges();

    const reopenedAck = el.querySelector<HTMLInputElement>('[data-testid="delete-ack-checkbox"]');
    expect(reopenedAck?.checked).toBe(false);
    expect(
      el.querySelector<HTMLButtonElement>('[data-testid="delete-continue-btn"]')?.disabled,
    ).toBe(true);
  });
});
