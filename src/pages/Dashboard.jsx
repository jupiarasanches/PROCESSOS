
import React from "react";
import DashboardMetrics from "../components/dashboard/DashboardMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Sector } from 'recharts';
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
  Zap,
  Trophy,
  Medal,
  CalendarClock,
  ArrowRight
} from "lucide-react";

// Hooks personalizados
import { useProcesses } from "../components/hooks/useProcesses";
import { useProcessInstances } from "../components/hooks/useProcessInstances";
import { useTechnicians } from "../components/hooks/useTechnicians";

export default function Dashboard() {
  // Usando hooks personalizados
  const { processes } = useProcesses();
  const { instances, loading } = useProcessInstances();
  const { technicians } = useTechnicians();
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Renderiza a fatia ativa com destaque
  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-lg font-bold">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          cornerRadius={4}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 15}
          fill={fill}
          cornerRadius={2}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value} Processos`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

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

  // Dados para gráfico de pizza
  const pieData = React.useMemo(() => {
    const statusCounts = {
      aguardando_analise: 0,
      em_andamento: 0,
      pendente: 0,
      finalizado: 0,
      cancelado: 0
    };

    instances.forEach(instance => {
      // Normaliza o status caso venha diferente ou nulo
      const status = instance.status || 'aguardando_analise';
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    return [
      { name: 'Aguardando Análise', value: statusCounts.aguardando_analise, color: '#EAB308' },
      { name: 'Em Andamento', value: statusCounts.em_andamento, color: '#3B82F6' },
      { name: 'Pendente', value: statusCounts.pendente, color: '#F97316' },
      { name: 'Finalizado', value: statusCounts.finalizado, color: '#22C55E' },
      { name: 'Cancelado', value: statusCounts.cancelado, color: '#EF4444' }
    ].filter(item => item.value > 0);
  }, [instances]);

  // Ranking de Técnicos
  const techniciansRanking = React.useMemo(() => {
    const counts = {};
    instances.forEach(instance => {
      // Considera 'finalizado' como concluído/protocolado
      if (instance.status === 'finalizado') {
        const techEmail = instance.technician_responsible;
        if (techEmail) {
          counts[techEmail] = (counts[techEmail] || 0) + 1;
        }
      }
    });

    return Object.entries(counts)
      .map(([email, count]) => {
        const tech = technicians.find(t => t.email === email);
        return {
          email,
          name: tech?.full_name || email.split('@')[0],
          avatar: tech?.profile_picture_url,
          position: tech?.position || 'Técnico',
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  }, [instances, technicians]);

  // Próximos Vencimentos
  const upcomingDeadlines = React.useMemo(() => {
    return instances
      .filter(i => 
        i.due_date && 
        !['finalizado', 'cancelado'].includes(i.status)
      )
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5)
      .map(instance => {
        const dueDate = new Date(instance.due_date);
        const today = new Date();
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        let statusColor = 'bg-blue-100 text-blue-800';
        let statusText = `${diffDays} dias restantes`;

        if (diffDays < 0) {
          statusColor = 'bg-red-100 text-red-800';
          statusText = `Atrasado há ${Math.abs(diffDays)} dias`;
        } else if (diffDays === 0) {
          statusColor = 'bg-orange-100 text-orange-800';
          statusText = 'Vence hoje';
        } else if (diffDays <= 3) {
          statusColor = 'bg-orange-100 text-orange-800';
          statusText = `Vence em ${diffDays} dias`;
        }

        return {
          ...instance,
          statusColor,
          statusText,
          formattedDate: format(dueDate, "dd/MM/yyyy", { locale: ptBR })
        };
      });
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
                {recentActivities.map((activity) => (
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

          {/* Ranking de Técnicos */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <CardTitle className="text-lg font-semibold">Ranking de Produtividade</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100">
                  Top 5
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {techniciansRanking.length > 0 ? (
                  techniciansRanking.map((tech, index) => (
                    <div key={tech.email} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 relative">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm border-2 
                          ${index === 0 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                            index === 1 ? 'bg-gray-100 text-gray-700 border-gray-200' : 
                            index === 2 ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                            'bg-white text-gray-500 border-transparent'}`}>
                          {index + 1}º
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <img 
                          src={tech.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tech.name)}&background=random`} 
                          alt={tech.name}
                          className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {tech.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {tech.position}
                        </p>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-blue-600">{tech.count}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Finalizados</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Medal className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm">Nenhum processo finalizado ainda.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção Inferior */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Distribuição */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Status dos Processos</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={130}
                      fill="#8884d8"
                      dataKey="value"
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      paddingAngle={2}
                      cornerRadius={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value, entry) => (
                        <span className="text-gray-600 font-medium ml-1">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{instances.length}</div>
                  <div className="text-xs text-gray-500">Total de Processos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {instances.filter(i => i.status === 'finalizado').length}
                  </div>
                  <div className="text-xs text-gray-500">Concluídos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Próximos Vencimentos */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-red-500" />
                  <CardTitle className="text-lg font-semibold">Próximos Vencimentos</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {upcomingDeadlines.length > 0 ? (
                  upcomingDeadlines.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                      <div className="min-w-0 flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 truncate">{item.title}</span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span>{item.municipality || 'N/A'}</span>
                          <span>•</span>
                          <span>{item.technician_responsible?.split('@')[0]}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <Badge className={`${item.statusColor} border-0`}>
                          {item.statusText}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {item.formattedDate}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2 opacity-20" />
                    <p className="text-sm">Tudo em dia! Nenhum vencimento próximo.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
