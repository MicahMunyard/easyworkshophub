import { useState, useEffect } from 'react';
import { Supplier } from '@/types/inventory';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // One-time cleanup of old localStorage data
  useEffect(() => {
    const hasCleanedStorage = localStorage.getItem('suppliers_migrated_to_db');
    if (!hasCleanedStorage) {
      localStorage.removeItem('defaultSuppliers');
      localStorage.removeItem('suppliers_demo-user');
      localStorage.setItem('suppliers_migrated_to_db', 'true');
    }
  }, []);

  // Load suppliers from database
  useEffect(() => {
    if (user?.id) {
      loadSuppliers();
    }
  }, [user?.id]);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);

      // Get default suppliers (visible to all users)
      const { data: defaultSuppliers, error: defaultError } = await supabase
        .from('user_inventory_suppliers')
        .select('*')
        .eq('isdefault', true)
        .is('user_id', null);

      if (defaultError) throw defaultError;

      // Get user-specific suppliers
      const { data: userSuppliers, error: userError } = await supabase
        .from('user_inventory_suppliers')
        .select('*')
        .eq('user_id', user!.id)
        .eq('isdefault', false);

      if (userError) throw userError;

      // Combine both lists and map from snake_case to camelCase
      const allSuppliers = [
        ...(defaultSuppliers || []),
        ...(userSuppliers || [])
      ].map(mapDbToSupplier);

      setSuppliers(allSuppliers);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      toast({
        title: 'Error Loading Suppliers',
        description: 'Failed to load suppliers from database.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Map database fields (snake_case) to TypeScript interface (camelCase)
  const mapDbToSupplier = (dbSupplier: any): Supplier => ({
    id: dbSupplier.id,
    name: dbSupplier.name,
    category: dbSupplier.category,
    contactPerson: dbSupplier.contactperson,
    email: dbSupplier.email,
    phone: dbSupplier.phone,
    address: dbSupplier.address,
    status: dbSupplier.status,
    notes: dbSupplier.notes,
    isDefault: dbSupplier.isdefault,
    logoUrl: dbSupplier.logourl,
    connectionType: dbSupplier.connectiontype || 'manual',
    apiConfig: dbSupplier.apiconfig ? {
      type: dbSupplier.apiconfig.type,
      connectionUrl: dbSupplier.apiconfig.connectionUrl,
      isConnected: dbSupplier.apiconfig.isConnected
    } : undefined
  });

  // Map TypeScript interface (camelCase) to database fields (snake_case)
  const mapSupplierToDb = (supplier: Omit<Supplier, 'id' | 'isDefault'>) => ({
    name: supplier.name,
    category: supplier.category,
    contactperson: supplier.contactPerson,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    status: supplier.status,
    notes: supplier.notes,
    logourl: supplier.logoUrl,
    connectiontype: supplier.connectionType || 'manual',
    apiconfig: supplier.apiConfig ? {
      type: supplier.apiConfig.type,
      connectionUrl: supplier.apiConfig.connectionUrl,
      isConnected: supplier.apiConfig.isConnected
    } : null
  });

  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'isDefault'>): Promise<Supplier> => {
    const newSupplier: Supplier = {
      id: uuidv4(),
      ...supplier,
      isDefault: false
    };

    try {
      const dbSupplier = {
        id: newSupplier.id,
        ...mapSupplierToDb(supplier),
        user_id: user!.id,
        isdefault: false
      };

      const { error } = await supabase
        .from('user_inventory_suppliers')
        .insert(dbSupplier);

      if (error) throw error;

      setSuppliers(prev => [...prev, newSupplier]);
      
      toast({
        title: 'Supplier Added',
        description: `${newSupplier.name} has been added successfully.`
      });

      return newSupplier;
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: 'Error Adding Supplier',
        description: 'Failed to add supplier to database.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateSupplier = async (id: string, updatedData: Partial<Supplier>): Promise<void> => {
    try {
      // Prevent updating default suppliers
      const supplier = suppliers.find(s => s.id === id);
      if (supplier?.isDefault) {
        toast({
          title: 'Cannot Update Default Supplier',
          description: 'Default suppliers cannot be modified.',
          variant: 'destructive'
        });
        return;
      }

      // Don't allow changing isDefault through this method
      const { isDefault, id: _, ...updateFields } = updatedData;

      const dbUpdate = mapSupplierToDb(updateFields as any);

      const { error } = await supabase
        .from('user_inventory_suppliers')
        .update(dbUpdate)
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;

      setSuppliers(prev => 
        prev.map(s => s.id === id ? { ...s, ...updatedData } : s)
      );

      toast({
        title: 'Supplier Updated',
        description: 'Supplier has been updated successfully.'
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast({
        title: 'Error Updating Supplier',
        description: 'Failed to update supplier in database.',
        variant: 'destructive'
      });
    }
  };

  const deleteSupplier = async (id: string): Promise<void> => {
    try {
      // Prevent deleting default suppliers
      const supplier = suppliers.find(s => s.id === id);
      if (supplier?.isDefault) {
        toast({
          title: 'Cannot Delete Default Supplier',
          description: 'Default suppliers cannot be deleted.',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('user_inventory_suppliers')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;

      setSuppliers(prev => prev.filter(s => s.id !== id));

      toast({
        title: 'Supplier Deleted',
        description: 'Supplier has been deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({
        title: 'Error Deleting Supplier',
        description: 'Failed to delete supplier from database.',
        variant: 'destructive'
      });
    }
  };

  return {
    suppliers,
    isLoading,
    addSupplier,
    updateSupplier,
    deleteSupplier
  };
};
