
export interface DashboardData {
  appointments: any[];
  todayBookingsCount: number;
  activeJobsCount: number;
  todayRevenue: number;
  lowStockItems: number;
  isLoading: boolean;
  formattedAppointments: {
    id: number | string;
    time: string;
    customer: string;
    service: string;
    car: string;
    status: string;
    date: string;
    duration: number;
  }[];
}

export interface AppointmentData {
  id: number | string;
  booking_time: string;
  customer_name: string;
  service: string;
  car: string;
  status: string;
  booking_date: string;
  duration: number;
  cost?: number | string;
  service_id?: string;
  user_id?: string;
}
