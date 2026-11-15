import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

let nextFieldId = 0;

@Component({
  selector: 'app-input-field',
  imports: [MatIconModule],
  templateUrl: './input-field.html',
  styleUrl: './input-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputField {
  readonly placeholder = input('Escribe aquí...');
  readonly type = input<'text' | 'email' | 'password' | 'search' | 'date'>('text');
  readonly fieldId = input(`input-field-${nextFieldId++}`);
  readonly label = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly required = input(false);
  readonly readOnly = input(false);
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  readonly icon = input<string | null>(null);
  readonly iconLabel = input('Acción del campo');
  readonly disabled = input(false);

  readonly value = model('');

  readonly iconClick = output<string>();
  readonly blurred = output<void>();

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.value.set(inputElement.value);
  }

  onIconClick(): void {
    if (this.disabled()) return;

    this.iconClick.emit(this.value());
  }
}
