import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { XeroAccountMapping, XeroAccount, XeroTaxRate } from '@/types/xero';

export const useXeroAccountMapping = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mapping, setMapping] = useState<XeroAccountMapping | null>(null);
  const [accounts, setAccounts] = useState<XeroAccount[]>([]);
  const [taxRates, setTaxRates] = useState<XeroTaxRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingAccounts, setIsFetchingAccounts] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMapping();
    }
  }, [user]);

  const fetchMapping = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('xero_account_mappings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setMapping({
          id: data.id,
          userId: data.user_id,
          invoiceAccountCode: data.invoice_account_code,
          cashPaymentAccountCode: data.cash_payment_account_code,
          bankPaymentAccountCode: data.bank_payment_account_code,
          creditAccountCode: data.credit_account_code,
          billAccountCode: data.bill_account_code,
          billCashPaymentAccountCode: data.bill_cash_payment_account_code,
          billBankPaymentAccountCode: data.bill_bank_payment_account_code,
          supplierCreditAccountCode: data.supplier_credit_account_code,
          invoiceTaxCode: data.invoice_tax_code,
          invoiceTaxFreeCode: data.invoice_tax_free_code,
          billTaxCode: data.bill_tax_code,
          billTaxFreeCode: data.bill_tax_free_code,
          isConfigured: data.is_configured,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
    } catch (error) {
      console.error('Error fetching account mapping:', error);
      toast({
        title: 'Error',
        description: 'Failed to load account mappings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccountsAndTaxRates = async () => {
    setIsFetchingAccounts(true);
    try {
      const [accountsResponse, taxRatesResponse] = await Promise.all([
        supabase.functions.invoke('xero-integration/fetch-chart-of-accounts'),
        supabase.functions.invoke('xero-integration/fetch-tax-rates'),
      ]);

      if (accountsResponse.error) throw accountsResponse.error;
      if (taxRatesResponse.error) throw taxRatesResponse.error;

      if (accountsResponse.data?.accounts) {
        setAccounts(accountsResponse.data.accounts);
      }

      if (taxRatesResponse.data?.taxRates) {
        setTaxRates(taxRatesResponse.data.taxRates);
      }
    } catch (error) {
      console.error('Error fetching accounts and tax rates:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch Xero accounts and tax rates',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingAccounts(false);
    }
  };

  const saveMapping = async (mappingData: Partial<XeroAccountMapping>) => {
    if (!user) return false;

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'xero-integration/save-account-mapping',
        {
          body: { mapping: mappingData }
        }
      );

      if (error) throw error;

      if (data?.success) {
        await fetchMapping();
        toast({
          title: 'Success',
          description: 'Account mappings saved successfully',
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error saving account mapping:', error);
      toast({
        title: 'Error',
        description: 'Failed to save account mappings',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    mapping,
    accounts,
    taxRates,
    isLoading,
    isSaving,
    isFetchingAccounts,
    fetchAccountsAndTaxRates,
    saveMapping,
    refetch: fetchMapping,
  };
};
