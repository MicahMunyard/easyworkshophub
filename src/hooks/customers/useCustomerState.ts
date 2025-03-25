
import { useState } from "react";
import { CustomerType, CustomerDetailType } from "@/types/customer";
import { CustomerStateData } from "./types";

export const useCustomerState = (): CustomerStateData => {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetailType | null>(null);
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<CustomerType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  return {
    customers,
    setCustomers,
    selectedCustomer,
    setSelectedCustomer,
    isCustomerDetailsOpen,
    setIsCustomerDetailsOpen,
    isNewCustomerModalOpen,
    setIsNewCustomerModalOpen,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    searchTerm,
    setSearchTerm,
    isFilterOpen,
    setIsFilterOpen,
    activeFilter,
    setActiveFilter,
    selectedCustomerForDetail,
    setSelectedCustomerForDetail,
    isLoading,
    setIsLoading
  };
};

export const getFilteredCustomers = (
  customers: CustomerType[],
  searchTerm: string,
  activeFilter: "all" | "active" | "inactive"
): CustomerType[] => {
  return customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      activeFilter === "all" || 
      customer.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });
};

export const calculateCustomerStats = (customers: CustomerType[]) => {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === "active").length;
  const inactiveCustomers = customers.filter(c => c.status === "inactive").length;
  const newCustomersThisMonth = 12; // Placeholder value

  return {
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    newCustomersThisMonth
  };
};
