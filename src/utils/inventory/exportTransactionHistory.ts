import { format } from 'date-fns';

interface Transaction {
  created_at: string;
  reference_type: string;
  reference_id: string | null;
  quantity_change: number;
  quantity_after: number;
  notes: string | null;
}

export const exportTransactionHistory = (
  transactions: Transaction[],
  itemCode: string,
  itemName: string
) => {
  // Prepare CSV headers
  const headers = ['Date', 'Time', 'Type', 'Reference', 'Quantity Change', 'Quantity After', 'Notes'];
  
  // Prepare CSV rows
  const rows = transactions.map(tx => [
    format(new Date(tx.created_at), 'yyyy-MM-dd'),
    format(new Date(tx.created_at), 'HH:mm:ss'),
    tx.reference_type,
    tx.reference_id || '',
    tx.quantity_change.toFixed(2),
    tx.quantity_after.toFixed(2),
    tx.notes || ''
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape cells containing commas or quotes
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const filename = `inventory-history-${itemCode}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
