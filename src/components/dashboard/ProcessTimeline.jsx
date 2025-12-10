import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, AlertCircle, Play } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ProcessTimeline({ instances, processes }) {
  const timelineData = useMemo(() => {
    return instances
      .slice(0, 10) // Últimos 10 processos
      .map(instance => {
        const process = processes.find(p => p.id === instance.process_id);
        const isOverdue = instance.due_date && 
          new Date(instance.due_date) < new Date() && 
          !['finalizado', 'cancelado'].includes(instance.status);
        
        return {
          ...instance,
          processName: process?.name || 'N/A',
          isOverdue,
          daysRemaining: instance.due_date ? 
            Math.ceil((new Date(instance.due_date) - new Date()) / (1000 * 60 * 60 * 24)) : null
        };
      })
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [instances, processes]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'finalizado': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'em_andamento': return <Play className="w-4 h-4 text-blue-600" />;
      case 'cancelado': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-orange-600" />;
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
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Timeline de Processos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineData.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Linha conectora */}
              {index < timelineData.length - 1 && (
                <div className="absolute left-6 top-12 w-px h-8 bg-gray-200" />
              )}
              
              <div className="flex items-start gap-4">
                {/* Ícone de status */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
                  {getStatusIcon(item.status)}
                </div>
                
                {/* Conteúdo */}
                <div className="flex-1 min-w-0 pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.processName} • {item.client_company}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Criado em {format(new Date(item.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                      
                      {item.due_date && (
                        <div className={`text-xs flex items-center gap-1 ${
                          item.isOverdue ? 'text-red-600' : 
                          item.daysRemaining <= 3 ? 'text-orange-600' : 
                          'text-gray-500'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {item.isOverdue 
                            ? `${Math.abs(item.daysRemaining)} dias atraso`
                            : `${item.daysRemaining} dias restantes`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Barra de progresso visual */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${
                          item.status === 'finalizado' ? 'bg-green-500' :
                          item.status === 'em_andamento' ? 'bg-blue-500' :
                          item.status === 'cancelado' ? 'bg-red-500' :
                          'bg-orange-500'
                        }`}
                        style={{ 
                          width: item.status === 'finalizado' ? '100%' :
                                 item.status === 'em_andamento' ? '60%' :
                                 item.status === 'cancelado' ? '25%' :
                                 '10%'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
ProcessTimeline.propTypes = {
  instances: PropTypes.array.isRequired,
  processes: PropTypes.array.isRequired,
}
