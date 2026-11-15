import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BankHeader } from './shared/components/bank-header/bank-header';

@Component({
  imports: [RouterOutlet, BankHeader],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('bank-products');
}
