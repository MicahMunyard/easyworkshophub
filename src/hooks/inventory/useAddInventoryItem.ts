
import { v4 as uuidv4 } from 'uuid';
import { InventoryItem } from '@/types/inventory';
import { useSuppliers } from './useSuppliers';
import { useInventoryItems } from './useInventoryItems';
import { useToast } from '@/components/ui/use-toast';

export const useAddInventoryItem = () => {
  const { suppliers } = useSuppliers();
  const { addInventoryItem } = useInventoryItems();
  const { toast } = useToast();

  const addProductToSupplier = (
    supplierName: string,
    productName: string,
    price: number,
    category: string,
    description: string,
    initialStock: number = 10,
    minStock: number = 5,
    imageUrl?: string
  ): boolean => {
    // Find the supplier
    const supplier = suppliers.find(s => 
      s.name.toLowerCase() === supplierName.toLowerCase()
    );

    if (!supplier) {
      toast({
        title: "Supplier Not Found",
        description: `Could not find supplier: ${supplierName}`,
        variant: "destructive"
      });
      return false;
    }

    // Generate a unique product code
    const code = `${supplier.name.substring(0, 3).toUpperCase()}-${uuidv4().substring(0, 6).toUpperCase()}`;

    // Create new inventory item
    const newItem: Omit<InventoryItem, 'id' | 'status'> = {
      code,
      name: productName,
      description,
      category,
      supplier: supplier.name,
      supplierId: supplier.id,
      inStock: initialStock,
      minStock,
      price,
      location: 'Main Warehouse',
      imageUrl
    };

    // Add item to inventory
    addInventoryItem(newItem);

    // Notify user
    toast({
      title: "Product Added",
      description: `${productName} has been added to inventory for ${supplier.name}.`
    });

    return true;
  };

  return { addProductToSupplier };
};
