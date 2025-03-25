
import { CustomerType, CustomerDetailType } from "@/types/customer";
import { BookingType } from "@/types/booking";

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newCustomersThisMonth: number;
}

export interface CustomerStateData {
  customers: CustomerType[];
  selectedCustomer: CustomerDetailType | null;
  selectedCustomerForDetail: CustomerType | null;
  isCustomerDetailsOpen: boolean;
  isNewCustomerModalOpen: boolean;
  isDeleteConfirmOpen: boolean;
  searchTerm: string;
  isFilterOpen: boolean;
  activeFilter: "all" | "active" | "inactive";
  isLoading: boolean;
}

export interface CustomerBookingHistory {
  id: number;
  customerId: string;
  date: string;
  service: string;
  vehicle: string;
  cost: number;
  status: "completed";
  mechanic: string;
}

export interface UseCustomersReturnType extends CustomerStateData, CustomerStats {
  filteredCustomers: CustomerType[];
  setSearchTerm: (term: string) => void;
  setIsFilterOpen: (isOpen: boolean) => void;
  setActiveFilter: (filter: "all" | "active" | "inactive") => void;
  setIsNewCustomerModalOpen: (isOpen: boolean) => void;
  setIsDeleteConfirmOpen: (isOpen: boolean) => void;
  fetchCustomers: () => Promise<void>;
  handleDeleteAllCustomers: () => Promise<void>;
  handleCustomerClick: (id: string) => void;
  handleCustomerSelect: (customer: CustomerType) => void;
  closeCustomerDetails: () => void;
  handleAddCustomer: (newCustomerData: { 
    name: string; 
    phone: string; 
    email: string; 
    vehicleInfo: string[] 
  }) => void;
  addCustomerFromBooking: (booking: BookingType) => void;
}
