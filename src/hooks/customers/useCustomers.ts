
import { useState, useEffect } from "react";
import { useCustomerState, getFilteredCustomers, calculateCustomerStats } from "./useCustomerState";
import { useCustomerAPI } from "./useCustomerAPI";
import { useCustomerActions } from "./useCustomerActions";
import { UseCustomersReturnType } from "./types";

export const useCustomers = (): UseCustomersReturnType => {
  const {
    customers,
    selectedCustomer,
    isCustomerDetailsOpen,
    isNewCustomerModalOpen,
    isDeleteConfirmOpen,
    searchTerm,
    isFilterOpen,
    activeFilter,
    selectedCustomerForDetail,
    isLoading
  } = useCustomerState();

  // Expose setters
  const [setCustomers] = useState<React.Dispatch<React.SetStateAction<any>>>(()=>{});
  const [setSelectedCustomer] = useState<React.Dispatch<React.SetStateAction<any>>>(()=>{});
  const [setIsCustomerDetailsOpen] = useState<React.Dispatch<React.SetStateAction<boolean>>>(()=>{});
  const [setIsNewCustomerModalOpen] = useState<React.Dispatch<React.SetStateAction<boolean>>>(()=>{});
  const [setIsDeleteConfirmOpen] = useState<React.Dispatch<React.SetStateAction<boolean>>>(()=>{});
  const [setSearchTerm] = useState<React.Dispatch<React.SetStateAction<string>>>(()=>{});
  const [setIsFilterOpen] = useState<React.Dispatch<React.SetStateAction<boolean>>>(()=>{});
  const [setActiveFilter] = useState<React.Dispatch<React.SetStateAction<any>>>(()=>{});
  const [setSelectedCustomerForDetail] = useState<React.Dispatch<React.SetStateAction<any>>>(()=>{});
  const [setIsLoading] = useState<React.Dispatch<React.SetStateAction<boolean>>>(()=>{});

  const { fetchCustomers: apiFetchCustomers } = useCustomerAPI();

  const {
    handleCustomerClick,
    handleCustomerSelect,
    closeCustomerDetails,
    handleAddCustomer,
    handleDeleteAllCustomers,
    addCustomerFromBooking
  } = useCustomerActions(
    customers,
    setCustomers,
    setSelectedCustomer,
    setIsCustomerDetailsOpen,
    setSelectedCustomerForDetail,
    setIsNewCustomerModalOpen,
    setIsDeleteConfirmOpen
  );

  const fetchCustomers = async () => {
    setIsLoading(true);
    const fetchedCustomers = await apiFetchCustomers();
    setCustomers(fetchedCustomers);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = getFilteredCustomers(customers, searchTerm, activeFilter);
  const stats = calculateCustomerStats(customers);

  return {
    customers,
    filteredCustomers,
    selectedCustomer,
    isCustomerDetailsOpen,
    isNewCustomerModalOpen,
    isDeleteConfirmOpen,
    searchTerm,
    isFilterOpen,
    activeFilter,
    selectedCustomerForDetail,
    isLoading,
    ...stats,
    setSearchTerm,
    setIsFilterOpen,
    setActiveFilter,
    setIsNewCustomerModalOpen,
    setIsDeleteConfirmOpen,
    fetchCustomers,
    handleDeleteAllCustomers,
    handleCustomerClick,
    handleCustomerSelect,
    closeCustomerDetails,
    handleAddCustomer,
    addCustomerFromBooking
  };
};
