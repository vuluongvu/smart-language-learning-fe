import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  OqEmptyStateComponent,
  OqIconComponent,
  OqIconName,
  OqModalComponent,
  OqProgressBarComponent,
} from '../../shared/components';
import { I18nService, TranslatePipe } from '../../shared/i18n';
import {
  LearningGoalBand,
  LearningPathOverview,
  LearningPathUnitNode,
} from '../../shared/types/learning-path.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { AuthService } from '../auth/auth.service';
import { LearningPathApiService } from './learning-path-api.service';
import { LpTranslatePipe, lpTranslate } from './learning-path.i18n';

const RING_CIRCUMFERENCE = 138.23;

@Component({
  selector: 'app-learning-path',
  imports: [
    FormsModule,
    RouterLink,
    OqIconComponent,
    OqModalComponent,
    OqProgressBarComponent,
    OqEmptyStateComponent,
    TranslatePipe,
    LpTranslatePipe,
  ],
  templateUrl: './learning-path.component.html',
  styleUrl: './learning-path.component.scss',
})
export class LearningPathComponent implements OnInit {
  private readonly pathApi = inject(LearningPathApiService);
  private readonly authService = inject(AuthService);
  protected readonly i18n = inject(I18nService);

  protected readonly ringCircumference = RING_CIRCUMFERENCE;
  protected readonly cefrOptions = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  protected readonly dailyMinuteOptions = [10, 15, 20, 30, 45];

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly overview = signal<LearningPathOverview | null>(null);
  protected readonly selectedBandView = signal<string>('');

  protected readonly showGoalModal = signal(false);
  protected readonly savingGoal = signal(false);
  protected readonly goalSuccess = signal<string | null>(null);

  protected draftBand: LearningGoalBand | string = 'band_45_55';
  protected draftLevel = 'B1';
  protected draftDailyMinutes = 15;

  protected readonly totalProgressPercent = computed(() => {
    const ov = this.overview();
    if (!ov || ov.stats.totalUnits === 0) {
      return 0;
    }
    return Math.round((ov.stats.completedUnits / ov.stats.totalUnits) * 100);
  });

  ngOnInit(): void {
    this.loadOverview();
  }

  loadOverview(band?: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.pathApi.getOverview(band).subscribe({
      next: (data) => {
        this.overview.set(data);
        this.selectedBandView.set(data.activeTrack.code);
        this.draftBand = data.goal.learningGoalBand;
        this.draftLevel = data.goal.currentLevel;
        this.draftDailyMinutes = data.goal.dailyGoalMinutes;
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể tải lộ trình học tập.'
              : 'Unable to load learning path.',
          ),
        );
      },
    });
  }

  onSelectTrack(event: Event): void {
    const code = (event.target as HTMLSelectElement).value;
    if (code && code !== this.selectedBandView()) {
      this.loadOverview(code);
    }
  }

  openGoalModal(): void {
    const g = this.overview()?.goal;
    if (g) {
      this.draftBand = g.learningGoalBand;
      this.draftLevel = g.currentLevel;
      this.draftDailyMinutes = g.dailyGoalMinutes;
    }
    this.showGoalModal.set(true);
  }

  saveGoal(): void {
    if (this.savingGoal()) {
      return;
    }
    this.savingGoal.set(true);
    this.errorMessage.set(null);

    this.pathApi
      .updateGoal({
        learningGoalBand: this.draftBand,
        currentLevel: this.draftLevel,
        dailyGoalMinutes: Number(this.draftDailyMinutes),
      })
      .subscribe({
        next: (data) => {
          this.overview.set(data);
          this.selectedBandView.set(data.activeTrack.code);
          this.savingGoal.set(false);
          this.showGoalModal.set(false);
          this.goalSuccess.set(lpTranslate(this.i18n.lang(), 'lp.goalSavedMsg'));
          this.authService.fetchMe().subscribe({ error: () => undefined });
        },
        error: (err: unknown) => {
          this.savingGoal.set(false);
          this.errorMessage.set(
            extractApiError(
              err,
              this.i18n.lang() === 'vi'
                ? 'Không thể lưu mục tiêu khóa học.'
                : 'Unable to update learning goal.',
            ),
          );
        },
      });
  }

  ringDashOffset(unit: LearningPathUnitNode): number {
    const pct = Math.max(0, Math.min(100, unit.progress.percentDone));
    return RING_CIRCUMFERENCE * (1 - pct / 100);
  }

  unitIcon(icon: string): OqIconName {
    const iconMap: Record<string, OqIconName> = {
      home: 'home',
      clock: 'clock',
      sparkles: 'sparkles',
      utensils: 'flame',
      'shopping-bag': 'layers',
      users: 'user',
      briefcase: 'folder',
      scale: 'bar-chart',
      cpu: 'sparkles',
      globe: 'globe',
      building: 'home',
    };
    return iconMap[icon] ?? 'target';
  }

  nodeTransform(index: number): string {
    const offsets = [-28, 18, 52, 26, -18];
    return `translateX(${offsets[index % offsets.length]}px)`;
  }
}
