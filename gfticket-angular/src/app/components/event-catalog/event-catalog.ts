import { Component, Input } from '@angular/core';
import { EventModel } from "../../models/event.model";
import { RouterLink } from '@angular/router';

const MONTH_ABBRS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

@Component({
  selector: 'app-event-catalog',
  imports: [RouterLink],
  templateUrl: './event-catalog.html',
  styleUrl: './event-catalog.css',
})
export class EventCatalog {
  @Input() events: EventModel[] = [];

  dayNum(event: EventModel): number {
    return new Date(event.fechaEvento).getDate();
  }

  monthAbbr(event: EventModel): string {
    return MONTH_ABBRS[new Date(event.fechaEvento).getMonth()];
  }
}
