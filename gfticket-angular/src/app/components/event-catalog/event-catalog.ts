import { Component, Input } from '@angular/core';
import { EventModel } from "../../models/event.model";

@Component({
  selector: 'app-event-catalog',
  imports: [],
  templateUrl: './event-catalog.html',
  styleUrl: './event-catalog.css',
})
export class EventCatalog {
  @Input() events: EventModel[] = [];
}
