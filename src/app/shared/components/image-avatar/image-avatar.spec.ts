import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageAvatar } from './image-avatar';
import { MOCK_PRODUCTS } from '../../../features/products/data/mocks/products.mock';

describe('ImageAvatar', () => {
  let component: ImageAvatar;
  let fixture: ComponentFixture<ImageAvatar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageAvatar],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageAvatar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it.each([undefined, null, MOCK_PRODUCTS[1].logo])('debe mostrar JG sin imagen (%s)', async src => {
    fixture.componentRef.setInput('src', src);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('.image-avatar--fallback')).not.toBeNull();
    expect(fixture.nativeElement.textContent.trim()).toBe('JG');
  });

  it('debe mostrar el logo y el nombre del producto sin círculo', async () => {
    fixture.componentRef.setInput('src', MOCK_PRODUCTS[0].logo);
    fixture.componentRef.setInput('alt', MOCK_PRODUCTS[0].name);
    await fixture.whenStable();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(image.getAttribute('src')).toBe(MOCK_PRODUCTS[0].logo);
    expect(image.alt).toBe(MOCK_PRODUCTS[0].name);
    expect(fixture.nativeElement.querySelector('.image-avatar--fallback')).toBeNull();
  });

  it('debe mostrar JG cuando falla la imagen y permitir una nueva URL', async () => {
    fixture.componentRef.setInput('src', MOCK_PRODUCTS[0].logo);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.textContent.trim()).toBe('JG');

    const newLogo = '/images/otro-logo.png';
    fixture.componentRef.setInput('src', newLogo);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe(newLogo);
    expect(fixture.nativeElement.querySelector('.image-avatar--fallback')).toBeNull();
  });

  it('debe respetar la altura y el ancho máximo configurados', async () => {
    fixture.componentRef.setInput('src', MOCK_PRODUCTS[0].logo);
    fixture.componentRef.setInput('height', '48px');
    fixture.componentRef.setInput('maxWidth', '120px');
    await fixture.whenStable();

    const avatar = fixture.nativeElement.querySelector('.image-avatar') as HTMLElement;
    expect(avatar.style.height).toBe('48px');
    expect(avatar.style.maxWidth).toBe('120px');
    expect(avatar.style.width).toBe('');
  });

  it('debe permitir otras iniciales en el círculo', async () => {
    fixture.componentRef.setInput('fallback', 'AB');
    fixture.componentRef.setInput('height', '48px');
    await fixture.whenStable();

    const avatar = fixture.nativeElement.querySelector('.image-avatar--fallback') as HTMLElement;
    expect(avatar.textContent?.trim()).toBe('AB');
    expect(avatar.style.width).toBe('48px');
    expect(avatar.style.height).toBe('48px');
  });
});
