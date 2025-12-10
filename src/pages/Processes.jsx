
import { useState } from "react";
import { AuthService } from "@/services";
import { SimcarService } from "@/services";
import ProcessCatalog from "../components/processes/ProcessCatalog";
import ProcessModal from "../components/processes/ProcessModal";
import { FileText, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Hooks personalizados
import { useProcesses } from "../components/hooks/useProcesses";
import { useProcessInstances } from "../components/hooks/useProcessInstances";
import { useAuditLog } from "../components/hooks/useAuditLog";

export default function ProcessesPage() {
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hooks personalizados para dados
  const { processes, loading: processesLoading } = useProcesses();
  const {
    instances,
    createInstance
  } = useProcessInstances();
  const { logCreation } = useAuditLog();

  const handleSelectProcess = (processId) => {
    const process = processes.find(p => p.id === processId);
    if (process) {
      setSelectedProcess(process);
      setIsModalOpen(true);
    }
  };

  const handleCreateInstance = async (formData) => {
    try {
      const currentUser = await AuthService.getCurrentUser();

      const instanceData = {
        ...formData,
        process_id: selectedProcess.id,
        requester: currentUser?.email || 'Sistema'
      };

      const newInstance = await createInstance(instanceData);

      // Se for SIMCAR, criar/atualizar detalhes com CAR e Propriedade
      if ((selectedProcess?.name || '').toUpperCase().includes('SIMCAR')) {
        const carMatch = (formData.title || '').match(/MT[-\s]?\d+(?:\/\d{4})?/i);
        const carNumber = carMatch ? carMatch[0].toUpperCase().replace(/\s+/g, '') : null;
        await SimcarService.updateSimcarDetails(newInstance.id, {
          car_number: carNumber,
          property_name: formData.property_name || '',
          technician_responsible: formData.technician_responsible
        });
      }

      // Log de auditoria
      await logCreation(
        'ProcessInstance',
        newInstance.id,
        instanceData,
        `Nova instância de processo criada: "${formData.title}" por ${currentUser.full_name || currentUser.email}`
      );

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
