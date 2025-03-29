
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
    // Find the supplier - first try exact match
    let supplier = suppliers.find(s => 
      s.name === supplierName
    );
    
    // If no exact match, try case-insensitive matching
    if (!supplier) {
      supplier = suppliers.find(s => 
        s.name.toLowerCase() === supplierName.toLowerCase()
      );
    }
    
    // If still no match, try to find a supplier that contains the given name
    if (!supplier) {
      supplier = suppliers.find(s => 
        s.name.toLowerCase().includes(supplierName.toLowerCase()) ||
        supplierName.toLowerCase().includes(s.name.toLowerCase())
      );
    }

    // Log available suppliers for debugging
    console.log('Available suppliers:', suppliers.map(s => s.name));
    console.log('Looking for supplier:', supplierName);

    if (!supplier) {
      toast({
        title: "Supplier Not Found",
        description: `Could not find supplier: ${supplierName}. Please check the spelling or add this supplier first.`,
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
