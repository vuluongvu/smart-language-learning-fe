import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OqIconComponent, OqPageHeaderComponent } from '../../shared/components';
import { I18nService, TranslatePipe } from '../../shared/i18n';
import { GoogleIdentityService } from '../../shared/services/google-identity.service';
import { LearningLanguageService } from '../../shared/services/learning-language.service';
import { ThemeService } from '../../shared/services/theme.service';
import { DeleteAccountRequest } from '../../shared/types/auth.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { AuthService } from '../auth/auth.service';
import {
  DELETE_ACCOUNT_COOLDOWN_SECONDS,
  DeleteAccountModalComponent,
} from './delete-account-modal/delete-account-modal.component';

export { DELETE_ACCOUNT_COOLDOWN_SECONDS };

@Component({
  selector: 'app-settings',
  imports: [
    ReactiveFormsModule,
    OqPageHeaderComponent,
    OqIconComponent,
    DeleteAccountModalComponent,
    TranslatePipe,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly googleIdentity = inject(GoogleIdentityService);
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  protected readonly i18n = inject(I18nService);
  protected readonly learningLang = inject(LearningLanguageService);

  protected readonly profileBusy = signal(false);
  protected readonly profileMessage = signal<string | null>(null);
  protected readonly profileError = signal<string | null>(null);

  protected readonly passwordBusy = signal(false);
  protected readonly passwordMessage = signal<string | null>(null);
  protected readonly passwordError = signal<string | null>(null);

  protected readonly googleClientId = signal<string | null>(null);
  protected readonly googleBusy = signal(false);
  protected readonly googleMessage = signal<string | null>(null);
  protected readonly googleError = signal<string | null>(null);
  protected readonly isGoogleLinked = computed(() =>
    Boolean(this.authService.user()?.linkedProviders.includes('google')),
  );

  protected readonly dangerZoneExpanded = signal(false);
  protected readonly showDeleteModal = signal(false);
  protected readonly deleteBusy = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected readonly userEmail = computed(() => this.authService.user()?.email ?? '');
  protected readonly hasPassword = computed(() => Boolean(this.authService.user()?.hasPassword));

  @ViewChild('googleLinkContainer')
  set googleLinkContainerRef(ref: ElementRef<HTMLElement> | undefined) {
    const clientId = this.googleClientId();
    if (ref && clientId && !this.isGoogleLinked()) {
      this.googleIdentity.renderButton(
        ref.nativeElement,
        clientId,
        (idToken) => this.linkGoogle(idToken),
        { text: 'continue_with', width: 280 },
      );
    }
  }

  protected readonly profileForm = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.maxLength(100)]],
    avatarUrl: ['', [Validators.maxLength(500)]],
    isLeaderboardVisible: [true],
  });

  protected readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: [''],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.googleIdentity.resolveClientId().subscribe((clientId) => {
      this.googleClientId.set(clientId);
    });

    const user = this.authService.user();
    if (user) {
      this.profileForm.patchValue({
        displayName: user.displayName,
        avatarUrl: user.avatarUrl ?? '',
        isLeaderboardVisible: user.isLeaderboardVisible,
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const raw = this.profileForm.getRawValue();
    this.profileBusy.set(true);
    this.profileMessage.set(null);
    this.profileError.set(null);

    this.authService
      .updateProfile({
        displayName: raw.displayName.trim(),
        avatarUrl: raw.avatarUrl.trim() ? raw.avatarUrl.trim() : null,
        isLeaderboardVisible: raw.isLeaderboardVisible,
      })
      .subscribe({
        next: () => {
          this.profileBusy.set(false);
          this.profileMessage.set(
            this.i18n.lang() === 'vi'
              ? 'Đã cập nhật hồ sơ thành công.'
              : 'Profile updated successfully.',
          );
        },
        error: (err: unknown) => {
          this.profileBusy.set(false);
          this.profileError.set(
            extractApiError(
              err,
              this.i18n.lang() === 'vi' ? 'Không thể cập nhật hồ sơ' : 'Failed to update profile',
            ),
          );
        },
      });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const raw = this.passwordForm.getRawValue();
    if (raw.newPassword !== raw.confirmPassword) {
      this.passwordError.set(
        this.i18n.lang() === 'vi'
          ? 'Mật khẩu mới và xác nhận mật khẩu không khớp.'
          : 'New password and confirmation do not match.',
      );
      return;
    }

    this.passwordBusy.set(true);
    this.passwordMessage.set(null);
    this.passwordError.set(null);

    this.authService
      .changePassword({
        currentPassword: raw.currentPassword || undefined,
        newPassword: raw.newPassword,
        confirmPassword: raw.confirmPassword,
      })
      .subscribe({
        next: (res) => {
          this.passwordBusy.set(false);
          this.passwordMessage.set(res.message);
          this.passwordForm.reset();
        },
        error: (err: unknown) => {
          this.passwordBusy.set(false);
          this.passwordError.set(
            extractApiError(
              err,
              this.i18n.lang() === 'vi'
                ? 'Không thể cập nhật mật khẩu'
                : 'Failed to update password',
            ),
          );
        },
      });
  }

  toggleDangerZone(): void {
    this.dangerZoneExpanded.update((expanded) => !expanded);
  }

  openDeleteModal(): void {
    this.deleteError.set(null);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    if (this.deleteBusy()) {
      return;
    }
    this.showDeleteModal.set(false);
    this.deleteError.set(null);
  }

  deleteAccount(payload: DeleteAccountRequest): void {
    if (this.deleteBusy()) {
      return;
    }

    this.deleteBusy.set(true);
    this.deleteError.set(null);

    this.authService.deleteAccount(payload).subscribe({
      next: () => {
        this.deleteBusy.set(false);
        this.showDeleteModal.set(false);
        void this.router.navigate(['/login']);
      },
      error: (err: unknown) => {
        this.deleteBusy.set(false);
        this.deleteError.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi' ? 'Không thể xóa tài khoản' : 'Failed to delete account',
          ),
        );
      },
    });
  }

  linkGoogle(idToken: string): void {
    if (this.googleBusy()) {
      return;
    }
    this.googleBusy.set(true);
    this.googleMessage.set(null);
    this.googleError.set(null);

    this.authService.linkGoogle(idToken).subscribe({
      next: (res) => {
        this.googleBusy.set(false);
        this.googleMessage.set(res.message);
      },
      error: (err: unknown) => {
        this.googleBusy.set(false);
        this.googleError.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể liên kết tài khoản Google'
              : 'Failed to link Google account',
          ),
        );
      },
    });
  }

  unlinkGoogle(): void {
    if (this.googleBusy() || !this.authService.user()?.hasPassword) {
      return;
    }
    this.googleBusy.set(true);
    this.googleMessage.set(null);
    this.googleError.set(null);

    this.authService.unlinkGoogle().subscribe({
      next: (res) => {
        this.googleBusy.set(false);
        this.googleMessage.set(res.message);
      },
      error: (err: unknown) => {
        this.googleBusy.set(false);
        this.googleError.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể hủy liên kết Google'
              : 'Failed to unlink Google account',
          ),
        );
      },
    });
  }
}
