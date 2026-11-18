import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from '../../features/auth/auth.service';
import {
  LEARNING_LANGUAGE_OPTIONS,
  LearningLanguageCode,
  isLearningLanguageCode,
} from '../types/learning-language.types';

const STORAGE_KEY = 'argon_learning_course';

@Injectable({ providedIn: 'root' })
export class LearningLanguageService {
  private readonly auth = inject(AuthService, { optional: true });
  private readonly activeLangSignal = signal<LearningLanguageCode>(readStoredLanguage());
  private lastSyncedUserId: number | null = null;
  private lastSyncedRemoteLang: LearningLanguageCode | null = null;
  private syncingRemote = false;

  readonly activeLang = this.activeLangSignal.asReadonly();
  readonly isKorean = computed(() => this.activeLangSignal() === 'ko');
  readonly isEnglish = computed(() => this.activeLangSignal() === 'en');
  readonly activeOption = computed(
    () =>
      LEARNING_LANGUAGE_OPTIONS.find((item) => item.code === this.activeLangSignal()) ??
      LEARNING_LANGUAGE_OPTIONS[0],
  );
  readonly options = LEARNING_LANGUAGE_OPTIONS;

  constructor() {
    effect(() => {
      const user = this.auth?.user?.() ?? null;
      if (!user) {
        this.lastSyncedUserId = null;
        this.lastSyncedRemoteLang = null;
        return;
      }

      const remoteLang = isLearningLanguageCode(user.learningLanguage)
        ? user.learningLanguage
        : null;
      const userChanged = this.lastSyncedUserId !== user.id;
      const remoteChanged = remoteLang !== null && remoteLang !== this.lastSyncedRemoteLang;

      this.lastSyncedUserId = user.id;
      if (remoteLang) {
        this.lastSyncedRemoteLang = remoteLang;
      }

      if ((userChanged || remoteChanged) && remoteLang && !this.syncingRemote) {
        this.activeLangSignal.set(remoteLang);
        persistLanguage(remoteLang);
      }
    });
  }

  setLanguage(lang: LearningLanguageCode): void {
    this.activeLangSignal.set(lang);
    persistLanguage(lang);

    const user = this.auth?.user?.() ?? null;
    if (user && typeof this.auth?.updateProfile === 'function' && user.learningLanguage !== lang) {
      this.syncingRemote = true;
      this.auth.updateProfile({ learningLanguage: lang }).subscribe({
        next: (updated) => {
          this.syncingRemote = false;
          if (isLearningLanguageCode(updated.learningLanguage)) {
            this.lastSyncedRemoteLang = updated.learningLanguage;
          }
        },
        error: () => {
          this.syncingRemote = false;
        },
      });
    }
  }

  toggleLanguage(): void {
    this.setLanguage(this.activeLangSignal() === 'en' ? 'ko' : 'en');
  }
}

function readStoredLanguage(): LearningLanguageCode {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return isLearningLanguageCode(raw) ? raw : 'en';
  } catch {
    return 'en';
  }
}

function persistLanguage(lang: LearningLanguageCode): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, lang);
  } catch {
    // Ignore storage errors in restricted browsing contexts
  }
}
