import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { OqIconComponent } from '../../../shared/components';
import { I18nService, TranslatePipe } from '../../../shared/i18n';
import { GoogleIdentityService } from '../../../shared/services/google-identity.service';
import { ThemeService } from '../../../shared/services/theme.service';
import {
  COMMON_TIMEZONES,
  detectBrowserTimezone,
  extractApiError,
} from '../../../shared/utils/api-error.util';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, OqIconComponent, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrl: '../auth-page.scss',
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly googleIdentity = inject(GoogleIdentityService);
  private readonly router = inject(Router);
  protected readonly themeService = inject(ThemeService);
  protected readonly i18n = inject(I18nService);

  private readonly detectedTimezone = detectBrowserTimezone();
  protected readonly timezoneOptions = Array.from(
    new Set([this.detectedTimezone, ...COMMON_TIMEZONES]),
  );

  protected readonly googleClientId = signal<string | null>(
    environment.googleClientId.trim() || null,
  );
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    timezone: [this.detectedTimezone, [Validators.required]],
  });

  @ViewChild('googleBtnContainer')
  set googleBtnContainerRef(ref: ElementRef<HTMLElement> | undefined) {
    const clientId = this.googleClientId();
    if (ref && clientId) {
      this.googleIdentity.renderButton(
        ref.nativeElement,
        clientId,
        (idToken) => this.handleGoogleCredential(idToken),
        { text: 'signup_with' },
      );
    }
  }

  ngOnInit(): void {
    this.googleIdentity.resolveClientId().subscribe((clientId) => {
      this.googleClientId.set(clientId);
    });
  }

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
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi' ? 'Không thể tạo tài khoản' : 'Unable to create account',
          ),
        );
      },
    });
  }

  private handleGoogleCredential(idToken: string): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const selectedTimezone = this.form.controls.timezone.value || this.detectedTimezone;
    this.authService.googleLogin(idToken, selectedTimezone).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        void this.router.navigate(['/dashboard']);
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi' ? 'Đăng ký bằng Google thất bại' : 'Google sign-up failed',
          ),
        );
      },
    });
  }
}
