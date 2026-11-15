import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output
} from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-input-field',
  imports: [MatIconModule],
  templateUrl: './input-field.html',
  styleUrl: './input-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputField {

  readonly placeholder = input('Escribe aquí...');
  readonly type = input<'text' | 'email' | 'password' | 'search'>('text');
  readonly icon = input<string | null>(null);
  readonly iconLabel = input('Acción del campo');
  readonly disabled = input(false);

  // Valor del campo
  readonly value = model('');

  // Clic en el icono
  readonly iconClick = output<string>();

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.value.set(inputElement.value);
  }

  onIconClick(): void {
    if (this.disabled()) return;

    this.iconClick.emit(this.value());
  }
}
