import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '../../i18n';
import { OqIconComponent } from '../icon/icon.component';

let nextModalId = 0;

@Component({
  selector: 'oq-modal',
  imports: [OqIconComponent, TranslatePipe],
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
  template: `
    @if (open()) {
      <div class="oq-modal-backdrop" (click)="closeOnBackdrop() && closed.emit()">
        <div
          class="oq-modal"
          [class.oq-modal--sm]="size() === 'sm'"
          [class.oq-modal--lg]="size() === 'lg'"
          [class.oq-modal--xl]="size() === 'xl'"
          [attr.role]="role()"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          (click)="$event.stopPropagation()"
        >
          <div class="oq-modal__head">
            <div>
              <h2 [id]="titleId">{{ title() }}</h2>
              @if (description()) {
                <p class="oq-modal__desc">{{ description() }}</p>
              }
            </div>
            <button
              type="button"
              class="oq-modal__close"
              [attr.aria-label]="'common.closeModal' | t"
              (click)="closed.emit()"
            >
              <oq-icon name="x" [size]="18" />
            </button>
          </div>
          <div class="oq-modal__body">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .oq-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 60;
        background: rgba(15, 23, 42, 0.45);
        backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--oq-space-4);
        overflow-y: auto;
      }

      .oq-modal {
        width: 100%;
        max-width: 560px;
        max-height: min(90vh, 780px);
        overflow-y: auto;
        background: var(--oq-bg-surface);
        border: 1px solid var(--oq-border-subtle);
        border-radius: var(--oq-radius-lg);
        box-shadow: var(--oq-shadow-md);
        padding: var(--oq-space-6);

        &--sm {
          max-width: 440px;
        }

        &--lg {
          max-width: 720px;
        }

        &--xl {
          max-width: 880px;
          max-height: min(94vh, 940px);
        }
      }

      .oq-modal__head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--oq-space-3);
        margin-bottom: var(--oq-space-5);

        h2 {
          margin: 0;
          font-size: 1.1875rem;
          font-weight: 600;
        }
      }

      .oq-modal__desc {
        margin: 4px 0 0;
        font-size: 0.875rem;
        color: var(--oq-text-secondary);
      }

      .oq-modal__close {
        width: 34px;
        height: 34px;
        border-radius: var(--oq-radius-sm);
        border: 1px solid transparent;
        background: transparent;
        color: var(--oq-text-muted);
        display: grid;
        place-items: center;
        cursor: pointer;

        &:hover {
          background: var(--oq-bg-subtle);
          color: var(--oq-text-primary);
        }
      }
    `,
  ],
})
export class OqModalComponent {
  readonly open = input<boolean>(false);
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly role = input<'dialog' | 'alertdialog'>('dialog');
  readonly closeOnBackdrop = input<boolean>(true);
  readonly closed = output<void>();

  protected readonly titleId = `oq-modal-title-${++nextModalId}`;

  protected onEscape(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }
}
