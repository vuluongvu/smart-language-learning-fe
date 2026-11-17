import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  OqActivityHeatmapComponent,
  OqEmptyStateComponent,
  OqIconComponent,
  OqPageHeaderComponent,
  OqStatCardComponent,
} from '../../shared/components';
import { I18nService, TranslatePipe } from '../../shared/i18n';
import {
  ProgressHistory,
  StreakCalendarDay,
  StreakCalendarResponse,
  StreakSummary,
} from '../../shared/types/learning.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { ProgressApiService } from './progress-api.service';

@Component({
  selector: 'app-progress-streak',
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    OqPageHeaderComponent,
    OqStatCardComponent,
    OqActivityHeatmapComponent,
    OqEmptyStateComponent,
    OqIconComponent,
    TranslatePipe,
  ],
  templateUrl: './progress-streak.component.html',
  styleUrl: './progress-streak.component.scss',
})
export class ProgressStreakComponent implements OnInit {
  private readonly progressApi = inject(ProgressApiService);
  protected readonly i18n = inject(I18nService);

  protected readonly loading = signal(true);
  protected readonly calendarLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly streak = signal<StreakSummary | null>(null);
  protected readonly calendar = signal<StreakCalendarResponse | null>(null);
  protected readonly history = signal<ProgressHistory | null>(null);
  protected readonly historyDays = signal<number>(14);
  protected readonly activeMonth = signal<string | undefined>(undefined);

  protected readonly weekdays = computed(() =>
    this.i18n.lang() === 'vi'
      ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  );

  protected readonly leadingSpacers = computed(() => {
    const count = this.calendar()?.firstDayWeekday ?? 0;
    return Array.from({ length: count }, (_, idx) => idx);
  });

  protected readonly activeHistoryRows = computed(() =>
    (this.history()?.dailyActivities ?? []).filter((d) => d.activityCount > 0).reverse(),
  );

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      streak: this.progressApi.getMyStreak(),
      calendar: this.progressApi.getStreakCalendar(this.activeMonth()),
      history: this.progressApi.getHistory(this.historyDays()),
    }).subscribe({
      next: ({ streak, calendar, history }) => {
        this.streak.set(streak);
        this.calendar.set(calendar);
        this.activeMonth.set(calendar.month);
        this.history.set(history);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể tải lịch sử tiến độ và chuỗi ngày học.'
              : 'Unable to load your progress and streak calendar.',
          ),
        );
        this.loading.set(false);
      },
    });
  }

  changeMonth(delta: -1 | 1): void {
    const current = this.calendar()?.month ?? this.activeMonth();
    if (!current) {
      return;
    }
    const [yStr, mStr] = current.split('-');
    const date = new Date(Date.UTC(Number(yStr), Number(mStr) - 1 + delta, 1));
    const nextMonth = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

    this.activeMonth.set(nextMonth);
    this.calendarLoading.set(true);
    this.progressApi.getStreakCalendar(nextMonth).subscribe({
      next: (cal) => {
        this.calendar.set(cal);
        this.calendarLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể tải dữ liệu tháng.'
              : 'Failed to load month calendar.',
          ),
        );
        this.calendarLoading.set(false);
      },
    });
  }

  setHistoryWindow(days: 14 | 30): void {
    if (this.historyDays() === days) {
      return;
    }
    this.historyDays.set(days);
    this.progressApi.getHistory(days).subscribe({
      next: (res) => this.history.set(res),
      error: (err) =>
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể cập nhật khoảng thời gian.'
              : 'Failed to update activity window.',
          ),
        ),
    });
  }

  dayTitle(day: StreakCalendarDay): string {
    const isVi = this.i18n.lang() === 'vi';
    if (day.status === 'active') {
      return isVi
        ? `${day.date}: ${day.activityCount} hoạt động (${day.quizCompletions} bài kiểm tra, ${day.flashcardCompletions} phiên thẻ)`
        : `${day.date}: ${day.activityCount} activities (${day.quizCompletions} quizzes, ${day.flashcardCompletions} flashcards)`;
    }
    if (day.status === 'inactive_today') {
      return isVi
        ? `${day.date}: Hôm nay — chưa hoàn thành hoạt động đạt chuẩn`
        : `${day.date}: Today — no qualified activity yet`;
    }
    if (day.status === 'missed') {
      return isVi ? `${day.date}: Ngày bỏ lỡ` : `${day.date}: Missed day`;
    }
    if (day.status === 'before_registration') {
      return isVi ? `${day.date}: Trước khi đăng ký` : `${day.date}: Before account signup`;
    }
    return isVi ? `${day.date}: Ngày sắp tới` : `${day.date}: Upcoming date`;
  }
}
