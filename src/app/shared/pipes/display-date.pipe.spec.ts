import { DisplayDatePipe } from './display-date.pipe';

describe('DisplayDatePipe', () => {
  const pipe = new DisplayDatePipe();

  it('muestra el día y mes con dos dígitos y el año completo', () => {
    expect(pipe.transform('2001-01-01')).toBe('01/01/2001');
    expect(pipe.transform('2026-11-16')).toBe('16/11/2026');
  });

  it('conserva la fecha UTC sin desplazarla al día anterior', () => {
    expect(pipe.transform('2001-01-01T00:00:00.000Z')).toBe('01/01/2001');
    expect(pipe.transform(new Date('2001-01-01T00:00:00.000Z'))).toBe('01/01/2001');
    expect(pipe.transform(0)).toBe('01/01/1970');
  });

  it('deja vacíos los valores ausentes', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });
});
