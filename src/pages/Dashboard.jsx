
import React from "react";
import DashboardMetrics from "../components/dashboard/DashboardMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  CheckCircle, 
  Play, 
  AlertTriangle,
  Loader2,
  Plus,
  Users,
  BarChart3,
  Zap
} from "lucide-react";

// Hooks personalizados
import { useProcesses } from "../components/hooks/useProcesses";
import { useInstances } from "../components/hooks/useInstances";
import { useTechnicians } from "../components/hooks/useTechnicians";

export default function Dashboard() {
  // Usando hooks personalizados
  const { processes } = useProcesses();
  const { instances, loading } = useInstances();
  const { technicians } = useTechnicians();

  // Atividades recentes
  const recentActivities = instances
    .slice(0, 4)
    .map(instance => ({
      id: instance.id,
      title: instance.title,
      processName: processes.find(p => p.id === instance.process_id)?.name || 'N/A',
      user: instance.requester,
      timestamp: instance.created_date,
      status: instance.status,
      technician: technicians.find(t => t.email === instance.technician_responsible)?.full_name || instance.technician_responsible?.split('@')[0]
    }));

  // Dados para gráfico de burndown
  const burndownData = React.useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayInstances = instances.filter(instance => {
        const instanceDate = new Date(instance.created_date);
        return instanceDate.toDateString() === date.toDateString();
      });
      
      const idealValue = Math.max(0, 25 - (6 - i) * 3);
      
      last7Days.push({
        day: format(date, 'EEE', { locale: ptBR }),
        ideal: idealValue, 
        real: dayInstances.filter(i => i.status === 'finalizado').length
      });
    }
    return last7Days;
  }, [instances]);

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'finalizado': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'em_andamento': return <Play className="w-4 h-4 text-blue-600" />;
      case 'cancelado': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Loader2 className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'finalizado': return 'bg-green-100 text-green-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  return (
    <TooltipProvider>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Visão geral do seu workspace e atividades da equipe</p>
        </div>

        {/* Métricas */}
        <DashboardMetrics instances={instances} />

        {/* Seção Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Atividades Recentes */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Atividades Recentes</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={createPageUrl("Processes")} className="text-blue-600 text-sm hover:underline">
                      Ver todos
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver todos os processos do sistema</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {recentActivities.map((activity, index) => (
                  <Tooltip key={activity.id}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {getStatusIcon(activity.status)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            em {activity.processName} • {activity.technician}
                          </p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(activity.timestamp), "dd/MM 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(activity.status)} text-xs`}>
                          {activity.status === 'em_andamento' ? 'Em andamento' :
                           activity.status === 'finalizado' ? 'Concluído' :
                           activity.status === 'cancelado' ? 'Cancelado' : 'Pendente'}
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clique para ver detalhes do processo</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
              <p className="text-sm text-gray-500">Acesso rápido às funcionalidades</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={createPageUrl("Processes")} className="block">
                      <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Processo
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Criar uma nova instância de processo</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={createPageUrl("Technicians")} className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Convidar Membro
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Adicionar novo membro à equipe</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={createPageUrl("DataAdmin")} className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Ver Analytics
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visualizar relatórios e dados do sistema</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          {/* Progresso do Sprint */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Progresso do Sprint</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  Ver detalhes
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Sprint 15 - Processos do TI</span>
                    <span className="text-xs text-gray-500">Fim: 15/02/2024</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">Início: 01/02/2024</div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progresso</span>
                        <span>68% concluído</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>32 pontos completos</span>
                        <span>15 pontos falta</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">6</div>
                        <div className="text-xs text-gray-500">Finalizados</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">32</div>
                        <div className="text-xs text-gray-500">Pontos Completos</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção Inferior */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Burndown */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Gráfico de Burndown</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  <Zap className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={burndownData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 12, fill: '#666' }}
                      stroke="#999"
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#666' }}
                      stroke="#999"
                    />
                    <RechartsTooltip />
                    <Bar dataKey="ideal" fill="#e0e7ff" name="Ideal" />
                    <Bar dataKey="real" fill="#3b82f6" name="Real" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">23</div>
                  <div className="text-xs text-gray-500">Concluídas Esta Semana</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">31</div>
                  <div className="text-xs text-gray-500">Em Andamento</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visão Geral do Workspace */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Visão Geral do Workspace</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Projetos Ativos</span>
                  <span className="text-2xl font-bold">{processes.filter(p => p.status === 'ativo').length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Membros da Equipe</span>
                  <span className="text-2xl font-bold">{technicians.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Armazenamento do Workspace</span>
                  <span className="text-sm font-medium">2.4 GB / 10 GB</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
