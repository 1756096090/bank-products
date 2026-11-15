import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Icon } from './icon';

@Component({
  imports: [Icon],
  template: `<app-icon name="edit" />`,
})
class Host {}

describe('Icon', () => {
  it('dibuja el nombre del ícono como ligadura y lo oculta a lectores de pantalla', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    const icon = (fixture.nativeElement as HTMLElement).querySelector('app-icon') as HTMLElement;

    expect(icon.textContent?.trim()).toBe('edit');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.classList).toContain('app-icon');
  });
});
