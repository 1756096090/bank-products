import { TestBed } from '@angular/core/testing';
import { ErrorDialog } from './error-dialog';
import { ErrorDialogService } from './error-dialog.service';
import { mockNativeDialog } from '../../testing/native-dialog.stub';

describe('ErrorDialog', () => {
  let restore: () => void;
  beforeEach(() => {
    restore = mockNativeDialog();
  });
  afterEach(() => restore());

  it('muestra el mensaje como texto y se cierra con Aceptar o Escape', async () => {
    const fixture = TestBed.createComponent(ErrorDialog);
    const state = TestBed.inject(ErrorDialogService);
    await fixture.whenStable();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(false);
    state.show('El servicio no permite esta operación. <b>Detalle</b>');
    await fixture.whenStable();
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('p')?.textContent).toContain('<b>Detalle</b>');
    expect(dialog.querySelector('b')).toBeNull();
    expect(dialog.getAttribute('role')).toBe('alertdialog');
    dialog.querySelector('button')!.click();
    await fixture.whenStable();
    expect(dialog.open).toBe(false);
    expect(state.message()).toBe('');
    state.show('Otro error');
    await fixture.whenStable();
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await fixture.whenStable();
    expect(dialog.open).toBe(false);
    expect(state.message()).toBe('');
  });
});
