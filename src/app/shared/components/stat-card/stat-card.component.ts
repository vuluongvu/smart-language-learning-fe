import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OqIconComponent, OqIconName } from '../icon/icon.component';

@Component({
  selector: 'oq-stat-card',
  imports: [RouterLink, OqIconComponent],
  template: `
    <article class="oq-card oq-stat-card" [class.oq-card--interactive]="!!actionLink()">
      <div class="oq-stat-card__top">
        <span class="oq-stat-card__label">{{ label() }}</span>
        @if (icon()) {
          <span
            class="oq-stat-card__icon"
            [class.oq-stat-card__icon--accent]="tone() === 'accent'"
            [class.oq-stat-card__icon--success]="tone() === 'success'"
            [class.oq-stat-card__icon--warning]="tone() === 'warning'"
          >
            <oq-icon [name]="icon()!" [size]="17" />
          </span>
        }
      </div>

      <strong
        class="oq-stat-card__value"
        [class.oq-stat-card__value--accent]="tone() === 'accent'"
        [class.oq-stat-card__value--success]="tone() === 'success'"
      >
        {{ value() }}
      </strong>

      @if (detail()) {
        <p class="oq-stat-card__detail">{{ detail() }}</p>
      }

      @if (actionLink()) {
        <a [routerLink]="actionLink()" class="oq-stat-card__link">
          <span>{{ actionLabel() }}</span>
          <oq-icon name="arrow-right" [size]="14" />
        </a>
      } @else if (meta()) {
        <span class="oq-stat-card__meta">{{ meta() }}</span>
      }
    </article>
  `,
  styles: [
    `
      .oq-stat-card {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: var(--oq-space-5);
      }

      .oq-stat-card__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .oq-stat-card__label {
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--oq-text-muted);
      }

      .oq-stat-card__icon {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        background: var(--oq-bg-subtle);
        color: var(--oq-text-secondary);
        display: grid;
        place-items: center;

        &--accent {
          background: var(--oq-accent-soft);
          color: var(--oq-accent);
        }

        &--success {
          background: var(--oq-success-soft);
          color: var(--oq-success);
        }

        &--warning {
          background: var(--oq-warning-soft);
          color: var(--oq-warning);
        }
      }

      .oq-stat-card__value {
        font-size: 1.75rem;
        font-weight: 700;
        line-height: 1.15;
        letter-spacing: -0.02em;
        color: var(--oq-text-primary);
        font-variant-numeric: tabular-nums;

        &--accent {
          color: var(--oq-accent);
        }

        &--success {
          color: var(--oq-success);
        }
      }

      .oq-stat-card__detail {
        margin: 0;
        font-size: 0.8125rem;
        color: var(--oq-text-secondary);
      }

      .oq-stat-card__meta {
        margin-top: auto;
        font-size: 0.78125rem;
        color: var(--oq-text-muted);
      }

      .oq-stat-card__link {
        margin-top: auto;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--oq-accent);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    `,
  ],
})
export class OqStatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly detail = input<string | null>(null);
  readonly meta = input<string | null>(null);
  readonly icon = input<OqIconName | null>(null);
  readonly tone = input<'default' | 'accent' | 'success' | 'warning'>('default');
  readonly actionLink = input<string | unknown[] | null>(null);
  readonly actionLabel = input<string>('Open');
}
