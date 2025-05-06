
import { MonthlyData } from "../types";

export type CustomerReportData = {
  totalCustomers: number;
  newCustomers: number;
  customerRetention: number;
  averageLifetimeValue: number;
  customerData: MonthlyData[];
  newCustomersChangePercent: number;
  retentionChangePercent: number;
  lifetimeValueChangePercent: number;
};
