import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import {
  OqActivityHeatmapComponent,
  OqEmptyStateComponent,
  OqIconComponent,
  OqProgressBarComponent,
  OqStatCardComponent,
  OqStreakCardComponent,
} from '../../shared/components';
import { I18nService, TranslatePipe, TxKey } from '../../shared/i18n';
import {
  DailyActivityPoint,
  FlashcardCardView,
  ProgressOverview,
} from '../../shared/types/learning.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { AuthService } from '../auth/auth.service';
import { FlashcardsApiService } from '../flashcards/flashcards-api.service';
import { ProgressApiService } from '../progress/progress-api.service';

export type ReviewTimingState = 'overdue' | 'due' | 'upcoming';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    OqStatCardComponent,
    OqStreakCardComponent,
    OqProgressBarComponent,
    OqActivityHeatmapComponent,
    OqEmptyStateComponent,
    OqIconComponent,
    TranslatePipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly progressApi = inject(ProgressApiService);
  private readonly flashcardsApi = inject(FlashcardsApiService);
  protected readonly i18n = inject(I18nService);

  protected readonly user = this.authService.user;
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly overview = signal<ProgressOverview | null>(null);
  protected readonly queueCards = signal<FlashcardCardView[]>([]);

  protected readonly activityWindow = signal<14 | 30>(14);
  protected readonly activity30d = signal<DailyActivityPoint[] | null>(null);
  protected readonly loading30d = signal(false);

  protected readonly activityPoints = computed(() => {
    if (this.activityWindow() === 30) {
      return this.activity30d() ?? this.overview()?.recentActivity14d ?? [];
    }
    return this.overview()?.recentActivity14d ?? [];
  });

  protected readonly streakHistory7d = computed(() => {
    const days = this.overview()?.recentActivity14d ?? [];
    return days.slice(-7);
  });

  protected readonly completedStudyCount = computed(() => {
    const data = this.overview();
    if (!data) return 0;
    return data.quizzes.completedAttempts + data.flashcards.completedSessions;
  });

  protected readonly urgentCards = computed(() =>
    this.queueCards().filter((card) => {
      const state = this.reviewStateOf(card);
      return state === 'overdue' || state === 'due';
    }),
  );

  protected readonly upcomingCards = computed(() =>
    this.queueCards().filter((card) => this.reviewStateOf(card) === 'upcoming'),
  );

  protected readonly reviewQueuePreview = computed(() => {
    const urgent = this.urgentCards();
    if (urgent.length === 0) {
      return [];
    }
    return [...urgent, ...this.upcomingCards()].slice(0, 6);
  });

  protected readonly overdueCount = computed(
    () => this.queueCards().filter((card) => this.reviewStateOf(card) === 'overdue').length,
  );

  protected readonly dueTodayCount = computed(
    () => this.queueCards().filter((card) => this.reviewStateOf(card) === 'due').length,
  );

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      overview: this.progressApi.getOverview(),
      dueQueue: this.flashcardsApi
        .getDueQueue({ mode: 'all', limit: 6 })
        .pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ overview, dueQueue }) => {
        this.overview.set(overview);
        this.queueCards.set(dueQueue?.items ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(extractApiError(err, this.i18n.t('dashboard.loadError')));
        this.loading.set(false);
      },
    });
  }

  setActivityWindow(days: 14 | 30): void {
    if (this.activityWindow() === days) {
      return;
    }
    this.activityWindow.set(days);

    if (days === 30 && this.activity30d() === null && !this.loading30d()) {
      this.loading30d.set(true);
      this.progressApi.getHistory(30).subscribe({
        next: (hist) => {
          this.activity30d.set(hist.dailyActivities);
          this.loading30d.set(false);
        },
        error: () => {
          this.loading30d.set(false);
        },
      });
    }
  }

  reviewStateOf(card: FlashcardCardView): ReviewTimingState | null {
    const nextReviewAt = card.progress.nextReviewAt;
    if (card.progress.isDue) {
      const todayDate = this.overview()?.streak.todayDate ?? new Date().toISOString().slice(0, 10);
      if (nextReviewAt && nextReviewAt.slice(0, 10) < todayDate) {
        return 'overdue';
      }
      return 'due';
    }
    if (nextReviewAt) {
      return 'upcoming';
    }
    return null;
  }

  reviewBadgeKey(card: FlashcardCardView): TxKey {
    const state = this.reviewStateOf(card);
    if (state === 'overdue') return 'dashboard.badgeOverdue';
    if (state === 'upcoming') return 'dashboard.badgeUpcoming';
    return 'dashboard.badgeDue';
  }
}
