
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
import { useAuditLog } from "../components/hooks/useAuditLog";

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
  const { logUpdate, logStatusChange } = useAuditLog();

  const handleEdit = (instance) => {
    // The outline suggested `const oldInstance = { ...instance };` which is good practice if `instance` could be mutated
    // However, `setSelectedInstance(instance)` already creates a new reference in state.
    setSelectedInstance(instance);
    setIsInstanceModalOpen(true);
  };

  const handleUpdateInstance = async (formData) => {
    if (!selectedInstance) return; // Should not happen if modal is opened with selectedInstance

    const oldData = { ...selectedInstance }; // Capture old data for audit log
    const currentUser = await User.me(); // Get current user once

    try {
      const updatedProcessInstanceData = {
        ...formData,
        history: [
          ...(selectedInstance.history || []),
          {
            step: selectedInstance.current_step,
            action: 'atualizado', // Changed to 'atualizado' as per outline
            user: currentUser.email,
            timestamp: new Date().toISOString(),
            comment: 'Processo atualizado'
          }
        ]
      };

      await ProcessInstance.update(selectedInstance.id, updatedProcessInstanceData);
      updateInstance(selectedInstance.id, updatedProcessInstanceData); // Local state update in useInstances hook

      // Log de auditoria
      await logUpdate(
        'ProcessInstance',
        selectedInstance.id,
        oldData,
        updatedProcessInstanceData,
        `Processo "${formData.title}" foi atualizado` // Use formData.title as it represents the new title
      );

      setIsInstanceModalOpen(false); // Close the modal
      setSelectedInstance(null); // Clear selected instance
      toast.success("Processo atualizado com sucesso!", {
        description: `As alterações foram salvas.`,
      });

    } catch (error) {
      console.error('Erro ao atualizar processo:', error);
      toast.error("Erro ao atualizar processo", {
        description: "Tente novamente ou entre em contato com o suporte."
      });
      throw error; // Re-throw to allow component or error boundary to catch if needed
    }
  };

  const handleStatusChange = async (instance, newStatus) => { // Signature changed to pass full instance object
    if (!instance) return;

    const oldStatus = instance.status; // Capture old status for audit log and history
    const currentUser = await User.me(); // Get current user once

    // Optimistically update the UI *before* the API call
    // Store the original state to revert if API fails
    const originalInstance = { ...instance };
    updateInstance(instance.id, { status: newStatus });

    try {
      const updatedHistoryEntry = {
        step: instance.current_step, // Use current_step from the instance
        action: 'status_alterado',
        user: currentUser.email,
        timestamp: new Date().toISOString(),
        comment: `Status alterado de ${oldStatus} para ${newStatus}`
      };

      await ProcessInstance.update(instance.id, {
        status: newStatus,
        history: [
          ...(instance.history || []),
          updatedHistoryEntry
        ]
      });

      // Log de auditoria
      await logStatusChange(
        'ProcessInstance',
        instance.id,
        oldStatus,
        newStatus,
        `Status do processo "${instance.title}" alterado de ${oldStatus} para ${newStatus}`
      );

      toast.success("Status atualizado!", {
        description: `Processo movido para ${newStatus.replace('_', ' ')}.`,
        duration: 2000
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      // Revert the UI update if API fails
      updateInstance(originalInstance.id, { status: originalInstance.status });
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
          onStatusChange={handleStatusChange} // Now passes full instance object
          onEditInstance={handleEdit} // Renamed prop
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
