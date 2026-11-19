import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../i18n';
import { DailyActivityPoint } from '../../types/learning.types';
import { OqIconComponent } from '../icon/icon.component';

@Component({
  selector: 'oq-streak-card',
  imports: [RouterLink, OqIconComponent, TranslatePipe],
  template: `
    <section
      class="oq-card oq-streak-card"
      [class.oq-streak-card--active]="isActiveToday()"
      [class.oq-streak-card--risk]="isAtRiskToday()"
      [attr.aria-label]="'streak.eyebrow' | t"
    >
      <div class="oq-streak-card__top">
        <div class="oq-streak-card__main">
          <div
            class="oq-streak-card__flame"
            [class.oq-streak-card__flame--active]="isActiveToday()"
            [class.oq-streak-card__flame--milestone]="isActiveToday() || currentStreak() >= 3"
          >
            <oq-icon name="flame" [size]="24" />
          </div>
          <div>
            <span class="oq-streak-card__eyebrow">{{ 'streak.eyebrow' | t }}</span>
            <div class="oq-streak-card__count">
              <strong>{{ currentStreak() }}</strong>
              <span>{{
                currentStreak() === 1
                  ? ('streak.dayUnitSingular' | t)
                  : ('streak.dayUnitPlural' | t)
              }}</span>
              @if (currentStreak() >= 3) {
                <span class="oq-badge oq-badge--success">
                  {{ 'dashboard.streakMilestone' | t: { days: currentStreak() } }}
                </span>
              }
            </div>
            <p class="oq-streak-card__meta">
              <strong>{{ 'streak.longest' | t: { days: longestStreak() } }}</strong>
            </p>
          </div>
        </div>

        <div class="oq-streak-card__side">
          @if (isActiveToday()) {
            <span class="oq-badge oq-badge--success">
              <oq-icon name="check" [size]="13" />
              {{ 'streak.activeToday' | t }}
            </span>
          } @else if (isAtRiskToday()) {
            <span class="oq-badge oq-badge--warning">
              <oq-icon name="clock" [size]="13" />
              {{ 'streak.riskToday' | t }}
            </span>
          } @else {
            <span class="oq-badge">{{ 'streak.startToday' | t }}</span>
          }

          @if (showLinks()) {
            <div class="oq-streak-card__links">
              <a routerLink="/progress" class="oq-btn oq-btn--secondary oq-btn--sm">
                <oq-icon name="calendar" [size]="15" />
                <span>{{ 'streak.calendarLink' | t }}</span>
              </a>
              <a routerLink="/leaderboard" class="oq-btn oq-btn--secondary oq-btn--sm">
                <oq-icon name="trophy" [size]="15" />
                <span>{{ 'streak.leaderboardLink' | t }}</span>
              </a>
            </div>
          }
        </div>
      </div>

      @if (recentHistory().length > 0) {
        <div class="streak-strip">
          <span class="streak-strip__label">{{ 'dashboard.streakHistory7d' | t }}</span>
          <div class="streak-strip__days">
            @for (day of recentHistory(); track day.date) {
              <span
                class="streak-day"
                [class.streak-day--active]="day.activityCount > 0"
                [title]="day.date + ': ' + day.activityCount"
              >
                {{ day.date.slice(8, 10) }}
              </span>
            }
          </div>
          <a routerLink="/progress" class="streak-strip__link">
            {{ 'dashboard.fullCalendar' | t }}
          </a>
        </div>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .oq-streak-card {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: var(--oq-space-4);
        background: var(--oq-pastel-cream);
        border-color: var(--oq-pastel-cream-border);

        &--active {
          background: var(--oq-pastel-green);
          border-color: var(--oq-pastel-green-border);
        }

        &--risk {
          background: var(--oq-pastel-pink);
          border-color: var(--oq-pastel-pink-border);
        }
      }

      .oq-streak-card__top {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--oq-space-4);
      }

      .oq-streak-card__main {
        display: flex;
        align-items: center;
        gap: var(--oq-space-4);
      }

      .oq-streak-card__flame {
        width: 50px;
        height: 50px;
        border-radius: 14px;
        background: var(--oq-bg-surface);
        border: 1px solid var(--oq-pastel-cream-border);
        color: var(--oq-accent);
        display: grid;
        place-items: center;
        flex-shrink: 0;
        box-shadow: var(--oq-shadow-xs);

        &--active {
          border-color: var(--oq-pastel-green-border);
          color: var(--oq-success);
        }

        &--milestone {
          animation: oqFlamePulse 2.4s ease-in-out infinite;
        }
      }

      @keyframes oqFlamePulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      .oq-streak-card__eyebrow {
        display: block;
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--oq-text-muted);
      }

      .oq-streak-card__count {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 8px;
        margin: 2px 0;

        strong {
          font-size: 1.875rem;
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: var(--oq-text-primary);
        }

        span:first-of-type {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--oq-text-secondary);
        }
      }

      .oq-streak-card__meta {
        margin: 4px 0 0;
        font-size: 0.8125rem;
        color: var(--oq-text-secondary);
      }

      .oq-streak-card__side {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--oq-space-3);
      }

      .oq-streak-card__links {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .streak-strip {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px 12px;
        padding: 10px 12px;
        border-radius: var(--oq-radius-md);
        background: rgba(255, 255, 255, 0.68);
        border: 1px solid var(--oq-border-subtle);

        &__label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--oq-text-secondary);
        }

        &__days {
          display: flex;
          gap: 5px;
        }

        &__link {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--oq-accent);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      :host-context([data-theme='dark']) .streak-strip {
        background: rgba(15, 23, 42, 0.45);
      }

      .streak-day {
        width: 26px;
        height: 26px;
        border-radius: 8px;
        border: 1px solid var(--oq-border-subtle);
        background: var(--oq-bg-surface);
        color: var(--oq-text-muted);
        display: grid;
        place-items: center;
        font-size: 0.7rem;
        font-weight: 600;
        font-variant-numeric: tabular-nums;

        &--active {
          background: var(--oq-success);
          border-color: var(--oq-success);
          color: #ffffff;
        }
      }

      @media (max-width: 680px) {
        .oq-streak-card__side {
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class OqStreakCardComponent {
  readonly currentStreak = input<number>(0);
  readonly longestStreak = input<number>(0);
  readonly isActiveToday = input<boolean>(false);
  readonly isAtRiskToday = input<boolean>(false);
  readonly showLinks = input<boolean>(true);
  readonly recentHistory = input<DailyActivityPoint[]>([]);
}
