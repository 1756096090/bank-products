import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomButton } from './custom-button';

@Component({
  imports: [CustomButton],
  template: '<app-custom-button (clicked)="onClick()">Agregar</app-custom-button>'
})
class ButtonHost {
  readonly onClick = jest.fn();
}

describe('CustomButton', () => {
  let fixture: ComponentFixture<CustomButton>;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CustomButton, ButtonHost] }).compileComponents();
    fixture = TestBed.createComponent(CustomButton);
    await fixture.whenStable();
    button = fixture.nativeElement.querySelector('button');
  });

  it('usa la variante principal y tipo button por defecto', () => {
    expect(button.type).toBe('button');
    expect(button.classList.contains('custom-button--primary')).toBe(true);
    expect(button.disabled).toBe(false);
  });

  it('permite cambiar a la variante secundaria', async () => {
    fixture.componentRef.setInput('variant', 'secondary');
    await fixture.whenStable();
    expect(button.classList.contains('custom-button--secondary')).toBe(true);
    expect(button.classList.contains('custom-button--primary')).toBe(false);
  });

  it.each(['submit', 'reset'])('respeta el tipo %s', async type => {
    fixture.componentRef.setInput('type', type);
    await fixture.whenStable();
    expect(button.type).toBe(type);
  });

  it('proyecta el contenido y notifica al padre al pulsar', async () => {
    const host = TestBed.createComponent(ButtonHost);
    await host.whenStable();
    const projectedButton = host.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(projectedButton.textContent?.trim()).toBe('Agregar');
    projectedButton.click();
    expect(host.componentInstance.onClick).toHaveBeenCalledTimes(1);
  });

  it('no emite eventos cuando está deshabilitado', async () => {
    const clicked = jest.fn();
    fixture.componentInstance.clicked.subscribe(clicked);
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    expect(button.disabled).toBe(true);
    button.click();
    fixture.componentInstance.onClick();
    expect(clicked).not.toHaveBeenCalled();
  });
});
