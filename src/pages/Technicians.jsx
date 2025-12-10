
import { useState, useEffect, useMemo } from "react";
import { UsersService, AuthService } from "@/services";
import TechnicianCard from "../components/technicians/TechnicianCard";
import TechnicianForm from "../components/technicians/TechnicianForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Search, Users, Loader2, UserPlus } from "lucide-react";
import InviteTechnicianModal from "../components/technicians/InviteTechnicianModal";
import { toast } from "sonner";

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, technician: null });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadTechnicians();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário atual", error);
    }
  };

  const loadTechnicians = async () => {
    setLoading(true);
    try {
      const allUsers = await UsersService.getAllUsers({ orderBy: '-created_date' });
      setTechnicians(allUsers || []);
    } catch (error) {
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTechnician = async (formData) => {
    try {
      if (isEditing && selectedTechnician) {
        await UsersService.updateUser(selectedTechnician.id, formData);
        toast.success("Técnico atualizado com sucesso!");
      } else {
        toast.error("A criação de novos usuários não é permitida no formulário de edição.", {
          description: "Use o botão 'Convidar Técnico' para enviar convites."
        });
        return;
      }
      
      await loadTechnicians();
      handleCloseForm();
    } catch (error) {
      console.error('Erro ao salvar técnico:', error);
      toast.error("Erro ao atualizar técnico");
      throw error;
    }
  };

  const handleEdit = (technician) => {
    setSelectedTechnician(technician);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDelete = (technician) => {
    setDeleteDialog({ open: true, technician });
  };

  const handleToggleAdmin = async (technician) => {
    try {
      const makeAdmin = technician.role !== 'admin';
      await UsersService.setAdminRole(technician.id, makeAdmin);
      toast.success(makeAdmin ? 'Técnico promovido a admin' : 'Admin rebaixado para técnico');
      await loadTechnicians();
    } catch (error) {
      toast.error('Falha ao alterar privilégios');
    }
  };

  const handleResendInvite = async (technician) => {
    try {
      await UsersService.resendInvitation(technician.email);
      toast.success('Convite reenviado com sucesso');
    } catch (error) {
      toast.error(error?.message || 'Falha ao reenviar convite');
    }
  };

  const handleGenerateLink = async (technician) => {
    try {
      const { link } = await UsersService.generateAccessLink(technician.email);
      try { await navigator.clipboard.writeText(link); } catch (_) {
        const t = document.createElement('textarea');
        t.value = link;
        document.body.appendChild(t);
        t.select();
        try { document.execCommand('copy'); } catch (__) {}
        document.body.removeChild(t);
      }
      toast.success('Link de acesso gerado e copiado', { description: link });
    } catch (error) {
      toast.error(error?.message || 'Falha ao gerar link');
    }
  };

  const confirmDelete = async () => {
    try {
      await UsersService.deleteUser(deleteDialog.technician.id);
      toast.success("Técnico removido com sucesso!");
      await loadTechnicians();
    } catch (error) {
      console.error('Erro ao remover técnico:', error);
      toast.error("Erro ao remover técnico");
    } finally {
      setDeleteDialog({ open: false, technician: null });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTechnician(null);
    setIsEditing(false);
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const filteredTechnicians = useMemo(() => {
    const q = debouncedSearch;
    if (!q) return technicians;
    return technicians.filter(tech =>
      tech.full_name?.toLowerCase().includes(q) ||
      tech.email?.toLowerCase().includes(q) ||
      tech.department?.toLowerCase().includes(q) ||
      tech.position?.toLowerCase().includes(q)
    );
  }, [technicians, debouncedSearch]);

  const stats = useMemo(() => ({
    total: technicians.length,
    byDepartment: technicians.reduce((acc, tech) => {
      const dept = tech.department || 'administrativo';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {}),
    admins: technicians.filter(tech => tech.role === 'admin').length
  }), [technicians]);

  return (
    <TooltipProvider>
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Técnicos</h1>
              <p className="text-gray-500 mt-1">Gerencie os técnicos da sua empresa.</p>
            </div>
            {currentUser?.role === 'admin' && (
              <Button 
                onClick={() => setInviteOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Convidar Técnico
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Total</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total de técnicos cadastrados no sistema</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Ambiental</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{stats.byDepartment.ambiental || 0}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Técnicos especializados em processos ambientais</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-lime-600" />
                    <span className="text-sm text-gray-600">Agronegócio</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{stats.byDepartment.agronegocio || 0}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Técnicos especializados em agronegócio</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-600">Admins</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{stats.admins}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Usuários com privilégios administrativos</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Input 
                  placeholder="Buscar por nome, email, departamento..." 
                  className="pl-10 h-11 text-base bg-white shadow-sm text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Digite para filtrar técnicos por nome, e-mail ou departamento</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTechnicians.map(technician => (
              <Tooltip key={technician.id}>
                <TooltipTrigger asChild>
                  <div> {/* A div is needed here to wrap TechnicianCard when using asChild */}
                    <TechnicianCard
                      technician={technician}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleAdmin={handleToggleAdmin}
                      onResendInvite={handleResendInvite}
                      onGenerateLink={handleGenerateLink}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clique para editar informações do técnico</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        {!loading && filteredTechnicians.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">
              Nenhum técnico encontrado
            </h3>
            <p className="text-gray-500 mt-2">
              Convide novos usuários para listá-los como técnicos aqui.
            </p>
          </div>
        )}

        <TechnicianForm
          technician={selectedTechnician}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleSaveTechnician}
          isEditing={isEditing}
        />

        <InviteTechnicianModal
          isOpen={inviteOpen}
          onClose={() => setInviteOpen(false)}
          onInvited={() => loadTechnicians()}
        />

        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, technician: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o técnico <strong>{deleteDialog.technician?.full_name}</strong>? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
