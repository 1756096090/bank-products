import { FormControl } from '@angular/forms';
import {
  isIsoDate,
  releaseDateValidator,
  revisionDate,
  todayIso,
  trimmedRequired,
} from './product-form.validators';

describe('Product form validators', () => {
  it('acepta hoy y rechaza fechas anteriores o inválidas', () => {
    expect(releaseDateValidator(new FormControl(todayIso()))).toBeNull();
    expect(releaseDateValidator(new FormControl('2000-01-01'))).toEqual({ releaseDate: true });
    expect(releaseDateValidator(new FormControl('2026-02-30'))).toEqual({ releaseDate: true });
    expect(isIsoDate('no-date')).toBe(false);
    expect(releaseDateValidator(new FormControl(''))).toBeNull();
  });

  it('calcula un año posterior y ajusta el 29 de febrero al último día de febrero', () => {
    expect(revisionDate('2026-12-15')).toBe('2027-12-15');
    expect(revisionDate('2028-02-29')).toBe('2029-02-28');
    expect(revisionDate('')).toBe('');
    expect(revisionDate('2026-02-30')).toBe('');
  });

  it('rechaza campos vacíos o con solo espacios', () => {
    expect(trimmedRequired(new FormControl('   '))).toEqual({ required: true });
    expect(trimmedRequired(new FormControl('Visa'))).toBeNull();
  });
});
