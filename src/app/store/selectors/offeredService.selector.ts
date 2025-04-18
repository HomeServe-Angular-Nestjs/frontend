import { createFeatureSelector } from "@ngrx/store";
import { IOfferedServiceState } from "../models/offeredService.model";

export const selectOfferedServiceState = createFeatureSelector<IOfferedServiceState>('offeredServices');

