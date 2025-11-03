import { UnitOfMeasure } from '@/types/inventory';

/**
 * Calculate total available quantity in consumption units for bulk products
 * Example: 10 drums × 20L/drum = 200L
 */
export const calculateTotalConsumptionUnits = (
  inventoryUnits: number,
  isBulkProduct: boolean,
  bulkQuantity?: number
): number => {
  if (!isBulkProduct || !bulkQuantity) {
    return inventoryUnits;
  }
  return inventoryUnits * bulkQuantity;
};

/**
 * Calculate price per consumption unit
 * Example: $50/drum ÷ 20L/drum = $2.50/L
 */
export const calculatePricePerConsumptionUnit = (
  pricePerInventoryUnit: number,
  isBulkProduct: boolean,
  bulkQuantity?: number
): number => {
  if (!isBulkProduct || !bulkQuantity || bulkQuantity === 0) {
    return pricePerInventoryUnit;
  }
  return pricePerInventoryUnit / bulkQuantity;
};

/**
 * Format stock display with both inventory units and consumption units
 * Example: "10 units (200L)" or "5.5 drums (110L)"
 */
export const formatStockDisplay = (
  inventoryUnits: number,
  isBulkProduct: boolean,
  bulkQuantity?: number,
  unitOfMeasure: UnitOfMeasure = 'unit'
): string => {
  if (!isBulkProduct || !bulkQuantity) {
    return `${inventoryUnits} ${getUnitLabel(unitOfMeasure, inventoryUnits)}`;
  }

  const consumptionUnits = calculateTotalConsumptionUnits(inventoryUnits, isBulkProduct, bulkQuantity);
  const containerLabel = inventoryUnits === 1 ? 'container' : 'containers';
  
  return `${inventoryUnits} ${containerLabel} (${consumptionUnits}${getUnitSymbol(unitOfMeasure)})`;
};

/**
 * Format price display with both per-unit and per-consumption-unit pricing
 * Example: "$50/drum ($2.50/L)"
 */
export const formatPriceDisplay = (
  pricePerInventoryUnit: number,
  isBulkProduct: boolean,
  bulkQuantity?: number,
  unitOfMeasure: UnitOfMeasure = 'unit'
): string => {
  const basePrice = `$${pricePerInventoryUnit.toFixed(2)}/${getUnitLabel(unitOfMeasure, 1)}`;
  
  if (!isBulkProduct || !bulkQuantity) {
    return basePrice;
  }

  const pricePerConsumption = calculatePricePerConsumptionUnit(pricePerInventoryUnit, isBulkProduct, bulkQuantity);
  return `${basePrice} ($${pricePerConsumption.toFixed(2)}/${getUnitSymbol(unitOfMeasure)})`;
};

/**
 * Get unit label for display
 */
export const getUnitLabel = (unit: UnitOfMeasure, quantity: number = 1): string => {
  switch (unit) {
    case 'litre':
      return quantity === 1 ? 'litre' : 'litres';
    case 'ml':
      return 'ml';
    case 'kg':
      return 'kg';
    case 'g':
      return 'g';
    case 'unit':
    default:
      return quantity === 1 ? 'unit' : 'units';
  }
};

/**
 * Get unit symbol for compact display
 */
export const getUnitSymbol = (unit: UnitOfMeasure): string => {
  switch (unit) {
    case 'litre':
      return 'L';
    case 'ml':
      return 'ml';
    case 'kg':
      return 'kg';
    case 'g':
      return 'g';
    case 'unit':
    default:
      return '';
  }
};

/**
 * Validate if sufficient stock is available
 */
export const validateSufficientStock = (
  requestedQuantity: number,
  availableInventoryUnits: number,
  isBulkProduct: boolean,
  bulkQuantity?: number
): { isValid: boolean; message?: string } => {
  const availableConsumptionUnits = calculateTotalConsumptionUnits(
    availableInventoryUnits,
    isBulkProduct,
    bulkQuantity
  );

  if (requestedQuantity > availableConsumptionUnits) {
    return {
      isValid: false,
      message: `Insufficient stock. Available: ${availableConsumptionUnits}, Requested: ${requestedQuantity}`
    };
  }

  return { isValid: true };
};
