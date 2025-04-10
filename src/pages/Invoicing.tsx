
import React, { useState } from "react";
import { useInvoices } from "@/hooks/invoicing/useInvoices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import InvoiceHeader from "@/components/invoicing/InvoiceHeader";
import InvoicesList from "@/components/invoicing/InvoicesList";
import InvoiceForm from "@/components/invoicing/InvoiceForm";
import InvoiceDetail from "@/components/invoicing/InvoiceDetail";
import { Invoice, InvoiceStatus } from "@/types/invoice";

const Invoicing = () => {
  const { 
    invoices, 
    isLoading, 
    isAdmin, 
    selectedInvoice,
    setSelectedInvoice,
    createInvoice,
    updateInvoiceStatus,
    completedJobs
  } = useInvoices();

  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredInvoices = invoices.filter(invoice => {
    if (activeTab === 'all') return true;
    return invoice.status === activeTab;
  });

  const handleCreateInvoice = (invoiceData: Omit<Invoice, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>) => {
    const success = createInvoice({
      ...invoiceData,
      customerId: 'temp-id' // This would be replaced with real customer ID in a real system
    });
    if (success) {
      setIsCreating(false);
    }
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    updateInvoiceStatus(invoiceId, 'paid');
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleBack = () => {
    setSelectedInvoice(null);
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Only admin users can access the invoicing functionality
          </p>
        </div>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
        </Card>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground">
            Create a new invoice for a completed job
          </p>
        </div>
        
        <Card className="p-6">
          <InvoiceForm 
            onSubmit={handleCreateInvoice} 
            completedJobs={completedJobs}
            onCancel={() => setIsCreating(false)}
          />
        </Card>
      </div>
    );
  }

  if (selectedInvoice) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <InvoiceDetail 
          invoice={selectedInvoice}
          onBack={handleBack}
          onUpdateStatus={updateInvoiceStatus}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <InvoiceHeader 
        onCreateInvoice={() => setIsCreating(true)}
        isAdmin={isAdmin}
      />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
        
        <Card className="p-6">
          <InvoicesList 
            invoices={filteredInvoices}
            isLoading={isLoading}
            onViewInvoice={handleViewInvoice}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </Card>
      </Tabs>
    </div>
  );
};

export default Invoicing;
