import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, Target, TrendingUp, Award } from "lucide-react";

export default function PerformanceMetrics({ instances, technicians }) {
  const metrics = useMemo(() => {
    const completedInstances = instances.filter(i => i.status === 'finalizado');
    const onTimeCompletions = completedInstances.filter(i => {
      if (!i.due_date) return true;
      const completed = new Date(i.updated_date || i.created_date);
      const due = new Date(i.due_date);
      return completed <= due;
    });

    const avgCompletionTime = completedInstances.reduce((acc, instance) => {
      const created = new Date(instance.created_date);
      const completed = new Date(instance.updated_date || instance.created_date);
      const days = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
      return acc + days;
    }, 0) / (completedInstances.length || 1);

    // Performance por técnico
    const technicianStats = technicians.map(tech => {
      const techInstances = instances.filter(i => i.technician_responsible === tech.email);
      const completed = techInstances.filter(i => i.status === 'finalizado');
      const active = techInstances.filter(i => i.status === 'em_andamento');
      
      return {
        name: tech.full_name || tech.email,
        email: tech.email,
        total: techInstances.length,
        completed: completed.length,
        active: active.length,
        completionRate: techInstances.length > 0 ? (completed.length / techInstances.length * 100) : 0
      };
    }).sort((a, b) => b.completionRate - a.completionRate);

    return {
      onTimeRate: completedInstances.length > 0 ? (onTimeCompletions.length / completedInstances.length * 100) : 0,
      avgCompletionTime: Math.round(avgCompletionTime),
      totalCompleted: completedInstances.length,
      techniciansRanking: technicianStats.slice(0, 5)
    };
  }, [instances, technicians]);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Métricas de Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métricas gerais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(metrics.onTimeRate)}%
            </div>
            <div className="text-sm text-green-700 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Entregas no Prazo
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.avgCompletionTime}d
            </div>
            <div className="text-sm text-blue-700 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Tempo Médio
            </div>
          </div>
        </div>

        {/* Ranking de técnicos */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            Top Técnicos por Performance
          </h4>
          
          <div className="space-y-3">
            {metrics.techniciansRanking.map((tech, index) => (
              <div key={tech.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {tech.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {tech.completed}/{tech.total} concluídos
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={`${
                    tech.completionRate >= 80 ? 'bg-green-100 text-green-800' :
                    tech.completionRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {Math.round(tech.completionRate)}%
                  </Badge>
                  {tech.active > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {tech.active} ativo{tech.active > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
PerformanceMetrics.propTypes = {
  instances: PropTypes.array.isRequired,
  technicians: PropTypes.array.isRequired,
}
