
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-AU', { 
    style: 'currency', 
    currency: 'AUD' 
  }).format(amount);
};

export const calculateSubtotal = (items: { nettPriceEach: number; qty: number; isSelected: boolean }[]) => {
  return items
    .filter(item => item.isSelected)
    .reduce((sum, item) => sum + (item.nettPriceEach * item.qty), 0);
};

export const calculateTotalItems = (items: { isSelected: boolean }[]) => {
  return items.filter(item => item.isSelected).length;
};

export const calculateTotalQuantity = (items: { qty: number; isSelected: boolean }[]) => {
  return items
    .filter(item => item.isSelected)
    .reduce((sum, item) => sum + item.qty, 0);
};

