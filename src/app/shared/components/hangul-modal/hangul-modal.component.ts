import { Component, input, output } from '@angular/core';
import { type RecognizeHandwritingResult } from '../../types/ai.types';
import { OqHangulPadComponent } from '../hangul-pad/hangul-pad.component';
import { OqModalComponent } from '../modal/modal.component';

@Component({
  selector: 'oq-hangul-modal',
  imports: [OqModalComponent, OqHangulPadComponent],
  template: `
    <oq-modal
      [open]="open()"
      [title]="title()"
      [description]="description()"
      size="xl"
      (closed)="closed.emit()"
    >
      @if (open()) {
        <oq-hangul-pad
          [expectedText]="expectedText()"
          [initialTab]="initialTab()"
          [allowGuideTab]="allowGuideTab()"
          (textSelected)="textSelected.emit($event)"
          (evaluated)="evaluated.emit($event)"
        />
      }
    </oq-modal>
  `,
})
export class OqHangulModalComponent {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly expectedText = input<string>('');
  readonly initialTab = input<'guide' | 'freehand'>('guide');
  readonly allowGuideTab = input<boolean>(true);

  readonly closed = output<void>();
  readonly textSelected = output<string>();
  readonly evaluated = output<RecognizeHandwritingResult>();
}
