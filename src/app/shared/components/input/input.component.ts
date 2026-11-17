import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextInputId = 0;

@Component({
  selector: 'oq-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OqInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="oq-field">
      @if (label()) {
        <label [for]="inputId">{{ label() }}</label>
      }
      <input
        [id]="inputId"
        [type]="type()"
        [value]="value()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [attr.autocomplete]="autocomplete()"
        (input)="handleInput($event)"
        (blur)="handleBlur()"
      />
      @if (error()) {
        <span class="oq-field-error">{{ error() }}</span>
      } @else if (hint()) {
        <span class="oq-field-hint">{{ hint() }}</span>
      }
    </div>
  `,
})
export class OqInputComponent implements ControlValueAccessor {
  readonly label = input<string | null>(null);
  readonly type = input<'text' | 'email' | 'password' | 'search' | 'url' | 'number'>('text');
  readonly placeholder = input<string>('');
  readonly autocomplete = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);

  protected readonly inputId = `oq-input-${++nextInputId}`;
  protected readonly value = signal<string>('');
  protected readonly isDisabled = signal(false);

  private onChange: (val: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(val: string | number | null | undefined): void {
    this.value.set(val === null || val === undefined ? '' : String(val));
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }

  protected handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}
