import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorDialogService {
  readonly message = signal('');

  show(message: string): void {
    this.message.set(message);
  }

  close(): void {
    this.message.set('');
  }
}
