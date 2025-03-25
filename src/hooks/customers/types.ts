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
  setCustomers: React.Dispatch<React.SetStateAction<CustomerType[]>>;
  selectedCustomer: CustomerDetailType | null;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<CustomerDetailType | null>>;
  selectedCustomerForDetail: CustomerType | null;
  setSelectedCustomerForDetail: React.Dispatch<React.SetStateAction<CustomerType | null>>;
  isCustomerDetailsOpen: boolean;
  setIsCustomerDetailsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isNewCustomerModalOpen: boolean;
  setIsNewCustomerModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDeleteConfirmOpen: boolean;
  setIsDeleteConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  isFilterOpen: boolean;
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeFilter: "all" | "active" | "inactive";
  setActiveFilter: React.Dispatch<React.SetStateAction<"all" | "active" | "inactive">>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
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
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveFilter: React.Dispatch<React.SetStateAction<"all" | "active" | "inactive">>;
  setIsNewCustomerModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDeleteConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
