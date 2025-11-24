
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
  Download,
  Calendar,
  Sparkles, // Added new icon
  Wand2 // Added new icon
} from "lucide-react";
import { format, differenceInDays, differenceInHours, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

// Added new imports for AI features
import AIInsights from "../components/reports/AIInsights";
import AIMetricsSuggestion from "../components/reports/AIMetricsSuggestion";
import AICustomDashboard from "../components/reports/AICustomDashboard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Hooks personalizados
import { useProcesses } from "../components/hooks/useProcesses";
import { useInstances } from "../components/hooks/useInstances";
import { useTechnicians } from "../components/hooks/useTechnicians";

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  teal: '#14b8a6',
  pink: '#ec4899'
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.purple,
  COLORS.teal,
  COLORS.pink
];

export default function ReportsPage() {
  const { processes } = useProcesses();
  const { instances } = useInstances();
  const { technicians } = useTechnicians();
  
  const [dateRange, setDateRange] = useState('30'); // últimos 30 dias
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customDashboard, setCustomDashboard] = useState(null); // Added state for custom dashboard
  const [activeTab, setActiveTab] = useState("overview"); // Added state for active tab

  // Filtrar instâncias por período
  const filteredInstances = useMemo(() => {
    const now = new Date();
    const daysAgo = parseInt(dateRange);
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    let filtered = instances.filter(inst => {
      const createdDate = new Date(inst.created_date);
      return createdDate >= startDate;
    });

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(inst => {
        const process = processes.find(p => p.id === inst.process_id);
        return process?.category === selectedCategory;
      });
    }

    return filtered;
  }, [instances, dateRange, selectedCategory, processes]);

  // Métricas gerais
  const metrics = useMemo(() => {
    const total = filteredInstances.length;
    const finalizados = filteredInstances.filter(i => i.status === 'finalizado').length;
    const emAndamento = filteredInstances.filter(i => i.status === 'em_andamento').length;
    const atrasados = filteredInstances.filter(i => {
      if (i.due_date && i.status !== 'finalizado') {
        return new Date(i.due_date) < new Date();
      }
      return false;
    }).length;

    // Taxa de conclusão
    const taxaConclusao = total > 0 ? ((finalizados / total) * 100).toFixed(1) : 0;

    // Tempo médio de conclusão (em dias)
    const processosFinalizados = filteredInstances.filter(i => i.status === 'finalizado');
    const tempoMedio = processosFinalizados.length > 0
      ? processosFinalizados.reduce((acc, inst) => {
          const created = new Date(inst.created_date);
          const updated = new Date(inst.updated_date);
          return acc + differenceInDays(updated, created);
        }, 0) / processosFinalizados.length
      : 0;

    return {
      total,
      finalizados,
      emAndamento,
      atrasados,
      taxaConclusao,
      tempoMedio: tempoMedio.toFixed(1)
    };
  }, [filteredInstances]);

  // Volume por categoria
  const volumePorCategoria = useMemo(() => {
    const categoryCount = {};
    filteredInstances.forEach(inst => {
      const process = processes.find(p => p.id === inst.process_id);
      if (process) {
        const cat = process.category || 'outros';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      }
    });

    return Object.entries(categoryCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [filteredInstances, processes]);

  // Tempo médio por categoria
  const tempoPorCategoria = useMemo(() => {
    const categoryTimes = {};
    const categoryCounts = {};

    filteredInstances
      .filter(i => i.status === 'finalizado')
      .forEach(inst => {
        const process = processes.find(p => p.id === inst.process_id);
        if (process) {
          const cat = process.category || 'outros';
          const created = new Date(inst.created_date);
          const updated = new Date(inst.updated_date);
          const days = differenceInDays(updated, created);

          categoryTimes[cat] = (categoryTimes[cat] || 0) + days;
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }
      });

    return Object.entries(categoryTimes).map(([name, total]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      dias: (total / categoryCounts[name]).toFixed(1)
    }));
  }, [filteredInstances, processes]);

  // Desempenho por técnico
  const desempenhoPorTecnico = useMemo(() => {
    const techStats = {};

    filteredInstances.forEach(inst => {
      const techEmail = inst.technician_responsible;
      if (!techStats[techEmail]) {
        const tech = technicians.find(t => t.email === techEmail);
        techStats[techEmail] = {
          name: tech?.full_name || techEmail?.split('@')[0] || 'Desconhecido',
          total: 0,
          finalizados: 0,
          emAndamento: 0,
          atrasados: 0
        };
      }

      techStats[techEmail].total++;
      if (inst.status === 'finalizado') techStats[techEmail].finalizados++;
      if (inst.status === 'em_andamento') techStats[techEmail].emAndamento++;
      if (inst.due_date && new Date(inst.due_date) < new Date() && inst.status !== 'finalizado') {
        techStats[techEmail].atrasados++;
      }
    });

    return Object.values(techStats).sort((a, b) => b.finalizados - a.finalizados);
  }, [filteredInstances, technicians]);

  // Tendência mensal (últimos 6 meses)
  const tendenciaMensal = useMemo(() => {
    const monthsData = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthInstances = instances.filter(inst => {
        const created = new Date(inst.created_date);
        return created >= monthStart && created <= monthEnd;
      });

      monthsData.push({
        mes: format(date, 'MMM', { locale: ptBR }),
        criados: monthInstances.length,
        finalizados: monthInstances.filter(i => i.status === 'finalizado').length
      });
    }
    return monthsData;
  }, [instances]);

  // Status distribution
  const statusDistribution = useMemo(() => {
    const statusCount = {
      'aguardando_analise': { name: 'Aguardando', value: 0, color: COLORS.warning },
      'em_andamento': { name: 'Em Andamento', value: 0, color: COLORS.primary },
      'pendente': { name: 'Pendente', value: 0, color: COLORS.danger },
      'finalizado': { name: 'Finalizado', value: 0, color: COLORS.success }
    };

    filteredInstances.forEach(inst => {
      if (statusCount[inst.status]) {
        statusCount[inst.status].value++;
      }
    });

    return Object.values(statusCount).filter(s => s.value > 0);
  }, [filteredInstances]);

  const categorias = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'ambiental', label: 'Ambiental' },
    { value: 'agronegocio', label: 'Agronegócio' },
    { value: 'operacional', label: 'Operacional' },
    { value: 'florestal', label: 'Florestal' },
    { value: 'georreferenciamento', label: 'Georreferenciamento' }
  ];

  const handleDashboardGenerated = (dashboard) => {
    setCustomDashboard(dashboard);
    setActiveTab("custom");
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios e Analytics</h1>
            <p className="text-gray-500 mt-1">Análise detalhada de desempenho e métricas</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="180">Últimos 6 meses</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="ai-insights">
            <Sparkles className="w-4 h-4 mr-2" />
            Insights IA
          </TabsTrigger>
          <TabsTrigger value="custom">
            <Wand2 className="w-4 h-4 mr-2" />
            Personalizado
          </TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-8">
          {/* Métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total de Processos</span>
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{metrics.total}</div>
                <p className="text-xs text-gray-500 mt-1">No período selecionado</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Taxa de Conclusão</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{metrics.taxaConclusao}%</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <p className="text-xs text-green-600">
                    {metrics.finalizados} de {metrics.total} finalizados
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Tempo Médio</span>
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{metrics.tempoMedio}</div>
                <p className="text-xs text-gray-500 mt-1">dias para conclusão</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Processos Atrasados</span>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{metrics.atrasados}</div>
                <div className="flex items-center gap-1 mt-1">
                  {metrics.atrasados > 0 ? (
                    <>
                      <TrendingDown className="w-3 h-3 text-red-600" />
                      <p className="text-xs text-red-600">Requer atenção</p>
                    </>
                  ) : (
                    <p className="text-xs text-green-600">Nenhum atraso</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Volume por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Volume de Processos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumePorCategoria}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill={COLORS.primary} name="Processos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tendência Mensal */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Tendência Mensal - Últimos 6 Meses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tendenciaMensal}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="criados" stroke={COLORS.primary} strokeWidth={2} name="Criados" />
                    <Line type="monotone" dataKey="finalizados" stroke={COLORS.success} strokeWidth={2} name="Finalizados" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tempo Médio por Categoria */}
          {tempoPorCategoria.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Tempo Médio de Conclusão por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tempoPorCategoria}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} label={{ value: 'Dias', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip />
                      <Bar dataKey="dias" fill={COLORS.warning} name="Dias" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Desempenho dos Técnicos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Desempenho dos Técnicos</CardTitle>
                <Users className="w-5 h-5 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {desempenhoPorTecnico.map((tech, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">
                            {tech.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                          <p className="text-sm text-gray-500">{tech.total} processos no total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{tech.finalizados}</div>
                        <div className="text-xs text-gray-500">finalizados</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <Badge className="bg-blue-100 text-blue-800">
                          {tech.emAndamento} em andamento
                        </Badge>
                      </div>
                      <div className="text-center">
                        <Badge className="bg-green-100 text-green-800">
                          {((tech.finalizados / tech.total) * 100).toFixed(0)}% conclusão
                        </Badge>
                      </div>
                      <div className="text-center">
                        <Badge className={tech.atrasados > 0 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
                          {tech.atrasados} atrasados
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Insights IA */}
        <TabsContent value="ai-insights" className="space-y-8">
          <AIInsights 
            instances={filteredInstances}
            processes={processes}
            technicians={technicians}
          />

          <AIMetricsSuggestion
            instances={filteredInstances}
            processes={processes}
          />
        </TabsContent>

        {/* Tab: Dashboard Personalizado */}
        <TabsContent value="custom" className="space-y-8">
          <AICustomDashboard
            instances={filteredInstances}
            processes={processes}
            technicians={technicians}
            onDashboardGenerated={handleDashboardGenerated}
          />

          {customDashboard && (
            <Card>
              <CardHeader>
                <CardTitle>{customDashboard.title}</CardTitle>
                <p className="text-sm text-gray-600">{customDashboard.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {customDashboard.widgets.map((widget, index) => (
                    <Card key={index} className="border-2 border-purple-200">
                      <CardHeader>
                        <CardTitle className="text-base">{widget.title}</CardTitle>
                        <Badge variant="outline" className="w-fit">
                          {widget.type === 'bar' ? 'Gráfico de Barras' :
                           widget.type === 'line' ? 'Gráfico de Linha' :
                           widget.type === 'pie' ? 'Gráfico Pizza' :
                           widget.type === 'metric' ? 'Métrica' : 'Tabela'}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-3">{widget.explanation}</p>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-xs text-gray-600 mb-1">Fonte de dados:</p>
                          <p className="text-sm font-mono">{widget.data_source}</p>
                        </div>
                        {widget.filters && widget.filters.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-1">Filtros aplicados:</p>
                            <div className="flex flex-wrap gap-1">
                              {widget.filters.map((filter, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {filter}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
