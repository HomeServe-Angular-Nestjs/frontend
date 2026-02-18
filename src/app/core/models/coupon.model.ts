import { DiscountTypeEnum, UsageTypeEnum } from "../enums/enums";
import { IPagination } from "./booking.model";

export interface ICoupon {
  id: string;
  couponCode: string;
  couponName: string;
  discountType: DiscountTypeEnum;
  usageType: UsageTypeEnum;
  discountValue: number;
  validFrom: string | null;
  validTo: string | null;
  usageValue: number;
  isActive: boolean;
  isDeleted: boolean;
  professionId?: string;
  serviceCategoryId?: string;
  professionName?: string;
  categoryServiceName?: string;
}

export interface IUpsertCoupon extends Omit<ICoupon, 'id'> { }

export interface ICouponFilter {
  search: string;
  isActive: boolean | 'all',
  discountType: DiscountTypeEnum | 'all',
  usageType: UsageTypeEnum | 'all',
}

export interface ICouponWithPagination {
  coupons: ICoupon[];
  pagination: IPagination;
}

export interface IApplyCouponPayload {
  couponId: string;
  total: number;
}

export interface ICouponAppliedResponse {
  originalAmount: number;
  discountType: DiscountTypeEnum;
  couponValue: number;
  deductedValue: number;
  finalAmount: number;
}