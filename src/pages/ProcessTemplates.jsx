import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Loader2, Copy, FileText } from "lucide-react";
import ProcessTemplateModal from "../components/templates/ProcessTemplateModal";
import { toast } from "sonner";
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

const categoryColors = {
  financeiro: 'bg-green-100 text-green-800',
  rh: 'bg-purple-100 text-purple-800',
  operacional: 'bg-blue-100 text-blue-800',
  comercial: 'bg-orange-100 text-orange-800',
  ti: 'bg-gray-100 text-gray-800',
  ambiental: 'bg-emerald-100 text-emerald-800',
  agronegocio: 'bg-yellow-100 text-yellow-800',
  florestal: 'bg-lime-100 text-lime-800',
  georreferenciamento: 'bg-cyan-100 text-cyan-800'
};

export default function ProcessTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [searchTerm, templates]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Process.list('-created_date', 100);
      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      toast.error("Erro ao carregar templates");
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    if (!searchTerm) {
      setFilteredTemplates(templates);
      return;
    }

    const filtered = templates.filter(template =>
      template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTemplates(filtered);
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleDuplicate = async (template) => {
    try {
      const newTemplate = {
        ...template,
        name: `${template.name} (Cópia)`,
        id: undefined,
        created_date: undefined,
        updated_date: undefined
      };
      await base44.entities.Process.create(newTemplate);
      await loadTemplates();
      toast.success("Template duplicado com sucesso!");
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
      toast.error("Erro ao duplicar template");
    }
  };

  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    try {
      await base44.entities.Process.delete(templateToDelete.id);
      await loadTemplates();
      toast.success("Template excluído com sucesso!");
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      toast.error("Erro ao excluir template");
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleSubmit = async (templateData) => {
    try {
      if (selectedTemplate) {
        await base44.entities.Process.update(selectedTemplate.id, templateData);
        toast.success("Template atualizado com sucesso!");
      } else {
        await base44.entities.Process.create(templateData);
        toast.success("Template criado com sucesso!");
      }
      await loadTemplates();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast.error("Erro ao salvar template");
      throw error;
    }
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
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Modelos de Processos
            </h1>
            <p className="text-gray-500 mt-1">
              Crie e gerencie templates padronizados para seus processos
            </p>
          </div>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Modelo
          </Button>
        </div>

        {/* Barra de Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, categoria ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Grid de Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={categoryColors[template.category] || 'bg-gray-100 text-gray-800'}>
                      {template.category}
                    </Badge>
                    <Badge variant="outline">
                      {template.steps?.length || 0} etapas
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={template.status === 'ativo' ? 'border-green-500 text-green-700' : 'border-gray-500 text-gray-700'}
                    >
                      {template.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {template.description || 'Sem descrição'}
              </p>
              
              <div className="space-y-2 mb-4 text-xs text-gray-500">
                {template.sla_hours && (
                  <div>SLA: {template.sla_hours}h</div>
                )}
                {template.priority && (
                  <div>Prioridade: <span className="capitalize">{template.priority}</span></div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(template)}
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(template)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(template)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum template encontrado' : 'Nenhum modelo cadastrado'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Tente ajustar sua busca' 
              : 'Comece criando seu primeiro modelo de processo'}
          </p>
          {!searchTerm && (
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Modelo
            </Button>
          )}
        </div>
      )}

      <ProcessTemplateModal
        template={selectedTemplate}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o modelo "{templateToDelete?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}