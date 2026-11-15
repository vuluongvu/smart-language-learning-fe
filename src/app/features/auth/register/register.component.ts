import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../../shared/services/theme.service';
import { OqIconComponent } from '../../../shared/components';
import {
  COMMON_TIMEZONES,
  detectBrowserTimezone,
  extractApiError,
} from '../../../shared/utils/api-error.util';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, OqIconComponent],
  templateUrl: './register.component.html',
  styleUrl: '../auth-page.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly themeService = inject(ThemeService);

  private readonly detectedTimezone = detectBrowserTimezone();
  protected readonly timezoneOptions = Array.from(
    new Set([this.detectedTimezone, ...COMMON_TIMEZONES]),
  );

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    timezone: [this.detectedTimezone, [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        void this.router.navigate(['/dashboard']);
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(extractApiError(err, 'Unable to create account'));
      },
    });
  }
}
