import { useState, useEffect } from 'react';
import { Supplier } from '@/types/inventory';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';

// Mock data for default suppliers that will be available to all users
const defaultSuppliers: Supplier[] = [
  {
    id: uuidv4(),
    name: 'Burson Auto Parts',
    category: 'Auto Parts',
    contactPerson: 'EzyParts Support',
    email: 'ezypartssupport@bapcor.com.au',
    phone: '1300 650 590',
    status: 'active',
    notes: 'Official Burson Auto Parts integration via EzyParts API',
    isDefault: true,
    logoUrl: '/lovable-uploads/toliccs-logo.png',
    connectionType: 'api',
    apiConfig: {
      type: 'bursons',
      isConnected: false,
    }
  }
];

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadSuppliers = () => {
      // Get current user ID (in a real app, this would come from auth)
      // For now, we'll use a dummy user ID stored in localStorage
      const currentUserId = localStorage.getItem('currentUserId') || 'demo-user';
      
      // Get user-specific suppliers from localStorage
      const userSuppliersKey = `suppliers_${currentUserId}`;
      const savedUserSuppliers = localStorage.getItem(userSuppliersKey);
      
      let userSuppliers: Supplier[] = [];
      if (savedUserSuppliers) {
        userSuppliers = JSON.parse(savedUserSuppliers);
      }
      
      // Get default suppliers (should always be included)
      const savedDefaultSuppliers = localStorage.getItem('defaultSuppliers');
      // Make sure defaultSuppliers is always initialized
      if (!savedDefaultSuppliers) {
        localStorage.setItem('defaultSuppliers', JSON.stringify(defaultSuppliers));
      }
      
      const systemDefaultSuppliers = savedDefaultSuppliers 
        ? JSON.parse(savedDefaultSuppliers) 
        : defaultSuppliers;
      
      // Log to debug
      console.log('Default suppliers:', systemDefaultSuppliers);
      
      // Combine default and user-specific suppliers
      // Make sure we're not adding duplicates by checking IDs
      const defaultIds = new Set(systemDefaultSuppliers.map(s => s.id));
      const filteredUserSuppliers = userSuppliers.filter(s => !defaultIds.has(s.id));
      
      const allSuppliers = [...systemDefaultSuppliers, ...filteredUserSuppliers];
      setSuppliers(allSuppliers);
      setIsLoading(false);
    };

    loadSuppliers();
  }, []);

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'isDefault'>) => {
    // Get current user ID
    const currentUserId = localStorage.getItem('currentUserId') || 'demo-user';
    
    const newSupplier = {
      ...supplier,
      id: uuidv4(),
      isDefault: false // User-created suppliers are never default
    };
    
    const updatedSuppliers = [...suppliers, newSupplier];
    setSuppliers(updatedSuppliers);
    
    // Only save user-specific suppliers to their storage key
    const userSuppliers = updatedSuppliers.filter(s => !s.isDefault);
    const userSuppliersKey = `suppliers_${currentUserId}`;
    localStorage.setItem(userSuppliersKey, JSON.stringify(userSuppliers));
    
    toast({
      title: "Supplier Added",
      description: `${newSupplier.name} has been added successfully.`,
    });
    
    return newSupplier;
  };

  const updateSupplier = (id: string, updatedData: Partial<Supplier>) => {
    // Get current user ID
    const currentUserId = localStorage.getItem('currentUserId') || 'demo-user';
    
    const updatedSuppliers = suppliers.map(supplier => {
      if (supplier.id === id) {
        // Don't allow changing isDefault status
        const { isDefault, ...allowedUpdates } = updatedData;
        return { ...supplier, ...allowedUpdates };
      }
      return supplier;
    });
    
    setSuppliers(updatedSuppliers);
    
    // Update the appropriate storage
    const supplierToUpdate = suppliers.find(s => s.id === id);
    
    if (supplierToUpdate?.isDefault) {
      // Update default suppliers
      const defaultSups = updatedSuppliers.filter(s => s.isDefault);
      localStorage.setItem('defaultSuppliers', JSON.stringify(defaultSups));
    } else {
      // Update user suppliers
      const userSuppliers = updatedSuppliers.filter(s => !s.isDefault);
      const userSuppliersKey = `suppliers_${currentUserId}`;
      localStorage.setItem(userSuppliersKey, JSON.stringify(userSuppliers));
    }
    
    toast({
      title: "Supplier Updated",
      description: "Supplier information has been updated successfully.",
    });
  };

  const deleteSupplier = (id: string) => {
    // Get current user ID
    const currentUserId = localStorage.getItem('currentUserId') || 'demo-user';
    
    const supplierToDelete = suppliers.find(s => s.id === id);
    if (!supplierToDelete) return;
    
    // Don't allow deleting default suppliers
    if (supplierToDelete.isDefault) {
      toast({
        title: "Cannot Delete Default Supplier",
        description: "Default suppliers cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedSuppliers = suppliers.filter(supplier => supplier.id !== id);
    setSuppliers(updatedSuppliers);
    
    // Update user suppliers storage
    const userSuppliers = updatedSuppliers.filter(s => !s.isDefault);
    const userSuppliersKey = `suppliers_${currentUserId}`;
    localStorage.setItem(userSuppliersKey, JSON.stringify(userSuppliers));
    
    toast({
      title: "Supplier Deleted",
      description: `${supplierToDelete.name} has been removed.`,
      variant: "destructive",
    });
  };

  return {
    suppliers,
    isLoading,
    addSupplier,
    updateSupplier,
    deleteSupplier
  };
};
