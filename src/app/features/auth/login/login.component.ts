import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ThemeService } from '../../../shared/services/theme.service';
import { detectBrowserTimezone, extractApiError } from '../../../shared/utils/api-error.util';
import { AuthService } from '../auth.service';

interface GoogleAccountsId {
  initialize: (options: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: { theme?: string; size?: string; width?: number },
  ) => void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: '../auth-page.scss',
})
export class LoginComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  protected readonly themeService = inject(ThemeService);

  @ViewChild('googleBtnContainer')
  private readonly googleBtnContainer?: ElementRef<HTMLElement>;

  protected readonly googleClientId = environment.googleClientId.trim();
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngAfterViewInit(): void {
    if (this.googleClientId && this.googleBtnContainer) {
      this.initGoogleSignIn(this.googleBtnContainer.nativeElement);
    }
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
        this.errorMessage.set(extractApiError(err, 'Unable to sign in'));
      },
    });
  }

  private initGoogleSignIn(container: HTMLElement): void {
    const render = () => {
      const gsi = window.google?.accounts?.id;
      if (!gsi) return;
      gsi.initialize({
        client_id: this.googleClientId,
        callback: (response) => {
          if (!response.credential) return;
          this.ngZone.run(() => this.handleGoogleCredential(response.credential!));
        },
      });
      gsi.renderButton(container, {
        theme: 'outline',
        size: 'large',
        width: 340,
      });
    };

    if (window.google?.accounts?.id) {
      render();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener('load', render, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);
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
        this.errorMessage.set(extractApiError(err, 'Google sign-in failed'));
      },
    });
  }
}
