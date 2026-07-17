import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { EventCatalog } from '../event-catalog/event-catalog';
import { EventModel } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [EventCatalog],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList implements OnInit {
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

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.eventService.getEventosByName(value).subscribe({
      next: (events) => {
        this.events = events;
        this.error = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.events = [];
        this.error = true;
        this.cdr.markForCheck();
      },
    });
  }
}
