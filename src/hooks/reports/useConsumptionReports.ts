import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DateRange } from './useReportDateRange';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

export interface ConsumptionByProduct {
  itemId: string;
  itemName: string;
  itemCode: string;
  category: string;
  quantityConsumed: number;
  unitOfMeasure?: string;
  valueConsumed: number;
  percentageOfTotal: number;
}

export interface MonthlyConsumption {
  month: string;
  items: { name: string; quantity: number; value: number }[];
}

export interface ConsumptionReportData {
  totalItemsConsumed: number;
  costOfGoodsSold: number;
  mostConsumedProduct: string;
  averageDailyUsage: number;
  consumptionByProduct: ConsumptionByProduct[];
  monthlyConsumption: MonthlyConsumption[];
  consumptionTrends: { name: string; [key: string]: any }[];
}

export const useConsumptionReports = (dateRange?: DateRange) => {
  const { user } = useAuth();
  const [data, setData] = useState<ConsumptionReportData>({
    totalItemsConsumed: 0,
    costOfGoodsSold: 0,
    mostConsumedProduct: '',
    averageDailyUsage: 0,
    consumptionByProduct: [],
    monthlyConsumption: [],
    consumptionTrends: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConsumptionData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const startDate = dateRange?.startDate || startOfMonth(new Date()).toISOString();
        const endDate = dateRange?.endDate || endOfMonth(new Date()).toISOString();

        // Fetch inventory transactions where reference_type = 'invoice'
        const { data: transactions, error } = await supabase
          .from('inventory_transactions')
          .select(`
            *,
            user_inventory_items (
              name,
              code,
              category,
              unit_of_measure,
              is_bulk_product,
              bulk_quantity,
              price
            )
          `)
          .eq('user_id', user.id)
          .eq('reference_type', 'invoice')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Calculate consumption by product
        const consumptionMap = new Map<string, {
          itemId: string;
          itemName: string;
          itemCode: string;
          category: string;
          quantityConsumed: number;
          unitOfMeasure?: string;
          valueConsumed: number;
        }>();

        let totalValue = 0;
        let totalQuantity = 0;

        transactions?.forEach((tx: any) => {
          const item = tx.user_inventory_items;
          if (!item) return;

          const quantity = Math.abs(tx.quantity_change);
          const value = quantity * (item.price || 0);

          const existing = consumptionMap.get(tx.inventory_item_id);
          if (existing) {
            existing.quantityConsumed += quantity;
            existing.valueConsumed += value;
          } else {
            consumptionMap.set(tx.inventory_item_id, {
              itemId: tx.inventory_item_id,
              itemName: item.name,
              itemCode: item.code,
              category: item.category || 'Uncategorized',
              quantityConsumed: quantity,
              unitOfMeasure: item.unit_of_measure,
              valueConsumed: value
            });
          }

          totalValue += value;
          totalQuantity += quantity;
        });

        // Convert to array and calculate percentages
        const consumptionByProduct = Array.from(consumptionMap.values()).map(item => ({
          ...item,
          percentageOfTotal: totalValue > 0 ? (item.valueConsumed / totalValue) * 100 : 0
        })).sort((a, b) => b.valueConsumed - a.valueConsumed);

        // Calculate daily average
        const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
        const averageDailyUsage = totalQuantity / days;

        // Generate consumption trends based on date range
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

        let intervals: Date[];
        let formatString: string;

        if (daysDiff <= 31) {
          // Daily granularity
          intervals = eachDayOfInterval({ start, end });
          formatString = 'MMM dd';
        } else if (daysDiff <= 90) {
          // Weekly granularity
          intervals = eachWeekOfInterval({ start, end });
          formatString = 'MMM dd';
        } else {
          // Monthly granularity
          intervals = eachMonthOfInterval({ start, end });
          formatString = 'MMM yyyy';
        }

        const trendData = intervals.map(date => {
          const dateStr = format(date, formatString);
          const dataPoint: any = { name: dateStr };

          // Get top 5 products
          const topProducts = consumptionByProduct.slice(0, 5);
          
          topProducts.forEach(product => {
            // Filter transactions for this product and time period
            const productTransactions = transactions?.filter((tx: any) => {
              const txDate = new Date(tx.created_at);
              return tx.inventory_item_id === product.itemId &&
                     txDate >= date &&
                     (daysDiff <= 31 
                       ? txDate < new Date(date.getTime() + 24 * 60 * 60 * 1000)
                       : daysDiff <= 90
                       ? txDate < new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000)
                       : txDate < new Date(date.getFullYear(), date.getMonth() + 1, 1));
            });

            const qty = productTransactions?.reduce((sum: number, tx: any) => sum + Math.abs(tx.quantity_change), 0) || 0;
            dataPoint[product.itemName] = qty;
          });

          return dataPoint;
        });

        setData({
          totalItemsConsumed: totalQuantity,
          costOfGoodsSold: totalValue,
          mostConsumedProduct: consumptionByProduct[0]?.itemName || 'N/A',
          averageDailyUsage,
          consumptionByProduct,
          monthlyConsumption: [],
          consumptionTrends: trendData
        });
      } catch (error) {
        console.error('Error fetching consumption data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsumptionData();
  }, [user, dateRange]);

  return { ...data, isLoading };
};
