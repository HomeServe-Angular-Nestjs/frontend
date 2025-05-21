export type ToggleType = true | false | 'all';

export interface IFilter {
    search?: string,
    status?: ToggleType,
    isCertified?: boolean,
};