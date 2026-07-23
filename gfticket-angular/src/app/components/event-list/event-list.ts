import { ChangeDetectorRef, Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { EventCatalog } from '../event-catalog/event-catalog';
import { EventModel } from '../../models/event.model';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [EventCatalog, RouterLink, FormsModule],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly elementRef = inject(ElementRef);
  readonly authService = inject(AuthService);

  allEvents: EventModel[] = [];
  filteredEvents: EventModel[] = [];
  loading = true;
  error = false;
  menuOpen = false;
  
  localities : string[] = [];
  genres : string[] = [];

  //filter values
  searchTerm = '';
  selectedLocality = '';
  selectedGenre = '';

  ngOnInit(): void {
    this.cargarEventos();
  }

  reintentar(): void {
    this.loading = true;
    this.error = false;
    this.cargarEventos();
  }

  private cargarEventos(): void {
    this.eventService.getEventos().subscribe({
      next: (events) => {
        this.allEvents = events;
        this.filteredEvents = this.allEvents;
        this.loading = false;
        this.error = false;
        this.cdr.markForCheck();

        this.localities = this.getLocalities();
        this.genres = this.getGenres();
      },
      error: (err) => {
        this.allEvents = [];
        this.filteredEvents = [];
        this.loading = false;
        this.error = true;
        this.cdr.markForCheck();
        console.log(err);
      },
    });
  }

  //Create a list of only existing localities from the received events, sorted alphabetically
  getLocalities() : string[] {
    let inputSet : Set<string> = new Set(); 
    this.allEvents.map(event => inputSet.add(
      //Save all localities with only first letter capitalized
      event.localidad.charAt(0).toUpperCase() + event.localidad.slice(1).toLowerCase()
    ));
    let res = Array.from(inputSet);
    //Sort alphabetically
    res.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    return Array.from(res);
  }

  getGenres() : string[]{
    let inputSet : Set<string> = new Set(); 
    
    //Save all genres with only first letter capitalized
        //Multiple genres are saved as "genre_1/genre_2", so we split it to avoid repetitions
    this.allEvents.map(event => 
      event.genero.split('/').map(genero => 
        inputSet.add(genero.charAt(0).toUpperCase() + genero.slice(1).toLowerCase()
      )
    ));
    let res = Array.from(inputSet);
    //Sort alphabetically
    res.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    return Array.from(res);
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

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedLocality = '';
    this.applyFilters(); // re-fetch the full list
  }

  private applyFilters(): void {
    const name = this.searchTerm.trim().toLowerCase();
    const locality = this.selectedLocality;
    const genre = this.selectedGenre;

    this.filteredEvents = this.allEvents.filter(event => {
      const matchesName = name === '' || event.nombre.toLowerCase().includes(name);
      const matchesLocality = locality === '' || event.localidad.toLowerCase() === locality.toLowerCase();
      //Multiple genres are saved as "genre_1/genre_2", split it to find at least one match
      const matchesGenre = genre === '' || event.genero.split('/').includes(genre);
      return matchesName && matchesLocality && matchesGenre;   // add the 3rd filter here later
    });

    this.cdr.markForCheck();
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  onLocalityChange(value: string): void {
    this.selectedLocality = value;
    this.applyFilters();
  }

  onGenreChange(value: string): void {
    this.selectedGenre = value;
    this.applyFilters();
  }
}
