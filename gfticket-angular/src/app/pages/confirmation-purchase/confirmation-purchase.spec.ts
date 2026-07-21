import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationPurchase } from './confirmation-purchase';

describe('ConfirmationPurchase', () => {
  let component: ConfirmationPurchase;
  let fixture: ComponentFixture<ConfirmationPurchase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationPurchase],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationPurchase);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
