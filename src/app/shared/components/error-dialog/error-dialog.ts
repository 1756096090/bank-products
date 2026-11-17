import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { CustomButton } from '../custom-button/custom-button';
import { ErrorDialogService } from './error-dialog.service';

@Component({
  selector: 'app-error-dialog',
  imports: [CustomButton],
  templateUrl: './error-dialog.html',
  styleUrl: './error-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDialog {
  readonly state = inject(ErrorDialogService);
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const dialog = this.dialog()?.nativeElement;
      if (!dialog) return;
      if (this.state.message() && !dialog.open) dialog.showModal();
      if (!this.state.message() && dialog.open) dialog.close();
    });
  }

  dismiss(event?: Event): void {
    event?.preventDefault();
    this.state.close();
  }
}
