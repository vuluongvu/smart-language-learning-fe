import { Component, input, output } from '@angular/core';

@Component({
  selector: 'oq-button',
  template: `
    <button
      [attr.type]="type()"
      class="oq-btn"
      [class.oq-btn--primary]="variant() === 'primary'"
      [class.oq-btn--secondary]="variant() === 'secondary'"
      [class.oq-btn--ghost]="variant() === 'ghost'"
      [class.oq-btn--danger]="variant() === 'danger'"
      [class.oq-btn--sm]="size() === 'sm'"
      [class.oq-btn--lg]="size() === 'lg'"
      [class.oq-btn--full]="fullWidth()"
      [disabled]="disabled() || loading()"
      (click)="clicked.emit($event)"
    >
      <ng-content />
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
    `,
  ],
})
export class OqButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('secondary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);
  readonly clicked = output<MouseEvent>();
}
