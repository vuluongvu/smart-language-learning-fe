import { Component, input } from '@angular/core';
import { OqIconComponent, OqIconName } from '../icon/icon.component';

@Component({
  selector: 'oq-empty-state',
  imports: [OqIconComponent],
  template: `
    <section class="oq-card oq-empty-state" [class.oq-empty-state--compact]="compact()">
      <div class="oq-empty-state__icon">
        <oq-icon [name]="icon()" [size]="compact() ? 20 : 24" />
      </div>
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

      .oq-empty-state__icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        background: var(--oq-bg-subtle);
        border: 1px solid var(--oq-border-subtle);
        color: var(--oq-text-secondary);
        display: grid;
        place-items: center;
        margin-bottom: var(--oq-space-3);
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
}
