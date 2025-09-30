import React from 'react';
import StatCard from "./StatCard";
import { FileText, Play, CheckCircle, AlertTriangle } from "lucide-react";

export default function DashboardStats({ processes, instances }) {
  const stats = {
    totalProcesses: processes.length,
    activeInstances: instances.filter(i => i.status === 'em_andamento').length,
    completedThisMonth: instances.filter(i => 
      i.status === 'finalizado' && 
      new Date(i.created_date).getMonth() === new Date().getMonth()
    ).length,
    overdue: instances.filter(i => 
      i.due_date && new Date(i.due_date) < new Date() && i.status !== 'finalizado'
    ).length
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total de Processos"
        value={stats.totalProcesses}
        icon={FileText}
        color="blue"
        trend="up"
        trendValue="+12%"
      />
      <StatCard
        title="Instâncias Ativas"
        value={stats.activeInstances}
        icon={Play}
        color="green"
        subtitle="Em andamento"
      />
      <StatCard
        title="Concluídos (Mês)"
        value={stats.completedThisMonth}
        icon={CheckCircle}
        color="purple"
        trend="up"
        trendValue="+8%"
      />
      <StatCard
        title="Atrasados"
        value={stats.overdue}
        icon={AlertTriangle}
        color="red"
        subtitle="Requer atenção"
      />
    </div>
  );
}