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