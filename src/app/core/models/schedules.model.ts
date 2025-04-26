export interface ISlot {
    from: string;
    to: string;
    takenBy: string;
}

export type SlotType = Omit<ISlot, 'takenBy'>;

export interface ISchedule {
    id: string,
    scheduledDate: Date,
    slots: ISlot[];
    status: boolean;
    bookingLimit?: number;
    bufferTime?: string;
    serviceArea?: [number, number];
    serviceRadius: number;
    default: Omit<ISlot, 'takenBy'>[];

}