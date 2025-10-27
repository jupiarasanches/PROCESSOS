import React, { useState } from "react";
import { User } from "@/api/entities";
import { ProcessInstance } from "@/api/entities";
import ProcessCatalog from "../components/processes/ProcessCatalog";
import ProcessModal from "../components/processes/ProcessModal";
import { FileText, Loader2, CheckCircle } from "lucide-react";
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

export default function ProcessesPage() {
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hooks personalizados para dados
  const { processes, loading: processesLoading } = useProcesses();
  const { 
    instances,
    addInstance 
  } = useInstances(false); // Não carrega automaticamente, só quando necessário

  const handleSelectProcess = (processId) => {
    const process = processes.find(p => p.id === processId);
    if (process) {
      setSelectedProcess(process);
      setIsModalOpen(true);
    }
  };

  const handleCreateInstance = async (formData) => {
    try {
      const currentUser = await User.me();

      const instanceData = {
        process_id: selectedProcess.id,
        title: formData.title,
        client_company: formData.client_company,
        technician_responsible: formData.technician_responsible,
        requester: currentUser.email,
        priority: formData.priority,
        area_hectares: formData.area_hectares,
        municipality: formData.municipality,
        due_date: formData.due_date,
        description: formData.description,
        documents: formData.documents || [],
        status: 'aguardando_analise',
        current_step: 0,
        deadline_notification_email: formData.deadline_notification_email,
        deadline_notification_email_address: formData.deadline_notification_email_address,
        deadline_notification_whatsapp: formData.deadline_notification_whatsapp,
        deadline_notification_days_before: formData.deadline_notification_days_before,
        recurring_notification_enabled: formData.recurring_notification_enabled,
        recurring_notification_frequency: formData.recurring_notification_frequency,
        recurring_notification_time: formData.recurring_notification_time,
        recurring_notification_email: formData.recurring_notification_email,
        recurring_notification_whatsapp: formData.recurring_notification_whatsapp,
        history: [{
          step: 0,
          action: 'criado',
          user: currentUser.email,
          timestamp: new Date().toISOString(),
          comment: `Processo iniciado em aguardando análise${formData.documents?.length ? ` com ${formData.documents.length} documento(s)` : ''}`
        }]
      };

      const newInstance = await ProcessInstance.create(instanceData);
      addInstance(newInstance);

      toast.success("Processo criado com sucesso!", {
        description: `O processo "${formData.title}" foi criado e está aguardando análise.`,
        icon: <CheckCircle className="w-4 h-4" />
      });

    } catch (error) {
      console.error('Erro ao criar instância do processo:', error);
      toast.error("Erro ao criar processo", {
        description: "Tente novamente ou entre em contato com o suporte."
      });
      throw error;
    }
  };

  if (processesLoading) {
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
            <FileText className="w-8 h-8 text-blue-600" />
            Catálogo de Processos
          </h1>
          <p className="text-gray-500 mt-1">Selecione um processo para iniciar uma nova instância.</p>
        </div>

        <ProcessCatalog
          processes={processes}
          instances={instances}
          onSelectProcess={handleSelectProcess}
        />

        <ProcessModal
          process={selectedProcess}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateInstance}
        />
      </div>
    </TooltipProvider>
  );
}