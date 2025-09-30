import React from "react";
import { FolderOpen } from "lucide-react";
import ProcessKanban from "./ProcessKanban";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ProcessInstanceManager({ 
  instances,
  processes, 
  technicians,
  onStatusChange,
  onEditInstance,
  loading 
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!Array.isArray(instances) || instances.length === 0) {
    return (
      <div className="text-center py-16">
        <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">Nenhum processo criado ainda</h3>
        <p className="text-gray-500 mt-2">
          Comece criando seu primeiro processo na aba "Catálogo de Processos".
        </p>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <ProcessKanban
            instances={instances}
            processes={processes}
            technicians={technicians}
            onStatusChange={onStatusChange}
            onEdit={onEditInstance}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Arraste e solte para alterar status dos processos</p>
      </TooltipContent>
    </Tooltip>
  );
}