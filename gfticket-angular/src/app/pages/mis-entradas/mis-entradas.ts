import { Component, inject } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { TicketModel } from '../../models/ticket.model';

@Component({
  selector: 'app-mis-entradas',
  imports: [],
  templateUrl: './mis-entradas.html',
  styleUrl: './mis-entradas.css',
})
export class MisEntradas {
  private readonly authService = inject(AuthService);

  get entradas(): TicketModel[] {
    return this.authService.usuarioActual()?.entradas ?? [];
  }
}
