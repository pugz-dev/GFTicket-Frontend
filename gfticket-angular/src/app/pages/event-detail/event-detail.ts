import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EventModel } from '../../models/event.model';
import { EventService } from '../../services/event.service';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
})
export class EventDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly cdr = inject(ChangeDetectorRef);

  event: EventModel | null = null;
  fechaLarga = '';
  loading = true;
  error = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event;
        this.fechaLarga = this.formatFechaLarga(event.fechaEvento);
        this.loading = false;
        this.error = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.event = null;
        this.loading = false;
        this.error = true;
        this.cdr.markForCheck();
      },
    });
  }

  private formatFechaLarga(fechaEvento: string): string {
    const d = new Date(fechaEvento);
    return `${d.getDate()} de ${MESES[d.getMonth()]} ${d.getFullYear()}`;
  }
}
