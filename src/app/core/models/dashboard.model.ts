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
  nextBooking: IUpcomingBooking | null;
  upcomingBookingCount: number;
  recentBookings: IDashboardRecentBooking[];
  wallet: { balance: number } | null;
}

export interface IUpcomingBooking {
  bookingId: string;
  amount: number;
  status: string;
  slot: { from: string; to: string; date: string };
  customer: {
    id: string;
    username: string;
    fullname: string;
    avatar: string;
  };
  service: {
    name: string;
    category: string;
  };
}

export interface IDashboardRecentBooking {
  bookingId: string;
  amount: number;
  status: string;
  date: string;
  customer: {
    id: string;
    username: string;
    fullname: string;
    avatar: string;
  };
  service: {
    name: string;
    category: string;
  };
}
