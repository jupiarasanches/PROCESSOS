import React, { useState, useEffect } from "react";
import { BankAccount, Contact, FinancialCategory, FinancialTransaction, Process, ProcessInstance } from "@/api/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  CreditCard,
  AlertCircle,
  Plus,
  Loader2,
  Building2,
  Users,
  Tag,
  ArrowUpDown,
  Wallet,
  PieChart,
  BarChart3,
  Zap,
  Search,
  Leaf, // New import
} from "lucide-react";
import { formatCurrency } from "../components/utils/formatters";
import { toast } from "sonner";
import BankAccountModal from "../components/financial/BankAccountModal";
import ContactModal from "../components/financial/ContactModal";
import CategoryModal from "../components/financial/CategoryModal";
import TransactionModal from "../components/financial/TransactionModal";
import CashFlowChart from "../components/financial/CashFlowChart";
import ExecutiveDashboard from "../components/financial/ExecutiveDashboard";
import AutomatedBillingSystem from "../components/financial/AutomatedBillingSystem";
import CashFlowPredictor from "../components/financial/CashFlowPredictor";
import MarketResearch from "../components/financial/MarketResearch";
import EnvironmentalBillingSystem from "../components/financial/EnvironmentalBillingSystem"; // New import

export default function FinancialPage() {
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Modal states
  const [modals, setModals] = useState({
    bankAccount: { open: false, data: null },
    contact: { open: false, data: null },
    category: { open: false, data: null },
    transaction: { open: false, data: null }
  });

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      // CARREGAR DADOS FINANCEIROS GLOBAIS - SEM FILTROS POR USUÁRIO
      const [accountData, contactData, categoryData, transactionData, processData, instanceData] = await Promise.all([
        BankAccount.list('-created_date'),
        Contact.list('-created_date'),
        FinancialCategory.list('-created_date'),
        FinancialTransaction.list('-created_date'),
        Process.list('-created_date'),
        ProcessInstance.list('-created_date')
      ]);

      setAccounts(accountData || []);
      setContacts(contactData || []);
      setCategories(categoryData || []);
      setTransactions(transactionData || []);
      setProcesses(processData || []);
      setInstances(instanceData || []);
      
      console.log('✅ FINANCEIRO - DADOS GLOBAIS CARREGADOS:');
      console.log('🏦 Contas:', accountData?.length || 0);
      console.log('👥 Contatos:', contactData?.length || 0);
      console.log('🏷️ Categorias:', categoryData?.length || 0);
      console.log('💰 Transações:', transactionData?.length || 0);
      console.log('🔄 Processos:', processData?.length || 0);
      console.log('🚀 Instâncias de Processo:', instanceData?.length || 0);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
      toast.error("Erro ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  };

  // Cálculos financeiros em tempo real
  const financialStats = React.useMemo(() => {
    const totalBalance = accounts
      .filter(acc => acc.is_active)
      .reduce((sum, acc) => sum + (acc.balance || 0), 0);

    const monthlyRevenue = transactions
      .filter(t => {
        if (t.type !== 'receita' || t.status !== 'pago') return false;
        const date = new Date(t.paid_date || t.created_date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = transactions
      .filter(t => {
        if (t.type !== 'despesa' || t.status !== 'pago') return false;
        const date = new Date(t.paid_date || t.created_date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingReceivables = transactions
      .filter(t => t.type === 'receita' && t.status === 'pendente')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingPayables = transactions
      .filter(t => t.type === 'despesa' && t.status === 'pendente')
      .reduce((sum, t) => sum + t.amount, 0);

    const overdueTransactions = transactions
      .filter(t => t.status === 'atrasado' || (
        t.status === 'pendente' &&
        t.due_date &&
        new Date(t.due_date) < new Date()
      )).length;

    return {
      totalBalance,
      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit: monthlyRevenue - monthlyExpenses,
      pendingReceivables,
      pendingPayables,
      overdueTransactions,
      activeAccounts: accounts.filter(acc => acc.is_active).length,
      totalContacts: contacts.length
    };
  }, [accounts, transactions, contacts]);

  const openModal = (type, data = null) => {
    setModals(prev => ({
      ...prev,
      [type]: { open: true, data }
    }));
  };

  const closeModal = (type) => {
    setModals(prev => ({
      ...prev,
      [type]: { open: false, data: null }
    }));
  };

  const handleSave = async (type, data) => {
    try {
      const entities = {
        bankAccount: BankAccount,
        contact: Contact,
        category: FinancialCategory,
        transaction: FinancialTransaction
      };

      if (modals[type].data?.id) {
        await entities[type].update(modals[type].data.id, data);
        toast.success("Atualizado com sucesso!");
      } else {
        await entities[type].create(data);
        toast.success("Criado com sucesso!");
      }

      await loadFinancialData();
      closeModal(type);
    } catch (error) {
      console.error(`Erro ao salvar ${type}:`, error);
      toast.error("Erro ao salvar dados");
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            Sistema Financeiro Completo
          </h1>
          <p className="text-gray-500 mt-1">Controle total das finanças da sua empresa.</p>
        </div>

        {/* Cards de Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">Saldo Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(financialStats.totalBalance)}
                      </p>
                      <p className="text-xs text-gray-500">{financialStats.activeAccounts} contas ativas</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Wallet className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Soma de todas as contas bancárias ativas</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-1">Receita Mensal</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(financialStats.monthlyRevenue)}
                      </p>
                      <p className="text-xs text-gray-500">A receber: {formatCurrency(financialStats.pendingReceivables)}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total de receitas do mês atual e valores pendentes</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600 mb-1">Despesa Mensal</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(financialStats.monthlyExpenses)}
                      </p>
                      <p className="text-xs text-gray-500">A pagar: {formatCurrency(financialStats.pendingPayables)}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-lg">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total de despesas do mês atual e valores a pagar</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 mb-1">Transações em Atraso</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {financialStats.overdueTransactions}
                      </p>
                      <p className="text-xs text-gray-500">Requer atenção imediata</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Número de transações com vencimento em atraso</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Conteúdo Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-fit grid-cols-11 bg-white border"> {/* Changed grid-cols-10 to grid-cols-11 for the new tab */}
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="research" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Pesquisa FAZ
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pesquisa do sistema FAZ SEDEP para insights</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="environmental" className="flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  Cobrança Ambiental
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sistema de cobrança adaptado para consultoria ambiental</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="executive" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Executivo
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dashboard executivo com KPIs avançados</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="billing" className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Cobrança Auto
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sistema de cobrança automatizada por etapas</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="prediction" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Previsões IA
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Análise preditiva de fluxo de caixa com IA</p>
                </TooltipContent>
              </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visão geral com gráficos e relatórios</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="accounts" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Contas
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gerenciar contas bancárias da empresa</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="transactions" className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  Transações
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Registrar e acompanhar receitas e despesas</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="contacts" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Clientes/Fornecedores
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cadastro de clientes e fornecedores</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Categorias
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Organizar transações por categoria</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="cashflow" className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Fluxo de Caixa
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Análise detalhada do fluxo de caixa</p>
              </TooltipContent>
            </Tooltip>
          </TabsList>

          <TabsContent value="research" className="space-y-6">
            <MarketResearch />
          </TabsContent>

          <TabsContent value="environmental" className="space-y-6">
            <EnvironmentalBillingSystem
              instances={instances}
              onRefresh={loadFinancialData}
            />
          </TabsContent>

          <TabsContent value="executive" className="space-y-6">
            <ExecutiveDashboard
              transactions={transactions}
              processes={processes}
              instances={instances}
              contacts={contacts}
              accounts={accounts}
            />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <AutomatedBillingSystem
              instances={instances}
              onRefresh={loadFinancialData}
            />
          </TabsContent>

          <TabsContent value="prediction" className="space-y-6">
            <CashFlowPredictor
              transactions={transactions}
              instances={instances}
              accounts={accounts}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <CashFlowChart transactions={transactions} accounts={accounts} />
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Contas Bancárias</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => openModal('bankAccount')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Conta
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Adicionar nova conta bancária ao sistema</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <Tooltip key={account.id}>
                  <TooltipTrigger asChild>
                    <Card className="bg-white cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => openModal('bankAccount', account)}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{account.account_name}</CardTitle>
                            <p className="text-sm text-gray-600">{account.bank_name}</p>
                          </div>
                          <Badge variant={account.is_active ? "default" : "secondary"}>
                            {account.is_active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {formatCurrency(account.balance)}
                        </div>
                        <p className="text-sm text-gray-500 capitalize">{account.account_type}</p>
                        {account.description && (
                          <p className="text-sm text-gray-600 mt-2">{account.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clique para editar dados desta conta bancária</p>
                  </TooltipContent>
                </Tooltip>
              ))}

              {accounts.length === 0 && (
                <Card className="bg-white col-span-full">
                  <CardContent className="p-12 text-center">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma conta encontrada</h3>
                    <p className="text-gray-600">Adicione sua primeira conta bancária para começar.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Transações Financeiras</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => openModal('transaction')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Transação
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Registrar nova receita ou despesa</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="grid gap-4">
              {transactions.slice(0, 10).map((transaction) => (
                <Tooltip key={transaction.id}>
                  <TooltipTrigger asChild>
                    <Card className="bg-white cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => openModal('transaction', transaction)}>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex-1">
                          <CardTitle className="text-base">{transaction.description}</CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {transaction.type}
                            </Badge>
                            <Badge className={getTransactionStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'receita' ? '+' : '-'} {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Venc: {new Date(transaction.due_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </CardHeader>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clique para editar esta transação</p>
                  </TooltipContent>
                </Tooltip>
              ))}

              {transactions.length === 0 && (
                <Card className="bg-white">
                  <CardContent className="p-12 text-center">
                    <ArrowUpDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma transação encontrada</h3>
                    <p className="text-gray-600">Registre sua primeira transação para começar.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Clientes e Fornecedores</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => openModal('contact')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Contato
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Adicionar novo cliente ou fornecedor</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contacts.map((contact) => (
                <Tooltip key={contact.id}>
                  <TooltipTrigger asChild>
                    <Card className="bg-white cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => openModal('contact', contact)}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{contact.name}</CardTitle>
                            <p className="text-sm text-gray-600">{contact.document}</p>
                          </div>
                          <Badge className={getContactTypeColor(contact.type)}>
                            {contact.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {contact.email && (
                          <p className="text-sm text-gray-600 mb-1">{contact.email}</p>
                        )}
                        {contact.phone && (
                          <p className="text-sm text-gray-600">{contact.phone}</p>
                        )}
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clique para editar informações deste contato</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Categorias Financeiras</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => openModal('category')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Categoria
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Criar nova categoria para organizar transações</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Tooltip key={category.id}>
                  <TooltipTrigger asChild>
                    <Card className="bg-white cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => openModal('category', category)}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color || '#6366f1' }}
                          />
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{category.type}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clique para editar esta categoria</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cashflow" className="space-y-6">
            <h2 className="text-2xl font-semibold">Fluxo de Caixa</h2>
            <CashFlowChart transactions={transactions} accounts={accounts} />
          </TabsContent>
        </Tabs>

        {/* Modais */}
        <BankAccountModal
          isOpen={modals.bankAccount.open}
          account={modals.bankAccount.data}
          onClose={() => closeModal('bankAccount')}
          onSave={(data) => handleSave('bankAccount', data)}
        />

        <ContactModal
          isOpen={modals.contact.open}
          contact={modals.contact.data}
          onClose={() => closeModal('contact')}
          onSave={(data) => handleSave('contact', data)}
        />

        <CategoryModal
          isOpen={modals.category.open}
          category={modals.category.data}
          onClose={() => closeModal('category')}
          onSave={(data) => handleSave('category', data)}
        />

        <TransactionModal
          isOpen={modals.transaction.open}
          transaction={modals.transaction.data}
          accounts={accounts}
          contacts={contacts}
          categories={categories}
          onClose={() => closeModal('transaction')}
          onSave={(data) => handleSave('transaction', data)}
        />
      </div>
    </TooltipProvider>
  );

  function getTransactionStatusColor(status) {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-orange-100 text-orange-800';
      case 'atrasado': return 'bg-red-100 text-red-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  }

  function getContactTypeColor(type) {
    switch (type) {
      case 'cliente': return 'bg-blue-100 text-blue-800';
      case 'fornecedor': return 'bg-purple-100 text-purple-800';
      case 'ambos': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}