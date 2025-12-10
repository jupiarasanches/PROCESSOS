import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, AlertCircle } from "lucide-react";
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function TechnicianWorkload({ instances, technicians }) {
  const workloadData = useMemo(() => {
    return technicians.map(tech => {
      const techInstances = instances.filter(i => i.technician_responsible === tech.email);
      const active = techInstances.filter(i => i.status === 'em_andamento');
      const pending = techInstances.filter(i => i.status === 'pendente');
      const overdue = techInstances.filter(i => 
        i.due_date && 
        new Date(i.due_date) < new Date() && 
        !['finalizado', 'cancelado'].includes(i.status)
      );

      return {
        name: tech.full_name || tech.email,
        email: tech.email,
        department: tech.department,
        active: active.length,
        pending: pending.length,
        overdue: overdue.length,
        total: techInstances.length,
        workload: active.length + pending.length
      };
    }).sort((a, b) => b.workload - a.workload);
  }, [instances, technicians]);

  const chartData = workloadData.slice(0, 5).map((tech, index) => ({
    name: tech.name.split(' ')[0], // Primeiro nome apenas
    value: tech.workload,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Carga de Trabalho por Técnico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico de distribuição */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} processo${value !== 1 ? 's' : ''}`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lista detalhada */}
          <div className="space-y-3">
            {workloadData.slice(0, 6).map((tech) => (
              <div key={tech.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {tech.name}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {tech.department}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {tech.overdue > 0 && (
                    <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {tech.overdue}
                    </Badge>
                  )}
                  <Badge className="bg-blue-100 text-blue-800">
                    {tech.active} ativo{tech.active !== 1 ? 's' : ''}
                  </Badge>
                  {tech.pending > 0 && (
                    <Badge className="bg-orange-100 text-orange-800">
                      +{tech.pending}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas de workload */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {Math.round(workloadData.reduce((acc, t) => acc + t.workload, 0) / workloadData.length)}
              </div>
              <div className="text-xs text-gray-500">Carga Média</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {workloadData.reduce((acc, t) => acc + t.active, 0)}
              </div>
              <div className="text-xs text-gray-500">Total Ativo</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">
                {workloadData.reduce((acc, t) => acc + t.overdue, 0)}
              </div>
              <div className="text-xs text-gray-500">Atrasados</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
TechnicianWorkload.propTypes = {
  instances: PropTypes.array.isRequired,
  technicians: PropTypes.array.isRequired,
}
