
import React, { useState } from "react";
import { useInvoices } from "@/hooks/invoicing/useInvoices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import InvoiceHeader from "@/components/invoicing/InvoiceHeader";
import InvoicesList from "@/components/invoicing/InvoicesList";
import InvoiceForm from "@/components/invoicing/InvoiceForm";
import InvoiceDetail from "@/components/invoicing/InvoiceDetail";
import { Invoice, InvoiceStatus } from "@/types/invoice";
import { useAuth } from "@/contexts/AuthContext";
import AccountingIntegrations from "@/components/invoicing/AccountingIntegrations";

const Invoicing = () => {
  const { user } = useAuth();
  const { 
    invoices, 
    isLoading, 
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

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Please log in to access the invoicing functionality
          </p>
        </div>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">You need to be logged in to view your invoices.</p>
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
      />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card className="p-6">
            <InvoicesList 
              invoices={filteredInvoices}
              isLoading={isLoading}
              onViewInvoice={handleViewInvoice}
              onMarkAsPaid={handleMarkAsPaid}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="paid" className="space-y-4">
          <Card className="p-6">
            <InvoicesList 
              invoices={filteredInvoices}
              isLoading={isLoading}
              onViewInvoice={handleViewInvoice}
              onMarkAsPaid={handleMarkAsPaid}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <Card className="p-6">
            <InvoicesList 
              invoices={filteredInvoices}
              isLoading={isLoading}
              onViewInvoice={handleViewInvoice}
              onMarkAsPaid={handleMarkAsPaid}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="overdue" className="space-y-4">
          <Card className="p-6">
            <InvoicesList 
              invoices={filteredInvoices}
              isLoading={isLoading}
              onViewInvoice={handleViewInvoice}
              onMarkAsPaid={handleMarkAsPaid}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4">
          <AccountingIntegrations />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Invoicing;
