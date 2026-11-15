import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Paginator } from './paginator';

describe('Paginator', () => {
  let fixture: ComponentFixture<Paginator>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Paginator] }).compileComponents();
    fixture = TestBed.createComponent(Paginator);
    element = fixture.nativeElement;
    fixture.componentRef.setInput('totalPages', 8);
    await fixture.whenStable();
  });

  it('muestra tres números, puntos suspensivos y la página activa', () => {
    expect(fixture.componentInstance.visiblePages()).toEqual([1, 2, 3]);
    expect(element.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('1');
    expect(element.textContent).toContain('…');
    expect((element.querySelector('[aria-label="Página anterior"]') as HTMLButtonElement).disabled).toBe(true);
  });

  it('avanza y retrocede notificando la página seleccionada', async () => {
    const changed = jest.fn();
    fixture.componentInstance.page.subscribe(changed);
    (element.querySelector('[aria-label="Página siguiente"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(changed).toHaveBeenLastCalledWith(2);
    (element.querySelector('[aria-label="Página anterior"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(changed).toHaveBeenLastCalledWith(1);
  });

  it('permite elegir un número y desplaza los tres números visibles', async () => {
    (element.querySelector('[aria-label="Página 3"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.visiblePages()).toEqual([2, 3, 4]);
    expect(element.querySelectorAll('span')).toHaveLength(2);
  });

  it('deshabilita siguiente al llegar a la última página', async () => {
    fixture.componentRef.setInput('page', 8);
    await fixture.whenStable();
    expect(fixture.componentInstance.visiblePages()).toEqual([6, 7, 8]);
    expect((element.querySelector('[aria-label="Página siguiente"]') as HTMLButtonElement).disabled).toBe(true);
    fixture.componentInstance.goTo(9);
    expect(fixture.componentInstance.page()).toBe(8);
  });

  it('muestra una página sin puntos suspensivos y ambas flechas deshabilitadas', async () => {
    fixture.componentRef.setInput('totalPages', 1);
    await fixture.whenStable();
    expect(fixture.componentInstance.visiblePages()).toEqual([1]);
    expect(element.textContent).not.toContain('…');
    expect(element.querySelectorAll('button:disabled')).toHaveLength(2);
    fixture.componentInstance.goTo(0);
    expect(fixture.componentInstance.page()).toBe(1);
  });
});
