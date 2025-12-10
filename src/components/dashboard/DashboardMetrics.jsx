import PropTypes from "prop-types";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  TrendingUp,
  AlertTriangle,
  Activity
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DashboardMetrics({ instances }) {
  const stats = {
    activeProcesses: instances.filter(i => i.status === 'em_andamento').length,
    totalInstances: instances.length, // Renomeado para ser mais claro
    teamVelocity: instances.filter(i => {
      if (i.status !== 'finalizado') return false;
      const instanceDate = new Date(i.created_date);
      const now = new Date();
      return instanceDate.getMonth() === now.getMonth() && 
             instanceDate.getFullYear() === now.getFullYear();
    }).length,
    overdueProcesses: instances.filter(i => 
      i.due_date && 
      new Date(i.due_date) < new Date() && 
      !['finalizado', 'cancelado'].includes(i.status)
    ).length
  };

  const metricsData = [
    {
      title: "Processos Ativos",
      value: stats.activeProcesses,
      subtitle: "+2 no mês passado",
      icon: FileText,
      color: "blue",
      tooltip: "Processos que estão sendo executados atualmente"
    },
    {
      title: "Total de Processos", 
      value: stats.totalInstances, // Agora mostra o número correto de instâncias
      subtitle: "+5% esta semana",
      icon: Activity,
      color: "gray",
      tooltip: "Número total de processos criados no sistema"
    },
    {
      title: "Velocidade da Equipe",
      value: stats.teamVelocity,
      subtitle: "+8% último sprint", 
      icon: TrendingUp,
      color: "green",
      tooltip: "Processos finalizados pela equipe neste mês"
    },
    {
      title: "Processos Atrasados",
      value: stats.overdueProcesses,
      subtitle: "Requer atenção",
      icon: AlertTriangle,
      color: "orange",
      tooltip: "Processos que ultrapassaram o prazo definido"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      gray: "bg-gray-100 text-gray-600", 
      green: "bg-green-100 text-green-600",
      orange: "bg-orange-100 text-orange-600"
    };
    return colors[color] || colors.gray;
  };

  const getTextColorClasses = (color) => {
    const colors = {
      blue: "text-blue-600",
      gray: "text-gray-600",
      green: "text-green-600", 
      orange: "text-orange-600"
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {metricsData.map((metric, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${getTextColorClasses(metric.color)} mb-1`}>
                      {metric.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                    <p className={`text-xs ${getTextColorClasses(metric.color)}`}>
                      {metric.subtitle}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${getColorClasses(metric.color)} rounded-lg flex items-center justify-center`}>
                    <metric.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>{metric.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
DashboardMetrics.propTypes = {
  instances: PropTypes.array.isRequired,
  processes: PropTypes.array,
}
