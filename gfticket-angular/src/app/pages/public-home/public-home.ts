import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EventModel } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './public-home.html',
  styleUrl: './public-home.css',
})
export class PublicHome implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly cdr = inject(ChangeDetectorRef);

  events: EventModel[] = [];
  loading = true;
  error = false;

  ngOnInit(): void {
    this.eventService.getEventos().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
        this.error = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.events = [];
        this.loading = false;
        this.error = true;
        this.cdr.markForCheck();
      },
    });
  }
}
