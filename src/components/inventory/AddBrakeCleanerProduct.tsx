
import React, { useEffect, useState } from 'react';
import { useAddInventoryItem } from '@/hooks/inventory/useAddInventoryItem';

const AddBrakeCleanerProduct: React.FC = () => {
  const { addProductToSupplier } = useAddInventoryItem();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    // Check if product was already added
    const brakeCleanerAdded = localStorage.getItem('brakeCleanerAdded');
    
    if (!brakeCleanerAdded && !isAdded) {
      // Add the brake cleaner product with the specified details
      const success = addProductToSupplier(
        'Western Industrial Cleaning Suppliers',
        'Brake Cleaner 20L',
        100,
        'Cleaning Supplies',
        'Brake cleaner is a powerful chemical solution used for cleaning and maintaining braking systems in automobiles and other machinery. It is specially formulated to dissolve and remove brake dust, dirt, brake fluids, oil and other contaminants that can accumulate on brake components and affect their performance.',
        15, // Initial stock
        5,   // Minimum stock
        '/lovable-uploads/32fa5874-f6a1-477f-91ff-ed24b804ff53.png' // Product image URL
      );
      
      if (success) {
        localStorage.setItem('brakeCleanerAdded', 'true');
        setIsAdded(true);
      }
    }
  }, [addProductToSupplier]);

  return null; // This component doesn't render anything
};

export default AddBrakeCleanerProduct;
