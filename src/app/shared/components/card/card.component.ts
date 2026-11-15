import { Component, input } from '@angular/core';

@Component({
  selector: 'oq-card',
  template: `
    <div
      class="oq-card"
      [class.oq-card--subtle]="variant() === 'subtle'"
      [class.oq-card--danger]="variant() === 'danger'"
      [class.oq-card--compact]="padding() === 'compact'"
      [class.oq-card--none]="padding() === 'none'"
      [class.oq-card--interactive]="interactive()"
    >
      <ng-content />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .oq-card--none {
        padding: 0;
      }
    `,
  ],
})
export class OqCardComponent {
  readonly variant = input<'default' | 'subtle' | 'danger'>('default');
  readonly padding = input<'default' | 'compact' | 'none'>('default');
  readonly interactive = input<boolean>(false);
}
