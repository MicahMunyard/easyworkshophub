
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2 } from "lucide-react";
import CustomerDetailsModal from "@/components/CustomerDetailsModal";
import { useCustomers } from "@/hooks/customers/useCustomers";
import CustomerTabContent from "@/components/customers/CustomerTabContent";
import MobileCustomerView from "@/components/customers/MobileCustomerView";
import NewCustomerModal from "@/components/customers/NewCustomerModal";
import DeleteConfirmDialog from "@/components/customers/DeleteConfirmDialog";

const Customers = () => {
  const {
    customers,
    filteredCustomers,
    selectedCustomer,
    isCustomerDetailsOpen,
    isNewCustomerModalOpen,
    isDeleteConfirmOpen,
    searchTerm,
    isFilterOpen,
    selectedCustomerForDetail,
    isLoading,
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    newCustomersThisMonth,
    setSearchTerm,
    setIsFilterOpen,
    setIsNewCustomerModalOpen,
    setIsDeleteConfirmOpen,
    handleDeleteAllCustomers,
    handleCustomerClick,
    handleCustomerSelect,
    closeCustomerDetails,
    handleAddCustomer
  } = useCustomers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile View */}
      <div className="md:hidden">
        <MobileCustomerView 
          customers={customers}
          filteredCustomers={filteredCustomers}
          selectedCustomerForDetail={selectedCustomerForDetail}
          selectedCustomer={selectedCustomer}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleCustomerSelect={handleCustomerSelect}
          setIsNewCustomerModalOpen={setIsNewCustomerModalOpen}
          setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
        />
      </div>
      
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsNewCustomerModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" /> New Customer
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteConfirmOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete All
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 mt-6">
          <TabsList className="bg-sidebar-accent text-sidebar-foreground">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="all">All Customers</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>
          
          <CustomerTabContent 
            tabValue="overview"
            customers={customers}
            filteredCustomers={filteredCustomers}
            totalCustomers={totalCustomers}
            activeCustomers={activeCustomers}
            inactiveCustomers={inactiveCustomers}
            newCustomersThisMonth={newCustomersThisMonth}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            handleCustomerClick={handleCustomerClick}
          />
        </Tabs>
      </div>
      
      {/* Modals */}
      <CustomerDetailsModal 
        isOpen={isCustomerDetailsOpen}
        onClose={closeCustomerDetails}
        customer={selectedCustomer}
      />
      
      <NewCustomerModal 
        isOpen={isNewCustomerModalOpen}
        onOpenChange={setIsNewCustomerModalOpen}
        onAddCustomer={handleAddCustomer}
      />
      
      <DeleteConfirmDialog 
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={handleDeleteAllCustomers}
      />
    </div>
  );
};

export default Customers;
