import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, MapPin, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  aguardando: "bg-amber-100 text-amber-800 border-amber-200",
  em_andamento: "bg-blue-100 text-blue-800 border-blue-200", 
  pausado: "bg-gray-100 text-gray-800 border-gray-200",
  concluido: "bg-green-100 text-green-800 border-green-200",
  cancelado: "bg-red-100 text-red-800 border-red-200"
};

const priorityColors = {
  baixa: "bg-slate-100 text-slate-700",
  media: "bg-yellow-100 text-yellow-700",
  alta: "bg-orange-100 text-orange-700",
  critica: "bg-red-100 text-red-700"
};

export default function ProcessInstanceCard({ instance, processName, onClick }) {
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500"
      onClick={() => onClick?.(instance)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 text-sm truncate">
              {instance.title}
            </h4>
            <p className="text-xs text-slate-500 mt-1">{processName}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Badge className={`${statusColors[instance.status]} text-xs border`}>
              {instance.status.replace('_', ' ')}
            </Badge>
            <Badge className={`${priorityColors[instance.priority]} text-xs`}>
              {instance.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <User className="w-3 h-3" />
          <span className="truncate">{instance.client_company}</span>
        </div>
        
        {instance.municipality && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <MapPin className="w-3 h-3" />
            <span>{instance.municipality}</span>
          </div>
        )}
        
        {instance.area_hectares && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <FileText className="w-3 h-3" />
            <span>{instance.area_hectares} ha</span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {format(new Date(instance.created_date), "dd/MM/yy", { locale: ptBR })}
            </span>
          </div>
          {instance.due_date && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {format(new Date(instance.due_date), "dd/MM/yy", { locale: ptBR })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

ProcessInstanceCard.propTypes = {
  instance: PropTypes.object.isRequired,
  processName: PropTypes.string,
  onClick: PropTypes.func,
}
