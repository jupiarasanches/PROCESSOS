import { useState, useEffect } from 'react';
import { BankAccount, Contact, FinancialCategory, FinancialTransaction } from '@/api/entities';

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
      const [accountData, contactData, categoryData, transactionData] = await Promise.all([
        BankAccount.list('-created_date'),
        Contact.list('-created_date'),
        FinancialCategory.list('-created_date'),
        FinancialTransaction.list('-created_date')
      ]);

      setAccounts(accountData || []);
      setContacts(contactData || []);
      setCategories(categoryData || []);
      setTransactions(transactionData || []);
      
      console.log('✅ Dados financeiros carregados:');
      console.log('🏦 Contas:', accountData?.length || 0);
      console.log('👥 Contatos:', contactData?.length || 0);
      console.log('🏷️ Categorias:', categoryData?.length || 0);
      console.log('💰 Transações:', transactionData?.length || 0);
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