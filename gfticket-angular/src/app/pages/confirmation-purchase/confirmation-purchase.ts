import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PurchaseService } from '../../services/purchase.service';

@Component({
  selector: 'app-confirmation-purchase',
  imports: [RouterLink],
  templateUrl: './confirmation-purchase.html',
  styleUrl: './confirmation-purchase.css',
})
export class ConfirmationPurchase {
  private readonly purchaseService = inject(PurchaseService);

  success: boolean = true;
  mensaje: string = '';
  eventId?: number;

  constructor() {
    const state = history.state as { success: boolean; codigoError: string; eventId?: number };
    this.success = state.success;
    this.eventId = state.eventId;
    this.mensaje = this.success ? 'Tu compra se ha realizado correctamente' : this.purchaseService.getMensajeError(state.codigoError);
  }
}
