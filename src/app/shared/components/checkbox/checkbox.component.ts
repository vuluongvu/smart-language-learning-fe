import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'oq-checkbox',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OqCheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <label class="oq-checkbox" [class.oq-checkbox--disabled]="isDisabled()">
      <input
        type="checkbox"
        [checked]="checked()"
        [disabled]="isDisabled()"
        (change)="toggle($event)"
        (blur)="handleBlur()"
      />
      <span class="oq-checkbox__text">
        <span class="oq-checkbox__label">{{ label() }}</span>
        @if (description()) {
          <span class="oq-checkbox__desc">{{ description() }}</span>
        }
      </span>
    </label>
  `,
  styles: [
    `
      .oq-checkbox {
        display: inline-flex;
        align-items: flex-start;
        gap: 10px;
        cursor: pointer;
        user-select: none;

        &--disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        input {
          margin-top: 2px;
          width: 17px;
          height: 17px;
          accent-color: var(--oq-accent);
          cursor: inherit;
        }
      }

      .oq-checkbox__text {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .oq-checkbox__label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--oq-text-primary);
      }

      .oq-checkbox__desc {
        font-size: 0.8125rem;
        color: var(--oq-text-muted);
      }
    `,
  ],
})
export class OqCheckboxComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly description = input<string | null>(null);

  protected readonly checked = signal(false);
  protected readonly isDisabled = signal(false);

  private onChange: (val: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(val: boolean | null | undefined): void {
    this.checked.set(Boolean(val));
  }

  registerOnChange(fn: (val: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }

  protected toggle(event: Event): void {
    const next = (event.target as HTMLInputElement).checked;
    this.checked.set(next);
    this.onChange(next);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}
