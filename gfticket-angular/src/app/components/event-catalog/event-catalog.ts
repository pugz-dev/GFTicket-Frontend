import { Component, Input } from '@angular/core';
import { EventModel } from "../../models/event.model";
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-event-catalog',
  imports: [RouterLink],
  templateUrl: './event-catalog.html',
  styleUrl: './event-catalog.css',
})
export class EventCatalog {
  @Input() events: EventModel[] = [];
}
