
import React, { useEffect } from 'react';
import { useAddInventoryItem } from '@/hooks/inventory/useAddInventoryItem';

const AddBrakeCleanerProduct: React.FC = () => {
  const { addProductToSupplier } = useAddInventoryItem();

  useEffect(() => {
    // Add the brake cleaner product with the specified details
    addProductToSupplier(
      'Western Industrial Cleaning Suppliers',
      'Brake Cleaner 20L',
      100,
      'Cleaning Supplies',
      'Brake cleaner is a powerful chemical solution used for cleaning and maintaining braking systems in automobiles and other machinery. It is specially formulated to dissolve and remove brake dust, dirt, brake fluids, oil and other contaminants that can accumulate on brake components and affect their performance.',
      15, // Initial stock
      5   // Minimum stock
    );
  }, []);

  return null; // This component doesn't render anything
};

export default AddBrakeCleanerProduct;
