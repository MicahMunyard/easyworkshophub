import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useXeroAccountMapping } from '@/hooks/xero/useXeroAccountMapping';
import { Loader2, Info } from 'lucide-react';
import { XeroAccountMapping } from '@/types/xero';

const ChartOfAccounts: React.FC = () => {
  const navigate = useNavigate();
  const {
    mapping,
    accounts,
    taxRates,
    isLoading,
    isSaving,
    isFetchingAccounts,
    fetchAccountsAndTaxRates,
    saveMapping,
  } = useXeroAccountMapping();

  const [formData, setFormData] = useState<Partial<XeroAccountMapping>>({});

  useEffect(() => {
    fetchAccountsAndTaxRates();
  }, []);

  useEffect(() => {
    if (mapping) {
      setFormData(mapping);
    }
  }, [mapping]);

  const handleSave = async () => {
    const success = await saveMapping({
      ...formData,
      isConfigured: true,
    });

    if (success) {
      navigate('/invoicing');
    }
  };

  const handleCancel = () => {
    navigate('/invoicing');
  };

  const revenueAccounts = accounts.filter(a => a.type === 'REVENUE');
  const bankAccounts = accounts.filter(a => a.type === 'BANK' || a.type === 'CURRENT');
  const currentAccounts = accounts.filter(a => a.type === 'CURRENT');
  const expenseAccounts = accounts.filter(a => a.type === 'EXPENSE' || a.type === 'DIRECTCOSTS');

  // Filter tax rates by type to prevent incorrect selections
  const outputTaxRates = taxRates.filter(tax => 
    tax.taxType?.startsWith('OUTPUT') || 
    tax.name?.toLowerCase().includes('sales') ||
    tax.name?.toLowerCase().includes('income')
  );

  const inputTaxRates = taxRates.filter(tax => 
    tax.taxType?.startsWith('INPUT') || 
    tax.name?.toLowerCase().includes('purchase') ||
    tax.name?.toLowerCase().includes('expense')
  );

  const taxFreeTaxRates = taxRates.filter(tax => 
    tax.taxType?.includes('NONE') || 
    tax.taxType?.includes('EXEMPTEXPENSES') ||
    tax.taxType?.includes('EXEMPTOUTPUT') ||
    tax.name?.toLowerCase().includes('free') ||
    tax.name?.toLowerCase().includes('exempt')
  );

  if (isLoading || isFetchingAccounts) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Chart of Accounts Setup</CardTitle>
          <CardDescription>
            Map your WorkshopBase accounts to Xero accounts. This is required before syncing invoices and bills.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Invoice Accounts Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Invoice Accounts</h3>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceAccount">Invoice Account (Revenue)</Label>
                <Select
                  value={formData.invoiceAccountCode}
                  onValueChange={(value) => setFormData({ ...formData, invoiceAccountCode: value })}
                >
                  <SelectTrigger id="invoiceAccount">
                    <SelectValue placeholder="Select revenue account" />
                  </SelectTrigger>
                  <SelectContent>
                    {revenueAccounts.map((account) => (
                      <SelectItem key={account.accountID} value={account.code}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cashPaymentAccount">Cash Payment Account</Label>
                <Select
                  value={formData.cashPaymentAccountCode}
                  onValueChange={(value) => setFormData({ ...formData, cashPaymentAccountCode: value })}
                >
                  <SelectTrigger id="cashPaymentAccount">
                    <SelectValue placeholder="Select cash account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.accountID} value={account.code}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankPaymentAccount">Bank Payment Account</Label>
                <Select
                  value={formData.bankPaymentAccountCode}
                  onValueChange={(value) => setFormData({ ...formData, bankPaymentAccountCode: value })}
                >
                  <SelectTrigger id="bankPaymentAccount">
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.accountID} value={account.code}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditAccount">Customer Credit Account</Label>
                <Select
                  value={formData.creditAccountCode}
                  onValueChange={(value) => setFormData({ ...formData, creditAccountCode: value })}
                >
                  <SelectTrigger id="creditAccount">
                    <SelectValue placeholder="Select credit account" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentAccounts.map((account) => (
                      <SelectItem key={account.accountID} value={account.code}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Bill Accounts Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bill Accounts</h3>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="billAccount">Bill Account (Expenses)</Label>
                <Select
                  value={formData.billAccountCode}
                  onValueChange={(value) => setFormData({ ...formData, billAccountCode: value })}
                >
                  <SelectTrigger id="billAccount">
                    <SelectValue placeholder="Select expense account" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseAccounts.map((account) => (
                      <SelectItem key={account.accountID} value={account.code}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billCashPaymentAccount">Bill Cash Payment Account</Label>
                <Select
                  value={formData.billCashPaymentAccountCode}
                  onValueChange={(value) => setFormData({ ...formData, billCashPaymentAccountCode: value })}
                >
                  <SelectTrigger id="billCashPaymentAccount">
                    <SelectValue placeholder="Select cash account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.accountID} value={account.code}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billBankPaymentAccount">Bill Bank Payment Account</Label>
                <Select
                  value={formData.billBankPaymentAccountCode}
                  onValueChange={(value) => setFormData({ ...formData, billBankPaymentAccountCode: value })}
                >
                  <SelectTrigger id="billBankPaymentAccount">
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.accountID} value={account.code}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierCreditAccount">Supplier Credit Account</Label>
                <Select
                  value={formData.supplierCreditAccountCode}
                  onValueChange={(value) => setFormData({ ...formData, supplierCreditAccountCode: value })}
                >
                  <SelectTrigger id="supplierCreditAccount">
                    <SelectValue placeholder="Select credit account" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentAccounts.map((account) => (
                      <SelectItem key={account.accountID} value={account.code}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tax Codes Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tax Codes</h3>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Invoice Tax Codes:</strong> Use OUTPUT tax types for sales to customers (e.g., "GST on Income", "OUTPUT").
                <br />
                <strong>Bill Tax Codes:</strong> Use INPUT tax types for purchases from suppliers (e.g., "GST on Expenses", "INPUT").
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <div>
                  <Label htmlFor="invoiceTaxCode">Invoice GST</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    For sales invoices - use OUTPUT tax types only
                  </p>
                </div>
                <Select
                  value={formData.invoiceTaxCode}
                  onValueChange={(value) => setFormData({ ...formData, invoiceTaxCode: value })}
                >
                  <SelectTrigger id="invoiceTaxCode">
                    <SelectValue placeholder="Select OUTPUT tax code" />
                  </SelectTrigger>
                  <SelectContent>
                    {outputTaxRates.length > 0 ? (
                      outputTaxRates.map((tax) => (
                        <SelectItem key={tax.taxType} value={tax.taxType}>
                          {tax.name} ({tax.displayTaxRate}%)
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No OUTPUT tax rates available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div>
                  <Label htmlFor="invoiceTaxFreeCode">Invoice GST Free</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    For tax-exempt sales (e.g., exports, exempt supplies)
                  </p>
                </div>
                <Select
                  value={formData.invoiceTaxFreeCode}
                  onValueChange={(value) => setFormData({ ...formData, invoiceTaxFreeCode: value })}
                >
                  <SelectTrigger id="invoiceTaxFreeCode">
                    <SelectValue placeholder="Select tax-free code" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxFreeTaxRates.map((tax) => (
                      <SelectItem key={tax.taxType} value={tax.taxType}>
                        {tax.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div>
                  <Label htmlFor="billTaxCode">Bill GST</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    For purchase bills - use INPUT tax types only
                  </p>
                </div>
                <Select
                  value={formData.billTaxCode}
                  onValueChange={(value) => setFormData({ ...formData, billTaxCode: value })}
                >
                  <SelectTrigger id="billTaxCode">
                    <SelectValue placeholder="Select INPUT tax code" />
                  </SelectTrigger>
                  <SelectContent>
                    {inputTaxRates.length > 0 ? (
                      inputTaxRates.map((tax) => (
                        <SelectItem key={tax.taxType} value={tax.taxType}>
                          {tax.name} ({tax.displayTaxRate}%)
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No INPUT tax rates available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div>
                  <Label htmlFor="billTaxFreeCode">Bill GST Free</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    For tax-exempt purchases (e.g., exempt expenses)
                  </p>
                </div>
                <Select
                  value={formData.billTaxFreeCode}
                  onValueChange={(value) => setFormData({ ...formData, billTaxFreeCode: value })}
                >
                  <SelectTrigger id="billTaxFreeCode">
                    <SelectValue placeholder="Select tax-free code" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxFreeTaxRates.map((tax) => (
                      <SelectItem key={tax.taxType} value={tax.taxType}>
                        {tax.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartOfAccounts;
