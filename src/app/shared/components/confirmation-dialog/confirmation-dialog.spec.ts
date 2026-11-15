import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialog } from './confirmation-dialog';
import { mockNativeDialog } from '../../testing/native-dialog.stub';

describe('ConfirmationDialog', () => {
  let fixture: ComponentFixture<ConfirmationDialog>;
  let dialog: HTMLDialogElement;
  let restoreDialog: () => void;

  beforeEach(async () => {
    restoreDialog = mockNativeDialog();
    await TestBed.configureTestingModule({ imports: [ConfirmationDialog] }).compileComponents();
    fixture = TestBed.createComponent(ConfirmationDialog);
    fixture.componentRef.setInput('title', '¿Estás seguro de eliminar el producto Visa?');
    await fixture.whenStable();
    dialog = fixture.nativeElement.querySelector('dialog');
  });
  afterEach(() => restoreDialog());

  it('abre un diálogo con título accesible y ambos botones', async () => {
    expect(dialog.open).toBe(false);
    fixture.componentRef.setInput('open', true);
    await fixture.whenStable();
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('h2')!.id).toBe(dialog.getAttribute('aria-labelledby'));
    expect(dialog.textContent).toContain('Cancelar');
    expect(dialog.textContent).toContain('Confirmar');
    fixture.componentRef.setInput('open', false);
    await fixture.whenStable();
    expect(dialog.open).toBe(false);
  });

  it('emite confirmar o cancelar sin ejecutar ninguna operación de negocio', async () => {
    const confirmed = jest.fn();
    const cancelled = jest.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    fixture.componentInstance.cancelled.subscribe(cancelled);
    fixture.componentRef.setInput('open', true);
    await fixture.whenStable();
    const buttons = dialog.querySelectorAll('button');
    buttons[0].click();
    buttons[1].click();
    expect(cancelled).toHaveBeenCalledTimes(1);
    expect(confirmed).toHaveBeenCalledTimes(1);
  });

  it('cancela con Escape cuando no hay una operación pendiente', async () => {
    const cancelled = jest.fn();
    fixture.componentInstance.cancelled.subscribe(cancelled);
    fixture.componentRef.setInput('open', true);
    await fixture.whenStable();
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(cancelled).toHaveBeenCalledTimes(1);
  });

  it('bloquea confirmar, cancelar y Escape durante la petición', async () => {
    const confirmed = jest.fn();
    const cancelled = jest.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    fixture.componentInstance.cancelled.subscribe(cancelled);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('busy', true);
    fixture.componentRef.setInput('pendingLabel', 'Eliminando…');
    await fixture.whenStable();
    expect(dialog.querySelectorAll('button:disabled')).toHaveLength(2);
    expect(dialog.textContent).toContain('Eliminando…');
    fixture.componentInstance.confirm();
    fixture.componentInstance.cancel();
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(confirmed).not.toHaveBeenCalled();
    expect(cancelled).not.toHaveBeenCalled();
  });

  it('muestra errores dentro del diálogo', async () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('error', 'Error de servicio 500');
    await fixture.whenStable();
    expect(dialog.querySelector('[role="alert"]')?.textContent).toContain('500');
  });

  it('cancela al tocar el fondo sin cerrar por un clic dentro del contenido', async () => {
    const cancelled = jest.fn();
    fixture.componentInstance.cancelled.subscribe(cancelled);
    fixture.componentRef.setInput('open', true);
    await fixture.whenStable();
    jest.spyOn(dialog, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 10, 200, 100));
    dialog.dispatchEvent(new MouseEvent('click', { clientX: 100, clientY: 50 }));
    expect(cancelled).not.toHaveBeenCalled();
    dialog.querySelector('h2')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(cancelled).not.toHaveBeenCalled();
    dialog.dispatchEvent(new MouseEvent('click', { clientX: 1, clientY: 1 }));
    expect(cancelled).toHaveBeenCalledTimes(1);
  });
});
