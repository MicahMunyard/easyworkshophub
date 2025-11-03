import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, Package, Plus, Settings } from 'lucide-react';
import { useInventoryTransactions } from '@/hooks/inventory/useInventoryTransactions';
import { format } from 'date-fns';
import { exportTransactionHistory } from '@/utils/inventory/exportTransactionHistory';
import { Skeleton } from '@/components/ui/skeleton';

interface TransactionHistoryTabProps {
  itemId: string;
  itemCode: string;
  itemName: string;
}

const TransactionHistoryTab: React.FC<TransactionHistoryTabProps> = ({
  itemId,
  itemCode,
  itemName
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('30');
  
  const { getTransactionHistory } = useInventoryTransactions();
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const days = dateFilter === 'all' ? undefined : parseInt(dateFilter, 10);
        const history = await getTransactionHistory(itemId, days?.toString());
        setTransactions(history);
      } catch (error) {
        console.error('Error fetching transaction history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [itemId, dateFilter, getTransactionHistory]);

  const filteredTransactions = transactions.filter(tx => {
    if (typeFilter === 'all') return true;
    return tx.reference_type === typeFilter;
  });

  const handleExport = () => {
    exportTransactionHistory(filteredTransactions, itemCode, itemName);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <FileText className="h-4 w-4" />;
      case 'purchase':
        return <Package className="h-4 w-4" />;
      case 'adjustment':
        return <Settings className="h-4 w-4" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'invoice':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Invoice</Badge>;
      case 'purchase':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Purchase</Badge>;
      case 'adjustment':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Adjustment</Badge>;
      default:
        return <Badge variant="outline">Initial Stock</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Type:</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
                <SelectItem value="initial">Initial Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Period:</span>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredTransactions.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Transaction Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date/Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Quantity Change</TableHead>
              <TableHead className="text-right">Quantity After</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                </TableRow>
              ))
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No transactions found for the selected filters
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(tx.created_at), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(tx.created_at), 'h:mm a')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(tx.reference_type)}
                      {getTypeBadge(tx.reference_type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {tx.reference_id ? (
                      <span className="text-sm font-mono">{tx.reference_id}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${tx.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.quantity_change > 0 ? '+' : ''}{tx.quantity_change.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {tx.quantity_after.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {tx.notes || '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {!isLoading && filteredTransactions.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryTab;
