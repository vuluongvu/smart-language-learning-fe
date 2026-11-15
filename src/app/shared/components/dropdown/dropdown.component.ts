import { Component, ElementRef, inject, input, signal } from '@angular/core';
import { OqIconComponent, OqIconName } from '../icon/icon.component';

@Component({
  selector: 'oq-dropdown',
  imports: [OqIconComponent],
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
  template: `
    <div class="oq-dropdown">
      <button
        type="button"
        class="oq-btn oq-btn--secondary oq-btn--sm"
        aria-haspopup="menu"
        [attr.aria-expanded]="open()"
        (click)="toggle()"
      >
        @if (icon()) {
          <oq-icon [name]="icon()!" [size]="15" />
        }
        <span>{{ label() }}</span>
        <oq-icon name="chevron-down" [size]="14" />
      </button>

      @if (open()) {
        <div
          class="oq-dropdown__menu"
          [class.oq-dropdown__menu--left]="align() === 'left'"
          role="menu"
          (click)="close()"
        >
          <ng-content />
        </div>
      }
    </div>
  `,
  styles: [
    `
      .oq-dropdown {
        position: relative;
        display: inline-block;
      }

      .oq-dropdown__menu {
        position: absolute;
        top: calc(100% + 6px);
        right: 0;
        min-width: 180px;
        padding: 6px;
        background: var(--oq-bg-surface);
        border: 1px solid var(--oq-border-subtle);
        border-radius: var(--oq-radius-md);
        box-shadow: var(--oq-shadow-md);
        z-index: 40;
        display: flex;
        flex-direction: column;
        gap: 2px;

        &--left {
          right: auto;
          left: 0;
        }
      }
    `,
  ],
})
export class OqDropdownComponent {
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  readonly label = input.required<string>();
  readonly icon = input<OqIconName | null>(null);
  readonly align = input<'left' | 'right'>('right');

  protected readonly open = signal(false);

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.hostEl.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
