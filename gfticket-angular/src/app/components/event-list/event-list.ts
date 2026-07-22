import { ChangeDetectorRef, Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EventCatalog } from '../event-catalog/event-catalog';
import { EventModel } from '../../models/event.model';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [EventCatalog, RouterLink],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly elementRef = inject(ElementRef);
  readonly authService = inject(AuthService);

  events: EventModel[] = [];
  loading = true;
  error = false;
  menuOpen = false;

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

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  onLogout(): void {
    this.authService.logout();
    this.menuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.menuOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
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
