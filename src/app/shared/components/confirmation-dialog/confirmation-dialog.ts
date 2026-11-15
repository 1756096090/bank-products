import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { CustomButton } from '../custom-button/custom-button';

let nextDialogId = 0;

@Component({
  selector: 'app-confirmation-dialog',
  imports: [CustomButton],
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialog {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly busy = input(false);
  readonly error = input('');
  readonly pendingLabel = input('Procesando…');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
  readonly titleId = `confirmation-dialog-${nextDialogId++}`;
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const dialog = this.dialog()?.nativeElement;
      if (!dialog) return;
      if (this.open() && !dialog.open) dialog.showModal();
      if (!this.open() && dialog.open) dialog.close();
    });
  }

  confirm(): void {
    if (this.open() && !this.busy()) this.confirmed.emit();
  }

  cancel(event?: Event): void {
    event?.preventDefault();
    if (this.open() && !this.busy()) this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    const dialog = this.dialog()?.nativeElement;
    if (!dialog || event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (outside) this.cancel();
  }
}
