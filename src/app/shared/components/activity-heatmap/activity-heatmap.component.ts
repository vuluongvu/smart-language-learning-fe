import { Component, input } from '@angular/core';
import { TranslatePipe } from '../../i18n';
import { DailyActivityPoint } from '../../types/learning.types';

@Component({
  selector: 'oq-activity-heatmap',
  imports: [TranslatePipe],
  template: `
    <div class="oq-heatmap" role="img" [attr.aria-label]="ariaLabel()">
      <div class="oq-heatmap__grid">
        @for (point of points(); track point.date) {
          <div
            class="oq-heatmap__cell"
            [class.oq-heatmap__cell--l1]="levelOf(point.activityCount) === 1"
            [class.oq-heatmap__cell--l2]="levelOf(point.activityCount) === 2"
            [class.oq-heatmap__cell--l3]="levelOf(point.activityCount) === 3"
            [title]="tooltipOf(point)"
            [attr.aria-label]="tooltipOf(point)"
          >
            <span class="oq-heatmap__day">{{ dayNumber(point.date) }}</span>
            <span class="oq-heatmap__count">{{ point.activityCount }}</span>
          </div>
        }
      </div>

      <div class="oq-heatmap__legend" aria-hidden="true">
        <span>{{ 'dashboard.activityLess' | t }}</span>
        <i class="oq-heatmap__swatch"></i>
        <i class="oq-heatmap__swatch oq-heatmap__swatch--l1"></i>
        <i class="oq-heatmap__swatch oq-heatmap__swatch--l2"></i>
        <i class="oq-heatmap__swatch oq-heatmap__swatch--l3"></i>
        <span>{{ 'dashboard.activityMore' | t }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .oq-heatmap {
        display: grid;
        gap: var(--oq-space-3);
      }

      .oq-heatmap__grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 6px;
      }

      .oq-heatmap__cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        min-height: 46px;
        padding: 4px 2px;
        border-radius: 10px;
        border: 1px solid var(--oq-border-subtle);
        background: var(--oq-bg-subtle);
        color: var(--oq-text-muted);
        transition:
          transform var(--oq-transition),
          border-color var(--oq-transition),
          box-shadow var(--oq-transition);

        &:hover {
          transform: translateY(-2px);
          border-color: var(--oq-success);
          box-shadow: var(--oq-shadow-xs);
        }

        &--l1 {
          background: var(--oq-pastel-green);
          border-color: var(--oq-pastel-green-border);
          color: var(--oq-pastel-green-ink);
        }

        &--l2 {
          background: rgba(16, 185, 129, 0.34);
          border-color: rgba(16, 185, 129, 0.5);
          color: var(--oq-text-primary);
        }

        &--l3 {
          background: var(--oq-success);
          border-color: var(--oq-success);
          color: #ffffff;
        }
      }

      .oq-heatmap__day {
        font-size: 0.65rem;
        opacity: 0.85;
        font-variant-numeric: tabular-nums;
      }

      .oq-heatmap__count {
        font-size: 0.8125rem;
        font-weight: 700;
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }

      .oq-heatmap__legend {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        font-size: 0.72rem;
        color: var(--oq-text-muted);
      }

      .oq-heatmap__swatch {
        width: 12px;
        height: 12px;
        border-radius: 4px;
        border: 1px solid var(--oq-border-subtle);
        background: var(--oq-bg-subtle);

        &--l1 {
          background: var(--oq-pastel-green);
          border-color: var(--oq-pastel-green-border);
        }

        &--l2 {
          background: rgba(16, 185, 129, 0.34);
          border-color: rgba(16, 185, 129, 0.5);
        }

        &--l3 {
          background: var(--oq-success);
          border-color: var(--oq-success);
        }
      }
    `,
  ],
})
export class OqActivityHeatmapComponent {
  readonly points = input.required<DailyActivityPoint[]>();
  readonly ariaLabel = input<string>('Learning activity heatmap');
  readonly lang = input<'en' | 'vi'>('en');

  protected levelOf(count: number): 0 | 1 | 2 | 3 {
    if (count <= 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    return 3;
  }

  protected dayNumber(ymd: string): string {
    return ymd.slice(8, 10) || ymd;
  }

  protected tooltipOf(point: DailyActivityPoint): string {
    if (this.lang() === 'vi') {
      return `${point.date}: ${point.activityCount} hoạt động (${point.quizCompletions} kiểm tra, ${point.flashcardCompletions} thẻ)`;
    }
    return `${point.date}: ${point.activityCount} activities (${point.quizCompletions} quizzes, ${point.flashcardCompletions} flashcards)`;
  }
}
