export interface IPriceBreakup {
    serviceId: string;
    subServiceIds: string[]
}

export interface IPriceBreakupData {
    subTotal: number;
    tax: number;
    visitingFee: number;
    total: number;
}