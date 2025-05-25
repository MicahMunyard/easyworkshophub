
/**
 * Format currency values for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Calculate subtotal from parts array
 */
export const calculateSubtotal = (parts: any[]): number => {
  return parts.reduce((total, part) => {
    return total + (part.nettPriceEach || 0) * (part.qty || 1);
  }, 0);
};

/**
 * Calculate total number of items from parts array
 */
export const calculateTotalItems = (parts: any[]): number => {
  return parts.length;
};

/**
 * Calculate total quantity from parts array
 */
export const calculateTotalQuantity = (parts: any[]): number => {
  return parts.reduce((total, part) => {
    return total + (part.qty || 1);
  }, 0);
};
