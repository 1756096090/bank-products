import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BankHeader } from './shared/components/bank-header/bank-header';
import { ErrorDialog } from './shared/components/error-dialog/error-dialog';

@Component({
  imports: [RouterOutlet, BankHeader, ErrorDialog],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('bank-products');
}
