import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ComposedChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function ProcessStatusChart({ instances }) {
  // Preparar dados para os últimos 6 meses
  const processChartData = React.useMemo(() => {
    const months = [];
    const now = new Date();
    
    // Gerar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        fullDate: date
      });
    }
    
    // Calcular dados para cada mês
    return months.map(({ month, fullDate }) => {
      const monthInstances = instances.filter(instance => {
        const instanceDate = new Date(instance.created_date);
        return instanceDate.getMonth() === fullDate.getMonth() && 
               instanceDate.getFullYear() === fullDate.getFullYear();
      });
      
      return {
        month,
        'Em Andamento': monthInstances.filter(i => i.status === 'em_andamento').length,
        'Pendentes': monthInstances.filter(i => i.status === 'pendente').length,
        'Finalizados': monthInstances.filter(i => i.status === 'finalizado').length,
        'Cancelados': monthInstances.filter(i => i.status === 'cancelado').length,
        'Total': monthInstances.length
      };
    });
  }, [instances]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value} processo{entry.value !== 1 ? 's' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900">
            Evolução dos Processos por Status
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4" />
            <span>Últimos 6 meses</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={processChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#666' }}
                stroke="#999"
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#666' }}
                stroke="#999"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
              />
              
              {/* Barras empilhadas para diferentes status */}
              <Bar dataKey="Em Andamento" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Pendentes" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Finalizados" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Cancelados" stackId="a" fill="#EF4444" radius={[2, 2, 0, 0]} />
              
              {/* Linha de total */}
              <Line 
                type="monotone" 
                dataKey="Total" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#8B5CF6' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Estatísticas resumidas */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {instances.filter(i => i.status === 'em_andamento').length}
            </div>
            <div className="text-xs text-gray-500">Em Andamento</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">
              {instances.filter(i => i.status === 'pendente').length}
            </div>
            <div className="text-xs text-gray-500">Pendentes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {instances.filter(i => i.status === 'finalizado').length}
            </div>
            <div className="text-xs text-gray-500">Finalizados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {instances.filter(i => i.status === 'cancelado').length}
            </div>
            <div className="text-xs text-gray-500">Cancelados</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}