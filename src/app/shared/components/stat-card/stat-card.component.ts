import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OqIconComponent, OqIconName } from '../icon/icon.component';

export type OqStatTone = 'default' | 'accent' | 'success' | 'warning' | 'cream' | 'lavender';

@Component({
  selector: 'oq-stat-card',
  imports: [RouterLink, OqIconComponent],
  template: `
    <article
      class="oq-card oq-stat-card"
      [class.oq-stat-card--accent]="tone() === 'accent'"
      [class.oq-stat-card--success]="tone() === 'success'"
      [class.oq-stat-card--warning]="tone() === 'warning'"
      [class.oq-stat-card--cream]="tone() === 'cream'"
      [class.oq-stat-card--lavender]="tone() === 'lavender'"
      [class.oq-card--interactive]="interactive() || !!actionLink()"
    >
      <div class="oq-stat-card__top">
        <span class="oq-stat-card__label">{{ label() }}</span>
        @if (icon()) {
          <span
            class="oq-stat-card__icon"
            [class.oq-stat-card__icon--accent]="tone() === 'accent'"
            [class.oq-stat-card__icon--success]="tone() === 'success'"
            [class.oq-stat-card__icon--warning]="tone() === 'warning'"
            [class.oq-stat-card__icon--cream]="tone() === 'cream'"
            [class.oq-stat-card__icon--lavender]="tone() === 'lavender'"
          >
            <oq-icon [name]="icon()!" [size]="18" />
          </span>
        }
      </div>

      <strong
        class="oq-stat-card__value"
        [class.oq-stat-card__value--accent]="tone() === 'accent'"
        [class.oq-stat-card__value--success]="tone() === 'success'"
        [class.oq-stat-card__value--cream]="tone() === 'cream'"
        [class.oq-stat-card__value--lavender]="tone() === 'lavender'"
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
        gap: 8px;
        padding: var(--oq-space-5);
        border-top-width: 3px;

        &--accent {
          border-top-color: var(--oq-accent);
        }

        &--success {
          border-top-color: var(--oq-success);
        }

        &--warning,
        &--cream {
          border-top-color: var(--oq-warning);
        }

        &--lavender {
          border-top-color: var(--oq-pastel-lavender-ink);
        }
      }

      .oq-stat-card__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .oq-stat-card__label {
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--oq-text-secondary);
      }

      .oq-stat-card__icon {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        background: var(--oq-bg-subtle);
        color: var(--oq-text-secondary);
        display: grid;
        place-items: center;
        flex-shrink: 0;

        &--accent {
          background: var(--oq-pastel-pink);
          color: var(--oq-accent);
        }

        &--success {
          background: var(--oq-pastel-green);
          color: var(--oq-pastel-green-ink);
        }

        &--warning,
        &--cream {
          background: var(--oq-pastel-cream);
          color: var(--oq-pastel-cream-ink);
        }

        &--lavender {
          background: var(--oq-pastel-lavender);
          color: var(--oq-pastel-lavender-ink);
        }
      }

      .oq-stat-card__value {
        font-size: 1.75rem;
        font-weight: 600;
        line-height: 1.15;
        letter-spacing: -0.02em;
        color: var(--oq-text-primary);
        font-variant-numeric: tabular-nums;

        &--accent {
          color: var(--oq-accent);
        }

        &--success {
          color: var(--oq-pastel-green-ink);
        }

        &--cream {
          color: var(--oq-pastel-cream-ink);
        }

        &--lavender {
          color: var(--oq-pastel-lavender-ink);
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
  readonly tone = input<OqStatTone>('default');
  readonly interactive = input<boolean>(true);
  readonly actionLink = input<string | unknown[] | null>(null);
  readonly actionLabel = input<string>('Open');
}
