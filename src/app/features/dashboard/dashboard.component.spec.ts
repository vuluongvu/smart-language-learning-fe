import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { LanguagesApiService } from '../../shared/api/languages-api.service';
import { ProgressOverview } from '../../shared/types/learning.types';
import { AuthService } from '../auth/auth.service';
import { ProgressApiService } from '../progress/progress-api.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  const mockOverview: ProgressOverview = {
    streak: {
      currentStreak: 4,
      longestStreak: 7,
      status: 'active_today',
      isActiveToday: true,
      isAtRiskToday: false,
      lastActivityDate: '2026-03-10',
      currentStreakStartedAt: '2026-03-07',
      todayDate: '2026-03-10',
      timezone: 'Asia/Ho_Chi_Minh',
    },
    vocabulary: {
      total: 18,
      newCount: 6,
      learningCount: 8,
      masteredCount: 4,
      dueFlashcardsCount: 5,
      hardFlashcardsCount: 2,
      topicCount: 3,
    },
    quizzes: {
      totalAttempts: 4,
      completedAttempts: 3,
      averageScore: 86.5,
      totalQuestionsAnswered: 15,
      correctAnswers: 13,
      accuracyRate: 86.7,
    },
    flashcards: {
      completedSessions: 2,
      streakEligibleSessions: 2,
    },
    recentActivity14d: Array.from({ length: 14 }, (_, idx) => ({
      date: `2026-03-${String(idx + 1).padStart(2, '0')}`,
      activityCount: idx === 13 ? 2 : 0,
      quizCompletions: idx === 13 ? 1 : 0,
      flashcardCompletions: idx === 13 ? 1 : 0,
    })),
    weakVocabulary: [
      {
        vocabularyId: 10,
        term: 'pragmatic',
        pronunciation: '/præɡˈmæt.ɪk/',
        partOfSpeech: 'adjective',
        definition: 'sensible and realistic',
        wrongCount: 2,
        lastRating: null,
        progressStatus: 'learning',
      },
    ],
    recentQuizAttempts: [
      {
        id: 22,
        quizId: 3,
        quizTitleSnapshot: 'Core Verbs Drill',
        score: 90,
        correctCount: 9,
        totalQuestions: 10,
        completedAt: '2026-03-10T09:00:00Z',
      },
    ],
  };

  it('renders real streak, vocabulary, quiz accuracy, and weak vocabulary metrics from overview API', async () => {
    const progressApiMock = {
      getOverview: vi.fn().mockReturnValue(of(mockOverview)),
    };
    const languagesApiMock = {
      getLanguages: vi
        .fn()
        .mockReturnValue(of([{ id: 1, code: 'en', name: 'English', isActive: true }])),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { user: signal({ id: 1, displayName: 'Linh Learner' }) },
        },
        { provide: ProgressApiService, useValue: progressApiMock },
        { provide: LanguagesApiService, useValue: languagesApiMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Welcome back, Linh Learner');
    expect(el.textContent).toContain('4');
    expect(el.textContent).toContain('Longest streak: 7 days');
    expect(el.textContent).toContain('18');
    expect(el.textContent).toContain('pragmatic');
    expect(el.textContent).toContain('Core Verbs Drill');
  });
});
