import React, { useState } from "react";
import { User } from "@/api/entities";
import { ProcessInstance } from "@/api/entities";
import ProcessInstanceManager from "../components/processes/ProcessInstanceManager";
import ProcessInstanceModal from "../components/processes/ProcessInstanceModal";
import { FolderOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Hooks personalizados
import { useProcesses } from "../components/hooks/useProcesses";
import { useInstances } from "../components/hooks/useInstances";
import { useTechnicians } from "../components/hooks/useTechnicians";

export default function InstancesPage() {
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [isInstanceModalOpen, setIsInstanceModalOpen] = useState(false);

  // Hooks personalizados para dados
  const { processes } = useProcesses();
  const { technicians } = useTechnicians();
  const { 
    instances, 
    loading: instancesLoading,
    updateInstance 
  } = useInstances(true);

  const handleEditInstance = (instance) => {
    setSelectedInstance(instance);
    setIsInstanceModalOpen(true);
  };

  const handleUpdateInstance = async (formData) => {
    try {
      const currentUser = await User.me();

      const updatedData = {
        ...formData,
        history: [
          ...(selectedInstance.history || []),
          {
            step: selectedInstance.current_step,
            action: 'editado',
            user: currentUser.email,
            timestamp: new Date().toISOString(),
            comment: 'Processo atualizado'
          }
        ]
      };

      await ProcessInstance.update(selectedInstance.id, updatedData);
      updateInstance(selectedInstance.id, updatedData);

      toast.success("Processo atualizado com sucesso!", {
        description: `As alterações foram salvas.`,
      });

    } catch (error) {
      console.error('Erro ao atualizar processo:', error);
      toast.error("Erro ao atualizar processo", {
        description: "Tente novamente ou entre em contato com o suporte."
      });
      throw error;
    }
  };

  const handleStatusChange = async (instanceId, newStatus) => {
    updateInstance(instanceId, { status: newStatus });

    try {
      await ProcessInstance.update(instanceId, { status: newStatus });
      toast.success("Status atualizado!", {
        description: `Processo movido para ${newStatus.replace('_', ' ')}.`,
        duration: 2000
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error("Erro ao alterar status. Revertido.");
    }
  };

  if (instancesLoading) {
    return (
      <TooltipProvider>
        <div className="p-8 bg-gray-50 min-h-screen">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-blue-600" />
            Processos Criados
          </h1>
          <p className="text-gray-500 mt-1">Gerencie e acompanhe todas as instâncias de processos criadas.</p>
        </div>

        <ProcessInstanceManager
          instances={instances}
          processes={processes}
          technicians={technicians}
          onStatusChange={handleStatusChange}
          onEditInstance={handleEditInstance}
          loading={instancesLoading}
        />

        <ProcessInstanceModal
          instance={selectedInstance}
          isOpen={isInstanceModalOpen}
          onClose={() => {
            setIsInstanceModalOpen(false);
            setSelectedInstance(null);
          }}
          onSubmit={handleUpdateInstance}
        />
      </div>
    </TooltipProvider>
  );
}