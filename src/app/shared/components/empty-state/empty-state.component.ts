import { Component, input } from '@angular/core';
import { OqIconComponent, OqIconName } from '../icon/icon.component';

@Component({
  selector: 'oq-empty-state',
  imports: [OqIconComponent],
  template: `
    <section
      class="oq-card oq-empty-state"
      [class.oq-empty-state--compact]="compact()"
      [class.oq-empty-state--celebration]="variant() === 'celebration'"
      [class.oq-empty-state--warm]="variant() === 'warm'"
    >
      @if (variant() === 'celebration') {
        <div class="oq-empty-state__illo" aria-hidden="true">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <rect width="56" height="56" rx="18" fill="var(--oq-pastel-green)" />
            <circle
              cx="28"
              cy="28"
              r="15"
              fill="var(--oq-bg-surface)"
              stroke="var(--oq-success)"
              stroke-width="2"
            />
            <path
              d="m22 28.5 4 4 8.5-9"
              stroke="var(--oq-success)"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M44 10v4m-2-2h4M11 40v4m-2-2h4"
              stroke="var(--oq-accent)"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
      } @else {
        <div class="oq-empty-state__icon">
          <oq-icon [name]="icon()" [size]="compact() ? 20 : 24" />
        </div>
      }
      <h3>{{ title() }}</h3>
      @if (description()) {
        <p>{{ description() }}</p>
      }
      <div class="oq-empty-state__actions">
        <ng-content select="[actions]" />
      </div>
    </section>
  `,
  styles: [
    `
      .oq-empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: var(--oq-space-8) var(--oq-space-6);
      }

      .oq-empty-state--compact {
        padding: var(--oq-space-6) var(--oq-space-4);
      }

      .oq-empty-state--celebration {
        background: var(--oq-pastel-green);
        border-color: var(--oq-pastel-green-border);
      }

      .oq-empty-state--warm {
        background: var(--oq-pastel-cream);
        border-color: var(--oq-pastel-cream-border);
      }

      .oq-empty-state__illo {
        margin-bottom: var(--oq-space-3);
        animation: oqEmptyFloat 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .oq-empty-state__icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        background: var(--oq-pastel-lavender);
        border: 1px solid var(--oq-pastel-lavender-border);
        color: var(--oq-pastel-lavender-ink);
        display: grid;
        place-items: center;
        margin-bottom: var(--oq-space-3);
      }

      @keyframes oqEmptyFloat {
        0% {
          opacity: 0;
          transform: translateY(4px) scale(0.96);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      h3 {
        margin: 0 0 6px;
        font-size: 1.0625rem;
        font-weight: 600;
      }

      p {
        margin: 0;
        max-width: 440px;
        font-size: 0.875rem;
        color: var(--oq-text-secondary);
      }

      .oq-empty-state__actions {
        margin-top: var(--oq-space-4);
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--oq-space-2);

        &:empty {
          display: none;
        }
      }
    `,
  ],
})
export class OqEmptyStateComponent {
  readonly icon = input<OqIconName>('sparkles');
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly compact = input<boolean>(false);
  readonly variant = input<'default' | 'celebration' | 'warm'>('default');
}
