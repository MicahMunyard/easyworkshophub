
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ProductCategory } from '@/components/inventory/config/productCategories';

interface UserCategory {
  id: string;
  name: string;
  icon_name: string;
  color: string;
  description?: string;
}

export const useUserCategories = () => {
  const [userCategories, setUserCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load user categories from database
  const loadUserCategories = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_inventory_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform database categories to ProductCategory format
      const transformedCategories: ProductCategory[] = (data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: require('lucide-react')[cat.icon_name] || require('lucide-react').Package,
        color: cat.color,
        description: cat.description || `Custom category: ${cat.name}`
      }));

      setUserCategories(transformedCategories);
    } catch (error) {
      console.error('Error loading user categories:', error);
      toast({
        title: "Error Loading Categories",
        description: "Failed to load custom categories.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserCategories();
  }, [user]);

  // Add a new user category
  const addUserCategory = async (name: string, iconName: string = 'Package', color: string = '#778899') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_inventory_categories')
        .insert({
          user_id: user.id,
          name: name.trim(),
          icon_name: iconName,
          color: color,
          description: `Custom category: ${name.trim()}`
        })
        .select()
        .single();

      if (error) throw error;

      // Transform and add to local state
      const newCategory: ProductCategory = {
        id: data.id,
        name: data.name,
        icon: require('lucide-react')[data.icon_name] || require('lucide-react').Package,
        color: data.color,
        description: data.description || `Custom category: ${data.name}`
      };

      setUserCategories(prev => [...prev, newCategory]);

      toast({
        title: "Category Added",
        description: `${name} category has been created.`,
      });

      return newCategory;
    } catch (error) {
      console.error('Error adding user category:', error);
      toast({
        title: "Error Adding Category",
        description: "Failed to create custom category.",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    userCategories,
    isLoading,
    addUserCategory,
    refreshUserCategories: loadUserCategories
  };
};
