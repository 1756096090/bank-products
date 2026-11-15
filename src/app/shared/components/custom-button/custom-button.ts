import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-custom-button',
  styleUrl: './custom-button.scss',
  templateUrl: './custom-button.html',
})
export class CustomButton {

  // Variante
  readonly variant = input<'primary' | 'secondary'>('primary');

  // Estado
  readonly disabled = input(false);

  // Tipo
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  // Clic
  readonly clicked = output<void>();

  onClick(): void {
    if (this.disabled()) return;

    this.clicked.emit();
  }
}
