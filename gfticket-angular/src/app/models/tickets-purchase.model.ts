import { CardDataModel } from "./card-data.model";

export interface TicketPurchaseModel {
    email: string;
    eventId: number;
    cardData: CardDataModel
}