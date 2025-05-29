export interface Train {
    trainName: string;
    fromCity: string;
    toCity: string;
    seatsAvailable: number;
    ticketPrices: {
        economy: number;
        business: number;
        firstClass: number;
    };
}