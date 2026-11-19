import { Component, OnDestroy, computed, inject, input, output, signal } from '@angular/core';
import { OqIconComponent, OqModalComponent } from '../../../shared/components';
import { I18nService, TranslatePipe } from '../../../shared/i18n';
import { DeleteAccountRequest } from '../../../shared/types/auth.types';

export const DELETE_ACCOUNT_COOLDOWN_SECONDS = 5;

function normalizeConfirmationPhrase(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

@Component({
  selector: 'app-delete-account-modal',
  imports: [OqIconComponent, OqModalComponent, TranslatePipe],
  templateUrl: './delete-account-modal.component.html',
  styleUrl: './delete-account-modal.component.scss',
})
export class DeleteAccountModalComponent implements OnDestroy {
  private readonly i18n = inject(I18nService);
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  readonly email = input.required<string>();
  readonly hasPassword = input.required<boolean>();
  readonly busy = input<boolean>(false);
  readonly error = input<string | null>(null);

  readonly closed = output<void>();
  readonly errorCleared = output<void>();
  readonly confirmed = output<DeleteAccountRequest>();

  protected readonly step = signal<1 | 2>(1);
  protected readonly acknowledged = signal(false);
  protected readonly confirmEmail = signal('');
  protected readonly confirmPhrase = signal('');
  protected readonly currentPassword = signal('');
  protected readonly countdown = signal(0);

  protected readonly expectedPhrase = computed(() =>
    this.i18n.lang() === 'vi' ? 'XOA TAI KHOAN' : 'DELETE MY ACCOUNT',
  );

  protected readonly isEmailMatch = computed(() => {
    const target = this.email().trim().toLowerCase();
    const typed = this.confirmEmail().trim().toLowerCase();
    return target.length > 0 && typed === target;
  });

  protected readonly isPhraseMatch = computed(() => {
    const expected = normalizeConfirmationPhrase(this.expectedPhrase());
    const typed = normalizeConfirmationPhrase(this.confirmPhrase());
    return typed.length > 0 && typed === expected;
  });

  protected readonly canSubmit = computed(() => {
    if (
      this.busy() ||
      this.step() !== 2 ||
      !this.acknowledged() ||
      this.countdown() > 0 ||
      !this.isEmailMatch()
    ) {
      return false;
    }

    if (this.hasPassword()) {
      return this.currentPassword().trim().length > 0;
    }

    return this.isPhraseMatch();
  });

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  protected requestClose(): void {
    if (this.busy()) {
      return;
    }
    this.clearCountdown();
    this.closed.emit();
  }

  protected proceedToStep2(): void {
    if (!this.acknowledged()) {
      return;
    }
    this.errorCleared.emit();
    this.step.set(2);
    this.startCountdown();
  }

  protected backToStep1(): void {
    if (this.busy()) {
      return;
    }
    this.clearCountdown();
    this.errorCleared.emit();
    this.step.set(1);
  }

  protected onAckChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.acknowledged.set(input.checked);
  }

  protected onEmailInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.confirmEmail.set(input.value);
    this.errorCleared.emit();
  }

  protected onPhraseInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.confirmPhrase.set(input.value);
    this.errorCleared.emit();
  }

  protected onPasswordInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.currentPassword.set(input.value);
    this.errorCleared.emit();
  }

  protected onFormSubmit(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit()) {
      return;
    }

    this.confirmed.emit({
      confirm: true,
      confirmEmail: this.confirmEmail().trim(),
      currentPassword: this.hasPassword() ? this.currentPassword() : undefined,
    });
  }

  private startCountdown(): void {
    this.clearCountdown();
    this.countdown.set(DELETE_ACCOUNT_COOLDOWN_SECONDS);
    this.countdownTimer = setInterval(() => {
      const next = this.countdown() - 1;
      if (next <= 0) {
        this.countdown.set(0);
        this.clearCountdown();
      } else {
        this.countdown.set(next);
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownTimer !== null) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.countdown.set(0);
  }
}
