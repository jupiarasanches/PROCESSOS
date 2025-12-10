import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useFinancialData() {
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const tables = ['bank_accounts','contacts','financial_categories','financial_transactions'];
      const results = await Promise.all(tables.map(async (t) => {
        const { data } = await supabase.from(t).select('*');
        return data || [];
      }));
      const [accountData, contactData, categoryData, transactionData] = results;
      setAccounts(accountData);
      setContacts(contactData);
      setCategories(categoryData);
      setTransactions(transactionData);
    } catch (err) {
      console.error('❌ Erro ao carregar dados financeiros:', err);
      setError(err);
      setAccounts([]);
      setContacts([]);
      setCategories([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  const refetch = () => loadFinancialData();

  return {
    accounts,
    contacts,
    categories,
    transactions,
    loading,
    error,
    refetch
  };
}
