
import { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export type DateRange = {
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
  label?: string; // Optional label for predefined ranges
};

export type DateRangeOption = {
  label: string;
  getValue: () => DateRange;
};

export const useReportDateRange = () => {
  // Default to current month
  const defaultRange = {
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    label: 'This Month'
  };

  const [dateRange, setDateRange] = useState<DateRange>(defaultRange);

  // Pre-defined date range options
  const dateRangeOptions: DateRangeOption[] = [
    {
      label: 'Today',
      getValue: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return {
          startDate: today,
          endDate: today,
          label: 'Today'
        };
      }
    },
    {
      label: 'Yesterday',
      getValue: () => {
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        return {
          startDate: yesterday,
          endDate: yesterday,
          label: 'Yesterday'
        };
      }
    },
    {
      label: 'Last 7 days',
      getValue: () => {
        return {
          startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
          endDate: format(new Date(), 'yyyy-MM-dd'),
          label: 'Last 7 days'
        };
      }
    },
    {
      label: 'This Month',
      getValue: () => {
        return {
          startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
          label: 'This Month'
        };
      }
    },
    {
      label: 'Last Month',
      getValue: () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return {
          startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
          label: 'Last Month'
        };
      }
    }
  ];

  const setCustomDateRange = (start: Date, end: Date) => {
    setDateRange({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd')
    });
  };

  const selectPredefinedRange = (optionLabel: string) => {
    const option = dateRangeOptions.find(opt => opt.label === optionLabel);
    if (option) {
      setDateRange(option.getValue());
    }
  };

  return {
    dateRange,
    setDateRange,
    dateRangeOptions,
    setCustomDateRange,
    selectPredefinedRange
  };
};
