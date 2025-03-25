
import { useEffect } from "react";
import { useCustomerState, getFilteredCustomers, calculateCustomerStats } from "./useCustomerState";
import { useCustomerAPI } from "./useCustomerAPI";
import { useCustomerActions } from "./useCustomerActions";
import { UseCustomersReturnType } from "./types";

export const useCustomers = (): UseCustomersReturnType => {
  const {
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
  } = useCustomerState();

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
