import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { TicketModel } from '../../models/ticket.model';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-mis-entradas',
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './mis-entradas.html',
  styleUrl: './mis-entradas.css',
})
export class MisEntradas {
  private readonly authService = inject(AuthService);

  get entradas(): TicketModel[] {
    return this.authService.usuarioActual()?.entradas ?? [];
  }
}
