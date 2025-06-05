
import { LucideIcon, Wrench, Droplets, Shield, Car, Zap, Filter, Gauge, Thermometer, Hammer, Scissors, FlaskConical, Paintbrush, Settings, Truck, AlertTriangle, CircleDot, Package, Fuel, ShieldCheck } from 'lucide-react';

export interface ProductCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

export const DEFAULT_CATEGORIES: ProductCategory[] = [
  {
    id: 'engine-oil',
    name: 'Engine Oil',
    icon: Droplets,
    color: '#8B4513',
    description: 'Engine lubricating oils and additives'
  },
  {
    id: 'transmission-oil',
    name: 'Transmission Oil',
    icon: Settings,
    color: '#DC143C',
    description: 'Transmission and gear oils'
  },
  {
    id: 'brake-fluid',
    name: 'Brake Fluid',
    icon: Shield,
    color: '#FF6347',
    description: 'Brake fluids and hydraulic fluids'
  },
  {
    id: 'coolant',
    name: 'Coolant',
    icon: Thermometer,
    color: '#00CED1',
    description: 'Engine coolants and antifreeze'
  },
  {
    id: 'filters',
    name: 'Filters',
    icon: Filter,
    color: '#228B22',
    description: 'Oil, air, fuel, and cabin filters'
  },
  {
    id: 'brake-parts',
    name: 'Brake Parts',
    icon: CircleDot,
    color: '#B22222',
    description: 'Brake pads, discs, drums, and components'
  },
  {
    id: 'engine-parts',
    name: 'Engine Parts',
    icon: Settings,
    color: '#4682B4',
    description: 'Engine components and parts'
  },
  {
    id: 'suspension',
    name: 'Suspension',
    icon: Car,
    color: '#9932CC',
    description: 'Shocks, struts, springs, and suspension components'
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: Zap,
    color: '#FFD700',
    description: 'Batteries, alternators, starters, and electrical components'
  },
  {
    id: 'exhaust',
    name: 'Exhaust',
    icon: Fuel,
    color: '#696969',
    description: 'Exhaust systems, mufflers, and catalytic converters'
  },
  {
    id: 'tyres',
    name: 'Tyres & Wheels',
    icon: CircleDot,
    color: '#2F4F4F',
    description: 'Tyres, wheels, and wheel accessories'
  },
  {
    id: 'body-parts',
    name: 'Body Parts',
    icon: Car,
    color: '#8FBC8F',
    description: 'Panels, bumpers, lights, and body components'
  },
  {
    id: 'tools',
    name: 'Tools',
    icon: Wrench,
    color: '#CD853F',
    description: 'Hand tools, power tools, and equipment'
  },
  {
    id: 'chemicals',
    name: 'Chemicals',
    icon: FlaskConical,
    color: '#FF4500',
    description: 'Cleaning chemicals, degreasers, and solvents'
  },
  {
    id: 'degreaser',
    name: 'Degreaser',
    icon: FlaskConical,
    color: '#32CD32',
    description: 'Engine and parts degreasers'
  },
  {
    id: 'tyre-shine',
    name: 'Tyre Shine',
    icon: Paintbrush,
    color: '#4169E1',
    description: 'Tyre shine and detailing products'
  },
  {
    id: 'solvents',
    name: 'Solvents',
    icon: FlaskConical,
    color: '#FF1493',
    description: 'Industrial solvents and cleaners'
  },
  {
    id: 'adhesives',
    name: 'Adhesives & Sealants',
    icon: Package,
    color: '#8A2BE2',
    description: 'Gasket sealers, adhesives, and compounds'
  },
  {
    id: 'belts-hoses',
    name: 'Belts & Hoses',
    icon: Settings,
    color: '#A0522D',
    description: 'Drive belts, timing belts, and hoses'
  },
  {
    id: 'safety',
    name: 'Safety Equipment',
    icon: ShieldCheck,
    color: '#FF8C00',
    description: 'Safety gear, warning devices, and protective equipment'
  },
  {
    id: 'fasteners',
    name: 'Fasteners',
    icon: CircleDot,
    color: '#708090',
    description: 'Bolts, nuts, washers, and hardware'
  },
  {
    id: 'fuel-system',
    name: 'Fuel System',
    icon: Fuel,
    color: '#8B0000',
    description: 'Fuel pumps, injectors, and fuel system components'
  },
  {
    id: 'climate-control',
    name: 'Climate Control',
    icon: Thermometer,
    color: '#87CEEB',
    description: 'A/C components, heaters, and climate control parts'
  },
  {
    id: 'interior',
    name: 'Interior',
    icon: Car,
    color: '#DDA0DD',
    description: 'Seats, trim, dashboard, and interior components'
  },
  {
    id: 'diagnostics',
    name: 'Diagnostics',
    icon: Gauge,
    color: '#20B2AA',
    description: 'Diagnostic tools and testing equipment'
  },
  {
    id: 'general',
    name: 'General',
    icon: Package,
    color: '#778899',
    description: 'Miscellaneous automotive parts and supplies'
  }
];

export const getCategoryById = (categoryId: string): ProductCategory | undefined => {
  return DEFAULT_CATEGORIES.find(cat => cat.id === categoryId);
};

export const getCategoryIcon = (categoryId: string): LucideIcon => {
  const category = getCategoryById(categoryId);
  return category?.icon || Package;
};

export const getCategoryColor = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.color || '#778899';
};
