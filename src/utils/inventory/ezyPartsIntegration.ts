
import { InventoryItem } from '@/types/inventory';
import { v4 as uuidv4 } from 'uuid';
import { PartItem, QuoteResponse } from '@/types/ezyparts';

/**
 * Converts EzyParts quote parts to inventory item format
 * so they can be added to the inventory management system
 */
export const convertEzyPartsToInventoryItems = (
  quote: QuoteResponse
): Omit<InventoryItem, 'id' | 'status'>[] => {
  // If no quote or parts are provided, return empty array
  if (!quote || !quote.parts || !quote.parts.length) {
    return [];
  }

  // Get supplier info from the headers
  const supplierName = 'Burson Auto Parts';
  const supplierId = '145eeddc-5b99-42d1-b413-e513cf014c7d'; // Standardized Burson supplier UUID

  // Map each part from the EzyParts quote to an inventory item
  return quote.parts.map(part => {
    // Generate a unique code that includes part SKU for traceability
    const code = `BP-${part.sku.toUpperCase()}-${uuidv4().substring(0, 6)}`;
    
    // Default minimum stock level
    const minStock = 5;
    
    // Generate product image URL based on SKU and brand
    const imageUrl = generateProductImageUrl(part.sku, part.brand);
    
    return {
      code,
      name: part.partDescription,
      description: `${part.partDescription} - Brand: ${part.brand} - SKU: ${part.sku}`,
      category: part.productCategory || 'Auto Parts',
      supplier: supplierName,
      supplierId,
      inStock: part.qty,
      minStock,
      price: part.nettPriceEach,
      retailPrice: part.retailPriceEa,
      location: 'Main Warehouse',
      lastOrder: new Date().toISOString(),
      imageUrl,
      brand: part.brand,
    };
  });
};

/**
 * Generate a product image URL based on SKU and brand
 * This attempts to create a valid image URL for Burson Auto Parts products
 */
function generateProductImageUrl(sku: string, brand: string): string {
  if (!sku) return '';
  
  // Common patterns for Burson Auto Parts product images
  const possibleImageUrls = [
    `https://images.burson.com.au/products/${sku.toLowerCase()}.jpg`,
    `https://images.burson.com.au/products/${sku.toUpperCase()}.jpg`,
    `https://cdn.burson.com.au/images/products/${sku.toLowerCase()}.png`,
    `https://api.burson.com.au/images/${sku}.jpg`,
  ];
  
  // Return the first pattern as default
  // In production, you might want to test which URL actually exists
  return possibleImageUrls[0];
}

/**
 * Takes an EzyParts quote and adds the parts to the inventory system
 * @returns Promise that resolves to array of added inventory items
 */
export const addEzyPartsQuoteToInventory = async (
  quote: QuoteResponse,
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'status'>) => Promise<InventoryItem | null>
): Promise<InventoryItem[]> => {
  // Convert EzyParts parts to inventory items
  const inventoryItems = convertEzyPartsToInventoryItems(quote);
  
  // Add each item to inventory and collect the results
  const addedItems: InventoryItem[] = [];
  
  for (const item of inventoryItems) {
    try {
      const addedItem = await addInventoryItem(item);
      if (addedItem) {
        addedItems.push(addedItem);
      }
    } catch (error) {
      console.error('Error adding item to inventory:', error);
    }
  }
  
  return addedItems;
};

/**
 * Saves the EzyParts quote to localStorage for future reference
 */
export const saveQuoteToLocalStorage = (quote: QuoteResponse): void => {
  try {
    // Get existing quotes or initialize empty array
    const existingQuotes = JSON.parse(localStorage.getItem('ezypartsQuotes') || '[]');
    
    // Add the new quote with timestamp
    existingQuotes.push({
      quote,
      timestamp: new Date().toISOString(),
      vehicle: {
        make: quote.headers.make,
        model: quote.headers.model,
        rego: quote.headers.rego
      }
    });
    
    // Save back to localStorage
    localStorage.setItem('ezypartsQuotes', JSON.stringify(existingQuotes));
  } catch (error) {
    console.error('Error saving EzyParts quote to localStorage:', error);
  }
};

/**
 * Retrieve saved EzyParts quotes from localStorage
 */
export const getSavedQuotes = () => {
  try {
    return JSON.parse(localStorage.getItem('ezypartsQuotes') || '[]');
  } catch (error) {
    console.error('Error retrieving EzyParts quotes from localStorage:', error);
    return [];
  }
};
