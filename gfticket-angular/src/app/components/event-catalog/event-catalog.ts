import { Component, inject, Input } from '@angular/core';
import { EventModel } from "../../models/event.model";
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

const MONTH_ABBRS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

@Component({
  selector: 'app-event-catalog',
  imports: [RouterLink],
  templateUrl: './event-catalog.html',
  styleUrl: './event-catalog.css',
})
export class EventCatalog {
  @Input() events: EventModel[] = [];
  readonly authService = inject(AuthService);

  dayNum(event: EventModel): number {
    return new Date(event.fechaEvento).getDate();
  }

  monthAbbr(event: EventModel): string {
    return MONTH_ABBRS[new Date(event.fechaEvento).getMonth()];
  }
}
