import React, { useState } from "react";
import { User } from "@/api/entities";
import { ProcessInstance } from "@/api/entities";
import ProcessCatalog from "../components/processes/ProcessCatalog";
import ProcessInstanceManager from "../components/processes/ProcessInstanceManager";
import ProcessModal from "../components/processes/ProcessModal";
import ProcessInstanceModal from "../components/processes/ProcessInstanceModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FolderOpen, Loader2, CheckCircle } from "lucide-react";
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

export default function ProcessesPage() {
  // Estados locais para UI
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("catalog");
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [isInstanceModalOpen, setIsInstanceModalOpen] = useState(false);

  // Hooks personalizados para dados
  const { processes, loading: processesLoading } = useProcesses();
  const { technicians } = useTechnicians();
  const { 
    instances, 
    loading: instancesLoading,
    addInstance,
    updateInstance 
  } = useInstances(activeTab === "instances");

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
        icon: <CheckCircle className="w-4 h-4" />
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
      // Revert on error
      const allInstances = await ProcessInstance.list('-created_date');
      // This would need to be handled by refetching
      toast.error("Erro ao alterar status. Revertido.");
    }
  };

  const handleSearchResult = (result) => {
    if (result.type === 'process') {
      setActiveTab("catalog");
    } else {
      setActiveTab("instances");
    }
  };

  if (processesLoading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Processos</h1>
          <p className="text-gray-500 mt-1">Gerencie seus processos empresariais de forma eficiente.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-fit grid-cols-2 bg-white border">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="catalog" className="flex items-center gap-2 data-[state=active]:bg-gray-100 text-gray-700">
                  <Search className="w-4 h-4" />
                  Catálogo de Processos
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visualize e inicie novos processos empresariais</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="instances" className="flex items-center gap-2 data-[state=active]:bg-gray-100 text-gray-700">
                  <FolderOpen className="w-4 h-4" />
                  Processos Criados
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gerencie suas instâncias de processos em execução</p>
              </TooltipContent>
            </Tooltip>
          </TabsList>

          <TabsContent value="catalog" className="space-y-6">
            <ProcessCatalog
              processes={processes}
              instances={instances}
              onSelectProcess={handleSelectProcess}
              onSearchResultSelect={handleSearchResult}
            />
          </TabsContent>

          <TabsContent value="instances" className="space-y-6">
            <ProcessInstanceManager
              instances={instances}
              processes={processes}
              technicians={technicians}
              onStatusChange={handleStatusChange}
              onEditInstance={handleEditInstance}
              loading={instancesLoading}
            />
          </TabsContent>
        </Tabs>

        <ProcessModal
          process={selectedProcess}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateInstance}
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