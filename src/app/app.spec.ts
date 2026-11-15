import { TestBed } from '@angular/core/testing';
import { App } from './app';

it('should render bank header', async () => {
  const fixture = TestBed.createComponent(App);

  fixture.detectChanges();
  await fixture.whenStable();

  const compiled = fixture.nativeElement as HTMLElement;

  const header = compiled.querySelector('app-bank-header');

  expect(header).not.toBeNull();
});
