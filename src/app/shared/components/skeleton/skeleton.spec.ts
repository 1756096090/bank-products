import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Skeleton } from './skeleton';
import { TableSkeleton } from '../table-skeleton/table-skeleton';
import { FormSkeleton } from '../form-skeleton/form-skeleton';

@Component({
  imports: [TableSkeleton],
  template: '<table><tbody appTableSkeleton [columns]="4" [rows]="3"></tbody></table>',
})
class TableHost {}

describe('Skeleton components', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Skeleton, TableSkeleton, FormSkeleton, TableHost],
    }).compileComponents();
  });

  it('permite reutilizar el skeleton con tamaño y forma distintos', async () => {
    const fixture = TestBed.createComponent(Skeleton);
    fixture.componentRef.setInput('width', '40px');
    fixture.componentRef.setInput('height', '40px');
    fixture.componentRef.setInput('shape', 'circle');
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.style.width).toBe('40px');
    expect(element.style.height).toBe('40px');
    expect(element.classList.contains('skeleton--circle')).toBe(true);
    expect(element.getAttribute('aria-hidden')).toBe('true');
    expect(element.textContent).toBe('');
  });

  it('genera las filas y columnas solicitadas dentro de un tbody válido', async () => {
    const fixture = TestBed.createComponent(TableHost);
    await fixture.whenStable();
    const element = fixture.nativeElement.querySelector('tbody') as HTMLElement;
    expect(element.tagName).toBe('TBODY');
    expect(element.querySelectorAll('tr')).toHaveLength(3);
    expect(element.querySelectorAll('app-skeleton')).toHaveLength(12);
    expect(element.getAttribute('aria-hidden')).toBe('true');
  });

  it('reutiliza la base para los campos y acciones del formulario', async () => {
    const fixture = TestBed.createComponent(FormSkeleton);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.form-skeleton__field')).toHaveLength(6);
    expect(element.querySelectorAll('.form-skeleton__actions app-skeleton')).toHaveLength(2);
    expect(element.querySelector('[role="status"]')?.getAttribute('aria-label')).toBe(
      'Cargando formulario',
    );
    expect(element.querySelector('input, button')).toBeNull();
  });
});
