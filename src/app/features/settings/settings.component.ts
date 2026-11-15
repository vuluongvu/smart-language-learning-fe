import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OqIconComponent, OqPageHeaderComponent } from '../../shared/components';
import { I18nService, TranslatePipe } from '../../shared/i18n';
import { ThemeService } from '../../shared/services/theme.service';
import { COMMON_TIMEZONES, extractApiError } from '../../shared/utils/api-error.util';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, OqPageHeaderComponent, OqIconComponent, TranslatePipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  protected readonly i18n = inject(I18nService);

  protected readonly timezoneOptions = signal<string[]>([...COMMON_TIMEZONES]);
  protected readonly profileBusy = signal(false);
  protected readonly profileMessage = signal<string | null>(null);
  protected readonly profileError = signal<string | null>(null);

  protected readonly passwordBusy = signal(false);
  protected readonly passwordMessage = signal<string | null>(null);
  protected readonly passwordError = signal<string | null>(null);

  protected readonly showDeleteConfirm = signal(false);
  protected readonly deleteBusy = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected readonly profileForm = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.maxLength(100)]],
    avatarUrl: ['', [Validators.maxLength(500)]],
    timezone: ['UTC', [Validators.required]],
    isLeaderboardVisible: [true],
  });

  protected readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: [''],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    confirmPassword: ['', [Validators.required]],
  });

  protected readonly deleteForm = this.fb.nonNullable.group({
    currentPassword: [''],
  });

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) {
      if (!COMMON_TIMEZONES.includes(user.timezone)) {
        this.timezoneOptions.set([user.timezone, ...COMMON_TIMEZONES]);
      }
      this.profileForm.patchValue({
        displayName: user.displayName,
        avatarUrl: user.avatarUrl ?? '',
        timezone: user.timezone,
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
        timezone: raw.timezone,
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

  deleteAccount(): void {
    this.deleteBusy.set(true);
    this.deleteError.set(null);
    const currentPassword = this.deleteForm.getRawValue().currentPassword;

    this.authService
      .deleteAccount({
        confirm: true,
        currentPassword: currentPassword || undefined,
      })
      .subscribe({
        next: () => {
          this.deleteBusy.set(false);
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
}
