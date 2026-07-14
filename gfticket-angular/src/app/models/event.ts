import { Temporal } from 'temporal-polyfill';

export interface Event {

  id: string;
  title: string;
  description: string;
  eventDate: Temporal.PlainDate;
  eventTime: Temporal.PlainTime;
  minPrice: number;
  maxPrice: number;
  city: string;
  genre: string;
  venueName: string;
  image: string;



}
