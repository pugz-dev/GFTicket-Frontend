import { Component } from '@angular/core';

import { EventList } from '../../components/event-list/event-list';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [EventList],
  templateUrl: './public-home.html',
  styleUrl: './public-home.css',
})
export class PublicHome {
}
