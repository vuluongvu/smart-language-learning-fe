import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface OqSelectOption<T = string | number | null> {
  label: string;
  value: T;
}

let nextSelectId = 0;

@Component({
  selector: 'oq-select',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OqSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="oq-field">
      @if (label()) {
        <label [for]="selectId">{{ label() }}</label>
      }
      <select
        [id]="selectId"
        [disabled]="isDisabled()"
        [attr.aria-label]="ariaLabel() || label() || null"
        (change)="handleChange($event)"
        (blur)="handleBlur()"
      >
        @for (opt of options(); track opt.label) {
          <option [value]="opt.value === null ? '' : opt.value" [selected]="opt.value === value()">
            {{ opt.label }}
          </option>
        }
      </select>
      @if (error()) {
        <span class="oq-field-error">{{ error() }}</span>
      } @else if (hint()) {
        <span class="oq-field-hint">{{ hint() }}</span>
      }
    </div>
  `,
})
export class OqSelectComponent implements ControlValueAccessor {
  readonly label = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly options = input<OqSelectOption[]>([]);
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);

  protected readonly selectId = `oq-select-${++nextSelectId}`;
  protected readonly value = signal<string | number | null>('');
  protected readonly isDisabled = signal(false);

  private onChange: (val: string | number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(val: string | number | null | undefined): void {
    this.value.set(val ?? null);
  }

  registerOnChange(fn: (val: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }

  protected handleChange(event: Event): void {
    const idx = (event.target as HTMLSelectElement).selectedIndex;
    const chosen = this.options()[idx]?.value ?? null;
    this.value.set(chosen);
    this.onChange(chosen);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}
