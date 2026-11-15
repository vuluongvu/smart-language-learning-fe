import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguagesApiService } from '../../shared/api/languages-api.service';
import {
  OqEmptyStateComponent,
  OqIconComponent,
  OqPageHeaderComponent,
  OqProgressBarComponent,
  OqStatCardComponent,
  OqStreakCardComponent,
} from '../../shared/components';
import { I18nService, TranslatePipe } from '../../shared/i18n';
import { LanguageItem } from '../../shared/types/auth.types';
import { DailyActivityPoint, ProgressOverview } from '../../shared/types/learning.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { AuthService } from '../auth/auth.service';
import { formatReviewRatingLabel } from '../flashcards/flashcard-labels';
import { ProgressApiService } from '../progress/progress-api.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    OqPageHeaderComponent,
    OqStreakCardComponent,
    OqStatCardComponent,
    OqProgressBarComponent,
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
  private readonly languagesApi = inject(LanguagesApiService);
  protected readonly i18n = inject(I18nService);
  protected readonly formatRating = formatReviewRatingLabel;

  protected readonly user = this.authService.user;
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly overview = signal<ProgressOverview | null>(null);
  protected readonly languages = signal<LanguageItem[]>([]);

  protected readonly maxDailyActivity = computed(() => {
    const points = this.overview()?.recentActivity14d ?? [];
    return Math.max(1, ...points.map((p) => p.activityCount));
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.languagesApi.getLanguages().subscribe({
      next: (langs) => this.languages.set(langs),
      error: () => this.languages.set([]),
    });

    this.progressApi.getOverview().subscribe({
      next: (data) => {
        this.overview.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(extractApiError(err, this.i18n.t('dashboard.loadError')));
        this.loading.set(false);
      },
    });
  }

  barHeightPercent(point: DailyActivityPoint): number {
    if (point.activityCount <= 0) {
      return 8;
    }
    return Math.max(20, Math.round((point.activityCount / this.maxDailyActivity()) * 100));
  }

  shortDayLabel(ymd: string): string {
    return ymd.slice(5);
  }
}
