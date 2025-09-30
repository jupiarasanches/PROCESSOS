import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  AlertTriangle,
  Target,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Zap
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate } from "../utils/formatters";

export default function ExecutiveDashboard({ 
  transactions = [], 
  processes = [], 
  instances = [], 
  contacts = [], 
  accounts = [] 
}) {
  const [timeRange, setTimeRange] = useState('30d');
  const [kpis, setKpis] = useState(null);
  const [predictions, setPredictions] = useState(null);

  // Calcular KPIs de Consultoria
  const consultancyKPIs = React.useMemo(() => {
    const now = new Date();
    const rangeDate = new Date();
    
    switch(timeRange) {
      case '7d': rangeDate.setDate(now.getDate() - 7); break;
      case '30d': rangeDate.setDate(now.getDate() - 30); break;
      case '90d': rangeDate.setDate(now.getDate() - 90); break;
      case '12m': rangeDate.setFullYear(now.getFullYear() - 1); break;
      default: rangeDate.setDate(now.getDate() - 30);
    }

    const periodTransactions = transactions.filter(t => new Date(t.created_date) >= rangeDate);
    const periodInstances = instances.filter(i => new Date(i.created_date) >= rangeDate);
    
    const totalRevenue = periodTransactions
      .filter(t => t.type === 'receita' && t.status === 'pago')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalCosts = periodTransactions
      .filter(t => t.type === 'despesa' && t.status === 'pago')
      .reduce((sum, t) => sum + t.amount, 0);

    const profitabilityMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;
    
    const completedProjects = periodInstances.filter(i => i.status === 'finalizado').length;
    const avgProjectDuration = completedProjects > 0 ? 
      periodInstances
        .filter(i => i.status === 'finalizado')
        .reduce((sum, i) => {
          const start = new Date(i.created_date);
          const end = new Date(i.updated_date || i.created_date);
          return sum + (end - start) / (1000 * 60 * 60 * 24);
        }, 0) / completedProjects : 0;

    const overdueTasks = instances.filter(i => 
      i.due_date && new Date(i.due_date) < now && !['finalizado', 'cancelado'].includes(i.status)
    ).length;

    const overdueRatio = instances.length > 0 ? (overdueTasks / instances.length) * 100 : 0;

    const activeClients = [...new Set(periodInstances.map(i => i.client_company))].length;
    const revenuePerClient = activeClients > 0 ? totalRevenue / activeClients : 0;

    return {
      totalRevenue,
      totalCosts,
      profitabilityMargin,
      avgProjectDuration,
      overdueRatio,
      activeClients,
      revenuePerClient,
      completedProjects,
      pipeline: instances.filter(i => ['aguardando_analise', 'em_andamento'].includes(i.status)).length,
      cashConversionCycle: 35 // Média da indústria, seria calculado com dados reais
    };
  }, [transactions, instances, timeRange]);

  // Dados para gráficos
  const revenueData = React.useMemo(() => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.paid_date || t.created_date);
        return transactionDate.toDateString() === date.toDateString() && t.status === 'pago';
      });
      
      const revenue = dayTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
      const costs = dayTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
      
      last30Days.push({
        date: date.toISOString().split('T')[0],
        revenue,
        costs,
        profit: revenue - costs
      });
    }
    return last30Days;
  }, [transactions]);

  const projectStatusData = React.useMemo(() => {
    const statusCounts = instances.reduce((acc, instance) => {
      acc[instance.status] = (acc[instance.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Em Análise', value: statusCounts.aguardando_analise || 0, color: '#f59e0b' },
      { name: 'Em Andamento', value: statusCounts.em_andamento || 0, color: '#3b82f6' },
      { name: 'Finalizados', value: statusCounts.finalizado || 0, color: '#10b981' },
      { name: 'Cancelados', value: statusCounts.cancelado || 0, color: '#ef4444' }
    ];
  }, [instances]);

  const performanceMetrics = [
    {
      title: "Margem de Lucro",
      value: `${consultancyKPIs.profitabilityMargin.toFixed(1)}%`,
      change: "+2.3%",
      trend: "up",
      icon: TrendingUp,
      benchmark: "35-45%",
      description: "Margem bruta dos projetos"
    },
    {
      title: "Receita Mensal",
      value: formatCurrency(consultancyKPIs.totalRevenue),
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      benchmark: "Crescimento sustentável",
      description: "Receita do período"
    },
    {
      title: "Clientes Ativos",
      value: consultancyKPIs.activeClients,
      change: "+3",
      trend: "up",
      icon: Users,
      benchmark: "20-30 clientes",
      description: "Clientes com projetos ativos"
    },
    {
      title: "Taxa de Atraso",
      value: `${consultancyKPIs.overdueRatio.toFixed(1)}%`,
      change: "-1.2%",
      trend: consultancyKPIs.overdueRatio < 15 ? "up" : "down",
      icon: AlertTriangle,
      benchmark: "<15%",
      description: "Processos em atraso"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header com Controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Executivo</h2>
          <p className="text-gray-500">Visão estratégica do desempenho financeiro</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="12m">Último ano</option>
          </select>
          
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Período Custom
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {metric.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Benchmark: {metric.benchmark}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <metric.icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Receita vs Custos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Evolução Financeira (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value)]}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} name="Receita" />
                  <Area type="monotone" dataKey="costs" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} name="Custos" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status dos Projetos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Distribuição dos Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Avançadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance por Técnico */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance por Técnico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['João Silva', 'Maria Santos', 'Carlos Oliveira'].map((tech, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{tech}</p>
                    <p className="text-sm text-gray-500">3 projetos ativos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(45000 + index * 10000)}</p>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      +{12 + index * 2}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas de Cash Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Alertas Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-sm">Pagamento Atrasado</p>
                  <p className="text-xs text-gray-600">Cliente XYZ - R$ 15.000</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Vencimento Próximo</p>
                  <p className="text-xs text-gray-600">3 faturas em 5 dias</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Meta Atingida</p>
                  <p className="text-xs text-gray-600">Receita mensal: 105%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próximas Ações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Ações Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="font-medium text-sm">Cobrar Cliente ABC</p>
                <p className="text-xs text-gray-600 mb-2">Fatura vencida há 5 dias</p>
                <Button size="sm" variant="outline" className="text-xs">
                  Enviar Lembrete
                </Button>
              </div>
              
              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="font-medium text-sm">Revisar Margem SIMCAR</p>
                <p className="text-xs text-gray-600 mb-2">Margem abaixo da meta</p>
                <Button size="sm" variant="outline" className="text-xs">
                  Analisar Custos
                </Button>
              </div>

              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="font-medium text-sm">Planejar Cash Flow</p>
                <p className="text-xs text-gray-600 mb-2">Projeção para 60 dias</p>
                <Button size="sm" variant="outline" className="text-xs">
                  Ver Projeção
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}