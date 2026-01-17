export interface IReservation {
    id: string;
    from: string;
    to: string;
    ruleId: string;
    date: Date | string;
    providerId: string;
    customerId: string;
}

export interface ISendReservation {
    from: string;
    to: string;
    date: string;
    providerId: string;
}

export interface IReservedSlot {
    from: string;
    to: string;
    date: string;
    providerId: string;
}