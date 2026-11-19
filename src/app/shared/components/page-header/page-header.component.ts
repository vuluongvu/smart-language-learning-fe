import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../i18n';
import { OqIconComponent } from '../icon/icon.component';

@Component({
  selector: 'oq-page-header',
  imports: [RouterLink, OqIconComponent, TranslatePipe],
  template: `
    <header class="oq-page-header">
      <div class="oq-page-header__left">
        @if (backLink()) {
          <a [routerLink]="backLink()" class="oq-page-header__back">
            <oq-icon name="arrow-left" [size]="15" />
            <span>{{ backLabel() ?? ('common.back' | t) }}</span>
          </a>
        }
        @if (eyebrow()) {
          <span class="oq-page-header__eyebrow">{{ eyebrow() }}</span>
        }
        <h1>{{ title() }}</h1>
        @if (subtitle()) {
          <p class="oq-page-header__sub">{{ subtitle() }}</p>
        }
      </div>
      <div class="oq-page-header__actions">
        <ng-content select="[actions]" />
      </div>
    </header>
  `,
  styles: [
    `
      .oq-page-header {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        justify-content: space-between;
        gap: var(--oq-space-4);
        margin-bottom: var(--oq-space-6);
      }

      .oq-page-header__left {
        flex: 1 1 320px;
        min-width: 0;
      }

      .oq-page-header__back {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--oq-text-secondary);
        text-decoration: none;

        &:hover {
          color: var(--oq-text-primary);
        }
      }

      .oq-page-header__eyebrow {
        display: block;
        margin-bottom: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--oq-accent);
      }

      h1 {
        margin: 0;
        font-size: clamp(1.625rem, 2.2vw, 1.875rem);
        font-weight: 700;
        line-height: 1.2;
      }

      .oq-page-header__sub {
        margin: 6px 0 0;
        font-size: 0.875rem;
        color: var(--oq-text-secondary);
        max-width: 640px;
      }

      .oq-page-header__actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;

        &:empty {
          display: none;
        }
      }
    `,
  ],
})
export class OqPageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly eyebrow = input<string | null>(null);
  readonly backLink = input<string | unknown[] | null>(null);
  readonly backLabel = input<string | null>(null);
}
