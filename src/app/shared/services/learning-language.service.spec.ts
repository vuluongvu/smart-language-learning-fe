import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../features/auth/auth.service';
import { UserProfile } from '../types/auth.types';
import { LearningLanguageService } from './learning-language.service';

describe('LearningLanguageService', () => {
  const storageKey = 'argon_learning_course';

  function buildUser(learningLanguage: 'en' | 'ko' = 'en'): UserProfile {
    return {
      id: 1,
      email: 'learner@argonlearning.test',
      displayName: 'Argon Learner',
      avatarUrl: null,
      timezone: 'Asia/Ho_Chi_Minh',
      isLeaderboardVisible: true,
      learningLanguage,
      role: 'USER',
      hasPassword: true,
      linkedProviders: ['local'],
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
    };
  }

  beforeEach(() => {
    localStorage.removeItem(storageKey);
  });

  afterEach(() => {
    localStorage.removeItem(storageKey);
    TestBed.resetTestingModule();
  });

  it('defaults to English when localStorage has no course stored', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(LearningLanguageService);

    expect(service.activeLang()).toBe('en');
    expect(service.isKorean()).toBe(false);
    expect(service.isEnglish()).toBe(true);
    expect(service.activeOption().badgeCode).toBe('EN');
  });

  it('reads stored Korean course on initialization and toggles cleanly', () => {
    localStorage.setItem(storageKey, 'ko');
    TestBed.configureTestingModule({});
    const service = TestBed.inject(LearningLanguageService);

    expect(service.activeLang()).toBe('ko');
    expect(service.isKorean()).toBe(true);
    expect(service.activeOption().nativeLabel).toBe('한국어');

    service.toggleLanguage();
    expect(service.activeLang()).toBe('en');
    expect(localStorage.getItem(storageKey)).toBe('en');
  });

  it('syncs with authenticated user profile and persists course change remotely', () => {
    const mockUser = signal<UserProfile | null>(buildUser('ko'));
    const updateProfile = vi.fn((payload: { learningLanguage: 'en' | 'ko' }) => {
      const updated = buildUser(payload.learningLanguage);
      mockUser.set(updated);
      return of(updated);
    });

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            user: mockUser.asReadonly(),
            updateProfile,
          },
        },
      ],
    });

    const service = TestBed.inject(LearningLanguageService);
    TestBed.flushEffects();

    expect(service.activeLang()).toBe('ko');
    expect(localStorage.getItem(storageKey)).toBe('ko');

    service.setLanguage('en');
    expect(service.activeLang()).toBe('en');
    expect(updateProfile).toHaveBeenCalledWith({ learningLanguage: 'en' });
  });
});
