
import { useState, useEffect, useMemo } from "react";
import { ProcessService, ProcessInstanceService, UsersService, AuthService } from "@/services";
import { CATEGORY_COLORS } from "@/components/utils/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2, Database, FileText, Play, Users, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import NewProcessModal from "../components/admin/NewProcessModal";

export default function DataAdminPage() {
  const [processes, setProcesses] = useState([]);
  const [instances, setInstances] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', item: null });
  const [isNewProcessModalOpen, setIsNewProcessModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);

  const instancesCountByProcess = useMemo(() => {
    return instances.reduce((acc, inst) => {
      const pid = inst.process_id;
      acc[pid] = (acc[pid] || 0) + 1;
      return acc;
    }, {});
  }, [instances]);

  useEffect(() => {
    loadAllData();
    AuthService.getCurrentUser().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // CARREGA TODOS OS DADOS SEM FILTROS - VISÍVEL PARA TODOS
      const [processData, instanceData, userData] = await Promise.all([
        ProcessService.getAllProcesses({ orderBy: '-created_date' }),
        ProcessInstanceService.getAllInstances({ orderBy: '-created_date' }),
        UsersService.getAllUsers({ orderBy: '-created_date' })
      ]);
      
      setProcesses(processData || []);
      setInstances(instanceData || []);
      setTechnicians(userData || []);
      
      console.log('✅ ADMIN - DADOS GLOBAIS CARREGADOS:');
      console.log('📋 Processos:', processData?.length || 0);
      console.log('🔄 Instâncias:', instanceData?.length || 0);
      console.log('👥 Usuários:', userData?.length || 0);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewProcess = async (processData, processId) => {
    try {
      if (!currentUser) {
        toast.error('Faça login para criar processos.');
        return;
      }
      if (processId) {
        await ProcessService.updateProcess(processId, processData);
        toast.success("Processo atualizado com sucesso!");
      } else {
        await ProcessService.createProcess(processData);
        toast.success("Novo processo criado com sucesso!");
      }
      await loadAllData();
      setIsNewProcessModalOpen(false);
      setSelectedProcess(null);
    } catch (error) {
      console.error('Erro ao criar processo:', error);
      toast.error("Erro ao criar novo processo");
    }
  };

  const handleDelete = async (type, item) => {
    try {
      if (type === 'process') {
        await ProcessService.deleteProcess(item.id);
        setProcesses(prev => prev.filter(p => p.id !== item.id));
        toast.success("Processo removido com sucesso!");
      } else if (type === 'instance') {
        await ProcessInstanceService.deleteInstance(item.id);
        setInstances(prev => prev.filter(i => i.id !== item.id));
        toast.success("Instância removida com sucesso!");
      } else if (type === 'user') {
        await UsersService.deleteUser(item.id);
        setTechnicians(prev => prev.filter(u => u.id !== item.id));
        toast.success("Usuário removido com sucesso!");
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error("Erro ao remover item");
    } finally {
      setDeleteDialog({ open: false, type: '', item: null });
    }
  };

  const openDeleteDialog = (type, item) => {
    if (type === 'process' && currentUser?.role !== 'admin') {
      toast.error('Apenas administradores podem excluir processos.');
      return;
    }
    setDeleteDialog({ open: true, type, item });
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            Novos Processos
          </h1>
          <p className="text-gray-500 mt-1">Gerencie e crie novos processos do sistema.</p>
        </div>

        <Tabs defaultValue="processes" className="space-y-6">
          <TabsList className="grid w-fit grid-cols-3 bg-white border">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="processes" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Processos ({processes.length})
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gerenciar tipos de processos do sistema</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="instances" className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Instâncias ({instances.length})
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver todas as instâncias de processos criadas</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Usuários ({technicians.length})
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Administrar usuários e permissões do sistema</p>
              </TooltipContent>
            </Tooltip>
          </TabsList>

          <TabsContent value="processes" className="space-y-4">
            {/* Header com botão de criar novo processo */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Serviços Cadastrados</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => {
                      if (!currentUser) {
                        toast.error('Faça login para criar novos processos.');
                        return;
                      }
                      setIsNewProcessModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    disabled={!currentUser}
                  >
                    <Plus className="w-4 h-4" />
                    Novo Processo
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{currentUser ? 'Criar novo processo no sistema' : 'Requer login'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {/* Cards por serviço: nome, categoria e quantidade de processos cadastrados */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {processes.map((p) => (
                <Card key={p.id} className="bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">{p.name}</CardTitle>
                      <div className="mt-2">
                        <Badge className={`${CATEGORY_COLORS[p.category] || 'bg-gray-100 text-gray-800'} capitalize`}>{(p.category || 'sem categoria').replace('_', ' ')}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-gray-700">{instancesCountByProcess[p.id] || 0} processo{(instancesCountByProcess[p.id] || 0) > 1 ? 's' : ''}</Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="outline" onClick={() => { if (currentUser?.role !== 'admin') { toast.error('Apenas administradores podem editar.'); return; } setSelectedProcess(p); setIsNewProcessModalOpen(true); }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Editar serviço</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="destructive" disabled={currentUser?.role !== 'admin'} onClick={() => openDeleteDialog('process', p)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{currentUser?.role === 'admin' ? 'Excluir serviço' : 'Requer admin'}</p></TooltipContent>
                      </Tooltip>
                    </div>
                  </CardHeader>
                </Card>
              ))}
              {processes.length === 0 && (
                <Card className="bg-white">
                  <CardContent className="p-8 text-center text-gray-500">
                    Nenhum processo cadastrado
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="instances" className="space-y-4">
            <div className="grid gap-4">
              {instances.map((instance) => {
                const process = processes.find(p => p.id === instance.process_id);
                return (
                  <Tooltip key={instance.id}>
                    <TooltipTrigger asChild>
                      <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{instance.title}</CardTitle>
                            <p className="text-sm text-gray-600">
                              Processo: {process?.name || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Cliente: {instance.client_company}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="capitalize">
                                {instance.status?.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {instance.priority}
                              </Badge>
                              {instance.created_date && (
                                <Badge variant="outline">
                                  {format(new Date(instance.created_date), "dd/MM/yyyy", { locale: ptBR })}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => openDeleteDialog('instance', instance)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir esta instância permanentemente</p>
                            </TooltipContent>
                          </Tooltip>
                        </CardHeader>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{instance.title} • Status: {instance.status?.replace('_', ' ')}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              
              {instances.length === 0 && (
                <Card className="bg-white">
                  <CardContent className="p-8 text-center text-gray-500">
                    Nenhuma instância cadastrada
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid gap-4">
              {technicians.map((user) => (
                <Tooltip key={user.id}>
                  <TooltipTrigger asChild>
                    <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img 
                            src={user.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=random`}
                            alt="User"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <CardTitle className="text-lg">{user.full_name}</CardTitle>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="capitalize">
                                {user.department || 'N/A'}
                              </Badge>
                              <Badge variant="outline">
                                {user.role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => openDeleteDialog('user', user)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir este usuário permanentemente</p>
                          </TooltipContent>
                        </Tooltip>
                      </CardHeader>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.full_name} • {user.department || 'Sem departamento'} • {user.role}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              
              {technicians.length === 0 && (
                <Card className="bg-white">
                  <CardContent className="p-8 text-center text-gray-500">
                    Nenhum usuário cadastrado
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal para criar novo processo */}
        <NewProcessModal 
          isOpen={isNewProcessModalOpen}
          onClose={() => { setIsNewProcessModalOpen(false); setSelectedProcess(null); }}
          onSubmit={handleCreateNewProcess}
          process={selectedProcess}
        />

        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, type: '', item: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este {deleteDialog.type === 'process' ? 'processo' : deleteDialog.type === 'instance' ? 'instância' : 'usuário'}? 
                Esta ação não pode ser desfeita.
                {deleteDialog.item && (
                  <div className="mt-2 p-2 bg-gray-100 rounded">
                    <strong>
                      {deleteDialog.type === 'process' ? deleteDialog.item.name :
                       deleteDialog.type === 'instance' ? deleteDialog.item.title :
                       deleteDialog.item.full_name}
                    </strong>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleDelete(deleteDialog.type, deleteDialog.item)}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirmar Exclusão
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
