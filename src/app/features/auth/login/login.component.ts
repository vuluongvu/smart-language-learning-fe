import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { OqIconComponent } from '../../../shared/components';
import { I18nService, TranslatePipe } from '../../../shared/i18n';
import { GoogleIdentityService } from '../../../shared/services/google-identity.service';
import { ThemeService } from '../../../shared/services/theme.service';
import { detectBrowserTimezone, extractApiError } from '../../../shared/utils/api-error.util';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, OqIconComponent, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: '../auth-page.scss',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly googleIdentity = inject(GoogleIdentityService);
  private readonly router = inject(Router);
  protected readonly themeService = inject(ThemeService);
  protected readonly i18n = inject(I18nService);

  protected readonly googleClientId = signal<string | null>(
    environment.googleClientId.trim() || null,
  );
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  @ViewChild('googleBtnContainer')
  set googleBtnContainerRef(ref: ElementRef<HTMLElement> | undefined) {
    const clientId = this.googleClientId();
    if (ref && clientId) {
      this.googleIdentity.renderButton(
        ref.nativeElement,
        clientId,
        (idToken) => this.handleGoogleCredential(idToken),
        { text: 'signin_with' },
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

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        void this.router.navigate(['/dashboard']);
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi' ? 'Không thể đăng nhập' : 'Unable to sign in',
          ),
        );
      },
    });
  }

  private handleGoogleCredential(idToken: string): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.googleLogin(idToken, detectBrowserTimezone()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        void this.router.navigate(['/dashboard']);
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi' ? 'Đăng nhập Google thất bại' : 'Google sign-in failed',
          ),
        );
      },
    });
  }
}
