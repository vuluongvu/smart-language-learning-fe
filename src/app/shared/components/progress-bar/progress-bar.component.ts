import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'oq-progress-bar',
  template: `
    <div class="oq-progress">
      @if (label() || showPercent()) {
        <div class="oq-progress__head">
          <span class="oq-progress__label">{{ label() }}</span>
          @if (showPercent()) {
            <span class="oq-progress__pct">{{ percent() }}%</span>
          }
        </div>
      }
      <div
        class="oq-progress__track"
        [class.oq-progress__track--sm]="size() === 'sm'"
        role="progressbar"
        [attr.aria-valuenow]="value()"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="max()"
        [attr.aria-label]="label() || 'Progress'"
      >
        <div
          class="oq-progress__fill"
          [class.oq-progress__fill--success]="tone() === 'success'"
          [class.oq-progress__fill--warning]="tone() === 'warning'"
          [class.oq-progress__fill--lavender]="tone() === 'lavender'"
          [style.width.%]="percent()"
        ></div>
      </div>
    </div>
  `,
  styles: [
    `
      .oq-progress__head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
        font-size: 0.8125rem;
      }

      .oq-progress__label {
        color: var(--oq-text-secondary);
        font-weight: 500;
      }

      .oq-progress__pct {
        color: var(--oq-text-primary);
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .oq-progress__track {
        height: 8px;
        border-radius: var(--oq-radius-full);
        background: var(--oq-bg-subtle);
        overflow: hidden;
      }

      .oq-progress__track--sm {
        height: 6px;
      }

      .oq-progress__fill {
        height: 100%;
        border-radius: var(--oq-radius-full);
        background: var(--oq-accent);
        transition: width 520ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      .oq-progress__fill--success {
        background: var(--oq-success);
      }

      .oq-progress__fill--warning {
        background: var(--oq-warning);
      }

      .oq-progress__fill--lavender {
        background: var(--oq-pastel-lavender-ink);
      }
    `,
  ],
})
export class OqProgressBarComponent {
  readonly value = input<number>(0);
  readonly max = input<number>(100);
  readonly label = input<string>('');
  readonly showPercent = input<boolean>(false);
  readonly tone = input<'primary' | 'success' | 'warning' | 'lavender'>('primary');
  readonly size = input<'sm' | 'md'>('md');

  protected readonly percent = computed(() => {
    const cap = this.max();
    if (cap <= 0) {
      return 0;
    }
    const ratio = (this.value() / cap) * 100;
    return Math.min(100, Math.max(0, Math.round(ratio)));
  });
}
