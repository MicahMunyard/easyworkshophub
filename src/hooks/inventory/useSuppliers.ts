
import { useState, useEffect } from 'react';
import { Supplier } from '@/types/inventory';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';

// Mock data for default suppliers
const defaultSuppliers: Supplier[] = [
  {
    id: uuidv4(),
    name: 'Western Industrial Cleaning Suppliers',
    category: 'Cleaning Supplies',
    contactPerson: 'John Smith',
    email: 'john@westernindustrial.com',
    phone: '555-123-4567',
    status: 'active',
    notes: 'Primary supplier for cleaning products'
  },
  {
    id: uuidv4(),
    name: 'Halowipers',
    category: 'Cleaning Supplies',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@halowipers.com',
    phone: '555-987-6543',
    status: 'active',
    notes: 'Specializes in high-quality wiping solutions'
  }
];

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadSuppliers = () => {
      const savedSuppliers = localStorage.getItem('suppliers');
      if (savedSuppliers) {
        setSuppliers(JSON.parse(savedSuppliers));
      } else {
        // Load default suppliers if none exist
        setSuppliers(defaultSuppliers);
        localStorage.setItem('suppliers', JSON.stringify(defaultSuppliers));
      }
      setIsLoading(false);
    };

    loadSuppliers();
  }, []);

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier = {
      ...supplier,
      id: uuidv4()
    };
    
    const updatedSuppliers = [...suppliers, newSupplier];
    setSuppliers(updatedSuppliers);
    localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
    
    toast({
      title: "Supplier Added",
      description: `${newSupplier.name} has been added successfully.`,
    });
    
    return newSupplier;
  };

  const updateSupplier = (id: string, updatedData: Partial<Supplier>) => {
    const updatedSuppliers = suppliers.map(supplier => 
      supplier.id === id ? { ...supplier, ...updatedData } : supplier
    );
    
    setSuppliers(updatedSuppliers);
    localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
    
    toast({
      title: "Supplier Updated",
      description: "Supplier information has been updated successfully.",
    });
  };

  const deleteSupplier = (id: string) => {
    const supplierToDelete = suppliers.find(s => s.id === id);
    if (!supplierToDelete) return;
    
    const updatedSuppliers = suppliers.filter(supplier => supplier.id !== id);
    setSuppliers(updatedSuppliers);
    localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
    
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
