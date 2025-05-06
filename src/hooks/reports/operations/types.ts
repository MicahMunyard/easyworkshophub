
import { MonthlyData } from "../types";

export type OperationsReportData = {
  jobsCompleted: number;
  averageCompletionTime: number;
  shopUtilization: number;
  technicianEfficiency: number;
  jobsData: MonthlyData[];
  jobsChangePercent: number;
  completionTimeChangePercent: number;
  utilizationChangePercent: number;
  efficiencyChangePercent: number;
};
