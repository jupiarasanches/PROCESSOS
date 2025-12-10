import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FileText, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const categoryColors = {
  ambiental: "bg-green-100 text-green-800",
  agronegocio: "bg-lime-100 text-lime-800",
  operacional: "bg-blue-100 text-blue-800",
  qualidade: "bg-indigo-100 text-indigo-800",
  outros: "bg-slate-100 text-slate-800",
};

export default function ProcessCard({ process, onSelect }) {
  const colorClass = categoryColors[process.category] || categoryColors.outros;

  return (
    <Card 
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={() => onSelect(process.id)}
    >
      <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-bl from-slate-50 to-slate-100 rounded-full opacity-50 transition-transform duration-500 group-hover:scale-[10]`}></div>
      
      <CardHeader className="relative z-10">
        <div className="flex justify-between items-start">
          <div className={`p-4 rounded-lg bg-white shadow-md border border-slate-100`}>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <Badge className={`${colorClass} border-0 capitalize`}>{process.category}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{process.name}</h3>
          <p className="text-sm text-slate-600 line-clamp-3">
            {process.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-xs text-slate-500 mt-6">
          <span>{process.steps?.length || 0} etapas</span>
          <div className="flex items-center gap-1 font-semibold text-blue-600 group-hover:gap-2 transition-all">
            Iniciar
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

ProcessCard.propTypes = {
  process: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
}
