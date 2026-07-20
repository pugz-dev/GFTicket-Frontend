import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EventModel } from '../../models/event.model';
import { EventService } from '../../services/event.service';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly cdr = inject(ChangeDetectorRef);

  event: EventModel | null = null;
  loading = true;
  error = false;

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
}
