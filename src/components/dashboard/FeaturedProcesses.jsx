import PropTypes from 'prop-types';
import { Card, CardTitle } from "@/components/ui/card";
import { Clock, FileText } from "lucide-react";

export default function FeaturedProcesses({ processes, instances }) {
  return (
    <Card className="shadow-lg border-0 p-6">
      <div className="flex items-center justify-between mb-6">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Processos Mais Utilizados
        </CardTitle>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      
      {processes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {processes.slice(0, 3).map((process) => {
            const instanceCount = instances.filter(i => i.process_id === process.id).length;
            return (
              <div key={process.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 truncate">{process.name}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {instanceCount} usos
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{process.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">{process.category}</span>
                  <span>{process.steps?.length || 0} etapas</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3" />
          <p className="font-medium">Nenhum processo cadastrado ainda</p>
        </div>
      )}
    </Card>
  );
}
FeaturedProcesses.propTypes = {
  processes: PropTypes.array.isRequired,
  instances: PropTypes.array.isRequired,
}
