import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { EventModel } from '../../models/event.model';
import { EventService } from '../../services/event.service';
import { PurchaseService } from '../../services/purchase.service';
import { TicketPurchaseModel } from '../../models/tickets-purchase.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly purchaseService = inject(PurchaseService);
  private readonly cdr = inject(ChangeDetectorRef);

  event: EventModel | null = null;
  loading = true;
  error = false;

  form = new FormGroup({
    email: new FormControl('', Validators.required),
    nombreTitular: new FormControl('', Validators.required),
    numeroTarjeta: new FormControl('', Validators.required),
    mesCaducidad: new FormControl('', Validators.required),
    yearCaducidad: new FormControl('', Validators.required),
    cvv: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
        this.error = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.event = null;
        this.loading = false;
        this.error = true;
        // Detecta un cambio en la funcionalidad para gestionar la posible excepción
        this.cdr.markForCheck();
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.event) {
      return;
    }

    const formValue = this.form.getRawValue();
    const purchase: TicketPurchaseModel = {
      email: formValue.email!,
      eventId: this.event.id,
      cardData: {
        nombreTitular: formValue.nombreTitular!,
        numeroTarjeta: formValue.numeroTarjeta!,
        mesCaducidad: formValue.mesCaducidad!,
        yearCaducidad: formValue.yearCaducidad!,
        cvv: formValue.cvv!,
      },
    };

    this.purchaseService.compraEntradas(purchase, this.event).subscribe({
      next: () => {
        this.router.navigate(['/confirmacion'], {
          state: { success: true, eventId: this.event!.id },
        });
      },
      error: (err) => {
        this.router.navigate(['/confirmacion'], {
          state: { success: false, codigoError: err.error.error, eventId: this.event!.id },
        });
      },
    });
  }
}
