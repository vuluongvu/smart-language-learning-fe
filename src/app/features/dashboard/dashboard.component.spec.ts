import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { FlashcardDueQueueResponse, ProgressOverview } from '../../shared/types/learning.types';
import { AuthService } from '../auth/auth.service';
import { FlashcardsApiService } from '../flashcards/flashcards-api.service';
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
      dueFlashcardsCount: 2,
      hardFlashcardsCount: 1,
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
    weakVocabulary: [],
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

  const mockDueQueue: FlashcardDueQueueResponse = {
    items: [
      {
        id: 10,
        term: 'pragmatic',
        pronunciation: '/præɡˈmæt.ɪk/',
        partOfSpeech: 'adjective',
        definition: 'thực tế, thiết thực',
        example: null,
        notes: null,
        topics: [],
        progress: {
          status: 'learning',
          repetitions: 1,
          intervalDays: 1,
          easeFactor: 2.5,
          lastRating: 'good',
          lastReviewedAt: '2026-03-08T09:00:00Z',
          nextReviewAt: '2026-03-09T09:00:00Z',
          isDue: true,
        },
        sessionLastRating: null,
        sessionReviewCount: 0,
      },
      {
        id: 11,
        term: 'resilient',
        pronunciation: null,
        partOfSpeech: 'adjective',
        definition: 'kiên cường',
        example: null,
        notes: null,
        topics: [],
        progress: {
          status: 'learning',
          repetitions: 2,
          intervalDays: 3,
          easeFactor: 2.5,
          lastRating: 'good',
          lastReviewedAt: '2026-03-07T09:00:00Z',
          nextReviewAt: '2026-03-10T09:00:00Z',
          isDue: true,
        },
        sessionLastRating: null,
        sessionReviewCount: 0,
      },
      {
        id: 12,
        term: 'eloquent',
        pronunciation: null,
        partOfSpeech: 'adjective',
        definition: 'hùng biện, lưu loát',
        example: null,
        notes: null,
        topics: [],
        progress: {
          status: 'learning',
          repetitions: 3,
          intervalDays: 5,
          easeFactor: 2.6,
          lastRating: 'easy',
          lastReviewedAt: '2026-03-10T08:00:00Z',
          nextReviewAt: '2026-03-12T08:00:00Z',
          isDue: false,
        },
        sessionLastRating: null,
        sessionReviewCount: 0,
      },
    ],
    meta: { page: 1, limit: 6, total: 3, totalPages: 1 },
    summary: {
      totalCount: 18,
      dueCount: 2,
      newCount: 6,
      learningCount: 8,
      masteredCount: 4,
      hardCount: 1,
    },
  };

  it('renders unified stats, streak spotlight with 7d strip, heatmap with 30d toggle, and overdue/due/upcoming review states', async () => {
    const progressApiMock = {
      getOverview: vi.fn().mockReturnValue(of(mockOverview)),
      getHistory: vi.fn().mockReturnValue(
        of({
          days: 30,
          timezone: 'Asia/Ho_Chi_Minh',
          todayDate: '2026-03-10',
          dailyActivities: Array.from({ length: 30 }, (_, idx) => ({
            date: new Date(Date.UTC(2026, 1, 9 + idx)).toISOString().slice(0, 10),
            activityCount: idx === 0 ? 3 : 0,
            quizCompletions: idx === 0 ? 2 : 0,
            flashcardCompletions: idx === 0 ? 1 : 0,
          })),
          recentAttempts: [],
          weakVocabulary: [],
        }),
      ),
    };
    const flashcardsApiMock = {
      getDueQueue: vi.fn().mockReturnValue(of(mockDueQueue)),
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
        { provide: FlashcardsApiService, useValue: flashcardsApiMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Welcome back, Linh Learner');
    expect(el.textContent).toContain('4 days');
    expect(el.textContent).toContain('Longest streak: 7 days');
    expect(el.textContent).toContain('4-day milestone!');
    expect(el.querySelectorAll('.streak-day').length).toBe(7);
    expect(el.textContent).toContain('18');
    expect(el.textContent).toContain('pragmatic');
    expect(el.textContent).toContain('eloquent');
    expect(el.textContent).toContain('Overdue');
    expect(el.textContent).toContain('Due today');
    expect(el.textContent).toContain('Upcoming');
    expect(el.textContent).toContain('Core Verbs Drill');
    expect(el.querySelectorAll('.oq-heatmap__cell').length).toBe(14);

    const btn30 = Array.from(el.querySelectorAll<HTMLButtonElement>('.window-btn')).find((b) =>
      b.textContent?.includes('30 days'),
    );
    btn30?.click();
    fixture.detectChanges();

    expect(progressApiMock.getHistory).toHaveBeenCalledWith(30, 'en');
    expect(el.querySelectorAll('.oq-heatmap__cell').length).toBe(30);
  });

  it('renders friendly caught-up celebration state when no vocabulary is due today', async () => {
    const progressApiMock = {
      getOverview: vi.fn().mockReturnValue(of(mockOverview)),
      getHistory: vi.fn(),
    };
    const flashcardsApiMock = {
      getDueQueue: vi.fn().mockReturnValue(
        of({
          items: [
            {
              ...mockDueQueue.items[2],
            },
          ],
          meta: { page: 1, limit: 6, total: 1, totalPages: 1 },
          summary: {
            totalCount: 18,
            dueCount: 0,
            newCount: 6,
            learningCount: 8,
            masteredCount: 4,
            hardCount: 0,
          },
        }),
      ),
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
        { provide: FlashcardsApiService, useValue: flashcardsApiMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("You're all caught up today!");
    expect(el.textContent).toContain('Add new vocabulary');
    expect(el.querySelector('.oq-empty-state--celebration')).not.toBeNull();
    expect(el.textContent).toContain('Coming up next');
    expect(el.textContent).toContain('eloquent');

    localStorage.removeItem('argon_learning_course');
    const koTab = Array.from(el.querySelectorAll<HTMLButtonElement>('.oq-course-tab')).find((btn) =>
      btn.textContent?.includes('Korean'),
    );
    expect(koTab).toBeTruthy();
    koTab?.click();
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(progressApiMock.getOverview).toHaveBeenCalledWith('ko');
    localStorage.removeItem('argon_learning_course');
  });
});
