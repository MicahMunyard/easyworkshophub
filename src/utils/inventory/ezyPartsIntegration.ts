
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
  const supplierId = 'ezyparts-burson'; // Use consistent ID for EzyParts supplier

  // Map each part from the EzyParts quote to an inventory item
  return quote.parts.map(part => {
    // Generate a unique code that includes part SKU for traceability
    const code = `EP-${part.sku.toUpperCase()}-${uuidv4().substring(0, 6)}`;
    
    // Default minimum stock level
    const minStock = 5;
    
    return {
      code,
      name: part.partDescription,
      description: `${part.partDescription} - Brand: ${part.brand}`,
      category: part.productCategory || 'Auto Parts',
      supplier: supplierName,
      supplierId,
      inStock: part.qty,
      minStock,
      price: part.nettPriceEach,
      location: 'Main Warehouse',
      lastOrder: new Date().toISOString(),
      imageUrl: '', // EzyParts doesn't provide image URLs
    };
  });
};

/**
 * Takes an EzyParts quote and adds the parts to the inventory system
 * @returns Array of added inventory items
 */
export const addEzyPartsQuoteToInventory = (
  quote: QuoteResponse,
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'status'>) => InventoryItem
): InventoryItem[] => {
  // Convert EzyParts parts to inventory items
  const inventoryItems = convertEzyPartsToInventoryItems(quote);
  
  // Add each item to inventory and return the results
  return inventoryItems.map(item => addInventoryItem(item));
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
