export interface IProviderOverviewCardBox {
  title: string
  icon: string
  iconColorClass?: string
  value: number | string
  valueColorClass?: string
  bgColorClass?: string
  borderColorClass?: string
  desc?: string;
}

export interface OverviewCardData {
  heading: string
  boxes: IProviderOverviewCardBox[];
  detailsText?: string
  detailsLinkOrCallback?: string;
}


export interface IProviderDashboardOverview {
  revenue: {
    totalEarnings: number;
    completedCount: number;
    pendingCount: number;
  };
  bookings: {
    totalBookings: number;
    upcomingBookings: number;
    cancelledBookings: number;
    averageBookingValue: number;
  };
  avgRating: number;
  completionRate: number;
  nextAvailableSlot: { from: string; to: string; date: string };
  workingHours: {
    day: { from: string; to: string };
    time: { from: string; to: string };
  };
  activeServiceCount: number;
}
