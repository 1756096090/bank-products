import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-custom-button',
  styleUrl: './custom-button.scss',
  templateUrl: './custom-button.html',
})
export class CustomButton {
  readonly variant = input<'primary' | 'secondary'>('primary');

  readonly disabled = input(false);

  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly clicked = output<void>();

  onClick(): void {
    if (this.disabled()) return;

    this.clicked.emit();
  }
}
