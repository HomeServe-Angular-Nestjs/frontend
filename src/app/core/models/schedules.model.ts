export interface ISlot {
    from: string;
    to: string;
    takenBy: string;
}

export type SlotType = Omit<ISlot, 'takenBy'>;

export interface ISchedule {
    id: string,
    scheduleDate: Date,
    slots: ISlot[];
    status: boolean;
    bookingLimit?: number;
    bufferTime?: string;
    serviceArea?: [number, number];
    serviceRadius: number;
}