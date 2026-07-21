import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PurchaseService } from '../../services/purchase.service';
import { ConfirmationPurchase } from './confirmation-purchase';

describe('ConfirmationPurchase', () => {
  let component: ConfirmationPurchase;
  let fixture: ComponentFixture<ConfirmationPurchase>;
  let purchaseService: PurchaseService;

  function setNavigationState(state: unknown): void {
    window.history.replaceState(state, '');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationPurchase],
      providers: [provideRouter([])],
    }).compileComponents();

    purchaseService = TestBed.inject(PurchaseService);
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(ConfirmationPurchase);
    component = fixture.componentInstance;
  }

  it('creates the component', () => {
    setNavigationState({ success: true });
    createComponent();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('shows the error message from PurchaseService when the purchase fails (500.0001)', () => {
    const codigoError = '500.0001.Sistema inestable';
    setNavigationState({ success: false, codigoError, eventId: 7 });
    createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(purchaseService.getMensajeError(codigoError));
  });

  it('shows a success message when the purchase succeeds', () => {
    setNavigationState({ success: true });
    createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent?.toLowerCase()).toContain('compra realizada');
  });

  it('shows a link back to the cart when the purchase fails', () => {
    setNavigationState({ success: false, codigoError: '500.0001.Sistema inestable', eventId: 7 });
    createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const cartLink = compiled.querySelector('a.retry-link');
    expect(cartLink?.getAttribute('href')).toBe('/carrito/7');
  });

  it('shows a link back to the catalog when the purchase succeeds', () => {
    setNavigationState({ success: true });
    createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const catalogLink = compiled.querySelector('a.catalog-link');
    expect(catalogLink?.getAttribute('href')).toBe('/eventos');
  });

  it('does not show a link back to the cart when the purchase succeeds', () => {
    setNavigationState({ success: true });
    createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('a.retry-link')).toBeNull();
  });
});
