import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../i18n';
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
      <div class="oq-streak-card__main">
        <div class="oq-streak-card__flame" [class.oq-streak-card__flame--active]="isActiveToday()">
          <oq-icon name="flame" [size]="24" />
        </div>
        <div>
          <span class="oq-streak-card__eyebrow">{{ 'streak.eyebrow' | t }}</span>
          <div class="oq-streak-card__count">
            <strong>{{ currentStreak() }}</strong>
            <span>{{
              currentStreak() === 1 ? ('streak.dayUnitSingular' | t) : ('streak.dayUnitPlural' | t)
            }}</span>
          </div>
          <p class="oq-streak-card__meta">
            <strong>{{ 'streak.longest' | t: { days: longestStreak() } }}</strong> ·
            {{ 'streak.timezone' | t }} <code>{{ timezone() }}</code>
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
    </section>
  `,
  styles: [
    `
      .oq-streak-card {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--oq-space-5);

        &--active {
          border-color: rgba(22, 163, 122, 0.35);
        }

        &--risk {
          border-color: rgba(217, 119, 6, 0.35);
        }
      }

      .oq-streak-card__main {
        display: flex;
        align-items: center;
        gap: var(--oq-space-4);
      }

      .oq-streak-card__flame {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: var(--oq-accent-soft);
        color: var(--oq-accent);
        display: grid;
        place-items: center;
        flex-shrink: 0;

        &--active {
          background: var(--oq-success-soft);
          color: var(--oq-success);
        }
      }

      .oq-streak-card__eyebrow {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--oq-text-muted);
      }

      .oq-streak-card__count {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin: 2px 0;

        strong {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: var(--oq-text-primary);
        }

        span {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--oq-text-secondary);
        }
      }

      .oq-streak-card__meta {
        margin: 4px 0 0;
        font-size: 0.8125rem;
        color: var(--oq-text-secondary);

        code {
          padding: 1px 6px;
          border-radius: 6px;
          background: var(--oq-bg-subtle);
          font-size: 0.75rem;
        }
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
  readonly timezone = input<string>('UTC');
  readonly isActiveToday = input<boolean>(false);
  readonly isAtRiskToday = input<boolean>(false);
  readonly showLinks = input<boolean>(true);
}
